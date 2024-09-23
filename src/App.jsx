import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import NavBar from "./Componant/NavBar";
import Posts from "./Componant/Pages/Posts/Posts";
import Profile from "./Componant/Pages/Profile/Profile";
import Login from "./Componant/Pages/Login/Login";
import SignUp from "./Componant/Pages/SignUp/SignUp";
import { useState, useEffect } from "react";
import ProdectedRouter from "./Componant/ProdectedRouter";
import { Toaster } from "react-hot-toast";

function App() {
  const url = "https://posts-api-six.vercel.app";
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(!!token);
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
          },
        }}
      />
      <BrowserRouter>
        <NavBar url={url} isLogin={isLogin} setIsLogin={setIsLogin} />
        <Routes>
          <Route
            path="/"
            element={
              isLogin ? (
                <Navigate to="/home" />
              ) : (
                <Login url={url} setIsLogin={setIsLogin} />
              )
            }
          />
          <Route path="/signup" element={<SignUp url={url} />} />

          <Route
            path="/home"
            element={
              <ProdectedRouter isLogin={isLogin}>
                <Posts url={url} />
              </ProdectedRouter>
            }
          />
          <Route
            path="/profile"
            element={
              <ProdectedRouter isLogin={isLogin}>
                <Profile url={url} />
              </ProdectedRouter>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
