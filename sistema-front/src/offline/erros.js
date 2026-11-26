/**
 * Cria um erro que não adianta tentar de novo
 * (ex.: dados locais inconsistentes).
 */
export function criarErroPermanente(mensagem) {
  const erro = new Error(mensagem);
  erro.permanente = true;
  return erro;
}

/**
 * Classifica uma falha de sincronização.
 *
 * Retorna:
 *  - mensagem: texto para exibir e guardar na operação
 *  - permanente: true quando repetir o envio não resolve
 *  - contaTentativa: true quando a falha conta para o limite de tentativas
 */
export function classificarErro(erro) {
  const resposta = erro?.response;
  const status = resposta?.status;
  const dados = resposta?.data;

  const mensagemApi =
    dados?.mensagem || dados?.message || erro?.message || 'Erro ao sincronizar.';

  // Erro interno marcado como definitivo.
  if (erro?.permanente) {
    return { mensagem: mensagemApi, permanente: true, contaTentativa: false };
  }

  // Sem resposta da API (internet caiu, servidor fora, timeout).
  if (erro?.isAxiosError && !resposta) {
    return {
      mensagem: 'Sem comunicação com a API.',
      permanente: false,
      contaTentativa: false,
    };
  }

  // Sessão expirada: o api.js leva para o login; ao entrar de novo, tenta outra vez.
  if (status === 401) {
    return {
      mensagem: 'Sessão expirada. Entre novamente para sincronizar.',
      permanente: false,
      contaTentativa: false,
    };
  }

  // A API ainda está processando esta mesma operação.
  if (status === 409 && dados?.status === 'processando') {
    return { mensagem: mensagemApi, permanente: false, contaTentativa: true };
  }

  // Falhas temporárias do servidor.
  if (status >= 500 || status === 408 || status === 429) {
    return { mensagem: mensagemApi, permanente: false, contaTentativa: true };
  }

  // Demais 4xx: validação, permissão, conflito de dados etc.
  if (status >= 400) {
    return { mensagem: mensagemApi, permanente: true, contaTentativa: false };
  }

  // Erro inesperado sem relação com a rede.
  return { mensagem: mensagemApi, permanente: false, contaTentativa: true };
}