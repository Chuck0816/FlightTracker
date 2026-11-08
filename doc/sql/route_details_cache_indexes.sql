CREATE INDEX idx_airfare_market_pair
ON airfaremarkets (OriginMarketId, DestMarketId, Year, Quarter);

CREATE INDEX idx_markets_source_sourceid
ON markets (Source, SourceMarketId);
