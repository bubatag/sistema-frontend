import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Rótulo + campo de texto com a mesma aparência em todos os formulários.
export default function Campo({ id, label, ajuda, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {ajuda && <p className="text-xs text-muted-foreground">{ajuda}</p>}
    </div>
  );
}