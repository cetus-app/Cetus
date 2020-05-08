import {
  Connection, createConnection, getCustomRepository, getRepository, Repository
} from "typeorm";

import { Auth } from "./entities";
import { GroupRepository, UserRepository } from "./repositories";

export class Database {
  constructor () {
    createConnection().then(connection => {
      this.connection = connection;

      this.auth = getRepository(Auth);
      this.users = getCustomRepository(UserRepository);
      this.groups = getCustomRepository(GroupRepository);
    });
  }

  private connection: Connection;

  auth: Repository<Auth>;

  users: UserRepository;

  groups: GroupRepository;
}

export default new Database();
