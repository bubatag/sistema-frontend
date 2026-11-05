
export const ENDPOINTS = {
  coleiras: {
    criar: (usuarioId) =>
      `/api/coleiras/usuario/${usuarioId}`,

    atualizar: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}`,

    excluir: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}`,

    excluirPermanentemente: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}/permanente`,

    reativar: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}/reativar`,

    desvincular: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}/desvincular`,
  },

  bubalinos: {
    listar: () => '/api/bubalinos',

    criar: () => '/api/bubalinos',

    atualizar: (id) =>
      `/api/bubalinos/${id}`,

    excluir: (id) =>
      `/api/bubalinos/${id}`,

    reativar: (id) =>
      `/api/bubalinos/${id}/reativar`,

    excluirPermanentemente: (id) =>
      `/api/bubalinos/${id}/permanente`,

    desvincular: (id) =>
      `/api/bubalinos/${id}/desvincular`,
  },

  relatorios: {
    historicoColeira: (numeroColeira) =>
      `/api/relatorios/coleira/${encodeURIComponent(numeroColeira)}`,
  },
};
