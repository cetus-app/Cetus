import { Member } from "eris";

Member.prototype.setGroupRoles = async function setGroupRoles () {
  const {
    verified, add, remove, unusualConfig
  } = await this.computeGroupRoles();

  const addP = add.map(r => this.addRole(r.id));
  const removeP = remove.map(r => this.removeRole(r.id));
  await Promise.all([...addP, ...removeP]);

  return {
    verified,
    added: add,
    removed: remove,
    unusualConfig
  };
};
