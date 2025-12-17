import {
  standarApi,
  agentAIApi,
  duckApi,
  deliveryApi,
  coreApi,
} from "@/lib/api";
import { rankAndFilterDishes } from "@/utils";

// Menu API Service
export const menuService = {
  // Get all menu items
  async getMenuItems(phone: string) {
    return await standarApi.get(`/automate/core/menu/${phone}`);
  },
};

export const sendOrderCartToAutomate = async (order: any) => {
  // Get all menu items
  return await standarApi.post(`/automate/core/orders`, order);
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
  let payload = {
    signature: gatewaySignature,
  };

  let query = new URLSearchParams(payload).toString();

  const response = await deliveryApi.get(
    `/v1/finance/payment/gateway?${query}`
  );
  const { success, data } = response;
  console.log("Get Payment Gateway Response:", response);
  return { success, data: data };
};

export const ProcessPayment = async (
  paymentData: any
): Promise<{
  success: boolean;
  data: any;
}> => {
  const response = await duckApi.post(
    `/v1/payments/CNKT/order/${process.env.NEXT_PUBLIC_RECIPE_UUID}`,
    paymentData,
    { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}` }
  );
  const { success, data } = response;
  return { success, data: data };
};

export const GetDeliveryCost = async (deliveryData: {
  lat: number;
  lng: number;
  rest_id: number;
}): Promise<{
  success: boolean;
  data: any;
}> => {
  const { lat, lng, rest_id } = deliveryData;
  const response = await deliveryApi.post(
    `/v2/delivery/booking/quote-by-rest-id`,
    /*{ TODO
      rest_id,
      lat,
      lng,
    }*/
    /* test */
    {
      rest_id: 163,
      lat: 19.432608,
      lng: -99.133209,
    }
  );
  const { success, data } = response;
  console.log("Get Delivery Cost Response:", response);
  return { success, data: data };
};

export const GetSessionData = async (
  user_phone: string,
  rest_phone: string,
  customer_name: string,
  chatInput: string,
  platform: string
): Promise<{
  success: boolean;
  data: any;
}> => {
  const payload = {
    user_phone,
    rest_phone,
    sessionId: `${user_phone}||${rest_phone}`,
    chatInput,
    customer_name,
    platform,
  };
  console.log("Get Session Data Payload:", payload);
  const response = await coreApi.post(
    `/v2/automate/process_incoming_message`,
    payload
  );
  const { success, data } = response;
  console.log("Get Session Data Response:", response);
  console.log("Get Session Data data:", data);
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
