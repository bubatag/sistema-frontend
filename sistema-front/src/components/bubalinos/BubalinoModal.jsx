import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusOptions = [
  { value: 'saudavel', label: 'Saudavel' },
  { value: 'estressado', label: 'Estressado' },
  { value: 'fora_do_pasto', label: 'Fora do pasto' },
  { value: 'sem_conexao', label: 'Sem conexao' },
];

export default function BubalinoModal({ open, onOpenChange, bubalino, coleiras, onSave, saving }) {
  const [form, setForm] = useState({
    nome: '',
    numero_etiqueta: '',
    status: 'saudavel',
    coleira_id: '',
    idade: '',
    sexo: '',
  });

  useEffect(() => {
    if (bubalino) {
      setForm({
        nome: bubalino.nome || '',
        numero_etiqueta: bubalino.numero_etiqueta || '',
        status: bubalino.status || 'saudavel',
        coleira_id: bubalino.coleira_id || '',
        idade: bubalino.idade || '',
        sexo: bubalino.sexo || '',
      });
    } else {
      setForm({ nome: '', numero_etiqueta: '', status: 'saudavel', coleira_id: '', idade: '', sexo: '' });
    }
  }, [bubalino, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="text-lg font-semibold">{bubalino ? 'Editar Bubalino' : 'Cadastrar Bubalino'}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input placeholder="Etiqueta" value={form.numero_etiqueta} onChange={(e) => setForm({ ...form, numero_etiqueta: e.target.value })} />
          <Input placeholder="Idade" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
          <Input placeholder="Sexo" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} />
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
            value={form.coleira_id || 'none'}
            onChange={(e) => setForm({ ...form, coleira_id: e.target.value === 'none' ? '' : e.target.value })}
          >
            <option value="none">Sem coleira</option>
            {coleiras.map((c) => (
              <option key={c.id} value={c.id}>{c.numero_etiqueta}</option>
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
