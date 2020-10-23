import React, {useEffect, useState} from "react";
import auth from "../../api/auth";
import {Redirect} from "react-router-dom";
import OAuthConfirmationForm from "./OAuthConfirmationForm";

export default ({isLoggedIn, params, onSuccess}) => {
  const [errorMsg, setError] = useState('');
  const [confirmData, setConfirmData] = useState(null);

  const defaultAlertMsg = "Error while processing request. Please try again later.";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {data: confirmData} = await auth.oauthConfirm({
          token: params.oauth_token,
          oauthVerifier: params.oauth_verifier,
          code: params.code,
        });

        if (confirmData.possibeSignups.length) {
          const {data: loginData} = await auth.logIn({
            name: confirmData.possibeSignups[0],
            oauthAccessToken: confirmData.accessToken
          });

          onSuccess({
            name: confirmData.possibeSignups[0],
            token: loginData.eval.privatekey,
          });
        } else {
          setConfirmData(confirmData);
        }
      } catch (error) {
        if (error.response && error.response.data) {
          setError(error.response.data.message);
        } else {
          setError(defaultAlertMsg);
        }
      }
    };

    if (!isLoggedIn && !confirmData && (params.code || params.oauth_token || params.oauth_verifier)) {
      fetchData();
    }
  }, []);

  if (isLoggedIn) {
    return <Redirect to={"/profile"}/>
  }

  if (errorMsg) {
    return <div className="auth-container" id="opr-app">
      <h1>OAuth login failed</h1>
      <p>{errorMsg}</p>
    </div>
  }

  if (confirmData) {

    return <div className="auth-container" id="opr-app">
      <h1>Login</h1>

      <OAuthConfirmationForm
        oauthNickname={confirmData.oauthNickname}
        oauthAccessToken={confirmData.accessToken}
        userDetails={confirmData.details}
        onSuccess={onSuccess}
        onError={setError}
      />
    </div>;
  }

  return <div className="auth-container" id="opr-app">
    Checking token...
  </div>;
}