import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class Guild {
  @PrimaryColumn()
  id: string;

  @Column({
    type: "text",
    nullable: true
  })
  groupKey?: string;
}
