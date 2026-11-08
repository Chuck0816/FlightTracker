DROP PROCEDURE IF EXISTS GetOrCreateRouteDetails;

DELIMITER //

CREATE PROCEDURE GetOrCreateRouteDetails(IN input_route_id INT)
BEGIN

  -- Constants
  -- A flight counts as on time if it arrives within this many minutes of schedule. 15 is the BTS
  -- standard.
  DECLARE const_on_time_minutes INT DEFAULT 15;
  -- The markets table carries a Source because BTS and DOT were loaded separately.
  DECLARE const_bts_source VARCHAR(10) DEFAULT 'BTS';
  DECLARE const_dot_source VARCHAR(10) DEFAULT 'DOT';

  DECLARE var_first_year INT DEFAULT NULL;
  DECLARE var_origin_market INT DEFAULT NULL;
  DECLARE var_dest_market INT DEFAULT NULL;
  DECLARE var_origin_code VARCHAR(10) DEFAULT NULL;
  DECLARE var_origin_name VARCHAR(100) DEFAULT NULL;
  DECLARE var_origin_city VARCHAR(120) DEFAULT NULL;
  DECLARE var_origin_lat DECIMAL(9,6) DEFAULT NULL;
  DECLARE var_origin_lon DECIMAL(9,6) DEFAULT NULL;
  DECLARE var_dest_code VARCHAR(10) DEFAULT NULL;
  DECLARE var_dest_name VARCHAR(100) DEFAULT NULL;
  DECLARE var_dest_city VARCHAR(120) DEFAULT NULL;
  DECLARE var_dest_lat DECIMAL(9,6) DEFAULT NULL;
  DECLARE var_dest_lon DECIMAL(9,6) DEFAULT NULL;
  DECLARE var_distance_miles INT DEFAULT NULL;

  -- If any statement fails part way through, undo the whole cache write so no half-built summary is
  -- left behind.
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT input_route_id RouteId, 'ERROR' AS CacheStatus, NULL AS ComputedAt;
  END;

  IF NOT EXISTS (SELECT 1 FROM routes WHERE Id = input_route_id) THEN
    SELECT input_route_id RouteId, 'NOT_FOUND' AS CacheStatus, NULL AS ComputedAt;
  ELSEIF EXISTS (SELECT 1 FROM routemetrics WHERE RouteId = input_route_id) THEN
    SELECT input_route_id RouteId, 'HIT' AS CacheStatus, rm.ComputedAt
    FROM routemetrics rm
    WHERE rm.RouteId = input_route_id;
  ELSEIF NOT EXISTS (SELECT 1 FROM flightrecords WHERE RouteId = input_route_id AND Year IS NOT NULL) THEN
    -- The route has no flight records we can date, so there are no reliability metrics to compute.
    -- This is about flight data, not fares - missing fares are normal and handled further down.
    SELECT input_route_id RouteId, 'NO_DATA' AS CacheStatus, NULL AS ComputedAt;
  ELSE
    -- Earliest flight year on the route, used further down to trim the fare history to the period
    -- we actually hold flights for
    SELECT MIN(Year) INTO var_first_year
    FROM flightrecords
    WHERE RouteId = input_route_id;

    -- READ COMMITTED is enough. The flightrecords, flightdelaycause, and airfaremarkets tables are
    -- loaded once and read-only while the app runs.
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    START TRANSACTION;

      -- Everything the page needs to label the route: codes, names, city and state, distance, and
      -- the coordinates for the map. Cached as text so the details page never joins back to routes,
      -- airports, or cities.
      SELECT
        oa.IataCode,
        oa.Name,
        CONCAT(oc.Name, ', ', oc.StateCode),
        oa.Latitude,
        oa.Longitude,
        da.IataCode,
        da.Name,
        CONCAT(dc.Name, ', ', dc.StateCode),
        da.Latitude,
        da.Longitude,
        r.DistanceMiles
      INTO
        var_origin_code,
        var_origin_name,
        var_origin_city,
        var_origin_lat,
        var_origin_lon,
        var_dest_code,
        var_dest_name,
        var_dest_city,
        var_dest_lat,
        var_dest_lon,
        var_distance_miles
      FROM routes r
      JOIN airports oa ON oa.Id = r.OriginAirportId
      JOIN airports da ON da.Id = r.DestinationAirportId
      JOIN cities oc ON oc.Id = oa.CityId
      JOIN cities dc ON dc.Id = da.CityId
      WHERE r.Id = input_route_id;

      -- Header, from one pass over the route's flight records.
      INSERT INTO routemetrics (
        RouteId,
        OriginAirportCode,
        OriginAirportName,
        OriginCity,
        DestinationAirportCode,
        DestinationAirportName,
        DestinationCity,
        DistanceMiles,
        TotalFlights,
        CompletedFlights,
        AvgDeptDelayMinutes,
        AvgArrDelayMinutes,
        OnTimeArrivalRate,
        CancellationRate,
        DiversionRate,
        FirstYearObserved,
        LastYearObserved,
        OriginLatitude,
        OriginLongitude,
        DestinationLatitude,
        DestinationLongitude,
        ComputedAt
      )
      SELECT
        input_route_id,
        var_origin_code,
        var_origin_name,
        var_origin_city,
        var_dest_code,
        var_dest_name,
        var_dest_city,
        var_distance_miles,
        COUNT(*),
        SUM(
          CASE
            WHEN fr.Cancelled = 0 AND fr.Diverted = 0 THEN 1
            ELSE 0
          END
        ),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 THEN fr.DeptDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 AND fr.Diverted = 0 THEN fr.ArrDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 1 OR fr.Diverted = 1 OR fr.ArrDelayMinutes IS NULL THEN NULL
            WHEN fr.ArrDelayMinutes <= const_on_time_minutes THEN 1
            ELSE 0
          END
        ), 4),
        ROUND(AVG(fr.Cancelled), 4),
        ROUND(AVG(fr.Diverted), 4),
        MIN(fr.Year),
        MAX(fr.Year),
        var_origin_lat,
        var_origin_lon,
        var_dest_lat,
        var_dest_lon,
        NOW()
      FROM flightrecords fr
      WHERE fr.RouteId = input_route_id;

      -- Seasonality, one row per calendar month across every year.
      INSERT INTO routemonthmetrics (
        RouteId,
        Month,
        YearsObserved,
        TotalFlights,
        AvgDeptDelayMinutes,
        AvgArrDelayMinutes,
        OnTimeArrivalRate,
        CancellationRate,
        DiversionRate
      )
      SELECT
        input_route_id,
        fr.Month,
        COUNT(DISTINCT fr.Year),
        COUNT(*),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 THEN fr.DeptDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 AND fr.Diverted = 0 THEN fr.ArrDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 1 OR fr.Diverted = 1 OR fr.ArrDelayMinutes IS NULL THEN NULL
            WHEN fr.ArrDelayMinutes <= const_on_time_minutes THEN 1
            ELSE 0
          END
        ), 4),
        ROUND(AVG(fr.Cancelled), 4),
        ROUND(AVG(fr.Diverted), 4)
      FROM flightrecords fr
      WHERE fr.RouteId = input_route_id
      GROUP BY fr.Month;

      -- Per-airline performance, grouped straight onto the carrier's code and name so no id is
      -- stored.
      INSERT INTO routeairlinemetrics (
        RouteId,
        AirlineCode,
        AirlineName,
        TotalFlights,
        AvgDeptDelayMinutes,
        AvgArrDelayMinutes,
        OnTimeArrivalRate,
        CancellationRate,
        DiversionRate
      )
      SELECT
        input_route_id,
        al.IataCode,
        al.Name,
        COUNT(*),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 THEN fr.DeptDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 0 AND fr.Diverted = 0 THEN fr.ArrDelayMinutes
          END
        ), 2),
        ROUND(AVG(
          CASE
            WHEN fr.Cancelled = 1 OR fr.Diverted = 1 OR fr.ArrDelayMinutes IS NULL THEN NULL
            WHEN fr.ArrDelayMinutes <= const_on_time_minutes THEN 1
            ELSE 0
          END
        ), 4),
        ROUND(AVG(fr.Cancelled), 4),
        ROUND(AVG(fr.Diverted), 4)
      FROM flightrecords fr
      JOIN airlines al ON al.Id = fr.MarketingAirlineId
      WHERE fr.RouteId = input_route_id
      GROUP BY al.IataCode, al.Name;

      -- Delay cause breakdown, grouped onto the cause code and name.
      INSERT INTO routedelaycausemetrics (
        RouteId,
        DelayCauseCode,
        DelayCauseName,
        DelayedFlights,
        TotalDelayMinutes,
        AvgDelayMinutes
      )
      SELECT
        input_route_id,
        dc.Code,
        dc.Name,
        COUNT(*),
        SUM(fdc.DelayMinutes),
        ROUND(AVG(fdc.DelayMinutes), 2)
      FROM flightrecords fr
      JOIN flightdelaycause fdc ON fdc.FlightRecordId = fr.Id
      JOIN delaycauses dc ON dc.Id = fdc.DelayCauseId
      WHERE fr.RouteId = input_route_id
      GROUP BY dc.Code, dc.Name;

      -- A route is an airport pair, but DOT publishes fares for city markets. The airportmarkets
      -- table only links airports to BTS markets, so the bridge is the DOT city market id that both
      -- loaders kept in SourceMarketId.
      SELECT md.Id INTO var_origin_market
      FROM routes r
      JOIN airportmarkets am ON am.AirportId = r.OriginAirportId
      JOIN markets mb ON mb.Id = am.MarketId AND mb.Source = const_bts_source
      JOIN markets md ON md.SourceMarketId = mb.SourceMarketId AND md.Source = const_dot_source
      WHERE r.Id = input_route_id
      LIMIT 1;

      SELECT md.Id INTO var_dest_market
      FROM routes r
      JOIN airportmarkets am ON am.AirportId = r.DestinationAirportId
      JOIN markets mb ON mb.Id = am.MarketId AND mb.Source = const_bts_source
      JOIN markets md ON md.SourceMarketId = mb.SourceMarketId AND md.Source = const_dot_source
      WHERE r.Id = input_route_id
      LIMIT 1;

      -- Fare data is sparse and we do not expect coverage for every route.
      -- DOT also stores each city pair in one direction only, so both have to be checked. UNION ALL
      -- keeps each half an equality lookup on the market-pair index, which an OR would not.
      IF var_origin_market IS NOT NULL AND var_dest_market IS NOT NULL AND var_origin_market <> var_dest_market THEN

        INSERT INTO routefaremetrics (
          RouteId,
          Year,
          Quarter,
          AverageFare,
          LowestAirlineFare,
          LowestFareAirlineCode,
          LowestFareAirlineName
        )
        (
          SELECT
            input_route_id,
            af.Year,
            af.Quarter,
            af.AverageFare,
            af.LowestAirlineFare,
            al.IataCode,
            al.Name
          FROM airfaremarkets af
          LEFT JOIN airlines al ON al.Id = af.LowestFareAirlineId
          WHERE af.OriginMarketId = var_origin_market
            AND af.DestMarketId = var_dest_market
            AND af.Year >= var_first_year
        )
        UNION ALL
        (
          SELECT
            input_route_id,
            af.Year,
            af.Quarter,
            af.AverageFare,
            af.LowestAirlineFare,
            al.IataCode,
            al.Name
          FROM airfaremarkets af
          LEFT JOIN airlines al ON al.Id = af.LowestFareAirlineId
          WHERE af.OriginMarketId = var_dest_market
            AND af.DestMarketId = var_origin_market
            AND af.Year >= var_first_year
        );

      END IF;

      -- The two header values that depend on the detail rows. Reading the small cached tables here
      -- avoids aggregating the fact tables again.
      UPDATE routemetrics
      SET TopDelayCauseName = (
        SELECT rdc.DelayCauseName
        FROM routedelaycausemetrics rdc
        WHERE rdc.RouteId = input_route_id
          AND rdc.TotalDelayMinutes = (
            SELECT MAX(x.TotalDelayMinutes)
            FROM routedelaycausemetrics x
            WHERE x.RouteId = input_route_id
          )
        LIMIT 1
      )
      WHERE RouteId = input_route_id;

      UPDATE routemetrics
      SET AvgMarketFare = (
        SELECT ROUND(AVG(rf.AverageFare), 2)
        FROM routefaremetrics rf
        WHERE rf.RouteId = input_route_id
      )
      WHERE RouteId = input_route_id;

    COMMIT;

    SELECT input_route_id RouteId, 'COMPUTED' AS CacheStatus, rm.ComputedAt
    FROM routemetrics rm
    WHERE rm.RouteId = input_route_id;

  END IF;

END //

DELIMITER ;
