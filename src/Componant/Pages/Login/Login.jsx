import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import toast from 'react-hot-toast';

const Login = (props) => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const schema = Joi.object({
    email:  Joi.string()
    .email({ tlds: { allow: false } }) 
    .required()
    .messages({
      "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "string.empty": "Email is required.",
        "any.required": "Email is required.",
    }),
    password: Joi.string().required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "any.required": "Password is required.",
      }),
  })
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const { error: validationError } = schema.validate({ email, password });
    if (validationError) {
      setError(validationError.details[0].message);
      return;
    }
    setLoading(true);
    setError(null);
  
    const loginRequest = axios.post(`${props.url}/login`, { email, password });
  
    toast.promise(loginRequest, {
      loading: "Logging in...",
      success: "Login successful!",
      error: (err) =>
        err.response?.data?.message || "Login failed!",
    }).then((response) => {
      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('loginStatusChange'));
      props.setIsLogin(true); 
      navigate('/home', { replace: true }); 
    }).catch((error) => {
      setError(error.response?.data?.message || 'Login failed');
    }).finally(() => {
      setLoading(false);
    });
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      backgroundImage: "url('/loginBG.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                ref={emailRef}
                type="text"
                placeholder="Enter your email"
                className="input input-bordered"
                onFocus={() => setError(null)} 
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                ref={passwordRef}
                type="password"
                placeholder="Enter your password"
                className="input input-bordered"
                onFocus={() => setError(null)} 
              />
            </div>
            {error && (
              <div className="text-red-500 mt-4">
                {error}
              </div>
            )}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn bg-sky-800 text-white hover:bg-sky-700 ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
          <span>I don't have an account </span>
            <Link to='/signup' className="link link-primary">
               Sign Up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
