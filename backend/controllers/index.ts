import AccountController from "./AccountController";
import AuthController from "./AuthController";
import BotController from "./BotController";
import GroupController from "./GroupController";
import IntegrationController from "./IntegrationController";
import InternalController from "./InternalController";
import KeyController from "./KeyController";
import PaymentController from "./PaymentController";
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
  RankingV1Controller,
  BotController,
  InternalController,
  AuthController,
  PaymentController
];

export {
  SampleController,
  VerificationController,
  GroupController,
  AccountController,
  KeyController,
  IntegrationController,
  RankingV1Controller,
  BotController,
  InternalController,
  AuthController,
  PaymentController
};
