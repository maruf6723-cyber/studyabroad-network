import { Hono } from 'hono'
import { mapBlogPost } from '../lib/db'

export const blogRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

blogRoutes.get('/', async (c) => {
  const db = c.env.DB
  const result = await db.prepare("SELECT * FROM BlogPost WHERE status = 'published' ORDER BY publishedAt DESC").all()
  const posts = result.results.map(mapBlogPost)

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-bold text-slate-800 mb-3">Study Abroad Blog</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">Expert guides, tips, and insights to help you navigate your study abroad journey.</p>
      </div>

      {posts.length === 0 ? (
        <div class="text-center py-16 bg-white rounded-xl">
          <i class="fas fa-newspaper text-4xl text-slate-300 mb-4"></i>
          <p class="text-slate-500">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured post */}
          {posts.length > 0 && (
            <a href={`/blog/${posts[0].slug}`} class="block mb-8 bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <div class="grid md:grid-cols-2">
                <div class="h-64 md:h-80 overflow-hidden">
                  <img src={posts[0].coverImage} alt={posts[0].title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div class="p-8 flex flex-col justify-center">
                  <span class="text-emerald-600 text-sm font-semibold mb-2">FEATURED ARTICLE</span>
                  <h2 class="text-2xl font-bold text-slate-800 mb-3">{posts[0].title}</h2>
                  <p class="text-slate-600 mb-4">{posts[0].excerpt}</p>
                  <div class="flex items-center text-sm text-slate-500">
                    <span>{posts[0].authorName}</span>
                    <span class="mx-2">•</span>
                    <span>{posts[0].readMinutes} min read</span>
                  </div>
                </div>
              </div>
            </a>
          )}

          {/* Rest of posts */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map(post => (
              <a href={`/blog/${post.slug}`} class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div class="h-48 overflow-hidden">
                  <img src={post.coverImage} alt={post.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div class="p-5">
                  <div class="flex gap-1 mb-2">
                    {post.tags.slice(0, 2).map(t => <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded">{t}</span>)}
                  </div>
                  <h3 class="font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{post.title}</h3>
                  <p class="text-sm text-slate-600 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div class="flex items-center text-xs text-slate-400">
                    <i class="far fa-clock mr-1"></i>{post.readMinutes} min read
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>,
    { title: 'Blog' }
  )
})

blogRoutes.get('/:slug', async (c) => {
  const db = c.env.DB
  const slug = c.req.param('slug')
  const post = await db.prepare('SELECT * FROM BlogPost WHERE slug = ? AND status = ?').bind(slug, 'published').first()
  if (!post) return c.notFound()
  const p = mapBlogPost(post)

  // Increment view count
  await db.prepare('UPDATE BlogPost SET viewCount = viewCount + 1 WHERE id = ?').bind(p.id).run()

  // Get related posts
  const related = await db.prepare("SELECT * FROM BlogPost WHERE status = 'published' AND id != ? ORDER BY publishedAt DESC LIMIT 3").bind(p.id).all()
  const relatedPosts = related.results.map(mapBlogPost)

  // Simple markdown to HTML conversion
  const htmlContent = p.content
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-800 mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-800 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-slate-800 mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-slate-600">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal text-slate-600">$2</li>')
    .replace(/^- \*\*(.+?):\*\* (.+)$/gm, '<li class="ml-6 list-disc text-slate-600"><strong>$1:</strong> $2</li>')
    .replace(/^---$/gm, '<hr class="my-6 border-slate-200" />')
    .replace(/\n\n/g, '</p><p class="text-slate-600 leading-relaxed mb-4">')
    .replace(/\| (.+) \|/g, (match) => {
      const cells = match.split('|').map(c => c.trim()).filter(Boolean)
      return `<tr>${cells.map(c => `<td class="border border-slate-200 px-3 py-2 text-sm">${c}</td>`).join('')}</tr>`
    })

  return c.render(
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="/blog" class="text-emerald-600 text-sm mb-4 inline-block"><i class="fas fa-arrow-left mr-1"></i>Back to Blog</a>

      <article class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="h-72 overflow-hidden">
          <img src={p.coverImage} alt={p.title} class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="p-8 md:p-12">
          <div class="flex gap-2 mb-4">
            {p.tags.map(t => <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">{t}</span>)}
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{p.title}</h1>
          <div class="flex items-center gap-4 mb-8 text-sm text-slate-500 pb-6 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <img src={p.authorAvatar} alt={p.authorName} class="w-10 h-10 rounded-full object-cover" loading="lazy" />
              <div>
                <div class="font-medium text-slate-700">{p.authorName}</div>
                <div class="text-xs">{p.authorBio}</div>
              </div>
            </div>
            <span class="ml-auto"><i class="far fa-clock mr-1"></i>{p.readMinutes} min read</span>
          </div>

          <div class="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: `<p class="text-slate-600 leading-relaxed mb-4">${htmlContent}</p>` }} />

          <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span class="text-sm text-slate-400"><i class="far fa-eye mr-1"></i>{p.viewCount} views</span>
            <a href="/register" class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">Get Started <i class="fas fa-arrow-right ml-1"></i></a>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-slate-800 mb-4">Related Articles</h2>
          <div class="grid sm:grid-cols-3 gap-4">
            {relatedPosts.map(rp => (
              <a href={`/blog/${rp.slug}`} class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div class="h-32 overflow-hidden">
                  <img src={rp.coverImage} alt={rp.title} class="w-full h-full object-cover" loading="lazy" />
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-slate-800 text-sm">{rp.title}</h3>
                  <p class="text-xs text-slate-400 mt-1">{rp.readMinutes} min read</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>,
    { title: p.title }
  )
})
