// Allows emails to be sent, manages email verification
import {Request, Response} from "express";

import Roblox from "../api/roblox/Roblox";
import database from "../database";
import User from "../entities/User.entity";

export default class UserService {
  constructor (private request: Request, private response: Response) {
  }

}
