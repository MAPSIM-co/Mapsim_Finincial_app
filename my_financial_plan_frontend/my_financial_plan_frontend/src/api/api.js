import axios from "axios";

// تشخیص اتوماتیک آدرس backend
const hostname = window.location.hostname;

// اگر frontend روی localhost اجرا شده:
let API_URL = "http://localhost:8001";

// اگر از یک IP مثل 172.20.10.2 اجرا شده (موبایل):
if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  API_URL = `http://${hostname}:8001`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
