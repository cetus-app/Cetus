// Represents an authentication token
import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export default abstract class Key {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  token: string;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;
}
