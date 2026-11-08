ALTER TABLE savedroutes
ADD CONSTRAINT uc_savedroutes_user_route UNIQUE (UserId, RouteId);

DROP TABLE IF EXISTS routefaremetrics;
DROP TABLE IF EXISTS routedelaycausemetrics;
DROP TABLE IF EXISTS routeairlinemetrics;
DROP TABLE IF EXISTS routemonthmetrics;
DROP TABLE IF EXISTS routemetrics;

CREATE TABLE routemetrics (
  RouteId INT NOT NULL,
  OriginAirportCode VARCHAR(10) NULL,
  OriginAirportName VARCHAR(100) NULL,
  OriginCity VARCHAR(120) NULL,
  DestinationAirportCode VARCHAR(10) NULL,
  DestinationAirportName VARCHAR(100) NULL,
  DestinationCity VARCHAR(120) NULL,
  DistanceMiles INT NULL,
  TotalFlights INT NOT NULL,
  CompletedFlights INT NOT NULL,
  AvgDeptDelayMinutes DECIMAL(8,2) NULL,
  AvgArrDelayMinutes DECIMAL(8,2) NULL,
  OnTimeArrivalRate DECIMAL(5,4) NULL,
  CancellationRate DECIMAL(5,4) NOT NULL,
  DiversionRate DECIMAL(5,4) NOT NULL,
  FirstYearObserved INT NULL,
  LastYearObserved INT NULL,
  TopDelayCauseName VARCHAR(100) NULL,
  AvgMarketFare DECIMAL(10,2) NULL,
  OriginLatitude DECIMAL(9,6) NULL,
  OriginLongitude DECIMAL(9,6) NULL,
  DestinationLatitude DECIMAL(9,6) NULL,
  DestinationLongitude DECIMAL(9,6) NULL,
  ComputedAt DATETIME NOT NULL,

  PRIMARY KEY (RouteId),
  CONSTRAINT fk_rm_route FOREIGN KEY (RouteId) REFERENCES routes(Id),
  CONSTRAINT chk_rm_total CHECK (TotalFlights >= 0),
  CONSTRAINT chk_rm_cancel_rate CHECK (CancellationRate BETWEEN 0 AND 1),
  CONSTRAINT chk_rm_divert_rate CHECK (DiversionRate BETWEEN 0 AND 1),
  CONSTRAINT chk_rm_ontime_rate CHECK (OnTimeArrivalRate IS NULL OR OnTimeArrivalRate BETWEEN 0 AND 1),
  CONSTRAINT chk_rm_distance CHECK (DistanceMiles IS NULL OR DistanceMiles > 0),
  CONSTRAINT chk_rm_coords CHECK (
    (OriginLatitude IS NULL OR OriginLatitude BETWEEN -90 AND 90)
    AND (DestinationLatitude IS NULL OR DestinationLatitude BETWEEN -90 AND 90)
    AND (OriginLongitude IS NULL OR OriginLongitude BETWEEN -180 AND 180)
    AND (DestinationLongitude IS NULL OR DestinationLongitude BETWEEN -180 AND 180)
  ),
  CONSTRAINT chk_rm_completed CHECK (CompletedFlights >= 0 AND CompletedFlights <= TotalFlights),
  CONSTRAINT chk_rm_years CHECK (
    FirstYearObserved IS NULL
    OR LastYearObserved IS NULL
    OR FirstYearObserved <= LastYearObserved
  )
);

CREATE TABLE routemonthmetrics (
  RouteId INT NOT NULL,
  Month TINYINT NOT NULL,
  YearsObserved INT NOT NULL,
  TotalFlights INT NOT NULL,
  AvgDeptDelayMinutes DECIMAL(8,2) NULL,
  AvgArrDelayMinutes DECIMAL(8,2) NULL,
  OnTimeArrivalRate DECIMAL(5,4) NULL,
  CancellationRate DECIMAL(5,4) NOT NULL,
  DiversionRate DECIMAL(5,4) NOT NULL,

  PRIMARY KEY (RouteId, Month),
  CONSTRAINT fk_rmm_route FOREIGN KEY (RouteId) REFERENCES routemetrics(RouteId) ON DELETE CASCADE,
  CONSTRAINT chk_rmm_month CHECK (Month BETWEEN 1 AND 12),
  CONSTRAINT chk_rmm_years CHECK (YearsObserved > 0),
  CONSTRAINT chk_rmm_total CHECK (TotalFlights > 0),
  CONSTRAINT chk_rmm_cancel_rate CHECK (CancellationRate BETWEEN 0 AND 1)
);

CREATE TABLE routeairlinemetrics (
  RouteId INT NOT NULL,
  AirlineCode VARCHAR(10) NOT NULL,
  AirlineName VARCHAR(100) NULL,
  TotalFlights INT NOT NULL,
  AvgDeptDelayMinutes DECIMAL(8,2) NULL,
  AvgArrDelayMinutes DECIMAL(8,2) NULL,
  OnTimeArrivalRate DECIMAL(5,4) NULL,
  CancellationRate DECIMAL(5,4) NOT NULL,
  DiversionRate DECIMAL(5,4) NOT NULL,

  PRIMARY KEY (RouteId, AirlineCode),
  CONSTRAINT fk_ram_route FOREIGN KEY (RouteId) REFERENCES routemetrics(RouteId) ON DELETE CASCADE,
  CONSTRAINT chk_ram_total CHECK (TotalFlights > 0)
);

CREATE TABLE routedelaycausemetrics (
  RouteId INT NOT NULL,
  DelayCauseCode VARCHAR(20) NOT NULL,
  DelayCauseName VARCHAR(100) NULL,
  DelayedFlights INT NOT NULL,
  TotalDelayMinutes BIGINT NOT NULL,
  AvgDelayMinutes DECIMAL(8,2) NULL,

  PRIMARY KEY (RouteId, DelayCauseCode),
  CONSTRAINT fk_rdcm_route FOREIGN KEY (RouteId) REFERENCES routemetrics(RouteId) ON DELETE CASCADE,
  CONSTRAINT chk_rdcm_minutes CHECK (TotalDelayMinutes >= 0)
);

CREATE TABLE routefaremetrics (
  RouteId INT NOT NULL,
  Year INT NOT NULL,
  Quarter TINYINT NOT NULL,
  AverageFare DECIMAL(10,2) NOT NULL,
  LowestAirlineFare DECIMAL(10,2) NULL,
  LowestFareAirlineCode VARCHAR(10) NULL,
  LowestFareAirlineName VARCHAR(100) NULL,

  PRIMARY KEY (RouteId, Year, Quarter),
  CONSTRAINT fk_rfm_route FOREIGN KEY (RouteId) REFERENCES routemetrics(RouteId) ON DELETE CASCADE,
  CONSTRAINT chk_rfm_year CHECK (Year BETWEEN 1987 AND 2100),
  CONSTRAINT chk_rfm_quarter CHECK (Quarter BETWEEN 1 AND 4),
  CONSTRAINT chk_rfm_fare CHECK (AverageFare > 0)
);
