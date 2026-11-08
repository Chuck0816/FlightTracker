# Database Normalization 

To eliminate redundancy and update anomalies, we analyzed each relation against BCNF, identifying its functional dependencies (FDs) and candidate keys and verifying that every determinant is a superkey. 

### Airlines(Id, IataCode, DotId, Name)

#### FDs:

* Id → IataCode, DotId, Name  
* IataCode → Id, DotId, Name  
* DotId → Id, IataCode, Name

Since every relation on the left is a superkey, no BCNF is violated. 

### Cities(Id, Name, StateCode, StateName, Country) \[Before Normalization\]

#### FDs:

* Id → Name, StateCode, StateName, Country  
* StateCode → StateName, Country  
* StateName → StateCode, Country

Id is the only candidate key. StateCode and StateName, however, are not superkeys since they do not uniquely identify a row (there are many cities in a state), yet they determine the corresponding state attribute and Country. A non-superkey determinant violates BCNF. We resolve this by dropping the Country attribute (we are scoping our data to US only) and lifting the state dependency into a separate State relation which rejoins losslessly on StateCode and preserves dependency. The relation then breaks down to:

**Cities(Id, Name, StateCode)**  
**States(StateCode, StateName)**

### Airports(Id, IataCode, Name, Longitude, Latitude, Datasource, TimeZone, CityId)

#### FDs:

* Id → IataCode, Name, Longitude, Latitude, Datasource, TimeZone, CityId  
* IataCode → Id, Name, Longitude, Latitude, Datasource, TimeZone, CityId

Since every relation on the left is a superkey, no BCNF is violated. 

### Routes(Id, OriginAirportId, DestinationAirportId, DistanceMiles)

#### FDs:

* Id → OriginAirportId, DestinationAirportId, DistanceMiles  
* OriginAirportId, DestinationAirportId → Id, DistanceMiles

Since every relation on the left is a superkey, no BCNF is violated.

### FlightRecords(Id, Year, Month, Day, DayOfWeek, RouteId, MarketingAirlineId, MarketingFlightNumber, OperatingAirlineId, OperatingFlightNumber, TailNumber, ScheduledDeptTime, ActualDeptTime, DeptDelayMinutes, ArrDelayMinutes, ActualArrTime, ScheduledArrTime, Cancelled, Diverted, ScheduledElapsedTimeMinutes, ActualElapsedTimeMinutes)

#### FDs:

* Id → all other attributes

Since there is only one candidate key, no BCNF is violated.

### AirfareMarkets(Id, Year, Quarter, OriginMarketId, DestMarketId, AverageFare, LowestAirlineFare, LowestFareAirlineId)

#### FDs:

* Id → Year, Quarter, OriginMarketId, DestMarketId, AverageFare, LowestAirlineFare, LowestFareAirlineId  
* Year, Quarter, OriginMarketId, DestMarketId → Id, AverageFare, LowestAirlineFare, LowestFareAirlineId

Since every relation on the left is a superkey, no BCNF is violated.

### DelayCause(Id, Code, Name, Description)

#### FDs:

* Id → Code, Name, Description  
* Code → Id, Name, Description  
* Name → Id, Code, Description

Since every relation on the left is a superkey, no BCNF is violated.

### FlightDelayCause(FlightRecordId, DelayCauseId, DelayMinutes)

#### FDs:

* FlightRecordId, DelayCauseId → DelayMinutes

Since a flight can have multiple delay causes, the key is the composite (*FlightRecordId, DelayCauseId)* which is the only candidate key, so no BCNF is violated

### Users(Id, UserName, Email, PasswordHash, CreatedTimestamp, UpdatedTimestamp)

#### FDs:

* Id → all other attributes   
* UserName → all other attributes  
* Email → all other attributes

Since every relation on the left is a superkey, no BCNF is violated.

### SavedRoutes(Id, UserId, RouteId, Name, Note, UpdatedTimestamp, CreatedTimestamp)

#### FDs:

* Id → all other attributes 


Since there is only one candidate key, no BCNF is violated

### Market(Id, SourceMarketId, Name, StateCode, Source, IsMetroArea)

#### FDs:

* Id → SourceMarketId, Name, StateCode, Source, IsMetroArea  
* SourceMarketId, Source → Id, Name, StateCode, IsMetroArea

SourceMarketId is unique only within a source, so the natural key is the composite key (SourceMarketId, Source). The composite key and Id are superkeys, so no BCNF is violated. 

### AirportMarkets(AirportId, MarketId, Source)

#### FDs:

* AirportId, MarketId → Source

The composite (AirportId, MarketId) is the only candidate key and the determinant of the sole FD, so no BCNF is violated.

