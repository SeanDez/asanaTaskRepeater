export default interface App_User {
  id: number,
  asana_id: string,
  name: string,
  email: string,
  refresh_token_encrypted: string,
  access_token_encrypted: string,
}
