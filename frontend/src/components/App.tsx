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
      setUser(await res.json());


      // Wait for response to be parsed
      setLoading(false);
    }).catch(e => {
      if (e.response.status === 401) {
        // Show unauthenticated
        setLoading(false);
        return false;
      }
      setError("Error occurred. Try refreshing the page");
      throw new Error(`Non-authentication error: ${e.response.status}`);
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
