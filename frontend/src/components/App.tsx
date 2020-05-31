import React, { FunctionComponent, useEffect, useState } from "react";

import { fetch } from "../api";
import { FullUser } from "../api/types";
import { UserProvider } from "../context/UserContext";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";

const App: FunctionComponent = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FullUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.BACKEND_URL}/account`).then(async res => {
      if (res.ok) {
        setUser(await res.json());
      } else if (res.status !== 401) {
        throw new Error("Non-authentication error");
      }

      // Wait for response to be parsed
      setLoading(false);
    }).catch(e => {
      setError("Error occurred. Try refreshing the page");
      console.error(e);
    });
  }, []);

  if (error) return <div className="has-text-centered">{error}</div>;

  if (loading) return <div className="has-text-centered">Loading..</div>;

  if (!user) return <UnauthenticatedApp />;

  return (
    <UserProvider value={user}>
      <AuthenticatedApp />
    </UserProvider>
  );
};

export default App;
