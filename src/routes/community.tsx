import { Hono } from 'hono'
import { generateId } from '../lib/db'

export const communityRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

const CHANNELS = [
  { id: 'general', name: 'General', icon: 'comments', desc: 'General discussion about studying abroad' },
  { id: 'usa', name: 'USA', icon: 'flag-usa', desc: 'Studying in the United States' },
  { id: 'uk', name: 'UK', icon: 'landmark', desc: 'Studying in the United Kingdom' },
  { id: 'canada', name: 'Canada', icon: ' maple-leaf', desc: 'Studying in Canada' },
  { id: 'australia', name: 'Australia', icon: 'kangaroo', desc: 'Studying in Australia' },
  { id: 'germany', name: 'Germany', icon: 'beer', desc: 'Studying in Germany' },
  { id: 'buddies', name: 'Study Buddies', icon: 'users', desc: 'Find travel and study companions' },
  { id: 'visas', name: 'Visa Help', icon: 'file-alt', desc: 'Visa and immigration questions' },
]

communityRoutes.get('/', async (c) => {
  const db = c.env.DB
  const channel = c.req.query('channel') || 'general'
  const result = await db.prepare('SELECT * FROM CommunityPost WHERE channelId = ? AND parentId IS NULL ORDER BY createdAt DESC LIMIT 50').bind(channel).all()

  const currentChannel = CHANNELS.find(ch => ch.id === channel) || CHANNELS[0]

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-800 mb-2">Community Forum</h1>
        <p class="text-slate-600">Connect with fellow students, ask questions, and share your journey.</p>
      </div>

      <div class="grid lg:grid-cols-4 gap-6">
        {/* Channel sidebar */}
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Channels</h3>
            <div class="space-y-1">
              {CHANNELS.map(ch => (
                <a href={`/community?channel=${ch.id}`} class={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${channel === ch.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <i class={`fas fa-${ch.icon.trim()} w-4`}></i>
                  {ch.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div class="lg:col-span-3 space-y-4">
          {/* New post form */}
          <div class="bg-white rounded-xl shadow-sm p-5">
            <h3 class="font-bold text-slate-800 mb-3">Post in #{currentChannel.name}</h3>
            <form data-form="community-post" data-channel={channel}>
              <input type="hidden" name="channelId" value={channel} />
              <input type="text" name="title" placeholder="Post title (optional for questions)" class="w-full px-4 py-2 mb-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              <textarea name="content" rows="3" placeholder="Share your thoughts, ask a question..." required class="w-full px-4 py-2 mb-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
              <div class="flex gap-2">
                <input type="text" name="authorName" placeholder="Your name" required class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                <input type="email" name="authorEmail" placeholder="Your email" required class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Post</button>
              </div>
              <div id="post-result" class="hidden mt-3 p-3 rounded-lg"></div>
            </form>
          </div>

          {/* Posts list */}
          {result.results.length === 0 ? (
            <div class="bg-white rounded-xl shadow-sm p-12 text-center">
              <i class="fas fa-comments text-4xl text-slate-300 mb-4"></i>
              <p class="text-slate-500">No posts yet in #{currentChannel.name}. Be the first to start a conversation!</p>
            </div>
          ) : (
            result.results.map((post: any) => (
              <div class="bg-white rounded-xl shadow-sm p-5">
                <div class="flex gap-4">
                  <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div class="flex-1">
                    {post.title && <h3 class="font-bold text-slate-800">{post.title}</h3>}
                    <p class="text-slate-600 text-sm mt-1">{post.content}</p>
                    <div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>{post.authorName}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <button class="text-slate-500 hover:text-emerald-600" data-upvote={post.id}><i class="fas fa-arrow-up mr-1"></i>{post.upvotes}</button>
                      <span class="text-emerald-600">#{currentChannel.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    { title: 'Community' }
  )
})
