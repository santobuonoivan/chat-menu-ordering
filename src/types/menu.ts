export interface ModifierOption {
  name: string;
  priceAdjustment: number;
  imageUrl?: string;
}

export interface Modifier {
  modifierId: string;
  name: string;
  options: ModifierOption[];
  isRequired: boolean;
  maxOptions: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  modifiers?: Modifier[];
}

export interface MenuData {
  items: MenuItem[];
}
