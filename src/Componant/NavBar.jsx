import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function NavBar(props) {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    props.setIsLogin(false);
    setUser(null);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, [props.isLogin]);

  return (
    <>
      <div className="bg-sky-800 sticky top-0 z-30">
        <div className="container mx-auto">
          <div className="navbar">
            <div className="flex-1">
              <Link to='/home' className="btn btn-ghost text-xl">
                <img
                  alt="Logo"
                  src="logo.png"
                  className="h-8"
                />
              </Link>
            </div>

            {props.isLogin ? (
              <div className="flex-none">
                {user && <strong className="text-white mr-2 text-xl">Hi, {user.name}</strong>}
                <div className="dropdown dropdown-end ">
                

                  <label
                    tabIndex={0}
                    role="button"
                    className=""
                  >
                  <div className="flex items-center   avatar ">

                    <div className="w-14 btn btn-circle ">
                      {user && <img alt="User avatar" src={user.image} />}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white "
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  </label>
                  <ul
                    tabIndex={0}
                    className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <Link to="/profile">Your Posts</Link>
                    </li>
                    <li onClick={handleLogout}>
                      <Link to='/'>Logout 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                        </svg>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-none"></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
