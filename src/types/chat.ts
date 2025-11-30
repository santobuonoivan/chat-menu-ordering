import { IMenuItem } from "./menu";

export interface IMessage {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  data?: {
    items?: IMenuItem[];
    modifiers?: any[];
  };
}
