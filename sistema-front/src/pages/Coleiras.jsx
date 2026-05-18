import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ColeiraModal from '@/components/coleiras/ColeiraModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function Coleiras() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: coleiras = [], isLoading } = useQuery({
    queryKey: ['coleiras'],
    queryFn: () => base44.entities.Coleira.list(),
  });

  const { data: bubalinos = [] } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: () => base44.entities.Bubalino.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Coleira.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['coleiras'] }); setModalOpen(false); toast.success('Coleira cadastrada!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Coleira.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['coleiras'] }); setModalOpen(false); setEditing(null); toast.success('Coleira atualizada!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Coleira.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['coleiras'] }); setDeleteTarget(null); toast.success('Coleira excluída!'); },
  });

  const handleSave = (data) => {
    if (data.bubalino_id === 'none') { data.bubalino_id = ''; data.bubalino_nome = ''; }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = coleiras.filter(c =>
    !search || c.numero_etiqueta?.toLowerCase().includes(search.toLowerCase()) || c.bubalino_nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Coleiras</h1>
          <p className="text-muted-foreground mt-1">Gerencie as coleiras IoT do rebanho</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-primary hover:bg-[#06D001]">
          <Plus className="w-4 h-4 mr-2" /> Cadastrar Coleira
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar coleira..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-lg bg-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Radio} title="Nenhuma coleira encontrada" description="Cadastre coleiras IoT para monitorar seus bubalinos." actionLabel="Cadastrar Coleira" onAction={() => { setEditing(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Etiqueta</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Localização</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">IP</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Bubalino</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Bateria</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{c.numero_etiqueta}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{c.localizacao || '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground hidden md:table-cell">{c.endereco_ip || '—'}</td>
                    <td className="px-4 py-3 text-sm">{c.bubalino_nome || '—'}</td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">
                      {c.bateria != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.bateria}%`,
                                backgroundColor: c.bateria > 50 ? '#06D001' : c.bateria > 20 ? '#FFB703' : '#E63946'
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{c.bateria}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status || 'inativa'} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(c); setModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(c)}>
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

      <ColeiraModal open={modalOpen} onOpenChange={setModalOpen} coleira={editing} bubalinos={bubalinos} onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Excluir Coleira" description={`Tem certeza que deseja excluir a coleira "${deleteTarget?.numero_etiqueta}"?`} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} confirmLabel="Excluir" destructive />
    </div>
  );
}