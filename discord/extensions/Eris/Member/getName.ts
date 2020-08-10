import { Member } from "eris";

Member.prototype.getName = function getName () {
  return this.nick ?? `${this.username}#${this.discriminator}`;
};
