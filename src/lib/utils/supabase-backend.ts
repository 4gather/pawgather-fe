import { createClient } from '@supabase/supabase-js';

// RLS를 우회하고 모든 데이터에 접근 가능 (서버 전용)
export const supabaseBackend = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'backend_compat', // 백엔드 호환 스키마 사용
    },
  }
);

// JWT 토큰으로 인증된 Supabase 클라이언트 생성
export function createAuthenticatedSupabaseClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`, // JWT 토큰을 Authorization 헤더에 설정
        },
      },
      db: {
        schema: 'backend_compat',
      },
    }
  );
}
