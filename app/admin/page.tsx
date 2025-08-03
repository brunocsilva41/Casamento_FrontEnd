'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/contexts/auth-context'
import { BarChart3, CreditCard, Gift, Settings, ShoppingBag, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  // Verificar autenticação e permissão
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
      return
    }
    
    if (!isAdmin()) {
      router.push('/presentes')
      return
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo, {user?.name}! Gerencie o sistema de presentes de casamento.
        </p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes Vendidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 2.850</div>
            <p className="text-xs text-muted-foreground">
              +R$ 450 desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menu de navegação principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/presentes">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-600" />
                Gerenciar Presentes
              </CardTitle>
              <CardDescription>
                Adicionar, editar e remover presentes da lista
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/pagamentos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Pagamentos
              </CardTitle>
              <CardDescription>
                Visualizar e gerenciar pagamentos recebidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/usuarios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Usuários
              </CardTitle>
              <CardDescription>
                Gerenciar usuários cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/relatorios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Visualizar estatísticas e relatórios detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/configuracoes">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
