import { ICartModifier } from "./cart";
import { IMenuItem } from "./menu";

export interface IMessage {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  data?: {
    items?: IMenuItem[];
    modifiers?: ICartModifier[];
    itemId?: string;
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
