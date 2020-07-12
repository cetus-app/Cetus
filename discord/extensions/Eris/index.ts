import "./Member";

declare module "eris" {
  interface Member {
    computeGroupRoles (): Promise<{ verified: boolean, add: Role[], remove: Role[], unusualConfig: boolean }>;

    setGroupRoles (): Promise<{ verified: boolean, added: Role[], removed: Role[], unusualConfig: boolean }>;
  }
}
