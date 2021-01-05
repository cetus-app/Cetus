import { types } from "pg";
import {
  Connection, createConnection, getCustomRepository, getRepository, Repository
} from "typeorm";

import { Auth, Integration } from "./entities";
import ApiKey from "./entities/ApiKey.entity";
import Bot from "./entities/Bot.entity";
import { GroupRepository, UserRepository } from "./repositories";

// Set Int8 parser to the normal parse int
types.setTypeParser(types.builtins.INT8, val => parseInt(val, 10));

export class Database {
  constructor () {
    createConnection().then(connection => {
      this.connection = connection;

      this.auth = getRepository(Auth);
      this.users = getCustomRepository(UserRepository);
      this.groups = getCustomRepository(GroupRepository);
      this.keys = getRepository(ApiKey);
      this.integrations = getRepository(Integration);
      this.bots = getRepository(Bot);
    });
  }

  private connection: Connection;

  auth: Repository<Auth>;

  users: UserRepository;

  groups: GroupRepository;

  keys: Repository<ApiKey>;

  integrations: Repository<Integration>;

  bots: Repository<Bot>;
}

export default new Database();
