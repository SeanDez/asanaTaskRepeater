import { pgpConfigured } from '../dbConfig';

async function getRefreshToken(asana_id: string): Promise<string | null> {
  try {
    const token: string | null = await pgpConfigured.oneOrNone('SELECT refresh_token_encrypted FROM app_user WHERE CAST(asana_id AS TEXT) = CAST($1 AS TEXT);', asana_id);

    return token;
  } catch (error) {
    throw new Error(error);
  }
}

export default getRefreshToken;
