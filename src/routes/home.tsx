import { Hono } from 'hono'
import { mapDestination, mapInstitution, mapProgram, parseList } from '../lib/db'

export const homeRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

homeRoutes.get('/', async (c) => {
  const db = c.env.DB
  const [destinations, institutions, programs, testimonials, stories] = await Promise.all([
    db.prepare('SELECT * FROM Destination ORDER BY country LIMIT 8').all(),
    db.prepare('SELECT * FROM Institution WHERE featured = 1 ORDER BY featuredRank LIMIT 6').all(),
    db.prepare('SELECT * FROM Program WHERE featured = 1 ORDER BY featuredRank LIMIT 6').all(),
    db.prepare('SELECT * FROM Testimonial ORDER BY RANDOM() LIMIT 4').all(),
    db.prepare('SELECT * FROM VerifiedStory WHERE featured = 1 ORDER BY upvotes DESC LIMIT 3').all(),
  ])

  const dests = destinations.results.map(mapDestination)
  const insts = institutions.results.map(mapInstitution)
  const progs = programs.results.map(mapProgram)

  return c.render(
    <div>
      {/* Hero */}
      <section class="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div class="text-center max-w-3xl mx-auto">
            <span class="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-6">
              <i class="fas fa-globe-americas mr-2"></i>8 Destinations • 20+ Universities • 30+ Programs
            </span>
            <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">Your Global Education Journey Starts Here</h1>
            <p class="text-lg md:text-xl text-emerald-50 mb-8">Discover, compare, and apply to study abroad programs worldwide. AI-powered matching, verified reviews, and expert guidance — all in one platform.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/destinations" class="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
                <i class="fas fa-compass mr-2"></i>Explore Destinations
              </a>
              <a href="/register" class="px-8 py-4 bg-emerald-800/50 backdrop-blur text-white font-bold rounded-xl hover:bg-emerald-800 transition-all border border-white/30">
                <i class="fas fa-rocket mr-2"></i>Get Matched Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div class="text-3xl font-bold text-emerald-600">8</div>
              <div class="text-sm text-slate-500 mt-1">Study Destinations</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-emerald-600">20+</div>
              <div class="text-sm text-slate-500 mt-1">Top Universities</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-emerald-600">30+</div>
              <div class="text-sm text-slate-500 mt-1">Programs Listed</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-emerald-600">1M+</div>
              <div class="text-sm text-slate-500 mt-1">Students Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-800">Popular Destinations</h2>
            <p class="text-slate-600 mt-2">Explore top study abroad destinations with detailed guides</p>
          </div>
          <a href="/destinations" class="text-emerald-600 font-medium hover:text-emerald-700 hidden sm:inline">View all <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dests.map(d => (
            <a href={`/destinations/${d.countryCode}`} class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div class="relative h-40 overflow-hidden">
                <img src={d.image} alt={d.country} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-3 left-3 text-white">
                  <span class="text-3xl">{d.flag}</span>
                  <h3 class="text-lg font-bold mt-1">{d.country}</h3>
                </div>
              </div>
              <div class="p-4">
                <p class="text-sm text-slate-600 line-clamp-2">{d.blurb}</p>
                <div class="mt-3 flex items-center text-xs text-slate-500">
                  <i class="fas fa-graduation-cap mr-1 text-emerald-600"></i>
                  {d.popularFields.slice(0, 2).join(', ')}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Programs */}
      <section class="py-16 bg-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="text-3xl font-bold text-slate-800">Featured Programs</h2>
              <p class="text-slate-600 mt-2">Hand-picked programs from world-class institutions</p>
            </div>
            <a href="/programs" class="text-emerald-600 font-medium hover:text-emerald-700 hidden sm:inline">View all <i class="fas fa-arrow-right ml-1"></i></a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progs.map(p => (
              <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">{p.level}</span>
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded ml-1">{p.field}</span>
                  </div>
                  {p.featured && <span class="text-amber-500"><i class="fas fa-star"></i></span>}
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-1">{p.name}</h3>
                <p class="text-sm text-slate-600 mb-3">{p.institution}</p>
                <div class="flex items-center text-sm text-slate-500 mb-4">
                  <i class="fas fa-map-marker-alt mr-1"></i>{p.country}
                  <span class="mx-2">•</span>
                  <i class="fas fa-clock mr-1"></i>{p.duration}
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div>
                    <span class="text-xs text-slate-400">Tuition/year</span>
                    <div class="font-bold text-slate-800">{p.tuition === 0 ? 'Free' : `$${p.tuition.toLocaleString()}`}</div>
                  </div>
                  <div class="flex items-center">
                    <i class="fas fa-star text-amber-400"></i>
                    <span class="ml-1 font-medium text-slate-700">{p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-800">Featured Universities</h2>
            <p class="text-slate-600 mt-2">World-class institutions verified and ranked</p>
          </div>
          <a href="/institutions" class="text-emerald-600 font-medium hover:text-emerald-700 hidden sm:inline">View all <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insts.map(i => (
            <a href={`/institutions/${i.id}`} class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div class="h-32 bg-gradient-to-br from-slate-700 to-slate-900 relative">
                <img src={i.image} alt={i.name} class="w-full h-full object-cover opacity-70" loading="lazy" />
                {i.verified && <span class="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-check-circle mr-1"></i>Verified</span>}
              </div>
              <div class="p-5">
                <h3 class="text-lg font-bold text-slate-800 mb-1">{i.name}</h3>
                <p class="text-sm text-slate-500 mb-3"><i class="fas fa-map-marker-alt mr-1"></i>{i.city}, {i.country}</p>
                <p class="text-sm text-slate-600 line-clamp-2 mb-4">{i.description}</p>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-600"><i class="fas fa-star text-amber-400 mr-1"></i>{i.rating}</span>
                  <span class="text-slate-600"><i class="fas fa-book mr-1"></i>{i.programsCount} programs</span>
                  <span class="text-slate-600">{i.tuitionFrom === 0 ? 'Free' : `$${(i.tuitionFrom/1000).toFixed(0)}k+`}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Verified Stories */}
      {stories.results.length > 0 && (
        <section class="py-16 bg-emerald-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-10">
              <h2 class="text-3xl font-bold text-slate-800">Verified Success Stories</h2>
              <p class="text-slate-600 mt-2">Real students, real outcomes, AI-verified for authenticity</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.results.map((s: any) => (
                <div class="bg-white rounded-xl shadow-sm p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                      {s.userName.charAt(0)}
                    </div>
                    <div class="ml-3">
                      <div class="font-bold text-slate-800">{s.userName}</div>
                      <div class="text-xs text-slate-500">{s.destination} • {s.program}</div>
                    </div>
                    <span class="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"><i class="fas fa-shield-check mr-1"></i>Verified</span>
                  </div>
                  <p class="text-sm text-slate-600 mb-4 italic">"{s.story}"</p>
                  <div class="flex items-center text-amber-400">
                    {'★'.repeat(s.rating)}
                    <span class="ml-2 text-xs text-slate-500">AI Authenticity: {s.aiAuthenticityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-slate-800">What Students Say</h2>
          <p class="text-slate-600 mt-2">Thousands of students have found their path with us</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.results.map((t: any) => (
            <div class="bg-white rounded-xl shadow-sm p-6 flex gap-4">
              <img src={t.avatar} alt={t.name} class="w-14 h-14 rounded-full object-cover flex-shrink-0" loading="lazy" />
              <div>
                <div class="flex items-center mb-1">
                  <span class="font-bold text-slate-800">{t.name}</span>
                  <span class="ml-2 text-xs text-slate-500">{t.country} → {t.destination}</span>
                </div>
                <div class="text-amber-400 text-sm mb-2">{'★'.repeat(t.rating)}</div>
                <p class="text-sm text-slate-600 italic">"{t.quote}"</p>
                <p class="text-xs text-slate-400 mt-2">{t.program}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p class="text-lg text-emerald-50 mb-8">Join thousands of students who found their perfect study abroad program. Free registration, expert guidance, and AI-powered matching.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" class="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
              <i class="fas fa-rocket mr-2"></i>Get Started Free
            </a>
            <a href="/blog" class="px-8 py-4 bg-emerald-800/50 backdrop-blur text-white font-bold rounded-xl hover:bg-emerald-800 transition-all border border-white/30">
              <i class="fas fa-book-reader mr-2"></i>Read Our Guides
            </a>
          </div>
        </div>
      </section>
    </div>,
    { title: undefined }
  )
})
