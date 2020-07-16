// Generated - These are estimated using typeof on the log for a variety of requests
// This list is not exhaustive and will miss many. It only has those which existed on my example group during testing.
export interface RemoveMemberAction {
  targetId: number,
  targetName: string,
}

export interface DeletePostAction {
  postDesc: string,
  targetId: number,
  targetName: string,
}

export interface AcceptJoinRequestAction {
  targetId: number,
  targetName: string,
}

export interface DeclineJoinRequestAction {
  targetId: number,
  targetName: string,
}

export interface ChangeRankAction {
  targetId: number,
  oldRoleSetId: number,
  newRoleSetId: number,
  targetName: string,
  oldRoleSetName: string,
  newRoleSetName: string,
}

export interface PostStatusAction {
  text: string,
}

export interface SendAllyRequestAction {
  targetGroupId: number,
  targetGroupName: string,
}

export interface DeclineAllyRequestAction {
  targetGroupId: number,
  targetGroupName: string,
}

export interface CreateItemsAction {
  assetId: number,
  assetName: string,
}

export interface SpendGroupFundsAction {
  amount: number,
  currencyTypeId: number,
  itemDescription: string,
  currencyTypeName: string,
}

export interface ChangeOwnerAction {
  oldOwnerId: number,
  newOwnerId: number,
  isRoblox: boolean,
  oldOwnerName: string,
  newOwnerName: string,
}

export interface ChangeDescriptionAction {
  newDescription: string,
}

export interface ConfigureGroupAssetAction {
  assetId: number,
  actions: object,
  assetName: string,
}
