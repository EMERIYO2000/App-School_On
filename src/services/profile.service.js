import api from "./api";

export const profileService = {
  async getMyProfile() {
    const { data } = await api.get("profile/me/");
    return data;
  },

  async updateMyProfile(payload) {
    const { data } = await api.patch("profile/me/", payload);
    return data;
  },

  async uploadAvatar(file) {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await api.post("profile/avatar/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateTutorProfile(payload) {
    const { data } = await api.patch("profile/tutor/", payload);
    return data;
  },

  async updateLocation(payload) {
    const { data } = await api.patch("profile/location/", payload);
    return data;
  },

  async getLearnerProfile() {
    const { data } = await api.get("profile/learner/");
    return data;
  },

  async updateLearnerProfile(payload) {
    const { data } = await api.patch("profile/learner/", payload);
    return data;
  },

  async getMentorStatus() {
    const { data } = await api.get("auth/my-mentor-application/");
    const application = data.application;
    return {
      mentor_status: application?.status || "DRAFT",
      is_verified: application?.status === "approved",
    };
  },

  async getMentorApplication() {
    const { data } = await api.get("auth/my-mentor-application/");
    return data;
  },

  async saveMentorApplication(payload) {
    const { data } = await api.post("auth/become-mentor/", payload);
    return data;
  },

  async submitMentorApplication() {
    const { data } = await api.post("mentor/application/submit/");
    return data;
  },

  async getMentorSkills() {
    const { data } = await api.get("mentor/skills/");
    return data;
  },

  async addMentorSkill(payload) {
    const { data } = await api.post("mentor/skills/", payload);
    return data;
  },

  async deleteMentorSkill(id) {
    await api.delete(`mentor/skills/${id}/delete/`);
  },

  async getMentorQualifications() {
    const { data } = await api.get("mentor/qualifications/");
    return data;
  },

  async addMentorQualification(payload) {
    const isMultipart = payload instanceof FormData;
    const { data } = await api.post(
      "mentor/qualifications/",
      payload,
      isMultipart
        ? {
            headers: { "Content-Type": "multipart/form-data" },
          }
        : undefined,
    );
    return data;
  },

  async deleteMentorQualification(id) {
    await api.delete(`mentor/qualifications/${id}/delete/`);
  },
};

export const usersService = {
  async updateLocation(payload) {
    const { data } = await api.patch("users/me/location/", payload);
    return data;
  },

  async setFcmToken(fcm_token) {
    const { data } = await api.post("users/me/fcm-token/", { fcm_token });
    return data;
  },

  async requestParentChild(child_identifier) {
    const { data } = await api.post("users/parent-child/request/", {
      child_identifier,
    });
    return data;
  },

  async respondParentChild(relation_id, action) {
    const { data } = await api.post("users/parent-child/respond/", {
      relation_id,
      action,
    });
    return data;
  },

  async nearbyTutors({ radius = 10, lat, lng } = {}) {
    const { data } = await api.get("users/nearby-tutors/", {
      params: { radius, lat, lng },
    });
    return data;
  },

  async getMentor(mentorId) {
    const { data } = await api.get(`mentors/${mentorId}/`);
    return data;
  },

  async reportMentor(mentorId, payload) {
    const { data } = await api.post(`mentors/${mentorId}/report/`, payload);
    return data;
  },

  async getMentorReviews(mentorId) {
    const { data } = await api.get(`mentors/${mentorId}/reviews/`);
    return data;
  },

  async logoutAll() {
    const { data } = await api.post("users/logout-all/");
    return data;
  },

  async deactivateAccount() {
    const { data } = await api.delete("users/me/");
    return data;
  },
};

export const adminService = {
  async getUsers(params = {}) {
    const { data } = await api.get("users/", { params });
    return data;
  },

  async getMentorApplications(params = {}) {
    const { data } = await api.get("auth/mentor-applications/", { params });
    return Array.isArray(data) ? { results: data } : data;
  },

  async reviewMentorApplication(applicationId, payload) {
    const { data } = await api.post(
      `auth/mentor-applications/${applicationId}/review/`,
      { action: payload.action, review_note: payload.note || "" },
    );
    return data;
  },

  async getMentorApplicationHistory(applicationId) {
    const { data } = await api.get(
      `auth/mentor-applications/${applicationId}/`,
    );
    return data;
  },
};
