import { useContext, useState } from "react";
import "../styles/ResetPassword.css";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

const ResetPassword = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div className="reset-password-page">
        <div className="reset-password-container">
          <h2>Reset Password</h2>
          <p>Enter your new Password </p>
          <form className="reset-password-form" onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="reset-input"
            />
            <input
              type="password"
              placeholder="Confirm New password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="reset-input"
            />
            <button type="submit" className="reset-btn">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
