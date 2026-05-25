import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

import { setToken } from "../../../slices/authSlice";
import { setUser } from "../../../slices/profileSlice";
import {
  clearAuthSession,
  getStoredToken,
  isTokenExpired,
} from "../../../services/apiConnector";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = getStoredToken();

    if (storedToken && isTokenExpired(storedToken)) {
      clearAuthSession();
      dispatch(setToken(null));
      dispatch(setUser(null));

      if (location.pathname !== "/login") {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      }
    }
  }, [dispatch, navigate, location.pathname]);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearAuthSession();
      dispatch(setToken(null));
      dispatch(setUser(null));
    }
  }, [token, dispatch]);

  return children;
};

export default AuthInitializer;
