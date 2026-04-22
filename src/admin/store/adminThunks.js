import { loginStart, loginSuccess, loginFailure } from "./adminSlice";
import { adminLoginApi } from "../services/adminServices";

export const adminLogin = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await adminLoginApi(credentials);
    dispatch(loginSuccess({ admin: data.admin, token: data.token }));
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    dispatch(loginFailure(message));
    return { success: false, message };
  }
};
