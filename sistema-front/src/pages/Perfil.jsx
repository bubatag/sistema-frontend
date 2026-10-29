import { useState } from 'react';
import { User, Mail, Shield, Building2, Phone, Pencil, Save, X, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useUsuario } from '@/hooks/useUsuario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import ErrorState from '@/components/shared/ErrorState';

function Campo({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function Perfil() {
  const { usuario } = useUsuario();

  const [editando, setEditando] = useState(false);
  const [telefone, setTelefone] = useState(usuario?.telefone || '');
  const [fazenda, setFazenda] = useState(usuario?.fazenda || '');
  const [salvando, setSalvando] = useState(false);

  if (!usuario) {
    return (
      <ErrorState title="Não foi possível carregar o perfil" message="Saia da conta e entre novamente." />
    );
  }

  const nome = usuario.nome || 'Usuário';
  const email = usuario.email || '';
  const ccir = usuario.CCIR || usuario.ccir || '';
  const contaAtiva = usuario.ativo !== false;

  const cancelarEdicao = () => {
    setTelefone(usuario.telefone || '');
    setFazenda(usuario.fazenda || '');
    setEditando(false);
  };

  const salvarPerfil = async () => {
    setSalvando(true);

    try {
      // A API ainda não possui rota de atualização para telefone e fazenda.
      // Não simulamos um salvamento no servidor.
      toast.error('Ainda não é possível salvar: a API precisa de uma rota de atualização do perfil.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Perfil" description="Suas informações pessoais e da propriedade." />

      <section className="surface overflow-hidden">
        <div className="relative border-b border-border p-6">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #05D900 0%, transparent 65%)' }}
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient font-display text-3xl font-semibold text-white shadow-glow">
                {nome.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-2xl font-semibold">{nome}</h2>
                <p className="truncate text-sm text-muted-foreground">{email}</p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold ${
                    contaAtiva ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Conta {contaAtiva ? 'ativa' : 'inativa'}
                </span>
              </div>
            </div>

            {!editando ? (
              <Button variant="outline" onClick={() => setEditando(true)}>
                <Pencil />
                Editar perfil
              </Button>
            ) : (
              <Button variant="ghost" onClick={cancelarEdicao}>
                <X />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo icon={User} label="Nome">
              <Input value={nome} disabled readOnly />
            </Campo>

            <Campo icon={Mail} label="E-mail">
              <Input value={email} disabled readOnly />
            </Campo>

            <Campo icon={Shield} label="CCIR">
              <Input value={ccir} disabled readOnly placeholder="Não informado" />
            </Campo>

            <Campo icon={Phone} label="Telefone">
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={!editando}
                placeholder="(00) 00000-0000"
                inputMode="tel"
              />
            </Campo>

            <div className="sm:col-span-2">
              <Campo icon={Building2} label="Nome da fazenda">
                <Input
                  value={fazenda}
                  onChange={(e) => setFazenda(e.target.value)}
                  disabled={!editando}
                  placeholder="Ex.: Fazenda Boa Vista"
                />
              </Campo>
            </div>
          </div>

          {editando && (
            <div className="space-y-4 border-t border-border pt-5">
              <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                Você pode editar os campos nesta tela, mas para salvar é preciso criar a rota de
                atualização correspondente na API.
              </p>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelarEdicao} disabled={salvando}>
                  Cancelar
                </Button>
                <Button onClick={salvarPerfil} disabled={salvando}>
                  <Save />
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}