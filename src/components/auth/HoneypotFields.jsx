/**
 * Invisible fields bots tend to fill. Keep visually hidden from real users.
 */
export const honeypotFieldClassName =
  'absolute left-[-10000px] top-auto h-px w-px overflow-hidden opacity-0'

function HoneypotFields({ website, fax, onWebsiteChange, onFaxChange }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
      <label htmlFor="company_website_url">Website</label>
      <input
        id="company_website_url"
        name="company_website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => onWebsiteChange(event.target.value)}
        className={honeypotFieldClassName}
      />
      <label htmlFor="company_fax_number">Fax</label>
      <input
        id="company_fax_number"
        name="company_fax_number"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={fax}
        onChange={(event) => onFaxChange(event.target.value)}
        className={honeypotFieldClassName}
      />
    </div>
  )
}

export default HoneypotFields
