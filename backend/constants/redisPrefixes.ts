const REDIS_PREFIXES = {
  verification: "verification-",
  emailVerification: "emailVerification-",
  passwordReset: "passwordReset-",
  groupCache: "groupCache-",
  userGroupsCache: "userGroupsCache-",
  groupRolesCache: "groupRolesCache-",
  idToUsernameCache: "idToUsernameCache-",
  usernameToIdCache: "usernameToIdCache-",
  userImageCache: "userImageCache-",
  groupImageCache: "groupImageCache-",
  aquariusLink: "aquarius-link-"
};

export default REDIS_PREFIXES;
