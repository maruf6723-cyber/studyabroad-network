# StudyAbroad Network

## Project Overview
- **Name**: StudyAbroad Network
- **Goal**: A comprehensive study abroad platform that connects international students with universities, programs, and resources worldwide
- **Features**: Destination browsing, program search, university listings, blog, community forum, study guides, knowledge base, lead capture, waitlist, study buddy matching, partner portal, analytics

## URLs
- **Production (Custom Domain)**: https://studyabroad.network
- **Cloudflare Pages**: https://studyabroad-network.pages.dev
- **GitHub**: (configured via setup_github_environment)

## Data Architecture
- **Data Models**: Destination, Institution, Program, Testimonial, Registration, User, BlogPost, CommunityPost, CommunityVote, WaitlistEntry, GuidePage, LeadCapture, KnowledgeArticle, AnalyticsEvent, AffiliateClick, VerifiedStory, Partner, StudyBuddyProfile
- **Storage Services**: Cloudflare D1 (SQLite-based globally distributed database)
- **Database Name**: studyabroad-production
- **Database ID**: 46d88847-166d-4103-9890-032f4a1429a2
- **Data Flow**: Hono routes query D1 via prepared statements → JSX server-rendered pages → CDN-delivered to users

## Functional Entry URIs

### Pages
| Path | Description |
|------|-------------|
| `/` | Homepage with featured destinations, programs, universities, testimonials |
| `/destinations` | List all study destinations with key facts |
| `/destinations/:countryCode` | Detailed destination page with programs & universities |
| `/programs` | Searchable/filterable program listing |
| `/programs/:id` | Individual program detail page |
| `/institutions` | Searchable university listing |
| `/institutions/:id` | Individual university detail page |
| `/blog` | Blog listing with featured post |
| `/blog/:slug` | Individual blog post with markdown rendering |
| `/community` | Community forum with channels |
| `/guides` | Study guide listing |
| `/guides/:slug` | Detailed study guide with steps, sections, FAQs |
| `/knowledge` | Knowledge base / FAQ with search and categories |
| `/knowledge/:slug` | Individual knowledge article |
| `/auth/register` | Student registration form |
| `/auth/login` | Login page |
| `/dashboard` | User dashboard with stats and upgrade plans |
| `/waitlist` | Waitlist signup with referral codes |
| `/buddies` | Study buddy matcher |
| `/partners` | Partner inquiry form |
| `/about` | About page |
| `/contact` | Contact form |

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/destinations` | All destinations (JSON) |
| GET | `/api/programs` | Programs with filters (?country, ?field, ?level) |
| GET | `/api/institutions` | All institutions (JSON) |
| GET | `/api/search?q=` | Cross-entity search |
| POST | `/api/register` | Student registration |
| POST | `/api/waitlist` | Waitlist signup with referral tracking |
| POST | `/api/lead` | Lead capture |
| POST | `/api/partner` | Partner inquiry |
| POST | `/api/community/post` | Create community post |
| POST | `/api/community/vote` | Upvote a community post |
| POST | `/api/buddy` | Study buddy profile + matching |
| POST | `/api/contact` | Contact form submission |
| POST | `/api/analytics` | Analytics event tracking |
| POST | `/api/affiliate/click` | Affiliate click tracking |

## User Guide
1. **Explore Destinations**: Visit `/destinations` to compare 8 countries by tuition, living costs, and work rights
2. **Find Programs**: Use `/programs` with filters for country, level, and field
3. **Read Guides**: Check `/guides` for step-by-step application guides
4. **Search FAQs**: Use `/knowledge` to find answers about visas, costs, and requirements
5. **Register**: Sign up at `/auth/register` to get matched with programs
6. **Join Community**: Connect with other students in `/community` forums
7. **Find a Buddy**: Use `/buddies` to find study companions heading to the same destination
8. **Join Waitlist**: Get early access at `/waitlist` and refer friends to move up

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Custom Domain**: studyabroad.network (CNAME flattened → studyabroad-network.pages.dev)
- **Tech Stack**: Hono + TypeScript (JSX) + Tailwind CSS (CDN) + Cloudflare D1
- **Build**: `npm run build` (Vite → dist/)
- **Deploy**: `npx wrangler pages deploy dist --project-name studyabroad-network`
- **Last Updated**: 2026-06-25

## Development
```bash
# Install dependencies (already done)
npm install

# Build
npm run build

# Local development with D1
pm2 start ecosystem.config.cjs

# Apply migrations to local D1
npx wrangler d1 execute studyabroad-production --local --file=./migrations/0001_initial_schema.sql

# Seed local D1
npx wrangler d1 execute studyabroad-production --local --file=./seed.sql

# Apply migrations to production D1
npx wrangler d1 execute studyabroad-production --remote --file=./migrations/0001_initial_schema.sql

# Seed production D1
npx wrangler d1 execute studyabroad-production --remote --file=./seed.sql

# Deploy to production
npx wrangler pages deploy dist --project-name studyabroad-network
```

## Features Not Yet Implemented
- Stripe payment integration for premium subscriptions
- AI-powered document review system
- WhatsApp viral loops and voice interactions
- Visa interview prep chatbot
- i18n translation system
- Ambassador and creator campaign management
- Government scholar tracking
- Sales engine automation
- Concierge AI counseling sessions
- Outcome-based guarantee system

## Recommended Next Steps
1. Set up Stripe API keys for payment processing
2. Integrate OpenAI API for AI document review and counseling
3. Add authentication middleware (JWT-based) for dashboard access
4. Implement admin panel for content management
5. Add program comparison feature
6. Build email notification system for registrations and waitlist
