'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-colors hover:text-blue-600">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">Bruno & Laura</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            Início
          </Link>
          <Link 
            href="/presentes" 
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            Lista de Presentes
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}