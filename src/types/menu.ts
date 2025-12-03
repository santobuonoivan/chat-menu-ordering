export interface IModifier {
  mod_sku: string;
  mod_name: string;
  mod_price: number;
  group_code: string;
  modifier_id: number;
  max_quantity: number;
  min_quantity: number;
  mod_description: string;
}

export interface IModifierGroup {
  group_code: string;
  options: IModifier[];
}

export interface IMenuItem {
  dish_id: number;
  dish_sku: string;
  dish_name: string;
  description: string;
  category: string;
  category_order: number;
  dish_price: string;
  min_quantity: number;
  max_quantity: number;
  image: string | null;
  external_id: string;
  modifiers: IModifierGroup[];
}

export interface IMenuData {
  menu: IMenuItem[];
}
