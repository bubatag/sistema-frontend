import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Bug } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import BubalinoModal from '@/components/bubalinos/BubalinoModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function Bubalinos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: bubalinos = [], isLoading } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: () => base44.entities.Bubalino.list(),
  });

  const { data: coleiras = [] } = useQuery({
    queryKey: ['coleiras'],
    queryFn: () => base44.entities.Coleira.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Bubalino.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bubalinos'] }); setModalOpen(false); toast.success('Bubalino cadastrado!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Bubalino.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bubalinos'] }); setModalOpen(false); setEditing(null); toast.success('Bubalino atualizado!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bubalino.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bubalinos'] }); setDeleteTarget(null); toast.success('Bubalino excluído!'); },
  });

  const handleSave = (data) => {
    if (data.coleira_id === 'none') data.coleira_id = '';
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = bubalinos.filter(b => {
    const matchSearch = !search || b.nome?.toLowerCase().includes(search.toLowerCase()) || b.numero_etiqueta?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getColeiraNome = (id) => coleiras.find(c => c.id === id)?.numero_etiqueta || '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bubalinos</h1>
          <p className="text-muted-foreground mt-1">Gerencie o cadastro do rebanho</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-primary hover:bg-[#06D001]">
          <Plus className="w-4 h-4 mr-2" /> Cadastrar Bubalino
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou etiqueta..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
        </div>
        <select
          className="w-44 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="saudavel">Saudavel</option>
          <option value="estressado">Estressado</option>
          <option value="fora_do_pasto">Fora do pasto</option>
          <option value="sem_conexao">Sem conexao</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg bg-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bug} title="Nenhum bubalino encontrado" description="Cadastre seu primeiro bubalino para começar o monitoramento." actionLabel="Cadastrar Bubalino" onAction={() => { setEditing(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Raça</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Etiqueta</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Idade</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Sexo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Coleira</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{b.nome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{b.raca || '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{b.numero_etiqueta}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{b.idade ? `${b.idade} anos` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{b.sexo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{getColeiraNome(b.coleira_id)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status || 'sem_conexao'} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(b); setModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(b)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <BubalinoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bubalino={editing}
        coleiras={coleiras}
        onSave={handleSave}
        saving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Excluir Bubalino"
        description={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        confirmLabel="Excluir"
        destructive
      />
    </div>
  );
}