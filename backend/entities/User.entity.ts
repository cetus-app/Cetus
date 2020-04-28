// Used to present a user on the service
import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, PrimaryColumn} from "typeorm";
import Auth from "./Auth.entity";
import {Group} from "./Group.entity";

@Entity()
export class User {
	// UUID V4
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ length: 30, unique: true})
	username: string;

	// The Bcrypt hash of the password. These are always 60 characters long.
	@Column({ length: 60, select: false })
	hash: string;

	@Column({ length: 50, unique: true, /*select: false*/})
	email: string;

	@Column({type: "timestamptz", default: "NOW()"})
	created: Date;

	@OneToMany(() => Auth, auth => auth.user)
	auth: Auth[];

	@OneToMany(type => Group, grp => grp.owner)
	groups: Group[];
}

export default User;
