import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { generateId, generateRefCode } from '../lib/db'

export const apiRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

apiRoutes.use('*', cors())

// ============ Registration ============
apiRoutes.post('/register', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { fullName, email, phone, country, destination, field, level, budget, intake, notes, refCode } = body

  if (!fullName || !email) {
    return c.json({ error: 'Name and email are required' }, 400)
  }

  const id = generateId('reg')
  await db.prepare(`
    INSERT INTO Registration (id, fullName, email, phone, country, destination, field, level, budget, intake, notes, refCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, fullName, email, phone || null, country || null, destination || null, field || null, level || null, budget || null, intake || null, notes || null, refCode || null).run()

  // Track analytics
  await trackEvent(db, 'register', { destination, field, level })

  return c.json({ success: true, id, message: 'Registration successful! Check your email for next steps.' })
})

// ============ Waitlist ============
apiRoutes.post('/waitlist', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { name, email, referredBy } = body

  if (!email) {
    return c.json({ error: 'Email is required' }, 400)
  }

  // Check if already on waitlist
  const existing = await db.prepare('SELECT * FROM WaitlistEntry WHERE email = ?').bind(email).first()
  if (existing) {
    return c.json({ success: true, id: existing.id, position: existing.position, referralCode: existing.referralCode, message: 'You are already on the waitlist!' })
  }

  const id = generateId('wl')
  const referralCode = generateRefCode()

  // Get current position
  const countResult = await db.prepare('SELECT COUNT(*) as cnt FROM WaitlistEntry').first()
  const position = (countResult?.cnt || 0) + 1

  // Track referral if referredBy provided
  if (referredBy) {
    await db.prepare('UPDATE WaitlistEntry SET referralsCount = referralsCount + 1 WHERE referralCode = ?').bind(referredBy).run()
  }

  await db.prepare(`
    INSERT INTO WaitlistEntry (id, email, name, referralCode, referredBy, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, email, name || null, referralCode, referredBy || null, position).run()

  return c.json({ success: true, id, position, referralCode, message: `You're #${position} on the waitlist! Share code ${referralCode} to move up.` })
})

// ============ Lead Capture ============
apiRoutes.post('/lead', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { email, source, name, destination, field } = body

  if (!email || !source) {
    return c.json({ error: 'Email and source are required' }, 400)
  }

  const id = generateId('lead')
  await db.prepare(`
    INSERT INTO LeadCapture (id, email, source, name, destination, field)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, email, source, name || null, destination || null, field || null).run()

  return c.json({ success: true, id, message: 'Thank you! We will be in touch.' })
})

// ============ Partner Inquiry ============
apiRoutes.post('/partner', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { companyName, type, contactName, email, country, website, notes } = body

  if (!companyName || !email) {
    return c.json({ error: 'Company name and email are required' }, 400)
  }

  const id = generateId('partner')
  await db.prepare(`
    INSERT INTO Partner (id, type, companyName, contactName, email, country, website, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, type || 'institution', companyName, contactName || null, email, country || null, website || null, notes || null).run()

  return c.json({ success: true, id, message: 'Thank you! Our partnership team will contact you within 48 hours.' })
})

// ============ Community Post ============
apiRoutes.post('/community/post', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { channelId, authorName, authorEmail, title, content } = body

  if (!authorName || !authorEmail || !content) {
    return c.json({ error: 'Name, email, and content are required' }, 400)
  }

  const id = generateId('cp')
  await db.prepare(`
    INSERT INTO CommunityPost (id, channelId, authorName, authorEmail, title, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, channelId || 'general', authorName, authorEmail, title || null, content).run()

  return c.json({ success: true, id, message: 'Post created successfully!' })
})

// ============ Community Vote ============
apiRoutes.post('/community/vote', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { postId, voterEmail, value } = body

  if (!postId || !voterEmail) {
    return c.json({ error: 'Post ID and voter email are required' }, 400)
  }

  // Check existing vote
  const existing = await db.prepare('SELECT * FROM CommunityVote WHERE postId = ? AND voterEmail = ?').bind(postId, voterEmail).first()
  if (existing) {
    return c.json({ success: false, message: 'Already voted' })
  }

  const id = generateId('cv')
  await db.prepare('INSERT INTO CommunityVote (id, postId, voterEmail, value) VALUES (?, ?, ?, ?)').bind(id, postId, voterEmail, value || 1).run()
  await db.prepare('UPDATE CommunityPost SET upvotes = upvotes + ? WHERE id = ?').bind(value || 1, postId).run()

  return c.json({ success: true, message: 'Voted!' })
})

// ============ Study Buddy ============
apiRoutes.post('/buddy', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { userEmail, userName, destination, field, level, budget, startTerm, bio } = body

  if (!userEmail || !userName || !destination) {
    return c.json({ error: 'Name, email, and destination are required' }, 400)
  }

  const id = generateId('sb')
  // Upsert
  await db.prepare('DELETE FROM StudyBuddyProfile WHERE userEmail = ?').bind(userEmail).run()
  await db.prepare(`
    INSERT INTO StudyBuddyProfile (id, userEmail, userName, destination, field, level, budget, startTerm, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, userEmail, userName, destination, field || null, level || null, budget || null, startTerm || null, bio || null).run()

  // Find matches
  const matches = await db.prepare(`
    SELECT * FROM StudyBuddyProfile WHERE destination = ? AND userEmail != ? LIMIT 5
  `).bind(destination, userEmail).all()

  return c.json({ success: true, id, matches: matches.results, message: matches.results.length > 0 ? `Found ${matches.results.length} potential buddies!` : 'Profile saved! We will notify you when matches are found.' })
})

// ============ Contact ============
apiRoutes.post('/contact', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { name, email, subject, message } = body

  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400)
  }

  const id = generateId('contact')
  await db.prepare(`
    INSERT INTO LeadCapture (id, email, source, name)
    VALUES (?, ?, ?, ?)
  `).bind(id, email, `contact:${subject || 'general'}`, name).run()

  return c.json({ success: true, id, message: 'Thank you for your message! We will respond within 24 hours.' })
})

// ============ Analytics Event ============
apiRoutes.post('/analytics', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { event, sessionId, userId, page, props } = body

  if (!event) {
    return c.json({ error: 'Event type is required' }, 400)
  }

  const id = generateId('ae')
  await db.prepare(`
    INSERT INTO AnalyticsEvent (id, event, sessionId, userId, page, props)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, event, sessionId || null, userId || null, page || null, props ? JSON.stringify(props) : null).run()

  return c.json({ success: true })
})

// ============ Affiliate Click ============
apiRoutes.post('/affiliate/click', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { registrationId, partner, label, url } = body

  if (!partner || !url) {
    return c.json({ error: 'Partner and URL are required' }, 400)
  }

  const id = generateId('ac')
  await db.prepare(`
    INSERT INTO AffiliateClick (id, registrationId, partner, label, url)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, registrationId || null, partner, label || null, url).run()

  return c.json({ success: true })
})

// ============ Public Data API ============
apiRoutes.get('/destinations', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM Destination ORDER BY country').all()
  return c.json({ destinations: result.results })
})

apiRoutes.get('/programs', async (c) => {
  const db = c.env.DB
  const country = c.req.query('country')
  const field = c.req.query('field')
  const level = c.req.query('level')

  let sql = 'SELECT * FROM Program WHERE 1=1'
  const params: string[] = []
  if (country) { sql += ' AND country = ?'; params.push(country) }
  if (field) { sql += ' AND field = ?'; params.push(field) }
  if (level) { sql += ' AND level = ?'; params.push(level) }
  sql += ' ORDER BY featured DESC, rating DESC'

  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(...params)
  const result = await stmt.all()
  return c.json({ programs: result.results })
})

apiRoutes.get('/institutions', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM Institution ORDER BY rating DESC').all()
  return c.json({ institutions: result.results })
})

apiRoutes.get('/search', async (c) => {
  const db = c.env.DB
  const q = c.req.query('q')
  if (!q) return c.json({ results: [] })

  const [dests, progs, insts] = await Promise.all([
    db.prepare('SELECT id, country as title, blurb as desc, "destination" as type FROM Destination WHERE country LIKE ? LIMIT 3').bind(`%${q}%`).all(),
    db.prepare('SELECT id, name as title, institution as desc, "program" as type FROM Program WHERE name LIKE ? OR institution LIKE ? LIMIT 5').bind(`%${q}%`, `%${q}%`).all(),
    db.prepare('SELECT id, name as title, city as desc, "institution" as type FROM Institution WHERE name LIKE ? OR city LIKE ? LIMIT 3').bind(`%${q}%`, `%${q}%`).all(),
  ])

  return c.json({ results: [...dests.results, ...progs.results, ...insts.results] })
})

// ============ Health Check ============
apiRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Helper function
async function trackEvent(db: D1Database, event: string, props: any = {}) {
  const id = generateId('ae')
  await db.prepare(`
    INSERT INTO AnalyticsEvent (id, event, props)
    VALUES (?, ?, ?)
  `).bind(id, event, JSON.stringify(props)).run()
}
