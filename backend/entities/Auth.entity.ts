// Represents an authentication token
import {Entity, ManyToOne} from "typeorm";
import User from "./User.entity";
import Key from "./Key.abstract.entity";

@Entity()
export class Auth extends Key{
	@ManyToOne(() => User, (user: User) => user.auth)
	user: User;
}

export default Auth;
