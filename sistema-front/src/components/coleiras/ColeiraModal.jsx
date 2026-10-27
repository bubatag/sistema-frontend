
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusOptions = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
];

const initialForm = {
  numero_etiqueta: '',
  localizacao: '',
  endereco_ip: '',
  bateria: '',
  status: 'ativa',
};

export default function ColeiraModal({
  open,
  onOpenChange,
  coleira,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (coleira) {
      setForm({
        numero_etiqueta: coleira.numero_etiqueta || '',
        localizacao: coleira.localizacao || '',
        endereco_ip: coleira.endereco_ip || '',
        bateria: coleira.bateria ?? '',
        status: coleira.status || 'ativa',
      });
    } else {
      setForm({ ...initialForm });
    }
  }, [coleira, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      ...form,
      numero_etiqueta: form.numero_etiqueta.trim(),
      localizacao: form.localizacao.trim(),
      endereco_ip: form.endereco_ip.trim(),
      bateria:
        form.bateria === '' ? '' : Number(form.bateria),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="text-lg font-semibold">
          {coleira ? 'Editar Coleira' : 'Cadastrar Coleira'}
        </div>

        <p className="text-sm text-muted-foreground">
          Cadastre a coleira agora. A associação com um búfalo será feita
          posteriormente.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            placeholder="Identificação da tag"
            value={form.numero_etiqueta}
            onChange={(e) =>
              handleChange('numero_etiqueta', e.target.value)
            }
            required
          />

          <Input
            placeholder="Localização"
            value={form.localizacao}
            onChange={(e) =>
              handleChange('localizacao', e.target.value)
            }
          />

          <Input
            placeholder="Endereço IP (opcional)"
            value={form.endereco_ip}
            onChange={(e) =>
              handleChange('endereco_ip', e.target.value)
            }
          />

          <Input
            type="number"
            placeholder="Bateria (%)"
            min="0"
            max="100"
            value={form.bateria}
            onChange={(e) =>
              handleChange('bateria', e.target.value)
            }
          />

          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) =>
              handleChange('status', e.target.value)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            disabled={saving || !form.numero_etiqueta.trim()}
            onClick={handleSave}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
