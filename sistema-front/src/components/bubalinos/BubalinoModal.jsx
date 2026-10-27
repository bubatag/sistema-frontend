
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function BubalinoModal({
  open,
  onOpenChange,
  bubalino,
  coleiras = [],
  onSave,
  saving
}) {
  const formularioInicial = {
    raca: '',
    n_etiqueta: '',
    dt_nasc: '',
    sexo: '',
    coleira_id: ''
  };

  const [form, setForm] = useState(formularioInicial);

  useEffect(() => {
    if (bubalino) {
      const sexoNormalizado =
        bubalino.sexo === 'Masculino'
          ? 'Macho'
          : bubalino.sexo === 'Feminino'
            ? 'Fêmea'
            : bubalino.sexo || '';

      setForm({
        raca: bubalino.raca || '',
        n_etiqueta:
          bubalino.n_etiqueta || bubalino.numero_etiqueta || '',
        dt_nasc: bubalino.dt_nasc
          ? String(bubalino.dt_nasc).slice(0, 10)
          : '',
        sexo: sexoNormalizado,
        coleira_id: bubalino.coleira_id || ''
      });
    } else {
      setForm(formularioInicial);
    }
  }, [bubalino, open]);

  if (!open) return null;

  const atualizarCampo = (campo, valor) => {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  const canSave =
    form.raca.trim() !== '' &&
    form.n_etiqueta.trim() !== '' &&
    form.dt_nasc !== '' &&
    form.sexo !== '' &&
    !!form.coleira_id &&
    !saving;

  const handleSave = () => {
    if (!canSave) return;

    onSave({
      raca: form.raca.trim(),
      n_etiqueta: form.n_etiqueta.trim(),
      dt_nasc: form.dt_nasc,
      sexo: form.sexo,
      ativo: true,
      coleira_id: form.coleira_id
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="text-lg font-semibold">
          {bubalino ? 'Editar Bubalino' : 'Cadastrar Bubalino'}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="raca">Raça</Label>
            <Input
              id="raca"
              placeholder="Ex.: Murrah"
              value={form.raca}
              onChange={(e) =>
                atualizarCampo('raca', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="n_etiqueta">
              Número da etiqueta
            </Label>
            <Input
              id="n_etiqueta"
              placeholder="Ex.: BUB-003"
              value={form.n_etiqueta}
              onChange={(e) =>
                atualizarCampo('n_etiqueta', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dt_nasc">
              Data de nascimento
            </Label>
            <Input
              id="dt_nasc"
              type="date"
              value={form.dt_nasc}
              onChange={(e) =>
                atualizarCampo('dt_nasc', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Sexo</Label>

            <RadioGroup
              className="flex items-center gap-4 rounded-lg border border-border px-3 py-2"
              value={form.sexo}
              onValueChange={(sexo) =>
                atualizarCampo('sexo', sexo)
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="sexo-macho"
                  value="Macho"
                />
                <Label
                  htmlFor="sexo-macho"
                  className="text-sm font-normal"
                >
                  Macho
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="sexo-femea"
                  value="Fêmea"
                />
                <Label
                  htmlFor="sexo-femea"
                  className="text-sm font-normal"
                >
                  Fêmea
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="coleira_id">
              Coleira disponível
            </Label>

            <select
              id="coleira_id"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.coleira_id}
              onChange={(e) =>
                atualizarCampo('coleira_id', e.target.value)
              }
              required
            >
              <option value="">
                Selecione uma coleira
              </option>

              {coleiras.map((coleira) => {
                const id = coleira._id || coleira.id;

                return (
                  <option key={id} value={id}>
                    {coleira.n_coleira ||
                      coleira.numero_etiqueta ||
                      id}
                  </option>
                );
              })}
            </select>

            {coleiras.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Não há coleiras disponíveis. Cadastre uma coleira
                antes de cadastrar o búfalo.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
