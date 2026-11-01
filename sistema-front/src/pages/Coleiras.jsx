
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  Search,
  RefreshCw,
  Plus,
  RotateCcw,
  Trash2,
  Unlink,
} from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { useColeiras } from '@/hooks/useColeiras';
import {
  mensagemDeErro,
  normalizarTermo,
  obterIp,
  textoParaBusca,
} from '@/lib/rebanho';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import RowActions from '@/components/shared/RowActions';
import ColeiraModal from '@/components/coleiras/ColeiraModal';

function paraFormulario(c) {
  return {
    id: c._id || c.id,
    numero_etiqueta: c.n_coleira || '',
    localizacao: c.coleira_localizacao || '',
    endereco_ip: obterIp(c),
  };
}

function coleiraEstaVinculada(coleira) {
  return Boolean(
    coleira?.bubalino_id ||
    coleira?.bubalino?._id ||
    coleira?.bubalino?.id ||
    coleira?.bubalino
  );
}

function nomeBubalino(coleira) {
  return (
    coleira?.bubalino?.n_etiqueta ||
    coleira?.bubalino?.nome ||
    'animal vinculado'
  );
}

export default function Coleiras() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('ativas');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aExcluir, setAExcluir] = useState(null);
  const [aExcluirPermanentemente, setAExcluirPermanentemente] =
    useState(null);
  const [aDesvincular, setADesvincular] = useState(null);

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [excluindoPermanentemente, setExcluindoPermanentemente] =
    useState(false);
  const [desvinculando, setDesvinculando] = useState(false);
  const [reativando, setReativando] = useState(null);
  const [erroAoSalvar, setErroAoSalvar] = useState('');

  const queryClient = useQueryClient();

  const {
    usuarioId,
    coleiras = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useColeiras();

  const termo = normalizarTermo(busca);

  const ativas = coleiras.filter((c) => c.ativo !== false);
  const inativas = coleiras.filter((c) => c.ativo === false);

  const coleirasDoFiltro =
    filtroStatus === 'ativas' ? ativas : inativas;

  const filtradas = coleirasDoFiltro.filter((c) => {
    if (!termo) return true;

    const texto = textoParaBusca(
      c.n_coleira,
      obterIp(c),
      c.coleira_localizacao,
      c.bubalino?.n_etiqueta,
      c.bubalino?.nome,
      c.bubalino?.raca
    );

    return texto.includes(termo);
  });

  // Atualiza os dados das coleiras e dos bubalinos.
  const atualizarLista = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['coleiras', usuarioId],
      }),
      queryClient.invalidateQueries({
        queryKey: ['bubalinos', usuarioId],
      }),
    ]);
  };

  const abrirCadastro = () => {
    setErroAoSalvar('');
    setEditando(null);
    setModalAberto(true);
  };

  const abrirEdicao = (coleira) => {
    setErroAoSalvar('');
    setEditando(paraFormulario(coleira));
    setModalAberto(true);
  };

  const handleSave = async (form) => {
    if (!usuarioId) {
      setErroAoSalvar('Não foi possível identificar o usuário.');
      return;
    }

    const dados = {
      n_coleira: form.numero_etiqueta.trim(),
      coleira_localizacao: form.localizacao.trim(),
      IP: form.endereco_ip.trim(),
    };

    setSalvando(true);
    setErroAoSalvar('');

    try {
      if (editando) {
        await api.put(
          ENDPOINTS.coleiras.atualizar(usuarioId, editando.id),
          dados
        );
      } else {
        await api.post(
          ENDPOINTS.coleiras.criar(usuarioId),
          dados
        );
      }

      await atualizarLista();
      setModalAberto(false);

      toast.success(
        editando
          ? 'Coleira atualizada.'
          : 'Coleira cadastrada com sucesso.'
      );
    } catch (err) {
      setErroAoSalvar(
        mensagemDeErro(
          err,
          editando
            ? 'Não foi possível atualizar a coleira.'
            : 'Não foi possível cadastrar a coleira.'
        )
      );
    } finally {
      setSalvando(false);
    }
  };

  // Desativa a coleira, preservando o vínculo com o bubalino.
  const confirmarExclusao = async () => {
    if (!aExcluir || !usuarioId) return;

    setExcluindo(true);

    try {
      await api.delete(
        ENDPOINTS.coleiras.excluir(
          usuarioId,
          aExcluir._id || aExcluir.id
        )
      );

      await atualizarLista();

      toast.success('Coleira desativada com sucesso.');
      setAExcluir(null);
    } catch (err) {
      toast.error(
        mensagemDeErro(err, 'Não foi possível desativar a coleira.')
      );
    } finally {
      setExcluindo(false);
    }
  };

  // Encerra o vínculo sem excluir o cadastro do bubalino.
  const confirmarDesvinculacao = async () => {
    if (!aDesvincular || !usuarioId) return;

    const id = aDesvincular._id || aDesvincular.id;

    setDesvinculando(true);

    try {
      await api.patch(
        ENDPOINTS.coleiras.desvincular(usuarioId, id)
      );

      await atualizarLista();

      toast.success(
        'Bubalino desvinculado. O cadastro do animal foi mantido.'
      );

      setADesvincular(null);
    } catch (err) {
      toast.error(
        mensagemDeErro(err, 'Não foi possível desvincular o bubalino.')
      );
    } finally {
      setDesvinculando(false);
    }
  };

  // Exclui permanentemente somente uma coleira inativa e sem vínculo.
  const confirmarExclusaoPermanente = async () => {
    if (!aExcluirPermanentemente || !usuarioId) return;

    if (aExcluirPermanentemente.ativo !== false) {
      toast.error('Desative a coleira antes de excluí-la permanentemente.');
      return;
    }

    if (coleiraEstaVinculada(aExcluirPermanentemente)) {
      toast.error(
        'Desvincule o bubalino antes de excluir permanentemente a coleira.'
      );
      return;
    }

    setExcluindoPermanentemente(true);

    try {
      await api.delete(
        ENDPOINTS.coleiras.excluirPermanentemente(
          usuarioId,
          aExcluirPermanentemente._id ||
            aExcluirPermanentemente.id
        )
      );

      await atualizarLista();

      toast.success(
        'Coleira excluída permanentemente. O histórico foi preservado.'
      );

      setAExcluirPermanentemente(null);
    } catch (err) {
      toast.error(
        mensagemDeErro(
          err,
          'Não foi possível excluir permanentemente a coleira.'
        )
      );
    } finally {
      setExcluindoPermanentemente(false);
    }
  };

  const reativarColeira = async (coleira) => {
    if (!usuarioId) {
      toast.error('Não foi possível identificar o usuário.');
      return;
    }

    const id = coleira._id || coleira.id;

    setReativando(id);

    try {
      await api.patch(
        ENDPOINTS.coleiras.reativar(usuarioId, id)
      );

      await atualizarLista();

      toast.success('Coleira reativada com sucesso.');
    } catch (err) {
      toast.error(
        mensagemDeErro(err, 'Não foi possível reativar a coleira.')
      );
    } finally {
      setReativando(null);
    }
  };

  const tituloVazio =
    filtroStatus === 'ativas'
      ? 'Nenhuma coleira ativa'
      : 'Nenhuma coleira inativa';

  const acoesAtivas = (coleira) => (
    <div className="flex flex-wrap justify-end gap-2">
      <RowActions
        nome={`coleira ${coleira.n_coleira}`}
        onEdit={() => abrirEdicao(coleira)}
        onDelete={() => setAExcluir(coleira)}
      />

      {coleiraEstaVinculada(coleira) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setADesvincular(coleira)}
        >
          <Unlink />
          Desvincular
        </Button>
      )}
    </div>
  );

  const acoesInativas = (coleira) => (
    <div className="flex flex-wrap justify-end gap-2">
      {coleiraEstaVinculada(coleira) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setADesvincular(coleira)}
        >
          <Unlink />
          Desvincular
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => reativarColeira(coleira)}
        disabled={reativando === (coleira._id || coleira.id)}
      >
        <RotateCcw />
        {reativando === (coleira._id || coleira.id)
          ? 'Reativando...'
          : 'Reativar'}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => setAExcluirPermanentemente(coleira)}
        disabled={coleiraEstaVinculada(coleira)}
        title={
          coleiraEstaVinculada(coleira)
            ? 'Desvincule o bubalino antes de excluir.'
            : 'Excluir permanentemente'
        }
      >
        <Trash2 />
        Excluir
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleiras"
        description="Gerencie as coleiras IoT do rebanho."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={isFetching ? 'animate-spin' : ''}
              />
              Atualizar dados
            </Button>

            <Button onClick={abrirCadastro}>
              <Plus />
              Cadastrar coleira
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filtroStatus === 'ativas' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('ativas')}
        >
          Ativas ({ativas.length})
        </Button>

        <Button
          variant={filtroStatus === 'inativas' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('inativas')}
        >
          Inativas ({inativas.length})
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          type="text"
          inputMode="search"
          aria-label="Buscar coleiras"
          placeholder="Buscar por coleira, IP ou bubalino..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar as coleiras"
          message={mensagemDeErro(
            error,
            'Verifique a API e sua autenticação.'
          )}
          onRetry={() => refetch()}
        />
      ) : !usuarioId ? (
        <ErrorState
          title="Não foi possível identificar o usuário"
          message="Saia da conta e entre novamente."
        />
      ) : filtradas.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={
            coleirasDoFiltro.length === 0
              ? tituloVazio
              : 'Nenhuma coleira encontrada'
          }
          description={
            coleirasDoFiltro.length === 0
              ? filtroStatus === 'ativas'
                ? 'Cadastre uma coleira para começar a monitorar seus animais.'
                : 'As coleiras desativadas aparecerão aqui.'
              : 'Tente alterar o termo da busca.'
          }
          actionLabel={
            filtroStatus === 'ativas' && coleirasDoFiltro.length === 0
              ? 'Cadastrar coleira'
              : undefined
          }
          onAction={abrirCadastro}
        />
      ) : (
        <>
          {/* Tabela para telas médias e grandes */}
          <div className="surface hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      'Tag',
                      'Localização',
                      'IP',
                      'Bubalino',
                      'Situação',
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        scope="col"
                        className="table-head"
                      >
                        {titulo}
                      </th>
                    ))}

                    <th
                      scope="col"
                      className="table-head text-right"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtradas.map((c, indice) => (
                    <tr
                      key={c._id || c.n_coleira || indice}
                      className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5"
                    >
                      <td className="px-4 py-3.5 font-mono text-sm font-bold">
                        {c.n_coleira || '—'}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.coleira_localizacao || '—'}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">
                        {obterIp(c) || '—'}
                      </td>

                      <td className="px-4 py-3.5 text-sm">
                        <div>
                          {c.bubalino?.n_etiqueta || '—'}
                        </div>

                        {c.bubalino?.raca && (
                          <div className="text-xs text-muted-foreground">
                            {c.bubalino.raca}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={c.ativo === false ? 'inativa' : 'ativa'}
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        {c.ativo === false
                          ? acoesInativas(c)
                          : acoesAtivas(c)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartões para celular */}
          <ul className="space-y-3 md:hidden">
            {filtradas.map((c, indice) => (
              <li
                key={c._id || c.n_coleira || indice}
                className="surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono text-base font-bold">
                    {c.n_coleira || '—'}
                  </div>

                  <StatusBadge
                    status={c.ativo === false ? 'inativa' : 'ativa'}
                  />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Localização
                    </dt>
                    <dd>{c.coleira_localizacao || '—'}</dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Bubalino
                    </dt>
                    <dd>
                      {c.bubalino?.n_etiqueta || '—'}
                    </dd>
                  </div>

                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">
                      IP
                    </dt>
                    <dd className="font-mono">
                      {obterIp(c) || '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-2 border-t border-border pt-2">
                  {c.ativo === false
                    ? (
                      <div className="flex flex-col gap-2">
                        {acoesInativas(c)}
                      </div>
                    )
                    : (
                      <div className="flex flex-col gap-2">
                        {acoesAtivas(c)}
                      </div>
                    )}
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Exibindo {filtradas.length} de {coleirasDoFiltro.length}{' '}
            coleira(s) {filtroStatus}.
          </p>
        </>
      )}

      <ColeiraModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        coleira={editando}
        onSave={handleSave}
        saving={salvando}
        erro={erroAoSalvar}
      />

      <ConfirmDialog
        open={!!aExcluir}
        onOpenChange={(aberto) => !aberto && setAExcluir(null)}
        title="Desativar coleira?"
        description={
          `A coleira ${aExcluir?.n_coleira} será desativada, mas o vínculo com ${nomeBubalino(aExcluir)} será mantido. O cadastro do bubalino não será excluído.`
        }
        confirmLabel={excluindo ? 'Desativando...' : 'Desativar'}
        destructive
        onConfirm={confirmarExclusao}
      />

      <ConfirmDialog
        open={!!aDesvincular}
        onOpenChange={(aberto) =>
          !aberto && setADesvincular(null)
        }
        title="Desvincular bubalino?"
        description={
          `O vínculo entre a coleira ${aDesvincular?.n_coleira} e ${nomeBubalino(aDesvincular)} será encerrado e registrado no histórico. O cadastro do animal será mantido.`
        }
        confirmLabel={
          desvinculando ? 'Desvinculando...' : 'Desvincular'
        }
        onConfirm={confirmarDesvinculacao}
      />

      <ConfirmDialog
        open={!!aExcluirPermanentemente}
        onOpenChange={(aberto) =>
          !aberto && setAExcluirPermanentemente(null)
        }
        title="Excluir coleira permanentemente?"
        description={
          `A coleira ${aExcluirPermanentemente?.n_coleira} será removida da lista operacional. Seu cadastro e histórico serão arquivados. Essa ação não poderá ser desfeita.`
        }
        confirmLabel={
          excluindoPermanentemente
            ? 'Excluindo...'
            : 'Excluir permanentemente'
        }
        destructive
        onConfirm={confirmarExclusaoPermanente}
      />
    </div>
  );
}
