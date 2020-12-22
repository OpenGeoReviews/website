import React, {useContext} from "react";
import {Redirect} from "react-router-dom";
import qs from "qs";
import {UserContext} from "../../../context";

import EmailConfirmation from "./EmailConfirmation";
import ResetPwdConfirmation from "./ResetPwdConfirmation";
import OAuthConfirmation from "./OAuthConfirmation";
import storage from "../../../storage";

export default ({location}) => {
  const {authData, logIn, signUp} = useContext(UserContext);

  const {op, name, token, oauth_token, oauth_verifier, code} = qs.parse(location.search.substring(1));
  const isConfirmation = (name && token && op);
  const isOAuth = (oauth_token || oauth_verifier || code);
  const isLoggedIn = (authData.token && authData.token.length);
  const force_signup = storage.get('opr-force-signup');

  if (isLoggedIn) {
    return <Redirect to="/profile"/>
  } else if (isConfirmation) {
    const params = {name, token, op};
    if (op === 'signup_confirm') {
      return <EmailConfirmation isLoggedIn={isLoggedIn} params={params} onSuccess={logIn}/>
    } else if (op === 'reset_pwd') {
      return <ResetPwdConfirmation params={params}/>
    }
  } else if (isOAuth) {
    if (authData.name && authData.name.length) {
      return <Redirect to="/profile"/>;
    }
    const params = {oauth_token, oauth_verifier, code, force_signup};
    return <OAuthConfirmation isLoggedIn={isLoggedIn} params={params} onSignUp={signUp} onLogIn={logIn}/>
  }

  return <Redirect to={"/"}/>;
};