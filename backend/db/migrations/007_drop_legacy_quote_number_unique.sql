-- Drop leftover unique indexes that prevent same quotation_number across revisions.

ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_company_profile_id_quotation_number_key;
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_company_id_quotation_number_key;
DROP INDEX IF EXISTS quotations_company_profile_id_quotation_number_key;
DROP INDEX IF EXISTS quotations_company_id_quotation_number_key;
