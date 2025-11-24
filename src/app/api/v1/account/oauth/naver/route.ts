import { processOAuthUser } from '@/lib/utils/oauth-helpers';

export async function GET() {
  return processOAuthUser('naver');
}
