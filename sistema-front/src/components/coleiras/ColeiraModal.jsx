import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const initialForm = {
  numero_etiqueta: '',
  localizacao: '',
  endereco_ip: '',
  status: 'ativa',
};

function formularioDe(coleira) {
  if (!coleira) return { ...initialForm };
  return {
    numero_etiqueta: coleira.numero_etiqueta || '',
    localizacao: coleira.localizacao || '',
    endereco_ip: coleira.endereco_ip || '',
    status: coleira.status || 'ativa',
  };
}

function ColeiraForm({ coleira, onSave, onCancel, saving, erro }) {
  const [form, setForm] = useState(() => formularioDe(coleira));

  const alterar = (campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }));

  const podeSalvar = form.numero_etiqueta.trim() !== '' && !saving;

  const enviar = (event) => {
    event.preventDefault();
    if (!podeSalvar) return;

    onSave({
      ...form,
      numero_etiqueta: form.numero_etiqueta.trim(),
      localizacao: form.localizacao.trim(),
      endereco_ip: form.endereco_ip.trim(),
    });
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="coleira-tag">Identificação da tag</Label>
        <Input
          id="coleira-tag"
          placeholder="Ex.: COL-001"
          value={form.numero_etiqueta}
          onChange={(e) => alterar('numero_etiqueta', e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coleira-local">Localização</Label>
          <Input
            id="coleira-local"
            placeholder="Ex.: Pasto norte"
            value={form.localizacao}
            onChange={(e) => alterar('localizacao', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coleira-ip">Endereço IP (opcional)</Label>
          <Input
            id="coleira-ip"
            placeholder="192.168.0.10"
            value={form.endereco_ip}
            onChange={(e) => alterar('endereco_ip', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coleira-status">Situação</Label>
        <NativeSelect
          id="coleira-status"
          value={form.status}
          onChange={(e) => alterar('status', e.target.value)}
        >
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
        </NativeSelect>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      <DialogFooter className="gap-2 pt-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!podeSalvar}>
          {saving ? 'Salvando...' : 'Salvar coleira'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ColeiraModal({ open, onOpenChange, coleira, onSave, saving, erro }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coleira ? 'Editar coleira' : 'Cadastrar coleira'}</DialogTitle>
          <DialogDescription>
            Cadastre a coleira agora. A associação com um bubalino é feita depois.
          </DialogDescription>
        </DialogHeader>

        <ColeiraForm
          coleira={coleira}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          erro={erro}
        />
      </DialogContent>
    </Dialog>
  );
}