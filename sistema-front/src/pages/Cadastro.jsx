import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import AuthShell from '@/components/auth/AuthShell';
import Campo from '@/components/auth/Campo';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ccir, setCcir] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setSucesso('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      await api.post('/api/usuarios', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        CCIR: ccir.trim(),
        senha,
      });

      setSucesso('Cadastro realizado! Redirecionando para o login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (error) {
      setErro(
        error.response?.data?.mensagem ||
          error.response?.data?.erro ||
          'Não foi possível realizar o cadastro. Verifique se a API está funcionando.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre-se para monitorar seu rebanho no Bubatag."
      footer={
        <>
          Já possui uma conta?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Campo
          id="nome"
          label="Nome completo"
          autoComplete="name"
          required
          maxLength={120}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Seu nome completo"
        />

        <Campo
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu@email.com"
        />

        <Campo
          id="ccir"
          label="CCIR"
          required
          value={ccir}
          onChange={(event) => setCcir(event.target.value)}
          placeholder="Número do CCIR"
          ajuda="Certificado de Cadastro de Imóvel Rural da sua propriedade."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="senha"
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
          />

          <Campo
            id="confirmarSenha"
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmarSenha}
            onChange={(event) => setConfirmarSenha(event.target.value)}
            placeholder="Repita a senha"
          />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        )}

        {sucesso && (
          <p role="status" className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
            {sucesso}
          </p>
        )}

        <Button type="submit" size="lg" disabled={carregando} className="w-full">
          {carregando ? 'Cadastrando...' : 'Criar conta'}
        </Button>
      </form>
    </AuthShell>
  );
}