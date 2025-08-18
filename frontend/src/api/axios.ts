import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// activity service
export const activityApi = axios.create({
  baseURL: "http://localhost:8081/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// leave service
export const leaveApi = axios.create({
  baseURL: "http://localhost:8083/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// message service
export const messageApi = axios.create({
  baseURL: "http://localhost:8084/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// notification service
export const notificationApi = axios.create({
  baseURL: "http://localhost:8085/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// project service
export const projectApi = axios.create({
  baseURL: "http://localhost:8086/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// report service
export const reportApi = axios.create({
  baseURL: "http://localhost:8087/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// application service
export const applicationApi = axios.create({
  baseURL: "http://localhost:8082/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// task service
export const taskApi = axios.create({
  baseURL: "http://localhost:8088/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
