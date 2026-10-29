import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Botões de editar e excluir usados nas tabelas e cartões.
export default function RowActions({ onEdit, onDelete, nome }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onEdit} aria-label={`Editar ${nome}`} title="Editar">
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 hover:bg-danger/15 hover:text-danger"
        onClick={onDelete}
        aria-label={`Excluir ${nome}`}
        title="Excluir"
      >
        <Trash2 />
      </Button>
    </div>
  );
}