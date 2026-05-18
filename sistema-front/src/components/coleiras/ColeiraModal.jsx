import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusOptions = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
];

export default function ColeiraModal({ open, onOpenChange, coleira, bubalinos, onSave, saving }) {
  const [form, setForm] = useState({
    numero_etiqueta: '',
    localizacao: '',
    endereco_ip: '',
    bateria: '',
    status: 'ativa',
    bubalino_id: '',
    bubalino_nome: '',
  });

  useEffect(() => {
    if (coleira) {
      setForm({
        numero_etiqueta: coleira.numero_etiqueta || '',
        localizacao: coleira.localizacao || '',
        endereco_ip: coleira.endereco_ip || '',
        bateria: coleira.bateria ?? '',
        status: coleira.status || 'ativa',
        bubalino_id: coleira.bubalino_id || '',
        bubalino_nome: coleira.bubalino_nome || '',
      });
    } else {
      setForm({ numero_etiqueta: '', localizacao: '', endereco_ip: '', bateria: '', status: 'ativa', bubalino_id: '', bubalino_nome: '' });
    }
  }, [coleira, open]);

  if (!open) return null;

  const handleBubalinoChange = (id) => {
    const target = bubalinos.find((b) => b.id === id);
    setForm({ ...form, bubalino_id: id, bubalino_nome: target ? target.nome : '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="text-lg font-semibold">{coleira ? 'Editar Coleira' : 'Cadastrar Coleira'}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Etiqueta" value={form.numero_etiqueta} onChange={(e) => setForm({ ...form, numero_etiqueta: e.target.value })} />
          <Input placeholder="Localizacao" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
          <Input placeholder="Endereco IP" value={form.endereco_ip} onChange={(e) => setForm({ ...form, endereco_ip: e.target.value })} />
          <Input placeholder="Bateria (%)" value={form.bateria} onChange={(e) => setForm({ ...form, bateria: e.target.value })} />
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.bubalino_id || 'none'}
            onChange={(e) => handleBubalinoChange(e.target.value === 'none' ? '' : e.target.value)}
          >
            <option value="none">Sem bubalino</option>
            {bubalinos.map((b) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving} onClick={() => onSave(form)}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </div>
  );
}
