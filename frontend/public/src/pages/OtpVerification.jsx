import { useContext, useState } from "react";
import "../styles/OtpVerification.css";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { email, phone } = useParams();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const otpLength = otp.length;

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // Allow only single-digit numbers

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < otpLength - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOTP = otp.join("").toString();
    console.log(enteredOTP);
    if (enteredOTP.length < otpLength) {
      toast.error("Please enter the full OTP.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/otp-verification",
        { email, otp: enteredOTP, phone },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(response.data.message);
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="otp-verification-page">
      <div className="otp-container">
        <h1>OTP Verification</h1>
        <p>Enter the 5-digit OTP sent to your registered email and phone.</p>
        <form onSubmit={handleOtpVerification} className="otp-form">
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="verify-button">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
