// Stores configuration data for any applicable integrations.
// may want to look at JSON fields or something as it's likely the shape of the data will vary by integration.
// An alternative would be to have a different entity for each integration, I guess?
import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne
} from "typeorm";
import {Group} from "./Group.entity";

@Entity()
export class Integration {
	// UUID V4
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(type => Group, grp => grp.integrations)
	group: Group;
}

export default Integration;
