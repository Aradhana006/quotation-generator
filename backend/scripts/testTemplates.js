import dotenv from 'dotenv'

dotenv.config()

const BASE = 'http://localhost:3001/api'
const ts = Date.now()

function pngBuffer() {
  return Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009077453c0000000a49444154789c6360000002000100ffff03000006000557bf2dd40000000049454e44ae426082',
    'hex',
  )
}

function cookieFrom(response) {
  const raw = response.headers.getSetCookie?.() || []
  return raw.map((value) => value.split(';')[0]).join('; ')
}

async function register(name, email, companyName) {
  const response = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: 'secret12', companyName }),
  })
  const json = await response.json()
  return { json, cookie: cookieFrom(response) }
}

async function run() {
  const a = await register('Alice', `tpl-a-${ts}@test.com`, 'Template Co A')
  const b = await register('Bob', `tpl-b-${ts}@test.com`, 'Template Co B')

  const listBuiltin = await fetch(`${BASE}/templates`, { headers: { Cookie: a.cookie } })
  const builtinJson = await listBuiltin.json()
  const builtinCount = builtinJson.data.filter((item) => item.type === 'builtin').length
  console.log('builtin_count', builtinCount)

  const form = new FormData()
  form.append('name', 'Company A Format')
  form.append('file', new Blob([pngBuffer()], { type: 'image/png' }), 'format.png')

  const uploaded = await fetch(`${BASE}/templates`, {
    method: 'POST',
    headers: { Cookie: a.cookie },
    body: form,
  })
  const uploadedJson = await uploaded.json()
  console.log('upload_ok', uploadedJson.success, uploadedJson.data?.name)

  const exe = new FormData()
  exe.append('name', 'Bad')
  exe.append('file', new Blob([Buffer.from('MZ')], { type: 'application/octet-stream' }), 'virus.exe')
  const rejected = await fetch(`${BASE}/templates`, {
    method: 'POST',
    headers: { Cookie: a.cookie },
    body: exe,
  })
  const rejectedJson = await rejected.json()
  console.log('invalid_rejected', rejectedJson.success === false)

  const listB = await fetch(`${BASE}/templates`, { headers: { Cookie: b.cookie } })
  const listBJson = await listB.json()
  const bCustom = listBJson.data.filter((item) => item.type === 'custom')
  console.log('b_custom_count', bCustom.length)

  const sneak = await fetch(`${BASE}/templates/${uploadedJson.data.id}`, {
    headers: { Cookie: b.cookie },
  })
  const sneakJson = await sneak.json()
  console.log('b_cannot_read_a', sneakJson.success === false)

  const listA = await fetch(`${BASE}/templates`, { headers: { Cookie: a.cookie } })
  const listAJson = await listA.json()
  const aCustom = listAJson.data.filter((item) => item.type === 'custom')
  console.log('a_custom_count', aCustom.length)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
