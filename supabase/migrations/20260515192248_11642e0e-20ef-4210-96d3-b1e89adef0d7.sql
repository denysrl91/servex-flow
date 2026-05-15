-- Recalculate a customer's lifetime value from completed payments
CREATE OR REPLACE FUNCTION public.recalc_customer_ltv(_customer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.customers c
  SET lifetime_value = COALESCE((
    SELECT SUM(p.amount)
    FROM public.payments p
    WHERE p.customer_id = _customer_id
      AND p.status = 'completed'
  ), 0),
  updated_at = now()
  WHERE c.id = _customer_id;
END;
$$;

-- Trigger function for payments table
CREATE OR REPLACE FUNCTION public.payments_update_customer_ltv()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalc_customer_ltv(OLD.customer_id);
    RETURN OLD;
  END IF;

  PERFORM public.recalc_customer_ltv(NEW.customer_id);
  IF TG_OP = 'UPDATE' AND OLD.customer_id IS DISTINCT FROM NEW.customer_id THEN
    PERFORM public.recalc_customer_ltv(OLD.customer_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_ltv ON public.payments;
CREATE TRIGGER trg_payments_ltv
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.payments_update_customer_ltv();

-- Backfill existing customers
UPDATE public.customers c
SET lifetime_value = COALESCE((
  SELECT SUM(p.amount) FROM public.payments p
  WHERE p.customer_id = c.id AND p.status = 'completed'
), 0);

-- Date-based document number generator: PREFIX-YYYYMMDD-### (per company per day)
CREATE OR REPLACE FUNCTION public.next_doc_number(_company_id uuid, _prefix text, _table text, _column text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _date_part text := to_char(now(), 'YYYYMMDD');
  _pattern text := _prefix || '-' || _date_part || '-%';
  _next int;
  _sql text;
BEGIN
  _sql := format(
    'SELECT COALESCE(MAX(NULLIF(regexp_replace(%I, ''^.*-'', ''''), '''')::int), 0) + 1
     FROM public.%I
     WHERE company_id = $1 AND %I LIKE $2',
    _column, _table, _column
  );
  EXECUTE _sql INTO _next USING _company_id, _pattern;
  RETURN _prefix || '-' || _date_part || '-' || lpad(_next::text, 3, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalc_customer_ltv(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_doc_number(uuid, text, text, text) TO authenticated;