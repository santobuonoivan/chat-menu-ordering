import { v4 as uuidv4 } from "uuid";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateUUID = () => {
  return uuidv4();
};
