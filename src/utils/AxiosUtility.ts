import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
const clientInfo =
  typeof window !== "undefined" ? localStorage.getItem("client-info") : null;
const parsed = JSON.parse(clientInfo!);
const axiosInstance = () =>
  axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "user-secret": token,
      "client-id": parsed?.id || 0,
    },
  });

const handleError = (error: any) => {
  console.log(".....", error);
  // toast('Soemthing went wrong! Please try again.');
  throw error;
};

const GET = async (endPoint: string, config?: any) => {
  try {
    const response = await axiosInstance().get(endPoint, config);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const POST = async (endPoint: string, data: any, config?: any) => {
  try {
    const response = await axiosInstance().post(endPoint, data, config);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const DELETE = async (endPoint: string, config?: any) => {
  try {
    const response = await axiosInstance().delete(endPoint, config);
    return response;
  } catch (error: any) {
    const { code, message } = error?.response?.data || {};

    if (code === "SENDER_IN_USE") {
      const toastId = "sender-in-use-warning";
      if (!toast.isActive(toastId)) {
        toast.warn(message || "Sender is already in use", {
          toastId,
          autoClose: false,
        });
      }
    } else {
      handleError(error);
    }
  }
};

const PUT = async (endPoint: string, data: any, config?: any) => {
  try {
    const response = await axiosInstance().put(endPoint, data, config);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const PATCH = async (endPoint: string, data: any, config?: any) => {
  try {
    const response = await axiosInstance().patch(endPoint, data, config);
    return response;
  } catch (error: any) {
    handleError(error);
  }
};

export { GET, POST, DELETE, PUT, PATCH };
