-- Create cryptocurrencies table for tracking supported crypto donations
CREATE TABLE IF NOT EXISTS cryptocurrencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(10) NOT NULL UNIQUE,  -- BTC, ETH, etc.
    name VARCHAR(100) NOT NULL,          -- Bitcoin, Ethereum, etc.
    coingecko_id VARCHAR(100),           -- ID for CoinGecko API integration
    coinmarketcap_id INTEGER,            -- ID for CoinMarketCap API integration
    is_active BOOLEAN DEFAULT 1,         -- Whether this crypto is currently accepted
    min_donation_usd DECIMAL(10,2) DEFAULT 10.00, -- Minimum donation in USD equivalent
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common cryptocurrencies
INSERT OR IGNORE INTO cryptocurrencies (symbol, name, coingecko_id, description) VALUES
('BTC', 'Bitcoin', 'bitcoin', 'The original cryptocurrency'),
('ETH', 'Ethereum', 'ethereum', 'Smart contract platform'),
('USDT', 'Tether', 'tether', 'USD stablecoin'),
('USDC', 'USD Coin', 'usd-coin', 'USD stablecoin'),
('BNB', 'Binance Coin', 'binancecoin', 'Binance exchange token'),
('SOL', 'Solana', 'solana', 'High-speed blockchain'),
('ADA', 'Cardano', 'cardano', 'Proof-of-stake blockchain'),
('DOGE', 'Dogecoin', 'dogecoin', 'Meme cryptocurrency'),
('MATIC', 'Polygon', 'matic-network', 'Ethereum scaling solution'),
('DOT', 'Polkadot', 'polkadot', 'Interoperability platform');

-- Create crypto_price_history table for IRS documentation
CREATE TABLE IF NOT EXISTS crypto_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crypto_id INTEGER REFERENCES cryptocurrencies(id),
    donation_id INTEGER REFERENCES donations(id),
    price_usd DECIMAL(20,8) NOT NULL,     -- Price at exact time of donation
    price_source VARCHAR(50),              -- 'coinbase', 'binance', 'coingecko', etc.
    price_timestamp TIMESTAMP NOT NULL,    -- Exact timestamp when price was fetched
    volume_24h DECIMAL(20,2),             -- 24-hour trading volume for reference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups
CREATE INDEX idx_crypto_symbol ON cryptocurrencies(symbol);
CREATE INDEX idx_crypto_active ON cryptocurrencies(is_active);
CREATE INDEX idx_price_history_donation ON crypto_price_history(donation_id);
CREATE INDEX idx_price_history_timestamp ON crypto_price_history(price_timestamp);