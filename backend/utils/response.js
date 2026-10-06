export function successResponse(res, data, message = '', statusCode = 200, extra = null) {
  const body = { success: true, message }
  if (data !== undefined && data !== null) {
    body.data = data
  }
  if (extra && typeof extra === 'object') {
    Object.assign(body, extra)
  }
  return res.status(statusCode).json(body)
}

export function errorResponse(res, code, message, statusCode = 400, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  })
}
