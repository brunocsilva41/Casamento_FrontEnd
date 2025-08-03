'use client'

import { ErrorAlert } from '@/components/error-alert'
import { GiftCard } from '@/components/gift-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { useGifts } from '@/lib/contexts/gift-context'
import { Loader2, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export default function PresentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { 
    availableGifts, 
    gifts,
    isLoading, 
    error, 
    loadAvailableGifts,
    loadGifts,
    clearError 
  } = useGifts()
  const { isAdmin } = useAuth()

  // Load gifts on mount
  useEffect(() => {
    if (isAdmin()) {
      // Admin sees all gifts
      loadGifts()
    } else {
      // Regular users see only available gifts
      loadAvailableGifts()
    }
  }, [isAdmin, loadGifts, loadAvailableGifts])

  const displayGifts = isAdmin() ? gifts : availableGifts

  const filteredGifts = useMemo(() => {
    return displayGifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           gift.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [displayGifts, searchTerm])

  const availableCount = filteredGifts.filter(gift => !gift.claimedBy).length
  const claimedCount = filteredGifts.filter(gift => gift.claimedBy).length

  const handleRetry = () => {
    clearError()
    if (isAdmin()) {
      loadGifts()
    } else {
      loadAvailableGifts()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Carregando presentes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Error Display */}
        {error && (
          <ErrorAlert
            message={error}
            onDismiss={clearError}
            onRetry={handleRetry}
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lista de Presentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha um presente especial para Bruno & Laura. Todos os itens foram selecionados com carinho 
            para ajudar o casal a começar esta nova jornada juntos.
          </p>
          
          {/* Admin Actions */}
          {isAdmin() && (
            <div className="mt-6">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Presente
              </Button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar presentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{availableCount}</div>
            <div className="text-sm text-muted-foreground">Presentes Disponíveis</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{claimedCount}</div>
            <div className="text-sm text-muted-foreground">Já Reivindicados</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{filteredGifts.length}</div>
            <div className="text-sm text-muted-foreground">
              {isAdmin() ? 'Total de Presentes' : 'Presentes Encontrados'}
            </div>
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum presente encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente alterar os termos de busca para encontrar outros presentes.'
                : 'Não há presentes disponíveis no momento.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
