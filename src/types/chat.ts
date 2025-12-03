import { IMenuItem, IModifier, IModifierGroup } from "./menu";

export interface IMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  data?: {
    items?: IMenuItem[];
    modifiers?: IModifierGroup[];
    itemSelected?: IMenuItem;
    action: //ordering actions
    | "add_dish"
      | "add_modifier"
      | "update_dish"
      | "update_modifier"
      | "remove_dish"
      | "remove_modifier"
      //flows
      | "show_menu"
      | "show_cart"
      | "user_location"
      | "confirm_order"
      | "cancel_order"
      | "select_payment_method";
  };
}
