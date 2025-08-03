'use client';

import { LogOut, Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../lib/contexts/auth-context';
import { AuthForm } from './auth-form';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function UserMenu() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => setShowAuthDialog(true)}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Entrar
        </Button>

        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Autenticação</DialogTitle>
            </DialogHeader>
            <AuthForm onSuccess={handleAuthSuccess} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials(user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {isAdmin() && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">
                  Administrador
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        
        {isAdmin() && (
          <>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                <span>Painel Administrativo</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
