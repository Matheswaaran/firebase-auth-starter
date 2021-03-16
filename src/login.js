import React, { useState } from 'react'
import logo from './logo.svg';
import fireBaseApp from "./firebase";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = () => {
    fireBaseApp
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        localStorage.clear();
      })
      .catch((error) => console.log(error));
  };

  const handleLogin = () => {
    fireBaseApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (result) => {
      let token = await result.user.getIdToken();
      // let uid = await result.user.uid;
      localStorage.setItem("token", token);
      setLoggedIn(true);
    })
    .catch((error) => console.log(error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Firebase Login Example
        </p>
        {loggedIn ? (
          <div className="logout-form">
            <span>Logged in successfully</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <form>
            <div className="login-form">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
              <button onClick={handleLogin}>Login</button>
            </div>
          </form>
        )}
      </header>
    </div>
  )
}

export default Login
