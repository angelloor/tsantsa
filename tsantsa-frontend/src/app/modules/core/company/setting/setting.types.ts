export interface Setting {
  id_setting: string;
  expiration_token: number;
  expiration_verification_code: number;
  inactivity_time: number;
  session_limit: number;
  deleted_setting: boolean;
}
