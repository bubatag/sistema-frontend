import BuffaloIcon from '@/components/brand/BuffaloIcon';
import { Home, LayoutDashboard, Radio, MapPin, User } from 'lucide-react';

export const menuItems = [
  { label: 'Início', icon: Home, path: '/' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Bubalinos', icon: BuffaloIcon, path: '/bubalinos' },
  { label: 'Coleiras', icon: Radio, path: '/coleiras' },
  { label: 'Localização', icon: MapPin, path: '/localizacao' },
  { label: 'Perfil', icon: User, path: '/perfil' },
];