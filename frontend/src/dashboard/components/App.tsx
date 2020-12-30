import React, { FunctionComponent, useEffect, useState } from "react";
import "../assets/scss/dashboard.scss";
import { BrowserRouter } from "react-router-dom";

import { fetch } from "../api";
import { FullUser } from "../api/types";
import { UserProvider } from "../context/UserContext";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import Navbar from "./shared/Navbar";

const App: FunctionComponent = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUserO] = useState<FullUser | null>(null);
  const [error, setError] = useState("");
  function setUser (...content: any[]) {
    // @ts-ignore
    setUserO(...content);
  }
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.BACKEND_URL}/account`).then(async res => {
      setUser(await res.json());


      // Wait for response to be parsed
      setLoading(false);
    }).catch(e => {
      if (e.response && e.response.status === 401) {
        // Show unauthenticated
        setLoading(false);
        return false;
      }
      setError("Error occurred. Try refreshing the page");
      throw new Error(`Non-authentication error: ${e.response && e.response.status}`);
    });
  }, []);

  if (error) return <div className="has-text-centered">{error}</div>;

  if (loading) return <div className="has-text-centered">Loading...</div>;

  return (
    <BrowserRouter basename="/dashboard">
      <Navbar />
      {
          user
            ? (
              <UserProvider value={user}>
                <AuthenticatedApp />
              </UserProvider>
            )
            : (<UnauthenticatedApp setUser={setUser} />)
        }
    </BrowserRouter>
  );
};

export default App;
