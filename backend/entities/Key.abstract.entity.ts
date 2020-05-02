// Represents an authentication token
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default abstract class Key {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ length: 100 })
  token: string;

  @Column({
    type: "timestamptz",
    default: "NOW()"
  })
  created: Date;
}
