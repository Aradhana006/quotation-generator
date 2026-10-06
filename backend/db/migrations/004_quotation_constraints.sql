-- Migration 004: Financial and status constraints for quotations.

DELETE FROM quotation_items WHERE quantity <= 0;
DELETE FROM quotation_charges WHERE amount < 0;
DELETE FROM quotations WHERE quotation_number LIKE 'ROLLBACK-TEST-%';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotations_status_check') THEN
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_status_check
      CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotations_company_number_unique') THEN
    ALTER TABLE quotations
      ADD CONSTRAINT quotations_company_number_unique UNIQUE (company_id, quotation_number);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_discount_type_check') THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_discount_type_check
      CHECK (discount_type IN ('percentage', 'fixed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_quantity_positive') THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_quantity_positive CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotation_items_unit_price_non_negative') THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT quotation_items_unit_price_non_negative CHECK (unit_price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotation_charges_amount_non_negative') THEN
    ALTER TABLE quotation_charges
      ADD CONSTRAINT quotation_charges_amount_non_negative CHECK (amount >= 0);
  END IF;
END $$;
