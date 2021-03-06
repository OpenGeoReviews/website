import React, {useEffect, useState} from "react";

import AuthContext from "./AuthContext";
import auth from "../../../../api/auth";
import storage from "../../../../libs/cookies";

export default (props) => {
  const authName = storage.get('opr-nickname') || "";
  const initialAuthData = {
    data: {
      token: storage.get('opr-token') || "",
      provider: storage.get('opr-provider') || "",
      name: authName,
    },
    actions: {
      doLogout: false,
    }
  };
  const [authData, setAuthData] = useState(initialAuthData);

  const signUp = ({ name }) => {
    storage.set('opr-nickname', name);
    setAuthData((state) => {
      return {
        ...state,
        data: {
          ...state.data,
          name,
        }
      }
    });
  };

  const logIn = ({name, provider = "", token = ""}) => {
    storage.set('opr-nickname', name);
    storage.set('opr-provider', provider);
    storage.set('opr-token', token);

    setAuthData((state) => {
      return {
        ...state,
        data: {
          name,
          provider,
          token,
        }
      }
    })
  };

  const logOut = () => {
    setAuthData((state) => {
      return {
        ...state,
        actions: {
          ...state.actions,
          doLogout: true,
        }
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await auth.checkToken(authData.data);
        if (!data || data.result !== 'OK') {
          logOut(authData.data.name);
        }
      } catch(err) {
        logOut(authData.data.name);
      }
    };

    if (authData.data.token) {
      fetchData();
    }
  }, [authData.data.token]);

  useEffect(() => {
    const fetchData = async () => {
      await auth.logOut(authData.data.name);
    };

    if (authData.actions.doLogout) {
      storage.clear();
      setAuthData((state) => {
        return {
          data: {
            name: "",
            token: "",
          },
          actions: {
            ...state,
            doLogout: false,
          },
        };
      });

      fetchData();
    }
  }, [authData.actions.doLogout]);

  const contextValues = {
    authData: authData.data,
    signUp,
    logOut,
    logIn,
  };

  return <AuthContext.Provider value={contextValues}>
    {props.children}
  </AuthContext.Provider>;
};
