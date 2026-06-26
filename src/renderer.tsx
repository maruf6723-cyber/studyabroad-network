import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  const pageTitle = title ? `${title} | StudyAbroad Network` : 'StudyAbroad Network - Your Global Education Companion'
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Discover, compare, and apply to study abroad programs worldwide. AI-powered program matching, verified reviews, and expert guidance for your international education journey." />
        <title>{pageTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-slate-50 min-h-screen flex flex-col">
        <nav class="bg-white shadow-sm sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center space-x-8">
                <a href="/" class="flex items-center space-x-2">
                  <i class="fas fa-globe-americas text-2xl text-emerald-600"></i>
                  <span class="text-xl font-bold text-slate-800">StudyAbroad</span>
                </a>
                <div class="hidden md:flex items-center space-x-1">
                  <a href="/destinations" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Destinations</a>
                  <a href="/programs" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Programs</a>
                  <a href="/institutions" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Universities</a>
                  <a href="/blog" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Blog</a>
                  <a href="/community" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Community</a>
                  <a href="/guides" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">Guides</a>
                  <a href="/knowledge" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 rounded-md hover:bg-slate-50">FAQ</a>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <a href="/dashboard" class="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600">Dashboard</a>
                <a href="/auth/register" class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors">
                  <i class="fas fa-rocket mr-2"></i>Get Started
                </a>
                <a href="/auth/login" class="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600">Log in</a>
              </div>
            </div>
          </div>
        </nav>
        <main class="flex-1">{children}</main>
        <footer class="bg-slate-800 text-slate-300 mt-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div class="flex items-center space-x-2 mb-4">
                  <i class="fas fa-globe-americas text-2xl text-emerald-500"></i>
                  <span class="text-lg font-bold text-white">StudyAbroad Network</span>
                </div>
                <p class="text-sm text-slate-400">Your global education companion. Discover, compare, and apply to study abroad programs worldwide.</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h3>
                <ul class="space-y-2 text-sm">
                  <li><a href="/destinations" class="hover:text-emerald-400">Destinations</a></li>
                  <li><a href="/programs" class="hover:text-emerald-400">Programs</a></li>
                  <li><a href="/institutions" class="hover:text-emerald-400">Universities</a></li>
                  <li><a href="/blog" class="hover:text-emerald-400">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
                <ul class="space-y-2 text-sm">
                  <li><a href="/guides" class="hover:text-emerald-400">Study Guides</a></li>
                  <li><a href="/knowledge" class="hover:text-emerald-400">FAQ & Knowledge Base</a></li>
                  <li><a href="/community" class="hover:text-emerald-400">Community Forum</a></li>
                  <li><a href="/buddies" class="hover:text-emerald-400">Study Buddy Matcher</a></li>
                </ul>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
                <ul class="space-y-2 text-sm">
                  <li><a href="/partners" class="hover:text-emerald-400">Partner With Us</a></li>
                  <li><a href="/about" class="hover:text-emerald-400">About</a></li>
                  <li><a href="/waitlist" class="hover:text-emerald-400">Join Waitlist</a></li>
                  <li><a href="/contact" class="hover:text-emerald-400">Contact</a></li>
                </ul>
              </div>
            </div>
            <div class="border-t border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p class="text-sm text-slate-400">&copy; 2026 StudyAbroad Network. All rights reserved.</p>
              <div class="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" class="text-slate-400 hover:text-emerald-400"><i class="fab fa-twitter"></i></a>
                <a href="#" class="text-slate-400 hover:text-emerald-400"><i class="fab fa-instagram"></i></a>
                <a href="#" class="text-slate-400 hover:text-emerald-400"><i class="fab fa-linkedin"></i></a>
                <a href="#" class="text-slate-400 hover:text-emerald-400"><i class="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
        </footer>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
