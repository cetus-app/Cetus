import AccountController from "./AccountController";
import AuthController from "./AuthController";
import BotController from "./BotController";
import GroupController from "./GroupController";
import IntegrationController from "./IntegrationController";
import InternalController from "./InternalController";
import KeyController from "./KeyController";
import PaymentController from "./PaymentController";
import RobloxV1Controller from "./RobloxController/v1";
import VerificationController from "./VerificationController";

export default [
  VerificationController,
  GroupController,
  AccountController,
  KeyController,
  IntegrationController,
  RobloxV1Controller,
  BotController,
  InternalController,
  AuthController,
  PaymentController
];

export {
  VerificationController,
  GroupController,
  AccountController,
  KeyController,
  IntegrationController,
  RobloxV1Controller,
  BotController,
  InternalController,
  AuthController,
  PaymentController
};
