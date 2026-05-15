
-- Helper to add FK only if it doesn't already exist
DO $$
DECLARE
  r record;
  fks text[][] := ARRAY[
    -- [table, column, ref_table, ref_column, on_delete]
    ['profiles','company_id','companies','id','SET NULL'],
    ['user_roles','company_id','companies','id','CASCADE'],
    ['company_settings','company_id','companies','id','CASCADE'],
    ['business_locations','company_id','companies','id','CASCADE'],
    ['customers','company_id','companies','id','CASCADE'],
    ['customer_communications','company_id','companies','id','CASCADE'],
    ['customer_communications','customer_id','customers','id','CASCADE'],
    ['customer_photos','company_id','companies','id','CASCADE'],
    ['customer_photos','customer_id','customers','id','CASCADE'],
    ['properties','company_id','companies','id','CASCADE'],
    ['properties','customer_id','customers','id','CASCADE'],
    ['equipment','company_id','companies','id','CASCADE'],
    ['equipment','property_id','properties','id','CASCADE'],
    ['equipment','customer_id','customers','id','SET NULL'],
    ['equipment_photos','company_id','companies','id','CASCADE'],
    ['equipment_photos','equipment_id','equipment','id','CASCADE'],
    ['jobs','company_id','companies','id','CASCADE'],
    ['jobs','customer_id','customers','id','RESTRICT'],
    ['jobs','property_id','properties','id','SET NULL'],
    ['jobs','equipment_id','equipment','id','SET NULL'],
    ['job_photos','company_id','companies','id','CASCADE'],
    ['job_photos','job_id','jobs','id','CASCADE'],
    ['estimates','company_id','companies','id','CASCADE'],
    ['estimates','customer_id','customers','id','RESTRICT'],
    ['estimates','property_id','properties','id','SET NULL'],
    ['estimates','job_id','jobs','id','SET NULL'],
    ['estimates','equipment_id','equipment','id','SET NULL'],
    ['estimate_options','company_id','companies','id','CASCADE'],
    ['estimate_options','estimate_id','estimates','id','CASCADE'],
    ['estimate_line_items','company_id','companies','id','CASCADE'],
    ['estimate_line_items','estimate_id','estimates','id','CASCADE'],
    ['estimate_line_items','option_id','estimate_options','id','CASCADE'],
    ['estimate_line_items','item_id','inventory_items','id','SET NULL'],
    ['estimate_photos','company_id','companies','id','CASCADE'],
    ['estimate_photos','estimate_id','estimates','id','CASCADE'],
    ['invoices','company_id','companies','id','CASCADE'],
    ['invoices','customer_id','customers','id','RESTRICT'],
    ['invoices','job_id','jobs','id','SET NULL'],
    ['invoices','estimate_id','estimates','id','SET NULL'],
    ['invoice_line_items','company_id','companies','id','CASCADE'],
    ['invoice_line_items','invoice_id','invoices','id','CASCADE'],
    ['invoice_line_items','item_id','inventory_items','id','SET NULL'],
    ['payments','company_id','companies','id','CASCADE'],
    ['payments','invoice_id','invoices','id','CASCADE'],
    ['payments','customer_id','customers','id','RESTRICT'],
    ['inventory_items','company_id','companies','id','CASCADE'],
    ['inventory_locations','company_id','companies','id','CASCADE'],
    ['inventory_stock','company_id','companies','id','CASCADE'],
    ['inventory_stock','item_id','inventory_items','id','CASCADE'],
    ['inventory_stock','location_id','inventory_locations','id','CASCADE'],
    ['inventory_transactions','company_id','companies','id','CASCADE'],
    ['inventory_transactions','item_id','inventory_items','id','RESTRICT'],
    ['inventory_transactions','from_location_id','inventory_locations','id','SET NULL'],
    ['inventory_transactions','to_location_id','inventory_locations','id','SET NULL'],
    ['inventory_transactions','job_id','jobs','id','SET NULL'],
    ['purchase_orders','company_id','companies','id','CASCADE'],
    ['purchase_orders','warehouse_id','inventory_locations','id','SET NULL'],
    ['purchase_order_items','company_id','companies','id','CASCADE'],
    ['purchase_order_items','purchase_order_id','purchase_orders','id','CASCADE'],
    ['purchase_order_items','item_id','inventory_items','id','SET NULL'],
    ['dispatch_assignments','company_id','companies','id','CASCADE'],
    ['dispatch_assignments','job_id','jobs','id','CASCADE'],
    ['documents','company_id','companies','id','CASCADE'],
    ['documents','customer_id','customers','id','CASCADE'],
    ['documents','property_id','properties','id','SET NULL'],
    ['documents','job_id','jobs','id','SET NULL'],
    ['documents','estimate_id','estimates','id','SET NULL'],
    ['documents','invoice_id','invoices','id','SET NULL'],
    ['memberships','company_id','companies','id','CASCADE'],
    ['memberships','customer_id','customers','id','CASCADE'],
    ['memberships','property_id','properties','id','SET NULL'],
    ['maintenance_agreements','company_id','companies','id','CASCADE'],
    ['maintenance_agreements','customer_id','customers','id','CASCADE'],
    ['maintenance_agreements','property_id','properties','id','SET NULL'],
    ['pm_schedules','company_id','companies','id','CASCADE'],
    ['pm_schedules','customer_id','customers','id','CASCADE'],
    ['pm_schedules','property_id','properties','id','SET NULL'],
    ['pm_schedules','equipment_id','equipment','id','SET NULL'],
    ['pm_schedules','agreement_id','maintenance_agreements','id','SET NULL'],
    ['installations','company_id','companies','id','CASCADE'],
    ['installations','customer_id','customers','id','SET NULL'],
    ['installations','property_id','properties','id','SET NULL'],
    ['notifications','company_id','companies','id','CASCADE'],
    ['notifications','user_id','users','id','CASCADE'],
    ['projects','company_id','companies','id','CASCADE'],
    ['projects','customer_id','customers','id','SET NULL'],
    ['projects','property_id','properties','id','SET NULL'],
    ['reviews','company_id','companies','id','CASCADE'],
    ['reviews','customer_id','customers','id','SET NULL'],
    ['reviews','job_id','jobs','id','SET NULL'],
    ['assets','company_id','companies','id','CASCADE'],
    ['assets','location_id','business_locations','id','SET NULL'],
    ['commercial_accounts','company_id','companies','id','CASCADE'],
    ['commercial_accounts','customer_id','customers','id','CASCADE'],
    ['module_records','company_id','companies','id','CASCADE']
  ];
  i int;
  cname text;
  ref_schema text;
BEGIN
  FOR i IN 1..array_length(fks,1) LOOP
    cname := 'fk_' || fks[i][1] || '_' || fks[i][2];
    ref_schema := CASE WHEN fks[i][3] = 'users' THEN 'auth' ELSE 'public' END;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = cname
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s NOT VALID',
        fks[i][1], cname, fks[i][2], ref_schema, fks[i][3], fks[i][4], fks[i][5]
      );
    END IF;
  END LOOP;
END $$;

-- Indexes on FK columns to keep cascades + joins fast
DO $$
DECLARE
  idx text[][] := ARRAY[
    ['customer_communications','customer_id'],
    ['customer_photos','customer_id'],
    ['properties','customer_id'],
    ['equipment','property_id'],
    ['equipment_photos','equipment_id'],
    ['jobs','customer_id'],
    ['jobs','property_id'],
    ['job_photos','job_id'],
    ['estimates','customer_id'],
    ['estimates','property_id'],
    ['estimates','job_id'],
    ['estimate_options','estimate_id'],
    ['estimate_line_items','estimate_id'],
    ['estimate_photos','estimate_id'],
    ['invoices','customer_id'],
    ['invoices','job_id'],
    ['invoices','estimate_id'],
    ['invoice_line_items','invoice_id'],
    ['payments','invoice_id'],
    ['payments','customer_id'],
    ['inventory_stock','item_id'],
    ['inventory_stock','location_id'],
    ['inventory_transactions','item_id'],
    ['purchase_order_items','purchase_order_id'],
    ['dispatch_assignments','job_id'],
    ['documents','customer_id'],
    ['memberships','customer_id'],
    ['notifications','user_id'],
    ['module_records','company_id']
  ];
  i int;
  iname text;
BEGIN
  FOR i IN 1..array_length(idx,1) LOOP
    iname := 'idx_' || idx[i][1] || '_' || idx[i][2];
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = iname) THEN
      EXECUTE format('CREATE INDEX %I ON public.%I(%I)', iname, idx[i][1], idx[i][2]);
    END IF;
  END LOOP;
END $$;
