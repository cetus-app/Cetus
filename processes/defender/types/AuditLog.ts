// Manual classes
import {
  AcceptJoinRequestAction,
  ChangeDescriptionAction, ChangeOwnerAction, ChangeRankAction, ConfigureGroupAssetAction,
  CreateItemsAction, DeclineAllyRequestAction,
  DeclineJoinRequestAction, DeletePostAction, PostStatusAction,
  RemoveMemberAction, SendAllyRequestAction, SpendGroupFundsAction
} from "./LogAction";

export interface AuditLog {
  actor: AuditLogActor,
  type: ActionTypeResponse,
  action: RemoveMemberAction | DeletePostAction | AcceptJoinRequestAction | DeclineAllyRequestAction |
      DeclineJoinRequestAction | ChangeDescriptionAction | ChangeOwnerAction | ChangeRankAction |
      PostStatusAction | SendAllyRequestAction | CreateItemsAction | SpendGroupFundsAction | ConfigureGroupAssetAction,
  created: Date
  rawCreated: string
}

export interface AuditLogActor {
  id: number,
  username: string,
  rank: number,
  rankName: string
}

export interface LogsResponse {
  logs: AuditLog[],
  next: string|null,
  // never going to be used, really
  prev: string|null
}
// Auto generated
// Roblox returns the "spaced" version so saying it is this enum works.
export enum ActionTypeResponse {
  deletePost = "Delete Post",
  removeMember = "Remove Member",
  acceptJoinRequest = "Accept Join Request",
  declineJoinRequest = "Decline Join Request",
  postStatus = "Post Status",
  changeRank = "Change Rank",
  buyAd = "Buy Ad",
  sendAllyRequest = "Send Ally Request",
  createEnemy = "Create Enemy",
  acceptAllyRequest = "Accept Ally Request",
  declineAllyRequest = "Decline Ally Request",
  deleteAlly = "Delete Ally",
  deleteEnemy = "Delete Enemy",
  dddGroupPlace = "Add Group Place",
  removeGroupPlace = "Remove Group Place",
  createItems = "Create Items",
  configureItems = "Configure Items",
  spendGroupFunds = "Spend Group Funds",
  changeOwner = "Change Owner",
  delete = "Delete",
  adjustCurrencyAmounts = "Adjust Currency Amounts",
  abandon = "Abandon",
  claim = "Claim",
  rename = "Rename",
  changeDescription = "Change Description",
  inviteToClan = "Invite To Clan",
  kickFromClan = "Kick From Clan",
  cancelClanInvite = "Cancel Clan Invite",
  buyClan = "Buy Clan",
  createGroupAsset = "Create Group Asset",
  updateGroupAsset = "Update Group Asset",
  configureGroupAsset = "Configure Group Asset",
  revertGroupAsset = "Revert Group Asset",
  createGroupDeveloperProduct = "Create Group Developer Product",
  configureGroupGame = "Configure Group Game",
  lock = "Lock",
  unlock = "Unlock",
  createGamePass = "Create Game Pass",
  createBadge = "Create Badge",
  configureBadge = "Configure Badge",
  savePlace = "Save Place",
  publishPlace = "Publish Place"
}

// Generated
// Non-spaced version for making the request for URL params.
export enum ActionTypeRequest {
  deletePost = "DeletePost",
  removeMember = "RemoveMember",
  acceptJoinRequest = "AcceptJoinRequest",
  declineJoinRequest = "DeclineJoinRequest",
  postStatus = "PostStatus",
  changeRank = "ChangeRank",
  buyAd = "BuyAd",
  sendAllyRequest = "SendAllyRequest",
  createEnemy = "CreateEnemy",
  acceptAllyRequest = "AcceptAllyRequest",
  declineAllyRequest = "DeclineAllyRequest",
  deleteAlly = "DeleteAlly",
  deleteEnemy = "DeleteEnemy",
  dddGroupPlace = "AddGroupPlace",
  removeGroupPlace = "RemoveGroupPlace",
  createItems = "CreateItems",
  configureItems = "ConfigureItems",
  spendGroupFunds = "SpendGroupFunds",
  changeOwner = "ChangeOwner",
  delete = "Delete",
  adjustCurrencyAmounts = "AdjustCurrencyAmounts",
  abandon = "Abandon",
  claim = "Claim",
  rename = "Rename",
  changeDescription = "ChangeDescription",
  inviteToClan = "InviteToClan",
  kickFromClan = "KickFromClan",
  cancelClanInvite = "CancelClanInvite",
  buyClan = "BuyClan",
  createGroupAsset = "CreateGroupAsset",
  updateGroupAsset = "UpdateGroupAsset",
  configureGroupAsset = "ConfigureGroupAsset",
  revertGroupAsset = "RevertGroupAsset",
  createGroupDeveloperProduct = "CreateGroupDeveloperProduct",
  configureGroupGame = "ConfigureGroupGame",
  lock = "Lock",
  unlock = "Unlock",
  createGamePass = "CreateGamePass",
  createBadge = "CreateBadge",
  configureBadge = "ConfigureBadge",
  savePlace = "SavePlace",
  publishPlace = "PublishPlace"
}

export interface GetLogsOptions {
  limit?: 10|25|50|100,
  // sortOrder; Roblox specifies it but doesn't actually follow it
  cursor?: string,
  actionType?: ActionTypeRequest
}
