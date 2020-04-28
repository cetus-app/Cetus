// used to represent "linked" groups
// Used to present a user on the service

// TODO: Have a look at eager relationships - some of these would probably suit being made Eager.
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToOne
} from "typeorm";
import User from "./User.entity";
import ApiKey from "./ApiKey.Entity";
import Integration from "./Integration.entity";


@Entity()
export class Group {
	// UUID V4
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	robloxId: number;

	@Column({ length: 30, unique: true})
	username: string;

	@Column({type: "timestamptz", default: "NOW()"})
	created: Date;

	// TO consider;
	// If we want to add additional permissions the owner field could be replaced by a join table
	// With permission fields. One of those permissions could be ownership.
	@OneToMany(type => ApiKey, key => key.group)
	keys: ApiKey[];

	@OneToMany(type => Integration, integration => integration.group)
	integrations: Integration[];

	@ManyToOne(() => User, (user: User) => user.groups)
	users: User[];

	// Possible problem: What happens when Group ownership is transferred?
	@ManyToOne(() => User, (user: User) => user.groups)
	owner: User;
}

export default Group;
