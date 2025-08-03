'use client'

import { MercadoPagoCheckout } from '@/components/mercado-pago-checkout'
import { MercadoPagoScript } from '@/components/mercado-pago-script'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useNotification } from '@/hooks/use-notification'
import { useGift } from '@/lib/api-service'
import { useAuth } from '@/lib/contexts/auth-context'
import { MercadoPagoProvider } from '@/lib/mercado-pago-context'
import { CheckoutCallbacks, MercadoPagoConfig } from '@/lib/types'
import { AlertCircle, ArrowLeft, Gift, Heart, Loader2, MessageSquare, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PresentePage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth()
  const [giftMessage, setGiftMessage] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const { gift, loading, error } = useGift(params.id as string)
  const { showWarning, showError } = useNotification()
  const router = useRouter()

  // Configuração do Mercado Pago
  const mercadoPagoConfig: MercadoPagoConfig = {
    publicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
  }

  // Callbacks do checkout
  const checkoutCallbacks: CheckoutCallbacks = {
    onSuccess: (payment) => {
      console.log('Pagamento aprovado:', payment)
      router.push('/confirmacao')
    },
    onPending: (payment) => {
      console.log('Pagamento pendente:', payment)
    },
    onError: (error) => {
      console.error('Erro no pagamento:', error)
    }
  }

  const handleGiftPurchase = () => {
    if (!isAuthenticated) {
      showWarning('Login Necessário', 'Faça login para presentear os noivos')
      router.push('/login')
      return
    }
    setShowCheckout(true)
  }

  // Função de teste para debug - remover em produção
  const testAPI = async () => {
    try {
      const result = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'PIX',
          amount: 100,
          description: 'Teste',
          customer: { name: 'Teste', email: 'teste@teste.com', document: '12345678901' }
        })
      });
      console.log('Teste API - Status:', result.status);
      const text = await result.text();
      console.log('Teste API - Response:', text);
    } catch (error) {
      console.error('Teste API - Erro:', error);
    }
  }

  // Disponibilizar função para teste no console
  if (typeof window !== 'undefined') {
    (window as any).testAPI = testAPI;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando presente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar presente</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/presentes">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Presente não encontrado</h1>
          <Link href="/presentes">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <MercadoPagoScript publicKey={mercadoPagoConfig.publicKey} />
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/presentes">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={gift.imageUrl}
                alt={gift.name}
                fill
                className="object-cover"
                priority
              />
              {gift.claimedBy && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full">
                    <span className="font-medium">Já presenteado por {gift.claimedBy}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {gift.name}
              </h1>
              <p className="text-2xl font-bold text-blue-600 mb-6">
                R$ {gift.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {gift.description}
              </p>
            </div>

            {/* Gift Form or Checkout */}
            {!gift.claimedBy && !showCheckout ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-blue-600" />
                    Presentear Bruno & Laura
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated 
                      ? `Olá ${user?.name}! Deixe uma mensagem carinhosa para os noivos` 
                      : 'Faça login para presentear os noivos com este item especial'
                    }
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div>
                        <Label htmlFor="giftMessage" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Mensagem para os noivos (opcional)
                        </Label>
                        <Textarea
                          id="giftMessage"
                          placeholder="Deixe uma mensagem carinhosa para Bruno & Laura..."
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="mt-2 min-h-[100px]"
                          maxLength={300}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {giftMessage.length}/300 caracteres • Sua mensagem aparecerá no agradecimento
                        </p>
                      </div>

                      <Button
                        onClick={handleGiftPurchase}
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Heart className="mr-2 h-5 w-5" />
                        Presentear com R$ {gift.price.toFixed(2).replace('.', ',')}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="font-semibold mb-2">Entre na sua conta</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Para presentear os noivos, você precisa estar logado
                        </p>
                        <Button 
                          onClick={() => router.push('/login')}
                          className="w-full"
                        >
                          Fazer Login
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : !gift.claimedBy && showCheckout ? (
              <MercadoPagoProvider config={mercadoPagoConfig}>
                <MercadoPagoCheckout
                  config={mercadoPagoConfig}
                  amount={gift.price}
                  description={`Presente: ${gift.name}${giftMessage ? ` - Mensagem: ${giftMessage}` : ''}`}
                  customer={{
                    name: user?.name || 'Usuário',
                    email: user?.email || 'user@example.com',
                    document: '00000000000' // CPF temporário - idealmente deveria ser capturado
                  }}
                  giftId={gift.id}
                  callbacks={checkoutCallbacks}
                />
                <div className="mt-4">
                  <Button
                    onClick={() => setShowCheckout(false)}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </MercadoPagoProvider>
            ) : gift.claimedBy ? (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CardContent className="p-6 text-center">
                  <div className="text-green-600 mb-4">
                    <Gift className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-400">
                    Presente já escolhido!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Este presente foi escolhido por {gift.claimedBy}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}