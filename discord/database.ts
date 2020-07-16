import {
  Connection, createConnection, getRepository, Repository
} from "typeorm";

import { Guild } from "./entities";

export class Database {
  constructor () {
    createConnection().then(connection => {
      this.connection = connection;

      this.guilds = getRepository(Guild);
    });
  }

  private connection: Connection;

  guilds: Repository<Guild>;
}

export default new Database();
