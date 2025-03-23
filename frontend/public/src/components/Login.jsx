import { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const handlelogin = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/login",
        data,
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
      navigateTo("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <>
      <form
        className="auth-form"
        onSubmit={handleSubmit((data) => handlelogin(data))}
      >
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          required
          {...register("email")}
        />
        <input
          type="password"
          placeholder="Password"
          required
          {...register("password")}
        />

        <p className="forgot-password">
          <Link to="/password/forgot">Forgot your password?</Link>
        </p>
        <button type="submit">Login</button>
      </form>
    </>
  );
};

export default Login;
