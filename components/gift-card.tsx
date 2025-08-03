'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift } from '@/lib/types'
import { CheckCircle } from 'lucide-react'

interface GiftCardProps {
  gift: Gift
}

export function GiftCard({ gift }: GiftCardProps) {
  return (
    <Link href={`/presente/${gift.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {gift.claimedBy && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Já reivindicado</span>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge 
              className={gift.claimedBy ? "bg-red-500 text-white" : "bg-green-500 text-white"}
            >
              {gift.claimedBy ? "Reivindicado" : "Disponível"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {gift.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {gift.description}
          </p>
          {gift.claimedBy && (
            <p className="text-xs text-muted-foreground">
              Reivindicado por: {gift.claimedBy}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="w-full flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              R$ {gift.price.toFixed(2).replace('.', ',')}
            </span>
            {!gift.claimedBy && (
              <div className="text-sm text-green-600 font-medium">
                Disponível
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}