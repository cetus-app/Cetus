// Represents an authentication token
import {Entity, Column, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import User from "./User.entity";

@Entity()
export abstract class Key {
	@PrimaryGeneratedColumn("uuid")
	id: number;

	@Column({ length: 100 })
	token: string;

	@Column({type: "timestamptz", default: "NOW()"})
	created: Date;
}

export default Key;
