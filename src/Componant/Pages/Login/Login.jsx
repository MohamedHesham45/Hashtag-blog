import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import toast from 'react-hot-toast';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; 

const Login = (props) => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [backendError, setBackendError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false); 


  const schema = Joi.object({
    email: Joi.string()
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
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const { error: validationError } = schema.validate({ email, password }, { abortEarly: false });

    let emailErr = null;
    let passwordErr = null;

    if (validationError) {
      validationError.details.forEach(detail => {
        if (detail.path[0] === 'email') emailErr = detail.message;
        if (detail.path[0] === 'password') passwordErr = detail.message;
      });
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setBackendError(null); 

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
      setBackendError(error.response?.data?.message || 'Login failed'); 
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
                className={`input input-bordered ${emailError ? 'input-error' : ''}`}
                onFocus={() => {setEmailError(null);setBackendError(null)}}
              />
              {emailError && (
                <span className="text-red-500 text-sm mt-1">{emailError}</span>
              )}
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`input input-bordered w-full ${passwordError  ? 'input-error' : ''}`}
                  onFocus={() => {setPasswordError(null);setBackendError(null)}}
                />
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
                </span>
              </div>
              {passwordError && (
                <span className="text-red-500 text-sm mt-1">{passwordError}</span>
              )}
            </div>
            
            {backendError && (
              <div className="text-red-500 mt-4">
                {backendError}
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
