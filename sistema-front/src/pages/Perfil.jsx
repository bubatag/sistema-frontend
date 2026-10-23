
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  User,
  Mail,
  Shield,
  Building2,
  FileText,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Perfil() {
  const { user } = useAuth();

  const usuario = (() => {
    try {
      return user || JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  })();

  const [editando, setEditando] = useState(false);
  const [telefone, setTelefone] = useState(usuario?.telefone || '');
  const [fazenda, setFazenda] = useState(usuario?.fazenda || '');
  const [saving, setSaving] = useState(false);

  if (!usuario) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6">
        Não foi possível carregar o perfil. Entre novamente no sistema.
      </div>
    );
  }

  const nome = usuario.nome || 'Usuário';
  const email = usuario.email || '';
  const ccir = usuario.CCIR || usuario.ccir || '';

  const cancelarEdicao = () => {
    setTelefone(usuario.telefone || '');
    setFazenda(usuario.fazenda || '');
    setEditando(false);
  };

  const salvarPerfil = async () => {
    setSaving(true);

    try {
      // A API atual ainda não possui uma rota de atualização confirmada
      // para telefone e fazenda. Não simular um salvamento no servidor.
      toast.error(
        'A edição está disponível na tela, mas a API ainda precisa de uma rota para salvar esses campos.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Perfil
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {nome.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <CardTitle className="text-xl">{nome}</CardTitle>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            {!editando ? (
              <Button
                variant="outline"
                onClick={() => setEditando(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar perfil
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={cancelarEdicao}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Nome
              </Label>
              <Input
                value={nome}
                disabled
                className="border-border bg-muted opacity-80"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                value={email}
                disabled
                className="border-border bg-muted opacity-80"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                Identificador CCIR
              </Label>
              <Input
                value={ccir}
                disabled
                placeholder="Não informado"
                className="border-border bg-muted opacity-80"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={!editando}
                placeholder="(XX) XXXXX-XXXX"
                className="border-border bg-muted"
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Nome da fazenda
              </Label>
              <Input
                value={fazenda}
                onChange={(e) => setFazenda(e.target.value)}
                disabled={!editando}
                placeholder="Ex.: Fazenda Boa Vista"
                className="border-border bg-muted"
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Situação da conta
              </Label>
              <Input
                value={usuario.ativo === false ? 'Inativa' : 'Ativa'}
                disabled
                className="border-border bg-muted opacity-80"
              />
            </div>
          </div>

          {editando && (
            <>
              <p className="text-sm text-muted-foreground">
                Você pode alterar os campos nesta tela. Para persistir as
                alterações, precisamos implementar a rota de atualização
                correspondente na API.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={cancelarEdicao}
                  disabled={saving}
                >
                  Cancelar
                </Button>

                <Button
                  onClick={salvarPerfil}
                  disabled={saving}
                  className="bg-primary hover:bg-[#06D001]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
