import { getCategoryStructure } from '@/lib/blogs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = getCategoryStructure()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}
