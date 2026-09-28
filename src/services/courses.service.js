import api from "./api";

export const coursesService = {
  async getCategories() {
    const { data } = await api.get("courses/categories/");
    return data;
  },

  async getExams(params = {}) {
    const { data } = await api.get("courses/exams/", { params });
    return data;
  },

  async approveExam(examId) {
    const { data } = await api.post(`courses/exams/${examId}/approve/`);
    return data;
  },

  async rejectExam(examId, review_note) {
    const { data } = await api.post(`courses/exams/${examId}/reject/`, {
      review_note,
    });
    return data;
  },

  async getArchiveResources(params = {}) {
    const { data } = await api.get("courses/archive-resources/", { params });
    return data;
  },

  async approveArchiveResource(resourceId) {
    const { data } = await api.post(
      `courses/archive-resources/${resourceId}/approve/`,
    );
    return data;
  },

  async rejectArchiveResource(resourceId, review_note) {
    const { data } = await api.post(
      `courses/archive-resources/${resourceId}/reject/`,
      { review_note },
    );
    return data;
  },

  async approveCourse(courseId) {
    const { data } = await api.post(`courses/courses/${courseId}/approve/`);
    return data;
  },

  async rejectCourse(courseId, review_note) {
    const { data } = await api.post(`courses/courses/${courseId}/reject/`, {
      review_note,
    });
    return data;
  },

  async publishQuiz(quizId) {
    const { data } = await api.post(`courses/quizzes/${quizId}/publish/`);
    return data;
  },

  async getCourses(params = {}) {
    const { data } = await api.get("courses/courses/", { params });
    return data;
  },

  async getCourse(id) {
    const { data } = await api.get(`courses/courses/${id}/`);
    return data;
  },

  async getCourseReviews(id) {
    const { data } = await api.get(`courses/courses/${id}/reviews/`);
    return data;
  },

  async createCourse(payload) {
    const { data } = await api.post("courses/courses/", payload);
    return data;
  },

  async updateCourse(courseId, payload) {
    const { data } = await api.patch(`courses/courses/${courseId}/`, payload);
    return data;
  },

  async getChapters(params = {}) {
    const { data } = await api.get("courses/chapters/", { params });
    return data;
  },

  async createChapter(payload) {
    const { data } = await api.post("courses/chapters/", payload);
    return data;
  },

  async updateChapter(chapterId, payload) {
    const { data } = await api.patch(`courses/chapters/${chapterId}/`, payload);
    return data;
  },

  async getContentBlocks(params = {}) {
    const { data } = await api.get("courses/content-blocks/", { params });
    return data;
  },

  async createContentBlock(payload) {
    const { data } = await api.post("courses/content-blocks/", payload);
    return data;
  },

  async updateContentBlock(blockId, payload) {
    const { data } = await api.patch(
      `courses/content-blocks/${blockId}/`,
      payload,
    );
    return data;
  },

  async createQuiz(payload) {
    const { data } = await api.post("courses/quizzes/", payload);
    return data;
  },

  async addQuizQuestion(quizId, payload) {
    const { data } = await api.post(
      `courses/quizzes/${quizId}/questions/`,
      payload,
    );
    return data;
  },

  async enroll(courseId) {
    const { data } = await api.post(`courses/courses/${courseId}/enroll/`);
    return data;
  },

  async getMyCourses() {
    const { data } = await api.get("courses/courses/my_courses/");
    return data;
  },

  async getLessons(params = {}) {
    const { data } = await api.get("courses/lessons/", { params });
    return data;
  },

  async submitCourse(courseId) {
    const { data } = await api.post(`courses/courses/${courseId}/submit_review/`);
    return data;
  },

  async createLesson(payload) {
    const { data } = await api.post("courses/lessons/", payload);
    return data;
  },

  async markLessonCompleted(lessonId) {
    const { data } = await api.post(
      `courses/lessons/${lessonId}/mark_completed/`,
    );
    return data;
  },

  async getQuizzes(params = {}) {
    const { data } = await api.get("courses/quizzes/", { params });
    return data;
  },

  async startQuiz(quizId) {
    const { data } = await api.post(`courses/quizzes/${quizId}/start/`);
    return data;
  },

  async submitQuiz(quizId, payload) {
    const { data } = await api.post(
      `courses/quizzes/${quizId}/submit/`,
      payload,
    );
    return data;
  },

  async getQuizAttempts(params = {}) {
    const { data } = await api.get("courses/quiz-attempts/", { params });
    return data;
  },

  async getQuizAttempt(attemptId) {
    const { data } = await api.get(`courses/quiz-attempts/${attemptId}/`);
    return data;
  },

  async getQuizStats(params = {}) {
    const { data } = await api.get("courses/quiz-attempts/stats/", { params });
    return data;
  },

  async getLearnerQuestions(params = {}) {
    const { data } = await api.get("courses/learner-questions/", { params });
    return data;
  },

  async createLearnerQuestion(payload) {
    const { data } = await api.post("courses/learner-questions/", payload);
    return data;
  },
};

export const paginate = (data) => {
  if (Array.isArray(data)) return { results: data, count: data.length };
  return {
    results: data?.results || [],
    count: data?.count ?? data?.results?.length ?? 0,
    next: data?.next || null,
    previous: data?.previous || null,
  };
};
