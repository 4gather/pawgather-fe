import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  provider?: string;
  type?: 'access' | 'refresh';
}

interface JWTPayload extends TokenPayload {
  iat: number;
  exp: number;
  jti?: string; // 고유 JWT ID 클레임
}

// 고유 ID 생성 함수
function generateUniqueId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9);
  const extraRandom = Math.random().toString(36).substr(2, 5);

  // 마이크로초 시뮬레이션 및 추가 랜덤성
  const microTime = performance.now().toString().replace('.', '');

  return `${timestamp}_${microTime}_${randomPart}_${extraRandom}`;
}

// 실제 백엔드와 동일한 JWT 구조 사용
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15분
      jti: generateUniqueId(),
    },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  );
}

// 리프레시 토큰은 더 긴 만료시간 설정
export function generateRefreshToken(
  payload: Omit<TokenPayload, 'type'>
): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7일
      jti: `refresh_${generateUniqueId()}`,
    },
    process.env.JWT_REFRESH_SECRET!,
    { algorithm: 'HS256' }
  );
}

// 토큰 검증 함수 - 액세스/리프레시 토큰 구분
export function verifyToken(
  token: string,
  type: 'access' | 'refresh' = 'access'
): JWTPayload | null {
  const secret =
    type === 'access'
      ? process.env.JWT_SECRET!
      : process.env.JWT_REFRESH_SECRET!;

  try {
    const payload = jwt.verify(token, secret) as JWTPayload;
    return payload;
  } catch (error) {
    console.error(`${type} token verification failed:`, error);
    return null;
  }
}

// 토큰 만료 체크
export function isTokenExpired(
  token: string,
  type: 'access' | 'refresh' = 'access'
): boolean {
  const payload = verifyToken(token, type);
  if (!payload) return true;

  return payload.exp < Math.floor(Date.now() / 1000);
}
