import { Hono } from 'hono'

export const dashboardRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

dashboardRoutes.get('/', (c) => {
  return c.render(
    <div class="max-w-5xl mx-auto px-4 py-12">
      <div class="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
        <h1 class="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p class="text-emerald-50">Track your applications, saved programs, and personalized recommendations.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
            <i class="fas fa-bookmark text-emerald-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-slate-800">0</div>
          <div class="text-sm text-slate-500">Saved Programs</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <i class="fas fa-file-alt text-blue-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-slate-800">0</div>
          <div class="text-sm text-slate-500">Applications</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
            <i class="fas fa-crown text-amber-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-slate-800">Free</div>
          <div class="text-sm text-slate-500">Current Plan</div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Upgrade to Pro</h2>
        <p class="text-slate-600 mb-4">Unlock AI-powered document reviews, personalized counseling, and priority application support.</p>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="border-2 border-emerald-500 rounded-xl p-5 relative">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">POPULAR</span>
            <h3 class="font-bold text-slate-800">Pro Monthly</h3>
            <div class="text-3xl font-bold text-slate-800 mt-2">$9<span class="text-base font-normal text-slate-500">/mo</span></div>
            <ul class="text-sm text-slate-600 mt-4 space-y-2">
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>AI document reviews</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Unlimited program matching</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Priority support</li>
            </ul>
          </div>
          <div class="border border-slate-200 rounded-xl p-5">
            <h3 class="font-bold text-slate-800">Pro Yearly</h3>
            <div class="text-3xl font-bold text-slate-800 mt-2">$79<span class="text-base font-normal text-slate-500">/yr</span></div>
            <ul class="text-sm text-slate-600 mt-4 space-y-2">
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Everything in Pro Monthly</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>2 months free</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Scholarship report</li>
            </ul>
          </div>
          <div class="border border-slate-200 rounded-xl p-5">
            <h3 class="font-bold text-slate-800">Founders</h3>
            <div class="text-3xl font-bold text-slate-800 mt-2">$199<span class="text-base font-normal text-slate-500">/once</span></div>
            <ul class="text-sm text-slate-600 mt-4 space-y-2">
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Lifetime access</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>1-on-1 counseling</li>
              <li><i class="fas fa-check text-emerald-600 mr-2"></i>Success guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-8">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/programs" class="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors">
            <i class="fas fa-search text-2xl text-slate-600 mb-2"></i>
            <span class="text-sm text-slate-700">Find Programs</span>
          </a>
          <a href="/destinations" class="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors">
            <i class="fas fa-globe text-2xl text-slate-600 mb-2"></i>
            <span class="text-sm text-slate-700">Explore Destinations</span>
          </a>
          <a href="/community" class="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors">
            <i class="fas fa-users text-2xl text-slate-600 mb-2"></i>
            <span class="text-sm text-slate-700">Join Community</span>
          </a>
          <a href="/guides" class="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors">
            <i class="fas fa-book text-2xl text-slate-600 mb-2"></i>
            <span class="text-sm text-slate-700">Read Guides</span>
          </a>
        </div>
      </div>
    </div>,
    { title: 'Dashboard' }
  )
})
