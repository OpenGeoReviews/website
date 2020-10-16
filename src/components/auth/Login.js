import React, {useContext, useState} from 'react';
import {Link} from "react-router-dom";

import iconNickname from "../../assets/images/icon-nickname.png";
import {UserContext} from "../../context";

import LoginForm from "./LoginForm";


export default () => {
  const {authData, logIn} = useContext(UserContext);
  const [isFormHidden, setVisibilityForm] = useState(true);

  // TODO: Refactor duplicate code to auth base page.
  if (authData.name && !authData.isVerified) {
    return <div className="auth-container" id="opr-app">
      <p>
        Please check your email to confirm account.
      </p>
    </div>;
  }

  return <div className="auth-container" id="opr-app">
    <h1>Login</h1>

    <p>Don't have an account? <Link to="/signup">Create account</Link></p>

    <div className="socialaccount_ballot">
      <p>Select login method:</p>
      <ul className="socialaccount_providers">
        <li>
          <div className="method-auth-nickname" onClick={()=> setVisibilityForm(true)}>
            <img src={iconNickname} alt="Nickname icon"/>
            <div className="nickname-method">
              Use nickname and password
            </div>
          </div>
        </li>
      </ul>
    </div>

    {isFormHidden && <LoginForm onSuccess={logIn} />}
  </div>;
};