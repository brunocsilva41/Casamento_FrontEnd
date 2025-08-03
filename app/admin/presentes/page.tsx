'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/lib/contexts/auth-context'
import { ArrowLeft, Edit, Eye, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPresentes() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  // Verificar autenticação e permissão
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/presentes')
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

  // Dados mock dos presentes (em produção viria da API)
  const presentes = [
    { id: '1', nome: 'Jogo de Panelas', preco: 299.90, status: 'disponivel', compradoPor: null },
    { id: '2', nome: 'Liquidificador', preco: 150.00, status: 'vendido', compradoPor: 'João Silva' },
    { id: '3', nome: 'Micro-ondas', preco: 450.00, status: 'disponivel', compradoPor: null },
    { id: '4', nome: 'Aspirador de Pó', preco: 320.00, status: 'vendido', compradoPor: 'Maria Santos' },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Presentes</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todos os presentes da lista
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Presentes</CardTitle>
              <CardDescription>
                Total de {presentes.length} presentes cadastrados
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Presente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprado por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presentes.map((presente) => (
                <TableRow key={presente.id}>
                  <TableCell className="font-medium">{presente.nome}</TableCell>
                  <TableCell>R$ {presente.preco.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>
                    <Badge variant={presente.status === 'vendido' ? 'secondary' : 'default'}>
                      {presente.status === 'vendido' ? 'Vendido' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {presente.compradoPor || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
