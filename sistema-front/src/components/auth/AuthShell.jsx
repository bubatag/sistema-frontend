import { Radio, MapPin, HeartPulse } from 'lucide-react';
import Logo from '@/components/brand/Logo';

const destaques = [
  { icon: Radio, texto: 'Coleiras IoT conectadas ao rebanho' },
  { icon: HeartPulse, texto: 'Temperatura e batimentos em tempo real' },
  { icon: MapPin, texto: 'Localização de cada animal no mapa' },
];

// Estrutura compartilhada das telas de Login e Cadastro.
export default function AuthShell({ title, description, children, footer }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-[hsl(var(--sidebar))] p-12 lg:flex">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #05D900 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <Logo size={48} subtitle="Monitoramento inteligente" />

        <div className="relative max-w-md space-y-8">
          <h2 className="text-5xl font-semibold leading-[1.1]">
            Cada animal do rebanho, <span className="text-gradient">sempre à vista.</span>
          </h2>

          <ul className="space-y-4">
            {destaques.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-muted-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Bubatag</p>
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <Logo size={44} subtitle="Monitoramento inteligente" className="mb-8 lg:hidden" />

          <div className="mb-8">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          {children}

          {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </section>
    </main>
  );
}