/**
 * Invisible fields bots tend to fill. Keep visually hidden from real users.
 */
export const honeypotFieldClassName =
  'absolute left-[-10000px] top-auto h-px w-px overflow-hidden opacity-0'

function HoneypotFields({ website, fax, onWebsiteChange, onFaxChange }) {
  return (
    <div aria-hidden="true">
      <label htmlFor="website">Website</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => onWebsiteChange(event.target.value)}
        className={honeypotFieldClassName}
      />
      <label htmlFor="fax">Fax</label>
      <input
        id="fax"
        name="fax"
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
