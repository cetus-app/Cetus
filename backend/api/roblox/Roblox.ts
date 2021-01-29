import { max, min } from "class-validator";
import realFetch, { Headers, RequestInit } from "node-fetch";
import { BadRequestError, ForbiddenError } from "routing-controllers";

import { redisPrefixes } from "../../constants";
import database from "../../database";
import { Group } from "../../entities";
import { ExternalHttpError, redis } from "../../shared";
import { multiGet } from "../../shared/redis";
import camelify from "../../shared/util/camelify";
import checkStatus from "../../shared/util/fetchCheckStatus";
import {
  FullRobloxRole,
  GroupPermissions,
  RobloxGroup,
  RobloxGroupIcon,
  RobloxUser,
  Shout,
  UserRobloxGroup
} from "../../types";
import RobloxBot from "./RobloxBot";

export const fetch = (url: string, opt?: RequestInit) => {
  const newOpt = opt || {};

  console.log(`${newOpt.method || "GET"} ${url}`);

  if (newOpt.body) {
    newOpt.headers = new Headers(newOpt.headers);
    newOpt.headers.append("Content-Type", "application/json");
  }

  return realFetch(url, opt);
};

export const BASE_API_URL = "https://api.roblox.com";
export const USERS_API_URL = "https://users.roblox.com";
export const GROUPS_API_URL = "https://groups.roblox.com";
export const THUMBNAILS_API_URL = "https://thumbnails.roblox.com";
export const AUTH_API_URL = "https://auth.roblox.com";

export default class Roblox {
  readonly bot: RobloxBot;

  private readonly group: Group;

  private static readonly instances: Map<string, Roblox> = new Map<string, Roblox>();

  private constructor (bot: RobloxBot, group: Group) {
    this.bot = bot;
    this.group = group;
  }

  static async getClient (groupId: string): Promise<Roblox> {
    let client = this.instances.get(groupId);

    if (!client) {
      const group = await database.groups.getGroupWithCookie(groupId);

      if (!group) throw new Error(`Group ${groupId} not found`);

      if (!group.bot || group.bot.dead) throw new Error(`Group ${groupId} does not have active bot`);

      const botClient = await RobloxBot.getClient(group.bot);
      client = new Roblox(botClient, group);

      this.instances.set(group.id, client);
    }

    return client;
  }

  static async getUsernameFromId (id: number): Promise<string | undefined> {
    const key = redisPrefixes.idToUsernameCache + id;
    const cached = await redis.get(key);
    if (cached) return cached;

    const username = await this.fetchUsernameFromId(id);

    if (username) {
      await redis.set(key, username, "EX", 60 * 60 * 2);
      return username;
    }

    return undefined;
  }

  static fetchUsernameFromId (id: number): Promise<string | undefined> {
    return fetch(`${USERS_API_URL}/v1/users/${id}`).then(checkStatus).then(res => res && res.json())
      .then(data => (data?.isBanned ? undefined : data?.name))
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        // (before API changes 28.01.2021, 404 seems to be the default for invalid IDs/not found now)
        if (e instanceof ExternalHttpError && (e.response.status === 400 || e.response.status === 404)) return undefined;

        console.error(`Error while fetching username from ID ${id}`, e);
        return undefined;
      });
  }

  static async getUserImage (id: number): Promise<string | undefined> {
    const key = redisPrefixes.userImageCache + id;
    const cached = await redis.get(key);
    if (cached) return cached;

    const imageUrl = await this.fetchUserImage(id);

    if (imageUrl) {
      await redis.set(key, imageUrl, "EX", 60 * 60 * 5);
      return imageUrl;
    }

    return undefined;
  }

  static fetchUserImage (id: number): Promise<string | undefined> {
    return fetch(`${THUMBNAILS_API_URL}/v1/users/avatar-bust?userIds=${id}&size=75x75&format=Png&isCircular=true`).then(checkStatus).then(res => res && res.json())
      .then(data => data.data && data.data[0] && data.data[0].imageUrl)
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        if (e instanceof ExternalHttpError && e.response.status === 400) return undefined;

        console.error(`Error while fetching user bust from ID ${id}`, e);
        return undefined;
      });
  }

  static async getGroupsImage (groupIds: number[]): Promise<RobloxGroupIcon[]> {
    // Initially it's all of the ids
    const toFetch: number[] = groupIds;
    // Get cached
    const cachedGroups = await multiGet<RobloxGroupIcon>(redisPrefixes.groupImageCache, groupIds);

    // Remove all of the retrieved groups from those left to be fetched
    for (const fetchedGrp of cachedGroups) {
      const pos = toFetch.indexOf(fetchedGrp.id);
      if (pos !== -1) {
        toFetch.splice(pos, 1);
      }
    }
    // Either empty or full of the cached groups.
    const out: RobloxGroupIcon[] = cachedGroups;

    if (toFetch.length !== 0) {
      // Fetch remaining
      const resp = await this.fetchGroupsImage(toFetch);
      // Set fetched
      if (resp && Array.isArray(resp)) {
        for (const grp of resp) {
          out.push(grp);
          if (grp && grp.id) {
            redis.set(redisPrefixes.groupImageCache + grp.id, JSON.stringify(grp), "EX", 60 * 30).catch(console.error);
          }
        }
      }
    }

    // Return all
    return out;
  }


  /**
   * Fetches the thumbnail urls of the given groups.
   * @param ids - The group ids to get the icons for.
   */
  static fetchGroupsImage (ids: number[]): Promise<RobloxGroupIcon[]> {
    const idString = ids.join(",");
    return fetch(`${THUMBNAILS_API_URL}/v1/groups/icons?groupIds=${idString}&size=150x150&format=Png`)
      .then(checkStatus).then(res => res && res.json())
      .then(data => {
        if (data.data) {
          // imageUrl is null for "blocked" images.
          return data.data.map(({ imageUrl, targetId }: any) => ({
            url: imageUrl || "",
            id: targetId
          }));
        }
        return [];
      })
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        if (e instanceof ExternalHttpError && e.response.status === 400) return [];

        console.error(`Error while fetching group images from ID ${ids}`, e);
        return undefined;
      });
  }

  static async getIdFromUsername (username: string): Promise<number | undefined> {
    const key = redisPrefixes.usernameToIdCache + username;
    const cached = await redis.get(key);
    if (cached) return parseInt(cached, 10);

    const id = await this.fetchIdFromUsername(username);

    if (id) {
      await redis.set(key, `${id}`, "EX", 60 * 60 * 24);
      return id;
    }

    return undefined;
  }

  static async fetchIdFromUsername (username: string): Promise<number | undefined> {
    try {
      const body = {
        usernames: [username],
        excludeBannedUsers: true
      };

      const { data } = await fetch(`${USERS_API_URL}/v1/usernames/users`, {
        method: "POST",
        body: JSON.stringify(body)
      }).then(checkStatus).then(res => res && res.json());
      if (data) {
        if (data.length < 1) return undefined;

        if (data[0].id) return data[0].id;
      }

      // Is caught below
      throw new Error();
    } catch (e) {
      console.error(e);
      throw new Error("Error while getting ID from username");
    }
  }

  static async getBlurb (id: number): Promise<string> {
    const url = `${USERS_API_URL}/v1/users/${id}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error("Invalid ID passed to `getBlurb`");

    return data.description;
  }

  // Caches
  static async getGroup (groupId: number): Promise<RobloxGroup | undefined> {
    const key = redisPrefixes.groupCache + groupId;
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as RobloxGroup;
    }
    const group = await this.fetchGroup(groupId);
    if (group) {
      // One hour cache time
      await redis.set(key, JSON.stringify(group), "EX", 60 * 60);
      return group;
    }
    return undefined;
  }

  static async fetchGroup (groupId: number): Promise<RobloxGroup | undefined> {
    const url = `${GROUPS_API_URL}/v1/groups/${groupId}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    // Data is undefined for 404
    if (data) {
      // Parse shout into the accepted format
      const { userId: ownerId, username: ownerName } = data.owner;

      if (data.shout) {
        const { body, poster: { userId, username }, updated } = data.shout;

        data.shout = {
          message: body,
          poster: {
            userId,
            username
          },
          updated
        };
      }

      data.owner = {
        id: ownerId,
        name: ownerName
      };
      return camelify(data);
    }
    return undefined;
  }

  static getUserInfo (userId: number): Promise<RobloxUser | undefined> {
    const url = `${USERS_API_URL}/v1/users/${userId}`;
    // Data is undefined for 404
    return fetch(url).then(checkStatus).then(res => res && res.json());
  }

  static async getUserGroups (userId: number): Promise<UserRobloxGroup[] | undefined> {
    const key = redisPrefixes.userGroupsCache + userId;
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const groups = await this.fetchUserGroups(userId);
    if (groups) {
      // One hour cache time
      await redis.set(key, JSON.stringify(groups), "EX", 60 * 60);
      return groups;
    }
    return undefined;
  }

  static async fetchUserGroups (userId: number): Promise<UserRobloxGroup[] | undefined> {
    const url = `${GROUPS_API_URL}/v2/users/${userId}/groups/roles`;
    const { data } = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (data) {
      const ids = data.map((item: any) => item.group.id);
      const icons = await this.getGroupsImage(ids);

      const outGroups: UserRobloxGroup[] = [];
      for (const { group, role } of data) {
        const { id, name } = group;

        const icon = icons.find(i => i.id === group.id)!;
        const newGroup: UserRobloxGroup = {
          id,
          name,
          rank: role.rank,
          role: role.name,
          emblemUrl: icon.url
        };

        outGroups.push(newGroup);
      }
      return outGroups;
    }

    return undefined;
  }

  static async isMember (groupId: number, userId: number): Promise<boolean> {
    const groups = await this.getUserGroups(userId);
    if (!groups) return false;

    const groupIds = groups.map(g => g.id);
    return groupIds.includes(groupId);
  }

  static async getRoles (groupId: number): Promise<FullRobloxRole[] | undefined> {
    const key = redisPrefixes.groupRolesCache + groupId;

    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const roles = await this.fetchRoles(groupId);

    if (roles) {
      await redis.set(key, JSON.stringify(roles), "EX", 60 * 60);
      return roles;
    }

    return undefined;
  }

  static async fetchRoles (groupId: number): Promise<FullRobloxRole[] | undefined> {
    const data = await fetch(`${GROUPS_API_URL}/v1/groups/${groupId}/roles`).then(checkStatus).then(res => res && res.json());
    return data?.roles;
  }

  static async getUserGroup (userId: number, groupId: number): Promise<UserRobloxGroup | undefined> {
    const groups = await this.getUserGroups(userId);
    if (!groups) return undefined;

    return groups.find(g => g.id === groupId);
  }

  async setRank (userId: number, rank: number): Promise<void> {
    if (!this.group) throw new Error("Attempt to execute `setRank`, but no group set.");

    if (!min(rank, 0) || !max(rank, 255)) throw new TypeError("Rank must not be smaller than 0 or larger than 255");

    const roles = await Roblox.getRoles(this.group.robloxId);
    if (!roles) throw new Error(`Unknown error occurred while getting roles in group ${this.group.robloxId}`);

    const { id: roleId } = roles.find(r => r.rank === rank) || {};
    if (!roleId) throw new BadRequestError(`Role with rank ${rank} does not exist in group ${this.group.robloxId}`);

    const body = JSON.stringify({ roleId });

    const data = await this.bot.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/users/${userId}`, {
      method: "PATCH",
      body
    }).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error(`Unknown error while updating user ${userId} to rank ${rank} in group ${this.group.robloxId}`);

    if (data.errors && data.errors.length > 0) {
      const firstErr = data.errors[0].message;
      throw new Error(`Error(s) occurred while updating user ${userId} to rank ${rank} in group ${this.group.robloxId}: ${firstErr}`);
    }

    return undefined;
  }

  async exile (userId: number): Promise<void> {
    if (!this.group) throw new Error("Attempt to execute `exile`, but no group set.");

    const data = await this.bot.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/users/${userId}`, { method: "DELETE" }).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error(`Unknown error while exiling ${userId} from group ${this.group.robloxId}`);

    if (data.errors && data.errors.length > 0) {
      const firstErr = data.errors[0].message;
      if (firstErr.code === 3) {
        throw new BadRequestError("User does not exist");
      }
      throw new Error(`Error(s) occurred while exiling ${userId} from group ${this.group.robloxId}: ${firstErr.message}`);
    }

    return undefined;
  }

  async setShout (newShout: string): Promise<Shout> {
    if (!this.group) throw new Error("Attempt to execute `setShout`, but no group set.");

    const body = { message: newShout };
    const data = await this.bot.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/status/`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }).then(checkStatus).then(res => res && res.json());


    if (data.errors && data.errors.length > 0) {
      const err = data.errors[0];
      if (err.code === 6) {
        // Not authorised
        throw new ForbiddenError("Bot does not have permission to post shout");
      } else if (err.code === 7) {
        throw new BadRequestError(err.message || "Roblox rejected shout content");
      }
      throw new Error(`Error(s) occurred while posting shout to ${this.group.robloxId}: ${err.message}`);
    }
    const { body: message, poster, updated } = data;
    return {
      message,
      poster,
      updated
    };
  }

  // Undefined: not in group
  // Returns an object of relevant permissions rather than Roblox's format.
  async getPermissions (userId: number): Promise<GroupPermissions|undefined> {
    if (!this.group) throw new Error("Attempt to execute `getPermissions`, but no group set.");
    const rankArr = await Roblox.fetchUserGroups(userId);
    if (!rankArr) return undefined;

    const rank = rankArr.find(grp => grp.id === this.group.robloxId);
    if (!rank) return undefined;

    const roles = await Roblox.getRoles(this.group.robloxId);
    if (!roles) throw new Error(`Unknown error occurred while getting roles in group ${this.group.robloxId}`);

    const { id: roleId } = roles.find(r => r.rank === rank.rank) || {};

    if (!roleId) throw new BadRequestError(`Role with rank ${rank} does not exist in group ${this.group.robloxId}`);

    const data = await this.bot.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/roles/${roleId}/permissions`).then(checkStatus).then(res => res && res.json());

    if (data.errors && data.errors.length > 0) {
      const err = data.errors[0];
      if (err.code === 3) {
        // Not allowed
        return {
          changeRank: false,
          name: rank.role,
          rank: rank.rank
        };
      }
      throw new Error(`Error(s) occurred while getting permissions in ${this.group.robloxId}: ${err.message}`);
    }
    const {
      permissions: { groupPostsPermissions, groupMembershipPermissions, groupManagementPermissions },
      role: { name, rank: roleRank }
    } = data;
    return {
      name,
      rank: roleRank,
      viewShout: groupPostsPermissions.viewStatus,
      postShout: groupPostsPermissions.postToStatus,
      viewAudit: groupManagementPermissions.viewAuditLogs,
      acceptMembers: groupMembershipPermissions.inviteMembers,
      removeMembers: groupMembershipPermissions.removeMembers,
      changeRank: groupMembershipPermissions.changeRank
    };
  }
}
