// Tipos possíveis de evento
export type EventType =
  | 'condominium'
  | 'service'
  | 'maintenance'
  | 'security'
  | 'fine'
  | 'other';

// Retorna o nome legível do tipo de evento
export const getTypeName = (type: EventType | string): string => {
  switch (type) {
    case 'condominium':
      return 'Condomínio';
    case 'service':
      return 'Serviço';
    case 'maintenance':
      return 'Manutenção';
    case 'security':
      return 'Segurança';
    case 'fine':
      return 'Multa';
    default:
      return 'Outro';
  }
};

// Retorna a cor associada ao tipo de evento (Tailwind classes)
export const getTypeColor = (type: EventType | string): string => {
  switch (type) {
    case 'condominium':
      return 'bg-blue-500/20 text-blue-400';
    case 'service':
      return 'bg-green-500/20 text-green-400';
    case 'maintenance':
      return 'bg-orange-500/20 text-orange-400';
    case 'security':
      return 'bg-purple-500/20 text-purple-400';
    case 'fine':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};