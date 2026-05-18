const STORAGE_KEY = 'base44-data';

const defaultData = {
  bubalinos: [
    {
      id: 'b1',
      nome: 'Aurora',
      numero_etiqueta: 'BB-001',
      status: 'saudavel',
      temperatura: 38.2,
      batimentos: 60,
      latitude: -1.4558,
      longitude: -48.4902,
    },
    {
      id: 'b2',
      nome: 'Sol',
      numero_etiqueta: 'BB-002',
      status: 'estressado',
      temperatura: 39.1,
      batimentos: 72,
      latitude: -1.4572,
      longitude: -48.4914,
    },
  ],
  coleiras: [
    {
      id: 'c1',
      numero_etiqueta: 'CL-100',
      status: 'ativa',
      bateria: 76,
      localizacao: 'Pasto Norte',
      endereco_ip: '192.168.0.45',
    },
  ],
  user: {
    id: 'u1',
    full_name: 'Produtor Demo',
    email: 'demo@bubatag.local',
    role: 'admin',
    fazenda: 'Fazenda Exemplo',
    telefone: '(00) 00000-0000',
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
    return JSON.parse(raw);
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
