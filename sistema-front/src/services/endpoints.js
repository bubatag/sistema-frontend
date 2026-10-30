// Rotas da API usadas para cadastrar, editar, desativar e reativar.

export const ENDPOINTS = {
  coleiras: {
    criar: (usuarioId) =>
      `/api/coleiras/usuario/${usuarioId}`, // POST

    atualizar: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}`, // PUT

    excluir: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}`, // DELETE - desativar

    reativar: (usuarioId, id) =>
      `/api/coleiras/usuario/${usuarioId}/${id}/reativar`, // PATCH
  },

  bubalinos: {
    criar: () => '/api/bubalinos', // POST
    atualizar: (id) => `/api/bubalinos/${id}`, // PUT
    excluir: (id) => `/api/bubalinos/${id}`, // DELETE
  },
};
