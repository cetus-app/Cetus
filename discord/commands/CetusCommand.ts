import { CommandGeneratorFunction, CommandOptions } from "eris";

import CetusClient from "../CetusClient";

export default abstract class CetusCommand {
  protected constructor (label: string, options: CommandOptions, client: CetusClient) {
    this.label = label;
    this.options = options;
    this.client = client;
  }

  public label: string;

  public options: CommandOptions;

  protected client: CetusClient;

  public abstract run: CommandGeneratorFunction;
}
