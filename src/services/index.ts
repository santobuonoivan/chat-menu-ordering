import { api, agentAIApi, duckApi } from "@/lib/api";
import { rankAndFilterDishes } from "@/utils";
import { timeStamp } from "console";

// Menu API Service
export const menuService = {
  // Get all menu items
  async getMenuItems(phone: string) {
    return await api.get(`/automate/core/menu/${phone}`);
  },
};

export const getDishesByInput = async (
  input: string,
  list: string[]
): Promise<{
  success: boolean;
  data: string[];
}> => {
  const filteredDishes = rankAndFilterDishes(list, input);
  console.log("Filtered Dishes:", filteredDishes);
  if (filteredDishes.length === 1)
    return { success: true, data: filteredDishes };
  const agentRespones = await agentAIApi.post(
    "/webhook/16d87d1c-2071-4bf6-b4ee-03873d0cc2ff",
    {
      type: "FIND_DISH_BY_NAME",
      data: { DISH_LIST: filteredDishes, INPUT: input },
    }
  );
  console.log("Agent Responses:", agentRespones);
  const { success, data } = agentRespones;
  return { success, data: data.output };
};

export const GetPaymentGateway = async (
  gatewaySignature: string
): Promise<{
  success: boolean;
  data: any;
}> => {
  const response = await duckApi.get(`/v1/gateways/${gatewaySignature}`);
  const { success, data } = response;
  return { success, data: data };
};

export const ProcessPayment = async (
  paymentData: any
): Promise<{
  success: boolean;
  data: any;
}> => {
  const {
    signature,
    recipeuuid,
    customer,
    paymentMethod,
    receiptAmount,
    restaurantData,
  } = paymentData;
  const timeStamp = new Date().getTime();
  const response = await duckApi.post(
    `/v1/payments/${signature}/order/${recipeuuid}`,
    {
      customer,
      reference: timeStamp,
      concept: "ORDER_PAYMENT",
      description: "Pago de prueba orden AI",
      currency: "MXN",
      receipt_amount: receiptAmount,
      type_charge: "direct",
      payment_method: paymentMethod,
      service: "PAYMENT",
      cashOnHand: 1,
      receipt_details: [],
      receipt_charges: [],
      receipt_owner: {
        name: restaurantData.name,
        email: restaurantData.email,
        mobile: restaurantData.mobile,
        owner_id: restaurantData.ownerId,
      },
      metadata: {
        action: "PAY-ORDER-AI",
      },
    }
  );
  const { success, data } = response;
  return { success, data: data };
};
/*// Cart API Service
export const cartService = {
  // Submit order
  async submitOrder(orderData: any) {
    return await api.post("/api/orders", orderData);
  },

  // Get order status
  async getOrderStatus(orderId: string) {
    return await api.get(`/api/orders/${orderId}`);
  },

  // Cancel order
  async cancelOrder(orderId: string) {
    return await api.delete(`/api/orders/${orderId}`);
  },
};

// User API Service
export const userService = {
  // User login
  async login(credentials: { email: string; password: string }) {
    return await api.post("/api/auth/login", credentials);
  },

  // User register
  async register(userData: { name: string; email: string; password: string }) {
    return await api.post("/api/auth/register", userData);
  },

  // Get user profile
  async getProfile() {
    return await api.get("/api/user/profile");
  },

  // Update profile
  async updateProfile(data: any) {
    return await api.put("/api/user/profile", data);
  },
};

// Chat API Service
export const chatService = {
  // Send message to AI
  async sendMessage(message: string) {
    return await api.post("/api/chat", { message });
  },

  // Get chat history
  async getChatHistory() {
    return await api.get("/api/chat/history");
  },
};*/
