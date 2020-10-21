import React, {useContext} from "react";
import {Redirect} from "react-router-dom";
import qs from "qs";
import {UserContext} from "../../context";

import EmailConfirmation from "./EmailConfirmation";
import ResetPwdConfirmation from "./ResetPwdConfirmation";
import OAuthConfirmation from "./OAuthConfirmation";

export default ({location}) => {
  const {authData, logIn} = useContext(UserContext);

  const {op, name, token, oauth_token, oauth_verifier, code} = qs.parse(location.search.substring(1));
  const isConfirmation = (name && token && op);
  const isOAuth = (oauth_token || oauth_verifier || code);
  const isLoggedIn = (authData.token && authData.token.length);

  if (isConfirmation) {
    const params = {name, token};
    if (op === 'signup_confirm') {
      return <EmailConfirmation isLoggedIn={isLoggedIn} params={params} onSuccess={logIn}/>
    } else if (op === 'reset_pwd') {
      return <ResetPwdConfirmation params={params}/>
    }
  } else if (isOAuth) {
    const params = {oauth_token, oauth_verifier, code};
    return <OAuthConfirmation isLoggedIn={isLoggedIn} params={params}/>
  }


  return <Redirect to={"/"}/>;
};
