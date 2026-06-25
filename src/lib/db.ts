// Database utility helpers for D1

export function parseList(val: string | null): string[] {
  if (!val) return []
  return val.split('|').map(s => s.trim()).filter(Boolean)
}

export function parseJSON<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

export function pipeJoin(arr: string[]): string {
  return arr.join('|')
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateRefCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface Destination {
  id: string
  country: string
  countryCode: string
  flag: string
  blurb: string
  description: string
  highlights: string[]
  avgTuition: string
  livingCost: string
  workRights: string
  popularFields: string[]
  image: string
}

export interface Institution {
  id: string
  name: string
  country: string
  city: string
  founded: string
  description: string
  rating: number
  programsCount: number
  tuitionFrom: number
  image: string
  tags: string[]
  featured: boolean
  verified: boolean
}

export interface Program {
  id: string
  name: string
  institution: string
  country: string
  level: string
  field: string
  tuition: number
  duration: string
  language: string
  intake: string
  rating: number
  featured: boolean
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  authorName: string
  authorBio: string
  authorAvatar: string
  tags: string[]
  coverImage: string
  status: string
  readMinutes: number
  viewCount: number
  publishedAt: string
}

// Transform raw DB rows into typed objects
export function mapDestination(row: any): Destination {
  return {
    ...row,
    highlights: parseList(row.highlights),
    popularFields: parseList(row.popularFields),
  }
}

export function mapInstitution(row: any): Institution {
  return {
    ...row,
    tags: parseList(row.tags),
    featured: !!row.featured,
    verified: !!row.verified,
  }
}

export function mapProgram(row: any): Program {
  return {
    ...row,
    featured: !!row.featured,
  }
}

export function mapBlogPost(row: any): BlogPost {
  return {
    ...row,
    tags: parseList(row.tags),
  }
}
