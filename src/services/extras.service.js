import api from "./api";

export const notificationsService = {
  async getNotifications(params = {}) {
    const { data } = await api.get("notifications/notifications/", { params });
    return data;
  },
  async getUnreadCount() {
    const { data } = await api.get("notifications/notifications/unread-count/");
    return data;
  },
  async markRead(id) {
    const { data } = await api.post(`notifications/notifications/${id}/mark-read/`);
    return data;
  },
};

export const certificatesService = {
  async getMyCertificates() {
    const { data } = await api.get("certificates/");
    return data;
  },

  async verify(certificateId) {
    const { data } = await api.get(`certificates/verify/${certificateId}/`);
    return data;
  },
};

export const communityService = {
  async getCategories() {
    const { data } = await api.get("community/categories/");
    return data;
  },
  async getThreads(params = {}) {
    const { data } = await api.get("community/threads/", { params });
    return data;
  },

  async createThread(payload) {
    const { data } = await api.post("community/threads/", payload);
    return data;
  },

  async getThread(threadId) {
    const { data } = await api.get(`community/threads/${threadId}/`);
    return data;
  },

  async reply(threadId, payload) {
    const { data } = await api.post(
      `community/threads/${threadId}/replies/`,
      payload,
    );
    return data;
  },

  async likeThread(threadId) {
    const { data } = await api.post(`community/threads/${threadId}/like/`);
    return data;
  },

  async likePost(postId) {
    const { data } = await api.post(`community/posts/${postId}/like/`);
    return data;
  },

  async acceptPost(postId) {
    const { data } = await api.post(`community/posts/${postId}/accept/`);
    return data;
  },

  async reportThread(threadId, payload) {
    const { data } = await api.post(
      `community/threads/${threadId}/report/`,
      payload,
    );
    return data;
  },

  async reportPost(postId, payload) {
    const { data } = await api.post(
      `community/posts/${postId}/report/`,
      payload,
    );
    return data;
  },
};
