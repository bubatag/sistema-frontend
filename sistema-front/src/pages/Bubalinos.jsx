import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Beef, Thermometer, HeartPulse, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { useColeiras } from '@/hooks/useColeiras';
import { formatarSexo, mensagemDeErro, normalizarTermo, textoParaBusca } from '@/lib/rebanho';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import RowActions from '@/components/shared/RowActions';
import BubalinoModal from '@/components/bubalinos/BubalinoModal';

const filtros = [
  { valor: 'all', rotulo: 'Todos' },
  { valor: 'saudavel', rotulo: 'Saudáveis' },
  { valor: 'estressado', rotulo: 'Estressados' },
  { valor: 'outros', rotulo: 'Sem leitura' },
];

const colunas = ['Etiqueta', 'Raça', 'Idade', 'Sexo', 'Coleira', 'Temperatura', 'Batimentos', 'Estresse'];

function combinaFiltro(animal, filtro) {
  if (filtro === 'all') return true;
  if (filtro === 'outros') return animal.status !== 'saudavel' && animal.status !== 'estressado';
  return animal.status === filtro;
}

function Leitura({ icon: Icon, cor, valor, unidade }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={cn('h-4 w-4', cor)} />
      {valor == null ? '—' : `${valor} ${unidade}`}
    </span>
  );
}

export default function Bubalinos() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('all');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aExcluir, setAExcluir] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroAoSalvar, setErroAoSalvar] = useState('');

  const queryClient = useQueryClient();
  const { usuarioId, coleiras, bubalinos, isLoading, isError, error, refetch, isFetching } = useColeiras();

  // Coleiras livres (sem animal). Ao editar, inclui também a coleira atual do animal.
  const coleirasDisponiveis = useMemo(
    () =>
      coleiras.filter(
        (c) => c.ativo !== false && (!c.bubalino || (editando && (c._id || c.id) === editando.coleira_id))
      ),
    [coleiras, editando]
  );

  const atualizarLista = () => queryClient.invalidateQueries({ queryKey: ['coleiras', usuarioId] });

  const abrirCadastro = () => {
    setErroAoSalvar('');
    setEditando(null);
    setModalAberto(true);
  };

  const abrirEdicao = (animal) => {
    setErroAoSalvar('');
    setEditando(animal);
    setModalAberto(true);
  };

  const handleSave = async (dados) => {
    setSalvando(true);
    setErroAoSalvar('');

    try {
      if (editando) {
        await api.put(ENDPOINTS.bubalinos.atualizar(editando.id), dados);
      } else {
        await api.post(ENDPOINTS.bubalinos.criar(), dados);
      }

      await atualizarLista();
      setModalAberto(false);
      toast.success(editando ? 'Bubalino atualizado.' : 'Bubalino cadastrado com sucesso.');
    } catch (err) {
      setErroAoSalvar(
        mensagemDeErro(err, editando ? 'Não foi possível atualizar o bubalino.' : 'Não foi possível cadastrar o bubalino.')
      );
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!aExcluir) return;
    setExcluindo(true);

    try {
      await api.delete(ENDPOINTS.bubalinos.excluir(aExcluir.id));
      await atualizarLista();
      toast.success('Bubalino excluído.');
      setAExcluir(null);
    } catch (err) {
      toast.error(mensagemDeErro(err, 'Não foi possível excluir o bubalino.'));
    } finally {
      setExcluindo(false);
    }
  };

  const contagem = useMemo(
    () => Object.fromEntries(filtros.map((f) => [f.valor, bubalinos.filter((a) => combinaFiltro(a, f.valor)).length])),
    [bubalinos]
  );

  const filtrados = useMemo(() => {
    const termo = normalizarTermo(busca);

    return bubalinos.filter((animal) => {
      const combinaBusca =
        !termo ||
        textoParaBusca(
          animal.nome,
          animal.numero_etiqueta,
          animal.raca,
          animal.coleira_nome,
          animal.coleira_ip,
          animal.coleira_localizacao
        ).includes(termo);

      return combinaBusca && combinaFiltro(animal, filtro);
    });
  }, [bubalinos, busca, filtro]);

  if (!usuarioId) {
    return (
      <ErrorState
        title="Não foi possível identificar o usuário"
        message="Saia da conta e entre novamente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bubalinos"
        description="Animais monitorados pelas coleiras da sua propriedade."
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={isFetching ? 'animate-spin' : ''} />
              Atualizar dados
            </Button>
            <Button onClick={abrirCadastro}>
              <Plus />
              Cadastrar bubalino
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            inputMode="search"
            aria-label="Buscar bubalinos"
            placeholder="Buscar por etiqueta, raça, coleira ou IP..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
          {filtros.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={filtro === f.valor}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors',
                filtro === f.valor
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {f.rotulo} <span className="ml-1 opacity-70">{contagem[f.valor]}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar os bubalinos"
          message={mensagemDeErro(error, 'Verifique se a API está ligada e se o login continua válido.')}
          onRetry={() => refetch()}
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Beef}
          title="Nenhum bubalino encontrado"
          description={
            bubalinos.length === 0
              ? 'Não há bubalinos ativos associados às coleiras da sua conta.'
              : 'Nenhum animal corresponde à busca ou ao filtro selecionado.'
          }
          actionLabel={bubalinos.length === 0 ? 'Cadastrar bubalino' : undefined}
          onAction={abrirCadastro}
        />
      ) : (
        <>
          {/* Tabela (telas médias e grandes) */}
          <div className="surface hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {colunas.map((titulo) => (
                      <th key={titulo} scope="col" className="table-head">
                        {titulo}
                      </th>
                    ))}
                    <th scope="col" className="table-head text-right">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((animal) => (
                    <tr key={animal.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5">
                      <td className="px-4 py-3.5">
                        <div className="font-display text-base font-semibold">{animal.numero_etiqueta}</div>
                        <div className="text-xs text-muted-foreground">{animal.nome}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{animal.raca || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">{animal.idade}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{formatarSexo(animal.sexo)}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        <div className="font-mono">{animal.coleira_nome}</div>
                        <div className="text-xs">{animal.coleira_localizacao}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                        <Leitura icon={Thermometer} cor="text-warning" valor={animal.temperatura} unidade="°C" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                        <Leitura icon={HeartPulse} cor="text-danger" valor={animal.batimentos} unidade="bpm" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <StatusBadge status={animal.status} />
                          <div className="text-xs text-muted-foreground">{animal.estado_estresse}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <RowActions
                          nome={`bubalino ${animal.numero_etiqueta}`}
                          onEdit={() => abrirEdicao(animal)}
                          onDelete={() => setAExcluir(animal)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartões (celular) */}
          <ul className="space-y-3 md:hidden">
            {filtrados.map((animal) => (
              <li key={animal.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-semibold">{animal.numero_etiqueta}</div>
                    <div className="text-xs text-muted-foreground">
                      {[animal.raca, animal.idade, formatarSexo(animal.sexo)].filter((v) => v && v !== '—').join(' · ')}
                    </div>
                  </div>
                  <StatusBadge status={animal.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <Leitura icon={Thermometer} cor="text-warning" valor={animal.temperatura} unidade="°C" />
                  <Leitura icon={HeartPulse} cor="text-danger" valor={animal.batimentos} unidade="bpm" />
                  <span className="font-mono text-xs text-muted-foreground">Coleira {animal.coleira_nome}</span>
                </div>

                <div className="mt-2 border-t border-border pt-2">
                  <RowActions
                    nome={`bubalino ${animal.numero_etiqueta}`}
                    onEdit={() => abrirEdicao(animal)}
                    onDelete={() => setAExcluir(animal)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Exibindo {filtrados.length} de {bubalinos.length} bubalino(s).
            {isFetching ? ' Atualizando dados...' : ''}
          </p>
        </>
      )}

      <BubalinoModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        bubalino={editando}
        coleiras={coleirasDisponiveis}
        onSave={handleSave}
        saving={salvando}
        erro={erroAoSalvar}
      />

      <ConfirmDialog
        open={!!aExcluir}
        onOpenChange={(aberto) => !aberto && setAExcluir(null)}
        title="Excluir bubalino?"
        description={`O bubalino ${aExcluir?.numero_etiqueta ?? ''} será removido. Esta ação não pode ser desfeita.`}
        confirmLabel={excluindo ? 'Excluindo...' : 'Excluir'}
        destructive
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}