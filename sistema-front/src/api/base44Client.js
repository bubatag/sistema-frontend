const STORAGE_KEY = 'base44-data';
const MOCK_DATA_VERSION = '2026-06-10-demo';

const defaultData = {
  mockVersion: MOCK_DATA_VERSION,
  bubalinos: [
    {
      id: 'b1',
      nome: 'Aurora do Para',
      numero_etiqueta: 'BB-001',
      status: 'saudavel',
      temperatura: 38.2,
      batimentos: 60,
      raca: 'Murrah',
      idade: 5,
      sexo: 'Femea',
      coleira_id: 'c1',
      latitude: -1.4558,
      longitude: -48.4902,
    },
    {
      id: 'b2',
      nome: 'Jaci',
      numero_etiqueta: 'BB-002',
      status: 'estressado',
      temperatura: 39.1,
      batimentos: 72,
      raca: 'Mediterraneo',
      idade: 4,
      sexo: 'Femea',
      coleira_id: 'c2',
      latitude: -1.4572,
      longitude: -48.4914,
    },
    {
      id: 'b3',
      nome: 'Tupa',
      numero_etiqueta: 'BB-003',
      status: 'saudavel',
      temperatura: 38,
      batimentos: 58,
      raca: 'Murrah',
      idade: 6,
      sexo: 'Macho',
      coleira_id: 'c3',
      latitude: -1.4546,
      longitude: -48.4889,
    },
    {
      id: 'b4',
      nome: 'Maira',
      numero_etiqueta: 'BB-004',
      status: 'fora_do_pasto',
      temperatura: 38.8,
      batimentos: 69,
      raca: 'Carabao',
      idade: 3,
      sexo: 'Femea',
      coleira_id: 'c4',
      latitude: -1.4617,
      longitude: -48.4978,
    },
    {
      id: 'b5',
      nome: 'Guara',
      numero_etiqueta: 'BB-005',
      status: 'saudavel',
      temperatura: 37.9,
      batimentos: 56,
      raca: 'Jafarabadi',
      idade: 7,
      sexo: 'Macho',
      coleira_id: 'c5',
      latitude: -1.4529,
      longitude: -48.4921,
    },
    {
      id: 'b6',
      nome: 'Iara',
      numero_etiqueta: 'BB-006',
      status: 'sem_conexao',
      temperatura: null,
      batimentos: null,
      raca: 'Mediterraneo',
      idade: 2,
      sexo: 'Femea',
      coleira_id: 'c6',
      latitude: -1.4564,
      longitude: -48.4867,
    },
    {
      id: 'b7',
      nome: 'Bento',
      numero_etiqueta: 'BB-007',
      status: 'saudavel',
      temperatura: 38.4,
      batimentos: 61,
      raca: 'Murrah',
      idade: 5,
      sexo: 'Macho',
      coleira_id: 'c7',
      latitude: -1.4586,
      longitude: -48.4895,
    },
    {
      id: 'b8',
      nome: 'Luna',
      numero_etiqueta: 'BB-008',
      status: 'fora_do_pasto',
      temperatura: 39.4,
      batimentos: 76,
      raca: 'Carabao',
      idade: 4,
      sexo: 'Femea',
      coleira_id: 'c8',
      latitude: -1.4557,
      longitude: -48.4912,
    },
  ],
  coleiras: [
    {
      id: 'c1',
      numero_etiqueta: 'CL-100',
      status: 'ativa',
      bateria: 92,
      localizacao: 'Pasto Norte',
      endereco_ip: '192.168.0.45',
      bubalino_id: 'b1',
      bubalino_nome: 'Aurora do Para',
    },
    {
      id: 'c2',
      numero_etiqueta: 'CL-101',
      status: 'ativa',
      bateria: 64,
      localizacao: 'Pasto Norte',
      endereco_ip: '192.168.0.46',
      bubalino_id: 'b2',
      bubalino_nome: 'Jaci',
    },
    {
      id: 'c3',
      numero_etiqueta: 'CL-102',
      status: 'ativa',
      bateria: 81,
      localizacao: 'Pasto Central',
      endereco_ip: '192.168.0.47',
      bubalino_id: 'b3',
      bubalino_nome: 'Tupa',
    },
    {
      id: 'c4',
      numero_etiqueta: 'CL-103',
      status: 'ativa',
      bateria: 37,
      localizacao: 'Cerca Oeste',
      endereco_ip: '192.168.0.48',
      bubalino_id: 'b4',
      bubalino_nome: 'Maira',
    },
    {
      id: 'c5',
      numero_etiqueta: 'CL-104',
      status: 'ativa',
      bateria: 58,
      localizacao: 'Pasto Sul',
      endereco_ip: '192.168.0.49',
      bubalino_id: 'b5',
      bubalino_nome: 'Guara',
    },
    {
      id: 'c6',
      numero_etiqueta: 'CL-105',
      status: 'inativa',
      bateria: 12,
      localizacao: 'Pasto Central',
      endereco_ip: '192.168.0.50',
      bubalino_id: 'b6',
      bubalino_nome: 'Iara',
    },
    {
      id: 'c7',
      numero_etiqueta: 'CL-106',
      status: 'ativa',
      bateria: 74,
      localizacao: 'Pasto Leste',
      endereco_ip: '192.168.0.51',
      bubalino_id: 'b7',
      bubalino_nome: 'Bento',
    },
    {
      id: 'c8',
      numero_etiqueta: 'CL-107',
      status: 'ativa',
      bateria: 29,
      localizacao: 'Pasto Norte',
      endereco_ip: '192.168.0.52',
      bubalino_id: 'b8',
      bubalino_nome: 'Luna',
    },
    {
      id: 'c9',
      numero_etiqueta: 'CL-108',
      status: 'inativa',
      bateria: 0,
      localizacao: 'Manutencao',
      endereco_ip: '',
      bubalino_id: '',
      bubalino_nome: '',
    },
  ],
  user: {
    id: 'u1',
    full_name: 'Marina Costa',
    email: 'marina@fazendasaojoaquim.local',
    role: 'admin',
    fazenda: 'Fazenda Sao Joaquim',
    telefone: '(91) 98824-1904',
  },
};

function loadData() {
  if (typeof localStorage === 'undefined') return { ...defaultData };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return { ...defaultData };
  }
  try {
    const data = JSON.parse(raw);
    if (data.mockVersion !== MOCK_DATA_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return { ...defaultData };
    }
    return data;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return { ...defaultData };
  }
}

function saveData(data) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCollection(name) {
  const data = loadData();
  return Array.isArray(data[name]) ? data[name] : [];
}

function setCollection(name, items) {
  const data = loadData();
  data[name] = items;
  saveData(data);
}

function newId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEntityApi(name) {
  return {
    list: async () => getCollection(name),
    create: async (payload) => {
      const items = getCollection(name);
      const item = { id: newId(name.slice(0, 1)), ...payload };
      items.push(item);
      setCollection(name, items);
      return item;
    },
    update: async (id, payload) => {
      const items = getCollection(name).map((item) => (item.id === id ? { ...item, ...payload } : item));
      setCollection(name, items);
      return items.find((item) => item.id === id);
    },
    delete: async (id) => {
      const items = getCollection(name).filter((item) => item.id !== id);
      setCollection(name, items);
      return true;
    },
  };
}

export const base44 = {
  entities: {
    Bubalino: createEntityApi('bubalinos'),
    Coleira: createEntityApi('coleiras'),
  },
  auth: {
    me: async () => loadData().user,
    updateMe: async (payload) => {
      const data = loadData();
      data.user = { ...data.user, ...payload };
      saveData(data);
      return data.user;
    },
  },
};
