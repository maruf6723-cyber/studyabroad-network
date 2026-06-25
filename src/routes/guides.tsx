import { Hono } from 'hono'
import { parseJSON } from '../lib/db'

export const guideRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

guideRoutes.get('/', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM GuidePage ORDER BY viewCount DESC').all()

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 mb-3">Study Guides</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">Comprehensive, step-by-step guides for studying in your dream destination and field.</p>
      </div>

      {result.results.length === 0 ? (
        <div class="text-center py-16 bg-white rounded-xl">
          <i class="fas fa-book text-4xl text-slate-300 mb-4"></i>
          <p class="text-slate-500">No guides available yet. Check back soon!</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.results.map((g: any) => (
            <a href={`/guides/${g.slug}`} class="group bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all border-l-4 border-emerald-500">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">{g.level}</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{g.field}</span>
              </div>
              <h3 class="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{g.title}</h3>
              <p class="text-sm text-slate-600 line-clamp-3 mb-4">{g.intro}</p>
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span><i class="fas fa-map-marker-alt mr-1"></i>{g.destination}</span>
                <span><i class="far fa-eye mr-1"></i>{g.viewCount} views</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>,
    { title: 'Study Guides' }
  )
})

guideRoutes.get('/:slug', async (c) => {
  const db = c.env.DB
  const slug = c.req.param('slug')
  const guide = await db.prepare('SELECT * FROM GuidePage WHERE slug = ?').bind(slug).first()
  if (!guide) return c.notFound()

  // Increment view count
  await db.prepare('UPDATE GuidePage SET viewCount = viewCount + 1 WHERE id = ?').bind(guide.id).run()

  const sections = parseJSON<any[]>(guide.sections, [])
  const faqs = parseJSON<any[]>(guide.faqs, [])
  const steps = parseJSON<any[]>(guide.steps, [])

  return c.render(
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="/guides" class="text-emerald-600 text-sm mb-4 inline-block"><i class="fas fa-arrow-left mr-1"></i>Back to Guides</a>

      <div class="bg-white rounded-xl shadow-sm p-8 md:p-12">
        <div class="flex gap-2 mb-4">
          <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">{guide.level}</span>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{guide.field}</span>
          <span class="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">{guide.destination}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{guide.title}</h1>
        <p class="text-lg text-slate-600 mb-8">{guide.intro}</p>

        {/* Steps */}
        {steps.length > 0 && (
          <div class="mb-8 bg-emerald-50 rounded-xl p-6">
            <h2 class="text-xl font-bold text-slate-800 mb-4">Step-by-Step Application Process</h2>
            <ol class="space-y-4">
              {steps.map((s: any, i: number) => (
                <li class="flex gap-4">
                  <span class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">{i + 1}</span>
                  <div>
                    <div class="font-semibold text-slate-800">{s.step || s.title}</div>
                    {s.detail && <p class="text-sm text-slate-600 mt-1">{s.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Sections */}
        <div class="space-y-8">
          {sections.map((s: any) => (
            <div>
              <h2 class="text-2xl font-bold text-slate-800 mb-3">{s.heading}</h2>
              <p class="text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <div class="mt-10 pt-8 border-t border-slate-100">
            <h2 class="text-2xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <div class="space-y-4">
              {faqs.map((f: any) => (
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-800 mb-1"><i class="fas fa-question-circle text-emerald-600 mr-2"></i>{f.q}</h3>
                  <p class="text-slate-600 text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead capture CTA */}
        <div class="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-center text-white">
          <h2 class="text-2xl font-bold mb-2">Ready to Start?</h2>
          <p class="mb-4 text-emerald-50">Get personalized guidance and download the full checklist.</p>
          <a href="/register" class="inline-block px-8 py-3 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors">
            <i class="fas fa-download mr-2"></i>Get the Full Guide
          </a>
        </div>
      </div>
    </div>,
    { title: guide.title }
  )
})
