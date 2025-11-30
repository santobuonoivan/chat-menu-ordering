export interface IModifierOption {
  name: string;
  priceAdjustment: number;
  imageUrl?: string;
}

export interface IModifier {
  modifierId: string;
  name: string;
  options: IModifierOption[];
  isRequired: boolean;
  maxOptions: number;
}

export interface IMenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  modifiers?: IModifier[];
}

export interface IMenuData {
  items: IMenuItem[];
}
