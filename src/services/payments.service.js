import api from "./api";

export const paginate = (response) => {
  if (!response) return { results: [] };
  if (Array.isArray(response)) return { results: response };
  if (Array.isArray(response.results)) return response;
  return { results: response.data?.results || [] };
};

export const paymentsService = {
  async getWalletSummary() {
    const { data } = await api.get("payments/wallet/summary/");
    return data;
  },

  async getWalletProviderStatus() {
    const { data } = await api.get("payments/wallet/provider-status/");
    return data;
  },

  async getDeposits() {
    const { data } = await api.get("payments/wallet/deposits/");
    return data;
  },

  async createDeposit(payload) {
    const { data } = await api.post("payments/wallet/deposits/", payload);
    return data;
  },

  async getDepositStatus(reference) {
    const { data } = await api.get(`payments/wallet/deposits/${reference}/status/`);
    return data;
  },

  async getEarnings(params = {}) {
    const { data } = await api.get("payments/wallet/earnings/", { params });
    return data;
  },

  async getTransactions(params = {}) {
    const { data } = await api.get("payments/", { params });
    return data;
  },

  async createTransaction(payload) {
    const { data } = await api.post("payments/", payload);
    return data;
  },

  async requestBitliberaOtp(payload) {
    const { data } = await api.post("payments/bitlibera/request-otp/", payload);
    return data;
  },

  async getTransaction(id) {
    const { data } = await api.get(`payments/${id}/`);
    return data;
  },

  async refund(id) {
    const { data } = await api.post(`payments/${id}/refund/`);
    return data;
  },

  async getBookings(params = {}) {
    const { data } = await api.get("payments/bookings/", { params });
    return data;
  },

  async createBooking(payload) {
    const { data } = await api.post("payments/bookings/", payload);
    return data;
  },

  async studentConfirm(bookingId) {
    const { data } = await api.post(
      `payments/bookings/${bookingId}/student-confirm/`,
    );
    return data;
  },

  async mentorConfirm(bookingId) {
    const { data } = await api.post(
      `payments/bookings/${bookingId}/mentor-confirm/`,
    );
    return data;
  },
};
