import React from 'react';

const labels = {
  saudavel: 'Saudavel',
  estressado: 'Estressado',
  fora_do_pasto: 'Fora do pasto',
  sem_conexao: 'Sem conexao',
  ativa: 'Ativa',
  inativa: 'Inativa',
};

const colors = {
  saudavel: 'bg-[#06D001]/10 text-[#06D001] border-[#06D001]/30',
  estressado: 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/30',
  fora_do_pasto: 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30',
  sem_conexao: 'bg-muted text-muted-foreground border-border',
  ativa: 'bg-[#06D001]/10 text-[#06D001] border-[#06D001]/30',
  inativa: 'bg-muted text-muted-foreground border-border',
};

export default function StatusBadge({ status }) {
  const label = labels[status] || 'Desconhecido';
  const color = colors[status] || 'bg-muted text-muted-foreground border-border';
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs border rounded-full ${color}`}>{label}</span>;
}
