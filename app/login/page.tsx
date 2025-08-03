'use client'

import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/contexts/auth-context'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  useEffect(() => {
    if (isAuthenticated) {
      // Se já está logado, redireciona para onde foi solicitado ou para a página principal
      router.push(redirect || '/presentes')
    }
  }, [isAuthenticated, router, redirect])

  const handleAuthSuccess = () => {
    // Redireciona após login bem-sucedido
    router.push(redirect || '/presentes')
  }

  if (isAuthenticated) {
    return null // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <Heart className="h-8 w-8" />
            Bruno & Laura
          </Link>
          <p className="text-muted-foreground mt-2">
            Entre na sua conta para continuar
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>
              {redirect?.includes('admin') 
                ? 'Acesso restrito para administradores'
                : 'Faça login ou crie sua conta para continuar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm onSuccess={handleAuthSuccess} />
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Link 
            href="/presentes" 
            className="hover:text-blue-600 transition-colors"
          >
            ← Voltar para lista de presentes
          </Link>
        </div>
      </div>
    </div>
  )
}
