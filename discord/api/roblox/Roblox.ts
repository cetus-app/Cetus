import realFetch, { Headers, RequestInit } from "node-fetch";

import { REDIS_PREFIXES } from "../../constants";
import { ExternalHttpError, multiGet, client as redis } from "../../shared";
import { checkStatus } from "../../shared/util";
import {
  FullRobloxRole, RobloxGroup, RobloxGroupIcon, RobloxRole, RobloxUser, UserRobloxGroup
} from "../../types";

const fetch = (url: string, opt?: RequestInit) => {
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

export default class Roblox {
  static async getUsernameFromId (id: number): Promise<string | undefined> {
    const key = REDIS_PREFIXES.idToUsernameCache + id;
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
    return fetch(`${BASE_API_URL}/users/${id}`).then(checkStatus).then(res => res && res.json())
      .then(data => data?.Username)
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        if (e instanceof ExternalHttpError && e.response.status === 400) return undefined;

        console.error(`Error while fetching username from ID ${id}`, e);
        return undefined;
      });
  }

  static async getUserImage (id: number): Promise<string | undefined> {
    const key = REDIS_PREFIXES.userImageCache + id;
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
    const cachedGroups = await multiGet<RobloxGroupIcon>(REDIS_PREFIXES.groupImageCache, groupIds);

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
            redis.set(REDIS_PREFIXES.groupImageCache + grp.id, JSON.stringify(grp), "EX", 60 * 30).catch(console.error);
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
    const key = REDIS_PREFIXES.usernameToIdCache + username;
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
    const key = REDIS_PREFIXES.groupCache + groupId;
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
    const groupUrl = `${GROUPS_API_URL}/v1/groups/${groupId}`;
    const groupPromise = fetch(groupUrl).then(checkStatus).then(res => res && res.json());

    const rolesUrl = `${groupUrl}/roles`;
    const rolesPromise = fetch(rolesUrl).then(checkStatus).then(res => res && res.json());

    const iconPromise = this.getGroupsImage([groupId]);

    const [group, { roles }, [icon]] = await Promise.all([groupPromise, rolesPromise, iconPromise]);
    const outRoles: RobloxRole[] = roles.map(({ name, rank }: any) => ({
      name,
      rank
    }));

    // Data is undefined for 404 (not sure if this applies after API changes 28.01.2021, but keeping for good measure)
    return group ? {
      id: group.id,
      name: group.name,
      description: group.description,
      owner: {
        id: group.owner.userId,
        name: group.owner.username
      },
      emblemUrl: icon.url,
      roles: outRoles
    } : undefined;
  }

  static getUserInfo (userId: number): Promise<RobloxUser | undefined> {
    const url = `${USERS_API_URL}/v1/users/${userId}`;
    // Data is undefined for 404
    return fetch(url).then(checkStatus).then(res => res && res.json());
  }

  static async getUserGroups (userId: number): Promise<UserRobloxGroup[] | undefined> {
    const key = REDIS_PREFIXES.userGroupsCache + userId;
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
    const key = REDIS_PREFIXES.groupRolesCache + groupId;

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
}
