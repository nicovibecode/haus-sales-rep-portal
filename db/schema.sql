CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  rep_name TEXT,
  rep_email TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  shipping_address TEXT,
  product TEXT,
  quantity_sqft REAL,
  boxes_needed INTEGER,
  retail_price_sqft REAL,
  client_price_sqft REAL,
  discount_pct REAL,
  retail_total REAL,
  client_total REAL,
  commission_amount REAL,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS rep_settings (
  rep_email TEXT PRIMARY KEY,
  disabled_product_ids TEXT NOT NULL DEFAULT '[]',
  max_discounts TEXT NOT NULL DEFAULT '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}',
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS samples (
  id TEXT PRIMARY KEY,
  rep_name TEXT,
  rep_email TEXT,
  client_name TEXT,
  client_email TEXT,
  shipping_address TEXT,
  products TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Requested',
  created_at TEXT
);
