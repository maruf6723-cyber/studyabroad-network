import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { homeRoutes } from './routes/home'
import { destinationRoutes } from './routes/destinations'
import { programRoutes } from './routes/programs'
import { institutionRoutes } from './routes/institutions'
import { blogRoutes } from './routes/blog'
import { communityRoutes } from './routes/community'
import { guideRoutes } from './routes/guides'
import { knowledgeRoutes } from './routes/knowledge'
import { authRoutes } from './routes/auth'
import { dashboardRoutes } from './routes/dashboard'
import { apiRoutes } from './routes/api'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors())
app.use(renderer)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Routes
app.route('/', homeRoutes)
app.route('/destinations', destinationRoutes)
app.route('/programs', programRoutes)
app.route('/institutions', institutionRoutes)
app.route('/blog', blogRoutes)
app.route('/community', communityRoutes)
app.route('/guides', guideRoutes)
app.route('/knowledge', knowledgeRoutes)
app.route('/auth', authRoutes)
app.route('/dashboard', dashboardRoutes)
app.route('/api', apiRoutes)

// Static pages
app.get('/about', (c) => {
  return c.render(
    <div class="max-w-4xl mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-slate-800 mb-6">About StudyAbroad Network</h1>
      <div class="prose prose-lg max-w-none">
        <p class="text-lg text-slate-600 mb-6">StudyAbroad Network is the world's most comprehensive platform for international students. We connect ambitious learners with thousands of programs across the globe, providing AI-powered matching, verified reviews, and expert guidance.</p>
        <h2 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Our Mission</h2>
        <p class="text-slate-600 mb-4">To democratize access to global education by making study abroad discoverable, affordable, and achievable for every student, regardless of their background.</p>
        <h2 class="text-2xl font-bold text-slate-800 mt-8 mb-4">What We Offer</h2>
        <ul class="space-y-3 text-slate-600">
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>8 top study destinations with detailed guides</li>
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>30+ programs from world-class institutions</li>
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>Verified student stories and testimonials</li>
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>Comprehensive knowledge base and FAQs</li>
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>Community forum and study buddy matching</li>
          <li><i class="fas fa-check text-emerald-600 mr-2"></i>Expert-written guides and blog content</li>
        </ul>
      </div>
    </div>,
    { title: 'About' }
  )
})

app.get('/contact', (c) => {
  return c.render(
    <div class="max-w-2xl mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-slate-800 mb-6">Contact Us</h1>
      <p class="text-lg text-slate-600 mb-8">Have questions? We're here to help. Fill out the form below and our team will get back to you within 24 hours.</p>
      <form class="bg-white rounded-xl shadow-sm p-8 space-y-4" data-form="contact">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input type="text" name="name" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Subject</label>
          <input type="text" name="subject" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea name="message" rows="5" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"></textarea>
        </div>
        <button type="submit" class="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">Send Message</button>
        <div id="contact-result" class="hidden p-4 rounded-lg"></div>
      </form>
    </div>,
    { title: 'Contact' }
  )
})

app.get('/partners', (c) => {
  return c.render(
    <div class="max-w-5xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-800 mb-4">Partner With Us</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">Join our network of universities, agencies, and service providers. Reach millions of international students actively searching for study abroad opportunities.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <i class="fas fa-university text-3xl text-emerald-600 mb-4"></i>
          <h3 class="text-lg font-bold text-slate-800 mb-2">For Institutions</h3>
          <p class="text-sm text-slate-600 mb-4">List your programs, feature your institution, and receive qualified student leads directly.</p>
          <ul class="text-sm text-slate-600 space-y-1">
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Featured listings</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Verified badge</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Lead management</li>
          </ul>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <i class="fas fa-handshake text-3xl text-emerald-600 mb-4"></i>
          <h3 class="text-lg font-bold text-slate-800 mb-2">For Agencies</h3>
          <p class="text-sm text-slate-600 mb-4">White-label widgets, API access, and commission tracking for recruitment partners.</p>
          <ul class="text-sm text-slate-600 space-y-1">
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Embeddable widget</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>API access</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Commission tracking</li>
          </ul>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <i class="fas fa-bullhorn text-3xl text-emerald-600 mb-4"></i>
          <h3 class="text-lg font-bold text-slate-800 mb-2">For Service Providers</h3>
          <p class="text-sm text-slate-600 mb-4">Insurance, financing, accommodation, and travel partners reach students at the right moment.</p>
          <ul class="text-sm text-slate-600 space-y-1">
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Affiliate tracking</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Targeted placement</li>
            <li><i class="fas fa-check text-emerald-600 mr-2"></i>Conversion analytics</li>
          </ul>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Become a Partner</h2>
        <form class="grid md:grid-cols-2 gap-4" data-form="partner">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input type="text" name="companyName" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select name="type" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="institution">Institution / University</option>
              <option value="agency">Agency / Recruiter</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
            <input type="text" name="contactName" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input type="url" name="website" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input type="text" name="country" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea name="notes" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
          <div class="md:col-span-2">
            <button type="submit" class="py-3 px-6 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Submit Partnership Inquiry</button>
            <div id="partner-result" class="hidden mt-4 p-4 rounded-lg"></div>
          </div>
        </form>
      </div>
    </div>,
    { title: 'Partners' }
  )
})

app.get('/buddies', (c) => {
  return c.render(
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 mb-4">Study Buddy Matcher</h1>
        <p class="text-lg text-slate-600">Find a study buddy heading to the same destination. Travel together, share expenses, and support each other.</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Create Your Profile</h2>
        <form class="grid md:grid-cols-2 gap-4" data-form="buddy">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <input type="text" name="userName" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="userEmail" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Destination</label>
            <select name="destination" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="">Select...</option>
              <option>United States</option><option>United Kingdom</option><option>Canada</option>
              <option>Australia</option><option>Germany</option><option>Netherlands</option>
              <option>Ireland</option><option>Singapore</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
            <input type="text" name="field" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Level</label>
            <select name="level" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option>Bachelor</option><option>Master</option><option>PhD</option><option>Diploma</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Start Term</label>
            <input type="text" name="startTerm" placeholder="e.g., Fall 2026" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Short Bio</label>
            <textarea name="bio" rows="3" placeholder="Tell potential buddies about yourself..." class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
          <div class="md:col-span-2">
            <button type="submit" class="py-3 px-6 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Find My Study Buddy</button>
            <div id="buddy-result" class="hidden mt-4 p-4 rounded-lg"></div>
          </div>
        </form>
      </div>
      <div id="buddy-matches" class="mt-8"></div>
    </div>,
    { title: 'Study Buddy Matcher' }
  )
})

app.get('/waitlist', (c) => {
  return c.render(
    <div class="max-w-2xl mx-auto px-4 py-12">
      <div class="text-center mb-10">
        <span class="inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">Early Access</span>
        <h1 class="text-4xl font-bold text-slate-800 mb-4">Join the Waitlist</h1>
        <p class="text-lg text-slate-600">Be the first to access premium features, AI counseling, and exclusive scholarships. Refer friends to move up the list!</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8">
        <form data-form="waitlist">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="name" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Referral Code (optional)</label>
            <input type="text" name="referredBy" placeholder="If a friend referred you, enter their code" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all">Join Waitlist</button>
          <div id="waitlist-result" class="hidden mt-4 p-4 rounded-lg"></div>
        </form>
      </div>
    </div>,
    { title: 'Waitlist' }
  )
})

export default app
