import AccountController from "./AccountController";
import GroupController from "./GroupController";
import IntegrationController from "./IntegrationController";
import KeyController from "./KeyController";
import RankingV1Controller from "./RankingController/v1";
import SampleController from "./Sample.controller";
import VerificationController from "./VerificationController";

export default [
  SampleController,
  VerificationController,
  GroupController,
  AccountController,
  KeyController,
  IntegrationController,
  RankingV1Controller
];

export {
  SampleController, VerificationController, GroupController, AccountController, KeyController, IntegrationController, RankingV1Controller
};
