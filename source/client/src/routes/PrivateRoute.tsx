import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";

const PrivateRoute: React.FC = () => {
  const { state } = useAuth();
  console.log("PrivateRoute", state?.isAuthenticated);

  useEffect(() => {
    if (state?.isAuthenticated) {
      console.log("User is authenticated", state);
    } else {
      console.log("User is not authenticated", state);
    }
  }, [state]);

  return state?.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;

};

export default PrivateRoute;
