import { Hono } from 'hono'
import { mapInstitution, mapProgram } from '../lib/db'

export const institutionRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

institutionRoutes.get('/', async (c) => {
  const db = c.env.DB
  const q = c.req.query('q')
  const country = c.req.query('country')

  let sql = 'SELECT * FROM Institution WHERE 1=1'
  const params: string[] = []
  if (q) { sql += ' AND (name LIKE ? OR city LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }
  if (country) { sql += ' AND country = ?'; params.push(country) }
  sql += ' ORDER BY featured DESC, featuredRank, rating DESC'

  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(...params)
  const result = await stmt.all()
  const institutions = result.results.map(mapInstitution)

  const countries = await db.prepare('SELECT DISTINCT country FROM Institution ORDER BY country').all()

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-800 mb-2">Universities & Institutions</h1>
        <p class="text-slate-600">{institutions.length} verified institutions from around the world</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form method="get" class="flex flex-col sm:flex-row gap-3">
          <input type="text" name="q" placeholder="Search universities..." value={q || ''} class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <select name="country" class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Countries</option>
            {countries.results.map((r: any) => <option value={r.country} selected={country === r.country}>{r.country}</option>)}
          </select>
          <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><i class="fas fa-search mr-1"></i>Search</button>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(i => (
          <a href={`/institutions/${i.id}`} class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
            <div class="h-32 bg-gradient-to-br from-slate-700 to-slate-900 relative">
              <img src={i.image} alt={i.name} class="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" loading="lazy" />
              <div class="absolute top-3 right-3 flex gap-2">
                {i.verified && <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-check-circle mr-1"></i>Verified</span>}
                {i.featured && <span class="bg-amber-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-star mr-1"></i>Featured</span>}
              </div>
            </div>
            <div class="p-5">
              <h3 class="text-lg font-bold text-slate-800 mb-1">{i.name}</h3>
              <p class="text-sm text-slate-500 mb-3"><i class="fas fa-map-marker-alt mr-1"></i>{i.city}, {i.country} • Est. {i.founded}</p>
              <p class="text-sm text-slate-600 line-clamp-2 mb-4">{i.description}</p>
              <div class="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                <span class="text-amber-500"><i class="fas fa-star"></i> {i.rating}</span>
                <span class="text-slate-600">{i.programsCount} programs</span>
                <span class="font-bold text-emerald-700">{i.tuitionFrom === 0 ? 'Free' : `$${(i.tuitionFrom/1000).toFixed(0)}k+`}</span>
              </div>
              {i.tags.length > 0 && (
                <div class="mt-3 flex flex-wrap gap-1">
                  {i.tags.slice(0, 3).map(t => <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{t}</span>)}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>,
    { title: 'Universities' }
  )
})

institutionRoutes.get('/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const inst = await db.prepare('SELECT * FROM Institution WHERE id = ?').bind(id).first()
  if (!inst) return c.notFound()
  const i = mapInstitution(inst)

  const progs = await db.prepare('SELECT * FROM Program WHERE institution = ? ORDER BY featured DESC, rating DESC').bind(i.name).all()
  const programs = progs.results.map(mapProgram)

  return c.render(
    <div>
      <div class="relative h-64 bg-slate-800">
        <img src={i.image} alt={i.name} class="w-full h-full object-cover opacity-50" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-6 text-white">
          <div class="flex gap-2 mb-2">
            {i.verified && <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-check-circle mr-1"></i>Verified</span>}
            {i.featured && <span class="bg-amber-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-star mr-1"></i>Featured</span>}
          </div>
          <h1 class="text-3xl font-bold">{i.name}</h1>
          <p class="text-slate-200 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>{i.city}, {i.country} • Founded {i.founded}</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-bold text-slate-800 mb-3">About {i.name}</h2>
              <p class="text-slate-600 leading-relaxed">{i.description}</p>
            </div>

            {i.tags.length > 0 && (
              <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-3">Specializations</h3>
                <div class="flex flex-wrap gap-2">
                  {i.tags.map(t => <span class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">{t}</span>)}
                </div>
              </div>
            )}

            {programs.length > 0 && (
              <div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Programs ({programs.length})</h2>
                <div class="grid sm:grid-cols-2 gap-4">
                  {programs.map(p => (
                    <a href={`/programs/${p.id}`} class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
                      <div class="flex justify-between mb-2">
                        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">{p.level}</span>
                        {p.featured && <i class="fas fa-star text-amber-400 text-sm"></i>}
                      </div>
                      <h3 class="font-bold text-slate-800">{p.name}</h3>
                      <p class="text-sm text-slate-500 mb-3">{p.field}</p>
                      <div class="flex justify-between text-sm text-slate-600">
                        <span>{p.duration}</span>
                        <span class="font-bold text-emerald-700">{p.tuition === 0 ? 'Free' : `$${p.tuition.toLocaleString()}/yr`}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div class="space-y-6">
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <h3 class="font-bold text-slate-800 mb-4">At a Glance</h3>
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between"><dt class="text-slate-500">Rating</dt><dd class="font-bold text-amber-500"><i class="fas fa-star"></i> {i.rating}</dd></div>
                <div class="flex justify-between"><dt class="text-slate-500">Programs</dt><dd class="font-medium">{i.programsCount}</dd></div>
                <div class="flex justify-between"><dt class="text-slate-500">Tuition from</dt><dd class="font-medium">{i.tuitionFrom === 0 ? 'Free' : `$${i.tuitionFrom.toLocaleString()}`}</dd></div>
                <div class="flex justify-between"><dt class="text-slate-500">Founded</dt><dd class="font-medium">{i.founded}</dd></div>
                <div class="flex justify-between"><dt class="text-slate-500">Location</dt><dd class="font-medium">{i.city}</dd></div>
                <div class="flex justify-between"><dt class="text-slate-500">Country</dt><dd class="font-medium">{i.country}</dd></div>
              </dl>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 class="font-bold text-slate-800 mb-2">Want to apply here?</h3>
              <p class="text-sm text-slate-600 mb-4">Get expert guidance on your application.</p>
              <a href="/register" class="block w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">
                <i class="fas fa-rocket mr-2"></i>Start Application
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { title: i.name }
  )
})
