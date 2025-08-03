'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Gift, Users, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8 animate-in slide-in-from-bottom duration-1000">
            <Heart className="h-16 w-16 text-blue-600 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4">
              Bruno <span className="text-blue-600">&</span> Laura
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              15 de Junho de 2024
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Celebrando nosso amor</span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-12 animate-in slide-in-from-bottom duration-1000 delay-300">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Queridos familiares e amigos, é com imensa alegria que compartilhamos este momento especial com vocês. 
              Sua presença é o presente mais importante, mas se desejarem nos presentear, criamos esta lista com carinho.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-1000 delay-500">
            <Link href="/presentes">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                <Gift className="mr-2 h-5 w-5" />
                Ver Lista de Presentes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Gift className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Escolha o Presente</h3>
                <p className="text-muted-foreground">
                  Navegue pela nossa lista e escolha o presente que mais combina com vocês
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Informe seu Nome</h3>
                <p className="text-muted-foreground">
                  Digite seu nome para personalizar o presente e sabermos quem nos presenteou
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Pague via Pix</h3>
                <p className="text-muted-foreground">
                  Escaneie o QR Code gerado e efetue o pagamento de forma rápida e segura
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Faça Parte da Nossa História
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Cada presente escolhido com carinho fará parte do início da nossa jornada juntos
          </p>
          <Link href="/presentes">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              <Gift className="mr-2 h-5 w-5" />
              Escolher Presente Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}