import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [fazenda, setFazenda] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFazenda(u.fazenda || '');
      setTelefone(u.telefone || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ fazenda, telefone });
    toast.success('Perfil atualizado!');
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{user.full_name || 'Usuário'}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" /> Nome
              </Label>
              <Input value={user.full_name || ''} disabled className="bg-muted border-border opacity-60" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input value={user.email || ''} disabled className="bg-muted border-border opacity-60" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" /> Função
              </Label>
              <Input value={user.role || 'user'} disabled className="bg-muted border-border opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="bg-muted border-border" />
            </div>
            <div className="space-y-2 col-span-full">
              <Label>Nome da Fazenda</Label>
              <Input value={fazenda} onChange={e => setFazenda(e.target.value)} placeholder="Ex: Fazenda Boa Vista" className="bg-muted border-border" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-[#06D001]">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}