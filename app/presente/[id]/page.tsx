'use client'

import { PagBankCheckout } from '@/components/pagbank-checkout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useNotification } from '@/hooks/use-notification'
import { useGift } from '@/lib/api-service'
import { useAuth } from '@/lib/contexts/auth-context'
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
  const { notifyError, notifySuccess, notifyWarning } = useNotification()
  const router = useRouter()

  const handleGiftPurchase = () => {
    if (!isAuthenticated) {
      notifyWarning('Faça login para presentear os noivos')
      router.push('/login')
      return
    }
    setShowCheckout(true)
  }

  const handlePaymentCreated = (paymentUrl: string) => {
    console.log('🔗 URL de pagamento criada:', paymentUrl)
    // O redirecionamento é feito automaticamente pelo componente
  }

  const handlePaymentError = (error: string) => {
    notifyError(`Erro no pagamento: ${error}`)
    setShowCheckout(false)
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
              <>
                <PagBankCheckout
                  amount={gift.price}
                  description={`Presente: ${gift.name}${giftMessage ? ` - Mensagem: ${giftMessage}` : ''}`}
                  giftId={gift.id}
                  onPaymentCreated={handlePaymentCreated}
                  onError={handlePaymentError}
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
              </>
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