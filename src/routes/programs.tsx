import { Hono } from 'hono'
import { mapProgram } from '../lib/db'

export const programRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

programRoutes.get('/', async (c) => {
  const db = c.env.DB
  const country = c.req.query('country')
  const level = c.req.query('level')
  const field = c.req.query('field')
  const q = c.req.query('q')

  let sql = 'SELECT * FROM Program WHERE 1=1'
  const params: string[] = []
  if (country) { sql += ' AND country = ?'; params.push(country) }
  if (level) { sql += ' AND level = ?'; params.push(level) }
  if (field) { sql += ' AND field = ?'; params.push(field) }
  if (q) { sql += ' AND (name LIKE ? OR institution LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }
  sql += ' ORDER BY featured DESC, featuredRank, rating DESC'

  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(...params)
  const result = await stmt.all()
  const programs = result.results.map(mapProgram)

  const [countries, fields, levels] = await Promise.all([
    db.prepare('SELECT DISTINCT country FROM Program ORDER BY country').all(),
    db.prepare('SELECT DISTINCT field FROM Program ORDER BY field').all(),
    db.prepare('SELECT DISTINCT level FROM Program ORDER BY level').all(),
  ])

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-800 mb-2">Study Programs</h1>
        <p class="text-slate-600">Browse and filter {programs.length} programs from top institutions worldwide</p>
      </div>

      {/* Filters */}
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form method="get" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" name="q" placeholder="Search programs..." value={q || ''} class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <select name="country" class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Countries</option>
            {countries.results.map((r: any) => <option value={r.country} selected={country === r.country}>{r.country}</option>)}
          </select>
          <select name="level" class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Levels</option>
            {levels.results.map((r: any) => <option value={r.level} selected={level === r.level}>{r.level}</option>)}
          </select>
          <div class="flex gap-2">
            <select name="field" class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1">
              <option value="">All Fields</option>
              {fields.results.map((r: any) => <option value={r.field} selected={field === r.field}>{r.field}</option>)}
            </select>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><i class="fas fa-filter"></i></button>
          </div>
        </form>
      </div>

      {/* Results */}
      {programs.length === 0 ? (
        <div class="text-center py-16 bg-white rounded-xl shadow-sm">
          <i class="fas fa-search text-4xl text-slate-300 mb-4"></i>
          <p class="text-slate-500">No programs found matching your filters.</p>
          <a href="/programs" class="inline-block mt-4 text-emerald-600 hover:underline">Clear filters</a>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(p => (
            <a href={`/programs/${p.id}`} class="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all flex flex-col">
              <div class="flex justify-between items-start mb-3">
                <div class="flex gap-1">
                  <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">{p.level}</span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{p.field}</span>
                </div>
                {p.featured && <span class="text-amber-500 text-sm"><i class="fas fa-star"></i> Featured</span>}
              </div>
              <h3 class="text-lg font-bold text-slate-800 mb-1">{p.name}</h3>
              <p class="text-sm text-slate-600 mb-2">{p.institution}</p>
              <p class="text-sm text-slate-500 mb-4"><i class="fas fa-map-marker-alt mr-1"></i>{p.country}</p>
              <div class="mt-auto grid grid-cols-2 gap-2 text-sm pt-4 border-t border-slate-100">
                <div>
                  <span class="text-xs text-slate-400">Duration</span>
                  <div class="font-medium text-slate-700">{p.duration}</div>
                </div>
                <div>
                  <span class="text-xs text-slate-400">Intake</span>
                  <div class="font-medium text-slate-700">{p.intake}</div>
                </div>
                <div>
                  <span class="text-xs text-slate-400">Language</span>
                  <div class="font-medium text-slate-700">{p.language}</div>
                </div>
                <div>
                  <span class="text-xs text-slate-400">Tuition/yr</span>
                  <div class="font-bold text-emerald-700">{p.tuition === 0 ? 'Free' : `$${p.tuition.toLocaleString()}`}</div>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-amber-500"><i class="fas fa-star"></i> {p.rating}</span>
                <span class="text-emerald-600 text-sm font-medium">View details <i class="fas fa-arrow-right ml-1"></i></span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>,
    { title: 'Programs' }
  )
})

programRoutes.get('/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const prog = await db.prepare('SELECT * FROM Program WHERE id = ?').bind(id).first()
  if (!prog) return c.notFound()
  const p = mapProgram(prog)

  // Get related programs from same country/field
  const related = await db.prepare('SELECT * FROM Program WHERE country = ? AND id != ? ORDER BY RANDOM() LIMIT 3').bind(p.country, p.id).all()
  const relatedProgs = related.results.map(mapProgram)

  // Get institution info
  const inst = await db.prepare('SELECT * FROM Institution WHERE name = ?').bind(p.institution).first()

  return c.render(
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="/programs" class="text-emerald-600 text-sm mb-4 inline-block"><i class="fas fa-arrow-left mr-1"></i>Back to Programs</a>
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex gap-2 mb-4">
              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">{p.level}</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{p.field}</span>
              {p.featured && <span class="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full"><i class="fas fa-star mr-1"></i>Featured</span>}
            </div>
            <h1 class="text-3xl font-bold text-slate-800 mb-2">{p.name}</h1>
            <p class="text-lg text-slate-600 mb-4">{p.institution}</p>
            <div class="flex items-center gap-4 text-slate-500 mb-6">
              <span><i class="fas fa-map-marker-alt mr-1"></i>{p.country}</span>
              <span><i class="fas fa-star text-amber-400"></i> {p.rating} rating</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
              <div class="text-center">
                <div class="text-2xl font-bold text-emerald-700">{p.tuition === 0 ? 'Free' : `$${(p.tuition/1000).toFixed(0)}k`}</div>
                <div class="text-xs text-slate-500 mt-1">Tuition/year</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-slate-800">{p.duration}</div>
                <div class="text-xs text-slate-500 mt-1">Duration</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-slate-800">{p.language}</div>
                <div class="text-xs text-slate-500 mt-1">Language</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-slate-800">{p.intake}</div>
                <div class="text-xs text-slate-500 mt-1">Intake</div>
              </div>
            </div>

            <div class="mt-6">
              <h2 class="text-xl font-bold text-slate-800 mb-3">Program Overview</h2>
              <p class="text-slate-600">The {p.name} at {p.institution} is a {p.level} program in {p.field}, offered in {p.country}. The program runs for {p.duration} with intakes in {p.intake}, taught in {p.language}. {p.tuition === 0 ? 'This program is tuition-free, making it an excellent value option.' : `Annual tuition is $${p.tuition.toLocaleString()}.`}</p>
            </div>

            {inst && (
              <div class="mt-6 bg-slate-50 rounded-lg p-5">
                <h3 class="font-bold text-slate-800 mb-2">About {p.institution}</h3>
                <p class="text-sm text-slate-600 mb-3">{inst.description}</p>
                <a href={`/institutions/${inst.id}`} class="text-emerald-600 text-sm font-medium">View university <i class="fas fa-arrow-right ml-1"></i></a>
              </div>
            )}
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
            <h3 class="font-bold text-slate-800 mb-3">Apply for this Program</h3>
            <p class="text-sm text-slate-600 mb-4">Get personalized guidance on your application, visa, and scholarships.</p>
            <a href="/register" class="block w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 text-center">
              <i class="fas fa-rocket mr-2"></i>Start Application
            </a>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-slate-800 mb-3">Quick Facts</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between"><dt class="text-slate-500">Level</dt><dd class="font-medium">{p.level}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Field</dt><dd class="font-medium">{p.field}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Country</dt><dd class="font-medium">{p.country}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Tuition</dt><dd class="font-medium">{p.tuition === 0 ? 'Free' : `$${p.tuition.toLocaleString()}/yr`}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Rating</dt><dd class="font-medium text-amber-500"><i class="fas fa-star"></i> {p.rating}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      {relatedProgs.length > 0 && (
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-slate-800 mb-4">Related Programs in {p.country}</h2>
          <div class="grid sm:grid-cols-3 gap-4">
            {relatedProgs.map(rp => (
              <a href={`/programs/${rp.id}`} class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
                <h3 class="font-bold text-slate-800">{rp.name}</h3>
                <p class="text-sm text-slate-500">{rp.institution}</p>
                <p class="text-sm text-emerald-600 mt-2">{rp.tuition === 0 ? 'Free' : `$${rp.tuition.toLocaleString()}/yr`}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>,
    { title: p.name }
  )
})
