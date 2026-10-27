
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { UserPlus } from 'lucide-react';

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
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus size={28} />
          </div>

          <h1 className="text-2xl font-bold">Criar conta</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre-se para acessar o Bubatag.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome completo
            </label>

            <input
              id="nome"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ccir" className="text-sm font-medium">
              CCIR
            </label>

            <input
              id="ccir"
              type="text"
              required
              value={ccir}
              onChange={(event) => setCcir(event.target.value)}
              placeholder="Número do CCIR"
              className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>

            <input
              id="senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmarSenha" className="text-sm font-medium">
              Confirmar senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              placeholder="Digite a senha novamente"
              className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {erro}
            </p>
          )}

          {sucesso && (
            <p
              role="status"
              className="rounded-lg bg-green-100 p-3 text-sm text-green-800"
            >
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já possui uma conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
