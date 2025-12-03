import { api, agentAIApi } from "@/lib/api";
import { rankAndFilterDishes } from "@/utils";

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
