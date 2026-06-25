import { Hono } from 'hono'
import { generateId, generateRefCode } from '../lib/db'

export const authRoutes = new Hono<{ Bindings: { DB: D1Database } }>()

// Registration page
authRoutes.get('/register', async (c) => {
  const db = c.env.DB
  const destinations = await db.prepare('SELECT country FROM Destination ORDER BY country').all()
  const fields = ['Computer Science', 'Engineering', 'Business', 'Data Science', 'Medicine', 'Law', 'Arts', 'Healthcare', 'Finance', 'Other']
  const levels = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate']

  return c.render(
    <div class="max-w-2xl mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-slate-800 mb-3">Start Your Journey</h1>
        <p class="text-lg text-slate-600">Register free and get matched with the perfect study abroad program.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-8">
        <form data-form="register">
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" name="fullName" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" name="phone" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Your Country</label>
              <input type="text" name="country" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <select name="destination" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Select...</option>
                {destinations.results.map((d: any) => <option value={d.country}>{d.country}</option>)}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
              <select name="field" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Select...</option>
                {fields.map(f => <option value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select name="level" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Select...</option>
                {levels.map(l => <option value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Budget</label>
              <select name="budget" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Select...</option>
                <option value="under-10k">Under $10k/year</option>
                <option value="10k-25k">$10k-$25k/year</option>
                <option value="25k-50k">$25k-$50k/year</option>
                <option value="50k+">$50k+/year</option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Preferred Intake</label>
            <select name="intake" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="">Select...</option>
              <option>Fall 2026</option>
              <option>Spring 2027</option>
              <option>Fall 2027</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea name="notes" rows="3" placeholder="Tell us about your goals..." class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
          <button type="submit" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all">
            <i class="fas fa-rocket mr-2"></i>Register & Get Matched
          </button>
          <div id="register-result" class="hidden mt-4 p-4 rounded-lg"></div>
        </form>
      </div>

      <p class="text-center text-sm text-slate-500 mt-4">
        Already registered? <a href="/auth/login" class="text-emerald-600 hover:underline">Log in to your dashboard</a>
      </p>
    </div>,
    { title: 'Register' }
  )
})

// Login page
authRoutes.get('/login', (c) => {
  return c.render(
    <div class="max-w-md mx-auto px-4 py-16">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Log In</h1>
        <p class="text-slate-600">Access your study abroad dashboard</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8">
        <form data-form="login">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" name="password" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" class="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Log In</button>
          <div id="login-result" class="hidden mt-4 p-4 rounded-lg"></div>
        </form>
      </div>
      <p class="text-center text-sm text-slate-500 mt-4">
        New here? <a href="/auth/register" class="text-emerald-600 hover:underline">Create a free account</a>
      </p>
    </div>,
    { title: 'Log In' }
  )
})

// Logout
authRoutes.get('/logout', (c) => {
  return c.redirect('/')
})
