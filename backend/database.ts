import {
  Connection, createConnection, getCustomRepository, getRepository, Repository
} from "typeorm";

import { Auth } from "./entities";
import ApiKey from "./entities/ApiKey.entity";
import { GroupRepository, UserRepository } from "./repositories";

export class Database {
  constructor () {
    createConnection().then(connection => {
      this.connection = connection;

      this.auth = getRepository(Auth);
      this.users = getCustomRepository(UserRepository);
      this.groups = getCustomRepository(GroupRepository);
      this.keys = getRepository(ApiKey);
    });
  }

  private connection: Connection;

  auth: Repository<Auth>;

  users: UserRepository;

  groups: GroupRepository;

  keys: Repository<ApiKey>
}

export default new Database();
