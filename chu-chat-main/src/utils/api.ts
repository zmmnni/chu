import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
});

// 요청 인터셉터 - 요청 전 로그
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 응답 후 로그
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] 응답 성공: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] 요청 타임아웃:', error.config.url);
    } else if (error.response) {
      console.error(`[API] 응답 에러: ${error.response.status} ${error.config.url}`, error.response.data);
    } else if (error.request) {
      console.error('[API] 서버 연결 실패:', error.config.url, '서버가 실행 중인지 확인하세요.');
    } else {
      console.error('[API] 요청 설정 에러:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  health: {
    check: async () => {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      return response.data;
    },
  },
  messages: {
    post: async (data: { mentor_code: string; content: string; chat_id?: string }) => {
      const response = await apiClient.post('/messages', data);
      return response.data;
    },
  },
  stock: {
    get: async (company: string) => {
      const response = await apiClient.post('/stock', { company });
      return response.data;
    },
  },
};

