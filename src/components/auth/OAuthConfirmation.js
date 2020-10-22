import React, {useEffect, useState} from "react";
import auth from "../../api/auth";

export default ({isLoggedIn, params, onSuccess}) => {
  const [errorMsg, setError] = useState('');

  if (isLoggedIn) {
    return <div className="auth-container" id="opr-app">
      <h1>Email is confirmed</h1>
      <p>Your email is successfully confirmed and you can start contributing to OpenPlaceReviews.</p>
      <p>Please visit <a href="/map.html">map</a> to find places to contribute.</p>
    </div>
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {data: confirmData} = await auth.oauthConfirm({
          token: params.oauth_token,
          oauthVerifier: params.oauth_verifier,
          code: params.code,
        });
        const email = confirmData.details.email;
        if (email && email.length) {
          delete confirmData.details.email;
        }

        const {data: status} = await auth.checkName(confirmData.nickname);

        if (status.blockchain !== 'ok') {
          await auth.signUp({
            name: confirmData.nickname,
            oauthAccessToken: confirmData.accessToken,
            userDetails: confirmData.details,
            email,
          });
        }

        const {data} = await auth.logIn({
          name: confirmData.nickname,
          oauthAccessToken: confirmData.accessToken
        });

        onSuccess({
          name: confirmData.nickname,
          token: data.eval.privatekey,
        });
      } catch (error) {
        let errMessage = "Error while processing request. Please try again later.";
        if (error.response && error.response.data){
          errMessage = error.response.data.message;
        }

        setError(errMessage);
      }
    };

    if (params.token || params.oauthVerifier || params.code) {
      fetchData();
    }
  }, []);

  if (errorMsg) {
    return <div className="auth-container" id="opr-app">
      <h1>OAuth login failed</h1>
      <p>{errorMsg}</p>
    </div>
  }

  return <div className="auth-container" id="opr-app">
    Checking token...
  </div>;
}
