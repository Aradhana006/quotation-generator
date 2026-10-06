/**
 * Future optional email delivery.
 * This project currently uses FREE public-link sharing only.
 * Do not import Resend/SendGrid/SES here until you intentionally enable email.
 */

export function getSafeEmailError() {
  return {
    code: 'EMAIL_NOT_CONFIGURED',
    message: 'Email delivery is not enabled. Use the public share link instead.',
  }
}

export async function sendQuotationEmail() {
  return {
    ok: false,
    errorCode: 'EMAIL_NOT_CONFIGURED',
  }
}
