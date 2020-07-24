import { FunctionComponent } from "react";

import { PartialUser } from "../../api/types";

interface GreetingProps {
  user: PartialUser
}


export const Greeting: FunctionComponent<GreetingProps> = ({ toLogin, setUser }) => <h1 />;
