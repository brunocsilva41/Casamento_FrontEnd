'use client'

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminTable } from '@/components/admin/admin-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAdminGifts } from '@/hooks/use-admin';
import { useNotification } from '@/hooks/use-notification';
import { TableColumn } from '@/lib/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, MoreHorizontal, Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const giftSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  imageUrl: z.string().url('URL da imagem inválida'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  isActive: z.boolean().optional(),
});

type GiftFormData = z.infer<typeof giftSchema>;

export default function AdminGifts() {
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 25 });
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<any>(null);

  const { gifts, categories, pagination: paginationData, loading, error, createGift, updateGift, deleteGift } = useAdminGifts(filters, pagination);
  const { notifySuccess, notifyError } = useNotification();

  const form = useForm<GiftFormData>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      isActive: true,
    },
  });

  const columns: TableColumn[] = [
    {
      key: 'imageUrl',
      title: 'Imagem',
      width: 'w-20',
      render: (value, gift) => (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <Image
            src={value || '/placeholder-gift.jpg'}
            alt={gift.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ),
    },
    {
      key: 'name',
      title: 'Presente',
      sortable: true,
      render: (value, gift) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {gift.description}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Categoria',
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'price',
      title: 'Preço',
      sortable: true,
      render: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value),
    },
    {
      key: 'claimedBy',
      title: 'Status',
      render: (value, gift) => (
        <div>
          {value ? (
            <div>
              <Badge variant="secondary">Reivindicado</Badge>
              <div className="text-xs text-muted-foreground mt-1">
                por {value}
              </div>
            </div>
          ) : (
            <Badge variant={gift.isActive ? 'default' : 'destructive'}>
              {gift.isActive ? 'Disponível' : 'Inativo'}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_, gift) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditGift(gift)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteGift(gift.id)}
            disabled={!!gift.claimedBy}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleCreateGift = async (data: GiftFormData) => {
    try {
      await createGift(data);
      notifySuccess('Presente criado com sucesso!');
      setCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      notifyError('Erro ao criar presente');
    }
  };

  const handleEditGift = (gift: any) => {
    setEditingGift(gift);
    form.reset({
      name: gift.name,
      description: gift.description,
      price: gift.price,
      imageUrl: gift.imageUrl,
      category: gift.category,
      isActive: gift.isActive,
    });
  };

  const handleUpdateGift = async (data: GiftFormData) => {
    try {
      await updateGift(editingGift.id, data);
      notifySuccess('Presente atualizado com sucesso!');
      setEditingGift(null);
      form.reset();
    } catch (error) {
      notifyError('Erro ao atualizar presente');
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (confirm('Tem certeza que deseja excluir este presente?')) {
      try {
        await deleteGift(giftId);
        notifySuccess('Presente excluído com sucesso!');
      } catch (error) {
        notifyError('Erro ao excluir presente');
      }
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    setPagination({ page, limit });
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
    setPagination({ ...pagination, page: 1 });
  };

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Erro: {error}</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Presentes</h1>
            <p className="text-muted-foreground">
              Gerencie a lista de presentes de casamento
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Presente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Presente</DialogTitle>
                <DialogDescription>
                  Adicione um novo presente à lista de casamento
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateGift)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Presente</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Jogo de Panelas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o presente em detalhes..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="Nova Categoria">+ Nova Categoria</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://exemplo.com/imagem.jpg"
                                {...field}
                              />
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Presente
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingGift} onOpenChange={() => setEditingGift(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Presente</DialogTitle>
              <DialogDescription>
                Atualize as informações do presente
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateGift)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Presente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Jogo de Panelas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o presente em detalhes..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/imagem.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Presente Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          O presente aparece na lista para os convidados
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingGift(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paginationData?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gifts.filter(g => !g.claimedBy && g.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reivindicados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {gifts.filter(g => g.claimedBy).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(gifts.reduce((sum, gift) => sum + gift.price, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gifts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Presentes</CardTitle>
            <CardDescription>
              Gerencie todos os presentes da lista de casamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTable
              data={gifts}
              columns={columns}
              loading={loading}
              selectable={true}
              selectedItems={selectedGifts}
              onSelectionChange={setSelectedGifts}
              pagination={paginationData}
              onPaginationChange={handlePaginationChange}
              searchable={true}
              onSearchChange={handleSearchChange}
              emptyMessage="Nenhum presente encontrado"
              actions={
                selectedGifts.length > 0 && (
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Ações ({selectedGifts.length})
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
