import { STATUS } from '@/lib/rebanho';

export default function StatusBadge({ status }) {
  const config = STATUS[status] || { label: 'Desconhecido', color: '#6B7A84' };

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{
        color: config.color,
        backgroundColor: `${config.color}1A`,
        borderColor: `${config.color}4D`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}