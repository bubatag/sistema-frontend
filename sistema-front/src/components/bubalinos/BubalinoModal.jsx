import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formularioInicial = { raca: '', n_etiqueta: '', dt_nasc: '', sexo: '', coleira_id: '' };

function formularioDe(bubalino) {
  if (!bubalino) return formularioInicial;

  const sexo =
    bubalino.sexo === 'Masculino' ? 'Macho' : bubalino.sexo === 'Feminino' ? 'Fêmea' : bubalino.sexo || '';

  return {
    raca: bubalino.raca || '',
    n_etiqueta: bubalino.n_etiqueta || bubalino.numero_etiqueta || '',
    dt_nasc: bubalino.dt_nasc ? String(bubalino.dt_nasc).slice(0, 10) : '',
    sexo,
    coleira_id: bubalino.coleira_id || '',
  };
}

function BubalinoForm({ bubalino, coleiras, onSave, onCancel, saving, erro }) {
  const [form, setForm] = useState(() => formularioDe(bubalino));


  const atualizar = (campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }));

  const podeSalvar =
    form.raca.trim() !== '' &&
    form.n_etiqueta.trim() !== '' &&
    form.dt_nasc !== '' &&
    form.sexo !== '' &&
    !!form.coleira_id &&
    !saving;

  const enviar = (event) => {
    event.preventDefault();
    if (!podeSalvar) return;

    onSave({
      raca: form.raca.trim(),
      n_etiqueta: form.n_etiqueta.trim(),
      dt_nasc: form.dt_nasc,
      sexo: form.sexo,
      ativo: true,
      coleira_id: form.coleira_id,
    });
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="raca">Raça</Label>
          <Input id="raca" placeholder="Ex.: Murrah" value={form.raca} onChange={(e) => atualizar('raca', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="n_etiqueta">Número da etiqueta</Label>
          <Input id="n_etiqueta" placeholder="Ex.: BUB-003" value={form.n_etiqueta} onChange={(e) => atualizar('n_etiqueta', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dt_nasc">Data de nascimento</Label>
          <Input id="dt_nasc" type="date" value={form.dt_nasc} onChange={(e) => atualizar('dt_nasc', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Sexo</Label>
          <RadioGroup
            className="flex h-11 items-center gap-5 rounded-lg border border-input bg-background/60 px-3.5"
            value={form.sexo}
            onValueChange={(sexo) => atualizar('sexo', sexo)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id="sexo-macho" value="Macho" />
              <Label htmlFor="sexo-macho" className="font-normal">Macho</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="sexo-femea" value="Fêmea" />
              <Label htmlFor="sexo-femea" className="font-normal">Fêmea</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coleira_id">Coleira disponível</Label>
        <NativeSelect id="coleira_id" value={form.coleira_id} onChange={(e) => atualizar('coleira_id', e.target.value)} required>
          <option value="">Selecione uma coleira</option>
          {coleiras.map((coleira) => {
            const id = coleira._id || coleira.id;
            return (
              <option key={id} value={id}>
                {coleira.n_coleira || coleira.numero_etiqueta || id}
              </option>
            );
          })}
        </NativeSelect>

        {coleiras.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Não há coleiras disponíveis. Cadastre uma coleira antes de cadastrar o bubalino.
          </p>
        )}
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
          {saving ? 'Salvando...' : 'Salvar bubalino'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function BubalinoModal({ open, onOpenChange, bubalino, coleiras = [], onSave, saving, erro }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bubalino ? 'Editar bubalino' : 'Cadastrar bubalino'}</DialogTitle>
          <DialogDescription>Todos os campos são obrigatórios.</DialogDescription>
        </DialogHeader>

        <BubalinoForm
          bubalino={bubalino}
          coleiras={coleiras}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          erro={erro}
        />
      </DialogContent>
    </Dialog>
  );
}