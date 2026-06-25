import { Hono } from 'hono'

export const knowledgeRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

knowledgeRoutes.get('/', async (c) => {
  const db = c.env.DB
  const q = c.req.query('q')
  const category = c.req.query('category')

  let sql = 'SELECT * FROM KnowledgeArticle WHERE 1=1'
  const params: string[] = []
  if (q) { sql += ' AND (question LIKE ? OR answer LIKE ? OR shortAnswer LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`) }
  if (category) { sql += ' AND category = ?'; params.push(category) }
  sql += ' ORDER BY viewCount DESC'

  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(...params)
  const result = await stmt.all()

  const cats = await db.prepare('SELECT DISTINCT category FROM KnowledgeArticle ORDER BY category').all()

  return c.render(
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 mb-3">Knowledge Base</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">Get answers to the most common questions about studying abroad, visas, costs, and work rights.</p>
      </div>

      {/* Search */}
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form method="get" class="flex flex-col sm:flex-row gap-3">
          <input type="text" name="q" placeholder="Search questions..." value={q || ''} class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <select name="category" class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Categories</option>
            {cats.results.map((r: any) => <option value={r.category} selected={category === r.category}>{r.category}</option>)}
          </select>
          <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><i class="fas fa-search mr-1"></i>Search</button>
        </form>
      </div>

      {/* Categories */}
      {cats.results.length > 0 && (
        <div class="flex flex-wrap gap-2 mb-6">
          <a href="/knowledge" class={`px-3 py-1.5 rounded-full text-sm ${!category ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>All</a>
          {cats.results.map((r: any) => (
            <a href={`/knowledge?category=${encodeURIComponent(r.category)}`} class={`px-3 py-1.5 rounded-full text-sm ${category === r.category ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{r.category}</a>
          ))}
        </div>
      )}

      {/* Results */}
      {result.results.length === 0 ? (
        <div class="text-center py-16 bg-white rounded-xl">
          <i class="fas fa-question-circle text-4xl text-slate-300 mb-4"></i>
          <p class="text-slate-500">No articles found. Try a different search.</p>
        </div>
      ) : (
        <div class="space-y-4">
          {result.results.map((a: any) => (
            <a href={`/knowledge/${a.slug}`} class="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <i class="fas fa-question text-emerald-600"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{a.category}</span>
                    {a.destination && <span class="text-xs text-slate-400"><i class="fas fa-map-marker-alt"></i> {a.destination}</span>}
                    <span class="text-xs text-emerald-600"><i class="fas fa-shield-check"></i> {a.confidence}% confidence</span>
                  </div>
                  <h3 class="font-bold text-slate-800 mb-1">{a.question}</h3>
                  <p class="text-sm text-slate-600">{a.shortAnswer}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>,
    { title: 'Knowledge Base' }
  )
})

knowledgeRoutes.get('/:slug', async (c) => {
  const db = c.env.DB
  const slug = c.req.param('slug')
  const article = await db.prepare('SELECT * FROM KnowledgeArticle WHERE slug = ?').bind(slug).first()
  if (!article) return c.notFound()

  await db.prepare('UPDATE KnowledgeArticle SET viewCount = viewCount + 1 WHERE id = ?').bind(article.id).run()

  // Get related
  const related = await db.prepare('SELECT * FROM KnowledgeArticle WHERE category = ? AND id != ? LIMIT 4').bind(article.category, article.id).all()

  return c.render(
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="/knowledge" class="text-emerald-600 text-sm mb-4 inline-block"><i class="fas fa-arrow-left mr-1"></i>Back to Knowledge Base</a>

      <article class="bg-white rounded-xl shadow-sm p-8 md:p-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">{article.category}</span>
          {article.destination && <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{article.destination}</span>}
          <span class="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"><i class="fas fa-shield-check mr-1"></i>{article.confidence}% confidence</span>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">{article.question}</h1>
        <div class="bg-emerald-50 rounded-lg p-4 mb-6">
          <p class="text-slate-700 font-medium">{article.shortAnswer}</p>
        </div>
        <p class="text-slate-600 leading-relaxed text-lg">{article.answer}</p>

        {article.citations && (
          <div class="mt-8 pt-6 border-t border-slate-100">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Sources</h3>
            <p class="text-sm text-slate-400">{article.citations}</p>
          </div>
        )}

        <div class="mt-6 text-xs text-slate-400">
          Last verified: {new Date(article.lastVerified).toLocaleDateString()} • {article.viewCount} views
        </div>
      </article>

      {related.results.length > 0 && (
        <div class="mt-8">
          <h2 class="text-xl font-bold text-slate-800 mb-4">Related Questions</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            {related.results.map((r: any) => (
              <a href={`/knowledge/${r.slug}`} class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
                <span class="text-xs text-slate-400">{r.category}</span>
                <h3 class="font-medium text-slate-800 text-sm mt-1">{r.question}</h3>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>,
    { title: article.question }
  )
})
