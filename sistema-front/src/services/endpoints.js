// Rotas da API usadas para cadastrar, editar e excluir.
// Se o seu backend usar caminhos diferentes, ajuste SOMENTE este arquivo.
export const ENDPOINTS = {
  coleiras: {
    criar: (usuarioId) => `/api/coleiras/usuario/${usuarioId}`, // POST
    atualizar: (id) => `/api/coleiras/${id}`, // PUT
    excluir: (id) => `/api/coleiras/${id}`, // DELETE
  },
  bubalinos: {
    criar: () => '/api/bubalinos', // POST
    atualizar: (id) => `/api/bubalinos/${id}`, // PUT
    excluir: (id) => `/api/bubalinos/${id}`, // DELETE
  },
};