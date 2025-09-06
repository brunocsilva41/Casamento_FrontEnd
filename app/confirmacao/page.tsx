'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/contexts/auth-context'
import { gifts } from '@/lib/gifts-data'
import { ArrowLeft, CheckCircle, Copy, CreditCard, ExternalLink, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Parâmetros de retorno do PagBank
  const paymentId = searchParams.get('payment_id')
  const checkoutIdParam = searchParams.get('checkout_id') 
  const status = searchParams.get('status')
  const reference = searchParams.get('reference_id')

  // Parâmetros PIX (legado)
  const giftId = searchParams.get('gift')
  const guestName = searchParams.get('name')
  const qrCode = searchParams.get('qrCode')
  const pixPayload = searchParams.get('pixPayload')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    if (checkoutIdParam) {
      setCheckoutId(checkoutIdParam)
    }
    if (status) {
      setPaymentStatus(status)
    }
  }, [checkoutIdParam, status])

  const copyPixCode = async () => {
    if (!pixPayload) return
    
    try {
      await navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  // Página para retorno do PagBank
  if (paymentId || checkoutId) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                {status === 'PAID' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : status === 'WAITING' ? (
                  <CreditCard className="h-16 w-16 text-yellow-500" />
                ) : (
                  <ExternalLink className="h-16 w-16 text-blue-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {status === 'PAID' 
                  ? 'Pagamento Confirmado!' 
                  : status === 'WAITING'
                  ? 'Pagamento Pendente'
                  : 'Retorno do Pagamento'
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {status === 'PAID' ? (
                <div className="space-y-4">
                  <p className="text-lg text-green-600">
                    ✨ Obrigado por presentear Bruno & Laura! ✨
                  </p>
                  <p className="text-muted-foreground">
                    Seu pagamento foi processado com sucesso.
                  </p>
                  {user && (
                    <p className="text-sm text-muted-foreground">
                      Muito obrigado, {user.name}! 💝
                    </p>
                  )}
                </div>
              ) : status === 'WAITING' ? (
                <div className="space-y-4">
                  <p className="text-lg text-yellow-600">
                    Aguardando confirmação do pagamento
                  </p>
                  <p className="text-muted-foreground">
                    Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Retornamos do processamento do seu pagamento.
                  </p>
                  {paymentId && (
                    <p className="text-sm text-muted-foreground">
                      ID do Pagamento: {paymentId}
                    </p>
                  )}
                </div>
              )}

              {reference && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Referência:</p>
                  <p className="text-sm text-muted-foreground">{reference}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Link href="/presentes">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ver Outros Presentes
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Página Inicial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Funcionalidade PIX (legado) 
  const gift = gifts.find(g => g.id === giftId)

  if (!gift || !guestName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Informações inválidas</h1>
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
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-background">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Obrigado, {guestName}! ❤️
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu QR Code Pix foi gerado com sucesso
          </p>
        </div>

        {/* Gift Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-600" />
              Resumo do Presente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{gift.name}</h3>
                <p className="text-sm text-muted-foreground">Presente escolhido por {guestName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {gift.price.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">QR Code Pix</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Escaneie com seu aplicativo bancário ou copie o código abaixo
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {qrCode && pixPayload ? (
              <>
                {/* Use QR Code da API */}
                <div className="flex justify-center">
                  <Image 
                    src={qrCode} 
                    alt="QR Code PIX" 
                    width={280}
                    height={280}
                    className="rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={copyPixCode}
                    variant="outline" 
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? 'Copiado!' : 'Copiar código Pix'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Código Pix: {pixPayload.substring(0, 20)}...
                  </p>
                  
                  {transactionId && (
                    <p className="text-xs text-muted-foreground">
                      ID da transação: {transactionId}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-muted-foreground">Carregando QR Code...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-400">
              Como pagar:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>Abra o aplicativo do seu banco</li>
              <li>Procure pela opção &quot;Pix&quot; ou &quot;Pagamentos&quot;</li>
              <li>Selecione &quot;Ler QR Code&quot; ou &quot;Pix Copia e Cola&quot;</li>
              <li>Escaneie o QR Code ou cole o código copiado</li>
              <li>Confirme os dados e efetue o pagamento</li>
            </ol>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <Card className="text-center">
          <CardContent className="p-8">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-3">
              Bruno & Laura agradecem! 💕
            </h2>
            <p className="text-muted-foreground mb-6">
              Seu carinho e generosidade significam muito para nós. Este presente fará parte do início 
              da nossa jornada juntos e será sempre lembrado com muito amor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/presentes">
                <Button variant="outline">
                  Ver outros presentes
                </Button>
              </Link>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}