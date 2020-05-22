export interface StartVerificationResponse {
  rId: number;
  code?: number;
  blurbCode?: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
}
