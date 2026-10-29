// Regras de negócio compartilhadas entre as páginas (status, datas, coordenadas).

export const STATUS = {
  saudavel: { label: 'Saudável', color: '#05D900' },
  estressado: { label: 'Estressado', color: '#FF4D5A' },
  sem_classificacao: { label: 'Sem classificação', color: '#90A955' },
  sem_conexao: { label: 'Sem leitura', color: '#6B7A84' },
  ativa: { label: 'Ativa', color: '#05D900' },
  inativa: { label: 'Inativa', color: '#6B7A84' },
};

export function extrairLista(dados, propriedade) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.[propriedade])) return dados[propriedade];
  if (Array.isArray(dados?.data)) return dados.data;
  if (Array.isArray(dados?.value)) return dados.value;
  return [];
}

export function obterUltimoRegistro(registros, campoData = 'data') {
  if (!Array.isArray(registros) || registros.length === 0) return null;

  const ativos = registros.filter((r) => r.ativo !== false);
  const lista = ativos.length ? ativos : registros;

  return (
    lista
      .map((registro, indice) => ({ registro, indice }))
      .sort((a, b) => {
        const dataA = new Date(a.registro[campoData] || 0).getTime();
        const dataB = new Date(b.registro[campoData] || 0).getTime();
        return dataB - dataA || b.indice - a.indice;
      })[0]?.registro ?? null
  );
}

export function normalizarEstado(estado, possuiLeitura = false) {
  const valor = String(estado || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (['normal', 'ocioso', 'saudavel'].includes(valor)) return 'saudavel';

  if (
    valor === 'alerta' ||
    valor === 'estressado' ||
    valor.includes('estress') ||
    valor.includes('termico') ||
    valor.includes('critico')
  ) {
    return 'estressado';
  }

  return possuiLeitura ? 'sem_classificacao' : 'sem_conexao';
}

export function parseCoordenada(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;

  if (typeof valor === 'string' && valor.trim() !== '') {
    const convertido = Number(valor.replace(',', '.'));
    return Number.isFinite(convertido) ? convertido : null;
  }

  return null;
}

export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '—';

  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return '—';

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade--;

  idade = Math.max(0, idade);
  return `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
}

export function formatarSexo(sexo) {
  if (sexo === 'Masculino') return 'Macho';
  if (sexo === 'Feminino') return 'Fêmea';
  return sexo || '—';
}

export function formatarDataHora(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data.toLocaleString('pt-BR');
}

// Converte uma coleira (com o bubalino aninhado) no formato usado pelas telas.
export function montarBubalino(coleira) {
  const animal = coleira.bubalino;
  if (!animal) return null;

  const ultimoDado = obterUltimoRegistro(animal.dados, 'data');
  const ultimaLocalizacao = obterUltimoRegistro(animal.localizacao, 'data');
  const ultimoEstresse = obterUltimoRegistro(animal.historico_estresse, 'data_estresse');

  const estadoEstresse = ultimoEstresse?.estado_estresse || null;
  const possuiLeitura = Boolean(ultimoDado || ultimaLocalizacao || ultimoEstresse);

  const latitude = parseCoordenada(ultimaLocalizacao?.latitude);
  const longitude = parseCoordenada(ultimaLocalizacao?.longitude);
  const coordenadaValida =
    latitude !== null && longitude !== null &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;

  return {
    id: animal._id || animal.n_etiqueta,
    nome: animal.nome || animal.n_etiqueta || 'Bubalino sem nome',
    numero_etiqueta: animal.n_etiqueta || '—',
    raca: animal.raca || '',
    sexo: animal.sexo || '',
    dt_nasc: animal.dt_nasc,
    idade: calcularIdade(animal.dt_nasc),
    ativo: animal.ativo !== false,
    status: normalizarEstado(estadoEstresse, possuiLeitura),
    estado_estresse: estadoEstresse || 'Sem classificação',
    temperatura: ultimoDado?.temperatura ?? null,
    batimentos: ultimoDado?.batimento_cardiaco ?? null,
    data_leitura: ultimoDado?.data ?? null,
    latitude: coordenadaValida ? latitude : null,
    longitude: coordenadaValida ? longitude : null,
    data_localizacao: ultimaLocalizacao?.data || ultimaLocalizacao?.data_localizacao || null,
    coleira_id: coleira._id,
    coleira_nome: coleira.n_coleira || '—',
    coleira_localizacao: coleira.coleira_localizacao || '',
    coleira_ip: obterIp(coleira),
  };
}

// O IP pode vir com nomes diferentes dependendo da API.
export function obterIp(coleira) {
  return String(coleira?.IP ?? coleira?.ip ?? coleira?.endereco_ip ?? '').trim();
}

// Texto único para busca: ignora acentos, maiúsculas e espaços.
export function textoParaBusca(...valores) {
  return valores
    .flat()
    .filter((v) => v !== null && v !== undefined)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizarTermo(termo) {
  return textoParaBusca(String(termo || '').trim());
}

export function mensagemDeErro(error, padrao) {
  const status = error?.response?.status;
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para consultar esses dados.';
  return (
    error?.response?.data?.mensagem ||
    error?.response?.data?.message ||
    padrao
  );
}