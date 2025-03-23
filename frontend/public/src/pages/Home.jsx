import { useContext } from "react";
import Hero from "../components/Hero";
import Instructor from "../components/Instructor";
import Technologies from "../components/Technologies";
import "../styles/Home.css";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import Footer from "../layout/Footer";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const HandlleLogout = async () => {
    try {
      const respone = await axios.get("http://localhost:4000/api/v1/logout", {
        withCredentials: true,
      });
      toast.success(respone.data.message);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      toast.error(error.respone.data.message);
      console.error(error);
    }
  };
  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }
  return (
    <div className="home">
      <Hero />
      <Instructor />
      <Technologies />
      <Footer />
      <button onClick={HandlleLogout}>Logout</button>
    </div>
  );
};

export default Home;
