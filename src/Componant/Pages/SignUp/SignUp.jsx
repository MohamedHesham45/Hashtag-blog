import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import toast from 'react-hot-toast';

const SignUp = (props) => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const imageRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const schema = Joi.object({
    name: Joi.string()
      .required()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        "string.base": "Name must be a string.",
        "string.pattern.base": "Name must only contain alphabetic characters and spaces.",
        "string.empty": "Name is required.",
        "any.required": "Name is required.",
      }),
    email:  Joi.string()
    .email({ tlds: { allow: false } }) 
    .required()
    .messages({
      "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "string.empty": "Email is required.",
        "any.required": "Email is required.",
    }),
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/)
      .messages({
        "string.base": "Password must be a string.",
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character(@$!%*?).",
        "string.min": "Password must be at least 8 characters long.",
        "string.empty": "Password is required.",
        "any.required": "Password is required.",
      }),
    image: Joi.any().required().messages({
      "any.required": "Profile picture is required."
    })
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const image = imageRef.current.files[0];
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('image', image);
  
    const { error: validationError } = schema.validate({ name, email, password, image });
    if (validationError) {
      setError(validationError.details[0].message);
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const signUpRequest = axios.post(`${props.url}/signup`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    toast.promise(signUpRequest, {
      loading: "Signing up...",
      success: "Signup successful!",
      error: (err) =>
        err.response?.data?.message || "Signup failed!",
    })
    .then((response) => {
      navigate('/', { replace: true }); 
    })
    .catch((error) => {
      setError(error.response?.data?.message || 'Signup failed');
    })
    .finally(() => {
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
          <h2 className="text-center text-2xl font-bold mb-4">Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                placeholder="Enter your name"
                className="input input-bordered"
                
                onFocus={() => setError(null)}
              />
            </div>
            <div className="form-control mt-4">
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
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Profile Picture</span>
              </label>
              <input
                ref={imageRef}
                type="file"
                className="file-input file-input-bordered w-full mb-4"
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
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <span>Already have an account? </span>
            <Link to='/' className="link link-primary">
              Login now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 
