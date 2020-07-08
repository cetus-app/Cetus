import { CommandGeneratorFunction, CommandOptions } from "eris";

export default abstract class CetusCommand {
  protected constructor (label: string, options: CommandOptions) {
    this.label = label;
    this.options = options;
  }

  public label: string;

  public options: CommandOptions;

  public abstract run: CommandGeneratorFunction;
}
