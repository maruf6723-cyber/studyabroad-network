import { Hono } from 'hono'
import { mapDestination, mapInstitution, mapProgram, parseList } from '../lib/db'

export const destinationRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

// List all destinations
destinationRoutes.get('/', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM Destination ORDER BY country').all()
  const dests = result.results.map(mapDestination)

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 mb-4">Study Destinations</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">Explore {dests.length} top study abroad destinations. Compare tuition, work rights, and lifestyle to find your perfect match.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dests.map(d => (
          <a href={`/destinations/${d.countryCode}`} class="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all">
            <div class="relative h-56 overflow-hidden">
              <img src={d.image} alt={d.country} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div class="absolute bottom-4 left-4 text-white">
                <span class="text-4xl">{d.flag}</span>
                <h2 class="text-2xl font-bold mt-2">{d.country}</h2>
                <p class="text-sm text-slate-200">{d.blurb}</p>
              </div>
            </div>
            <div class="p-5">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-slate-400 text-xs">Avg Tuition</span>
                  <div class="font-semibold text-slate-700">{d.avgTuition}</div>
                </div>
                <div>
                  <span class="text-slate-400 text-xs">Living Cost</span>
                  <div class="font-semibold text-slate-700">{d.livingCost}</div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-slate-100">
                <span class="text-xs text-slate-400">Work Rights</span>
                <div class="text-sm text-emerald-600 font-medium">{d.workRights}</div>
              </div>
              <div class="mt-3 flex flex-wrap gap-1">
                {d.popularFields.slice(0, 3).map(f => (
                  <span class="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded">{f}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>,
    { title: 'Destinations' }
  )
})

// Individual destination by country code
destinationRoutes.get('/:code', async (c) => {
  const db = c.env.DB
  const code = c.req.param('code')
  const dest = await db.prepare('SELECT * FROM Destination WHERE countryCode = ?').bind(code).first()
  if (!dest) return c.notFound()

  const d = mapDestination(dest)
  const [insts, progs] = await Promise.all([
    db.prepare('SELECT * FROM Institution WHERE country = ? ORDER BY rating DESC').bind(d.country).all(),
    db.prepare('SELECT * FROM Program WHERE country = ? ORDER BY featured DESC, rating DESC').bind(d.country).all(),
  ])
  const institutions = insts.results.map(mapInstitution)
  const programs = progs.results.map(mapProgram)

  return c.render(
    <div>
      <div class="relative h-72 bg-slate-800">
        <img src={d.image} alt={d.country} class="w-full h-full object-cover opacity-60" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-8 text-white">
          <span class="text-5xl">{d.flag}</span>
          <h1 class="text-4xl font-bold mt-2">{d.country}</h1>
          <p class="text-lg text-slate-200 mt-1">{d.blurb}</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-slate-800 mb-4">About {d.country}</h2>
              <p class="text-slate-600 leading-relaxed">{d.description}</p>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-bold text-slate-800 mb-4">Key Highlights</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.highlights.map(h => (
                  <div class="flex items-center gap-2 text-slate-700">
                    <i class="fas fa-check-circle text-emerald-600"></i>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs */}
            {programs.length > 0 && (
              <div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Programs in {d.country}</h2>
                <div class="grid sm:grid-cols-2 gap-4">
                  {programs.map(p => (
                    <a href={`/programs/${p.id}`} class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
                      <div class="flex justify-between items-start mb-2">
                        <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">{p.level}</span>
                        {p.featured ? <i class="fas fa-star text-amber-400"></i> : null}
                      </div>
                      <h3 class="font-bold text-slate-800">{p.name}</h3>
                      <p class="text-sm text-slate-500 mb-3">{p.institution}</p>
                      <div class="flex justify-between text-sm text-slate-600">
                        <span><i class="fas fa-clock mr-1"></i>{p.duration}</span>
                        <span class="font-bold">{p.tuition === 0 ? 'Free' : `$${p.tuition.toLocaleString()}/yr`}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Institutions */}
            {institutions.length > 0 && (
              <div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Universities in {d.country}</h2>
                <div class="grid sm:grid-cols-2 gap-4">
                  {institutions.map(i => (
                    <a href={`/institutions/${i.id}`} class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all flex gap-4">
                      <img src={i.image} alt={i.name} class="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div>
                        <h3 class="font-bold text-slate-800">{i.name}</h3>
                        <p class="text-sm text-slate-500">{i.city}</p>
                        <div class="flex items-center gap-3 text-sm mt-1">
                          <span class="text-amber-500"><i class="fas fa-star"></i> {i.rating}</span>
                          <span class="text-slate-500">{i.programsCount} programs</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <h3 class="font-bold text-slate-800 mb-4">Quick Facts</h3>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-slate-500">Average Tuition</dt>
                  <dd class="font-semibold text-slate-800">{d.avgTuition}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Living Cost</dt>
                  <dd class="font-semibold text-slate-800">{d.livingCost}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Work Rights</dt>
                  <dd class="font-semibold text-emerald-700">{d.workRights}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Popular Fields</dt>
                  <dd class="flex flex-wrap gap-1 mt-1">
                    {d.popularFields.map(f => <span class="px-2 py-0.5 bg-white text-emerald-700 text-xs rounded border border-emerald-200">{f}</span>)}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 class="font-bold text-slate-800 mb-2">Interested in {d.country}?</h3>
              <p class="text-sm text-slate-600 mb-4">Get matched with the right program and start your application.</p>
              <a href="/register" class="block w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <i class="fas fa-rocket mr-2"></i>Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { title: d.country }
  )
})
