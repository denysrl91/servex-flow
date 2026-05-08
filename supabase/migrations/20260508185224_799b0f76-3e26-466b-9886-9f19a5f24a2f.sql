
ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS vendor_name text,
  ADD COLUMN IF NOT EXISTS vendor_email text,
  ADD COLUMN IF NOT EXISTS vendor_phone text,
  ADD COLUMN IF NOT EXISTS min_stock_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_serial boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_company ON public.inventory_stock(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_company ON public.inventory_transactions(company_id, created_at DESC);
