-- Core destinations table
CREATE TABLE IF NOT EXISTS Destination (
  id          TEXT PRIMARY KEY,
  country     TEXT UNIQUE NOT NULL,
  countryCode TEXT NOT NULL,
  flag        TEXT NOT NULL,
  blurb       TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights  TEXT DEFAULT '',
  avgTuition  TEXT DEFAULT '',
  livingCost  TEXT DEFAULT '',
  workRights  TEXT DEFAULT '',
  popularFields TEXT DEFAULT '',
  image       TEXT DEFAULT '',
  createdAt   TEXT DEFAULT (datetime('now'))
);

-- Institutions (universities)
CREATE TABLE IF NOT EXISTS Institution (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  country       TEXT NOT NULL,
  city          TEXT NOT NULL,
  founded       TEXT DEFAULT '',
  description   TEXT DEFAULT '',
  rating        REAL DEFAULT 0,
  programsCount INTEGER DEFAULT 0,
  tuitionFrom   INTEGER DEFAULT 0,
  image         TEXT DEFAULT '',
  tags          TEXT DEFAULT '',
  featured      INTEGER DEFAULT 0,
  featuredRank  INTEGER DEFAULT 0,
  verified      INTEGER DEFAULT 0,
  createdAt     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (country) REFERENCES Destination(country)
);

-- Programs
CREATE TABLE IF NOT EXISTS Program (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  institution   TEXT NOT NULL,
  country       TEXT NOT NULL,
  level         TEXT NOT NULL,
  field         TEXT NOT NULL,
  tuition       INTEGER DEFAULT 0,
  duration      TEXT DEFAULT '',
  language      TEXT DEFAULT '',
  intake        TEXT DEFAULT '',
  rating        REAL DEFAULT 0,
  featured      INTEGER DEFAULT 0,
  featuredRank  INTEGER DEFAULT 0,
  createdAt     TEXT DEFAULT (datetime('now'))
);

-- Testimonials
CREATE TABLE IF NOT EXISTS Testimonial (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  destination TEXT NOT NULL,
  program     TEXT DEFAULT '',
  quote       TEXT NOT NULL,
  rating      INTEGER DEFAULT 5,
  avatar      TEXT DEFAULT ''
);

-- Registrations (lead capture)
CREATE TABLE IF NOT EXISTS Registration (
  id          TEXT PRIMARY KEY,
  fullName    TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  country     TEXT,
  destination TEXT,
  field       TEXT,
  level       TEXT,
  budget      TEXT,
  intake      TEXT,
  notes       TEXT,
  tier        TEXT DEFAULT 'free',
  status      TEXT DEFAULT 'registered',
  refCode     TEXT,
  createdAt   TEXT DEFAULT (datetime('now')),
  updatedAt   TEXT DEFAULT (datetime('now'))
);

-- Users (dashboard auth)
CREATE TABLE IF NOT EXISTS User (
  id                TEXT PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  name              TEXT,
  tier              TEXT DEFAULT 'free',
  customerId        TEXT,
  subscriptionId    TEXT,
  status            TEXT DEFAULT 'active',
  currentPeriodEnd  TEXT,
  creditsRemaining  INTEGER DEFAULT 50,
  creditsUsed       INTEGER DEFAULT 0,
  trialEnd          TEXT,
  reviewCreditsUsed INTEGER DEFAULT 0,
  reviewCreditsReset TEXT,
  foundersClaimed   INTEGER DEFAULT 0,
  referralCode      TEXT UNIQUE,
  referralCount     INTEGER DEFAULT 0,
  createdAt         TEXT DEFAULT (datetime('now')),
  updatedAt         TEXT DEFAULT (datetime('now'))
);

-- Blog posts
CREATE TABLE IF NOT EXISTS BlogPost (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  content     TEXT DEFAULT '',
  authorName  TEXT NOT NULL,
  authorBio   TEXT,
  authorAvatar TEXT,
  tags        TEXT DEFAULT '',
  coverImage  TEXT,
  status      TEXT DEFAULT 'draft',
  aiSummary   TEXT,
  readMinutes INTEGER DEFAULT 5,
  viewCount   INTEGER DEFAULT 0,
  publishedAt TEXT,
  createdAt   TEXT DEFAULT (datetime('now')),
  updatedAt   TEXT DEFAULT (datetime('now'))
);

-- Community posts
CREATE TABLE IF NOT EXISTS CommunityPost (
  id          TEXT PRIMARY KEY,
  channelId   TEXT NOT NULL,
  authorName  TEXT NOT NULL,
  authorEmail TEXT NOT NULL,
  authorAvatar TEXT,
  title       TEXT,
  content     TEXT NOT NULL,
  parentId    TEXT,
  upvotes     INTEGER DEFAULT 0,
  createdAt   TEXT DEFAULT (datetime('now')),
  updatedAt   TEXT DEFAULT (datetime('now'))
);

-- Community votes
CREATE TABLE IF NOT EXISTS CommunityVote (
  id        TEXT PRIMARY KEY,
  postId    TEXT NOT NULL,
  voterEmail TEXT NOT NULL,
  value     INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(postId, voterEmail)
);

-- Waitlist entries
CREATE TABLE IF NOT EXISTS WaitlistEntry (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  referralCode  TEXT UNIQUE NOT NULL,
  referredBy    TEXT,
  position      INTEGER DEFAULT 0,
  referralsCount INTEGER DEFAULT 0,
  spotsSkipped  INTEGER DEFAULT 0,
  emailSequenceDay INTEGER DEFAULT 0,
  convertedToUser INTEGER DEFAULT 0,
  source        TEXT DEFAULT 'landing',
  createdAt     TEXT DEFAULT (datetime('now')),
  updatedAt     TEXT DEFAULT (datetime('now'))
);

-- Guide pages
CREATE TABLE IF NOT EXISTS GuidePage (
  id          TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  level       TEXT NOT NULL,
  field       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  intro       TEXT DEFAULT '',
  sections    TEXT DEFAULT '[]',
  faqs        TEXT DEFAULT '[]',
  steps       TEXT DEFAULT '[]',
  leadCount   INTEGER DEFAULT 0,
  viewCount   INTEGER DEFAULT 0,
  generatedAt TEXT DEFAULT (datetime('now')),
  updatedAt   TEXT DEFAULT (datetime('now'))
);

-- Lead captures
CREATE TABLE IF NOT EXISTS LeadCapture (
  id        TEXT PRIMARY KEY,
  email     TEXT NOT NULL,
  source    TEXT NOT NULL,
  name      TEXT,
  destination TEXT,
  field     TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Knowledge articles
CREATE TABLE IF NOT EXISTS KnowledgeArticle (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  shortAnswer     TEXT DEFAULT '',
  category        TEXT NOT NULL,
  destination     TEXT,
  citations       TEXT DEFAULT '',
  confidence      INTEGER DEFAULT 85,
  lastVerified    TEXT DEFAULT (datetime('now')),
  viewCount       INTEGER DEFAULT 0,
  aiCrawlCount    INTEGER DEFAULT 0,
  publishedAt     TEXT DEFAULT (datetime('now')),
  createdAt       TEXT DEFAULT (datetime('now')),
  updatedAt       TEXT DEFAULT (datetime('now'))
);

-- Analytics events
CREATE TABLE IF NOT EXISTS AnalyticsEvent (
  id        TEXT PRIMARY KEY,
  event     TEXT NOT NULL,
  sessionId TEXT,
  userId    TEXT,
  page      TEXT,
  props     TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Affiliate clicks
CREATE TABLE IF NOT EXISTS AffiliateClick (
  id              TEXT PRIMARY KEY,
  registrationId  TEXT,
  partner         TEXT NOT NULL,
  label           TEXT,
  url             TEXT NOT NULL,
  createdAt       TEXT DEFAULT (datetime('now'))
);

-- Verified stories
CREATE TABLE IF NOT EXISTS VerifiedStory (
  id            TEXT PRIMARY KEY,
  userEmail     TEXT,
  userName      TEXT NOT NULL,
  userAvatar    TEXT,
  destination   TEXT NOT NULL,
  program       TEXT,
  university    TEXT,
  story         TEXT NOT NULL,
  rating        INTEGER DEFAULT 5,
  aiAuthenticityScore INTEGER DEFAULT 85,
  verificationStatus TEXT DEFAULT 'verified',
  verificationMethod TEXT DEFAULT 'ai_analysis',
  outcome       TEXT DEFAULT 'enrolled',
  featured      INTEGER DEFAULT 0,
  upvotes       INTEGER DEFAULT 0,
  createdAt     TEXT DEFAULT (datetime('now'))
);

-- Partners
CREATE TABLE IF NOT EXISTS Partner (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  companyName   TEXT NOT NULL,
  contactName   TEXT,
  email         TEXT NOT NULL,
  country       TEXT,
  website       TEXT,
  studentVolume TEXT,
  notes         TEXT,
  status        TEXT DEFAULT 'lead',
  plan          TEXT DEFAULT 'trial',
  createdAt     TEXT DEFAULT (datetime('now')),
  updatedAt     TEXT DEFAULT (datetime('now'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_institutions_country ON Institution(country);
CREATE INDEX IF NOT EXISTS idx_institutions_featured ON Institution(featured);
CREATE INDEX IF NOT EXISTS idx_programs_country ON Program(country);
CREATE INDEX IF NOT EXISTS idx_programs_field ON Program(field);
CREATE INDEX IF NOT EXISTS idx_programs_level ON Program(level);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON Program(featured);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON BlogPost(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON BlogPost(status);
CREATE INDEX IF NOT EXISTS idx_community_channel ON CommunityPost(channelId);
CREATE INDEX IF NOT EXISTS idx_guides_slug ON GuidePage(slug);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON KnowledgeArticle(slug);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON Registration(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON WaitlistEntry(email);
