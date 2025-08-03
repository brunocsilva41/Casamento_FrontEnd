'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/contexts/auth-context'
import { Shield } from 'lucide-react'

export function AuthDebug() {
  const { user, isAuthenticated, isAdmin } = useAuth()

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Debug: Estado de Autenticação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Autenticado:</span>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "SIM" : "NÃO"}
          </Badge>
        </div>
        
        {user && (
          <>
            <div className="flex items-center justify-between">
              <span>Nome:</span>
              <span className="font-medium">{user.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Email:</span>
              <span className="font-medium text-xs">{user.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Role (raw):</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>É Admin:</span>
              <Badge variant={isAdmin() ? "default" : "secondary"}>
                {isAdmin() ? "SIM" : "NÃO"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Role === 2:</span>
              <Badge variant={user.role === 2 ? "default" : "secondary"}>
                {user.role === 2 ? "SIM" : "NÃO"}
              </Badge>
            </div>
          </>
        )}
        
        {!user && isAuthenticated && (
          <div className="text-orange-600 text-xs">
            ⚠️ Autenticado mas sem dados do usuário
          </div>
        )}
      </CardContent>
    </Card>
  )
}
