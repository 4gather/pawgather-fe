import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';

/**
 * API에서 사용할 에러 메시지를 상수로 관리
 * - EMPTY_DATA: 파일은 찾았지만 데이터가 비어있을 때
 * - NOT_FOUND: 요청한 리소스(파일)를 찾을 수 없을 때
 * - INVALID_FORMAT: 데이터 형식(예: JSON)이 올바르지 않아 파싱에 실패했을 때
 * - SERVER_ERROR: 예상치 못한 서버 내부 오류 발생 시
 */
const ERROR_MESSAGES = {
  EMPTY_DATA: '표시할 캐러셀 데이터가 없습니다.',
  NOT_FOUND: '캐러셀 데이터를 찾을 수 없습니다.',
  INVALID_FORMAT: '데이터 형식 오류가 발생했습니다.',
  SERVER_ERROR: '일시적인 서버 오류가 발생했습니다.',
} as const;

const CAROUSEL_DATA_FILE = join(
  process.cwd(),
  'src',
  'mock',
  'PetFairCarousel.json'
);

export async function GET(_request: Request) {
  try {
    const data = await readFile(CAROUSEL_DATA_FILE, 'utf-8');
    const petfairs = JSON.parse(data);

    if (!Array.isArray(petfairs) || petfairs.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.EMPTY_DATA },
        { status: 404 }
      );
    }

    return NextResponse.json(petfairs);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      console.error('[API Error] 파일을 찾을 수 없음:', {
        file: CAROUSEL_DATA_FILE,
        error,
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      );
    }

    if (error instanceof SyntaxError) {
      console.error('[API Error] JSON 파싱 실패:', {
        file: CAROUSEL_DATA_FILE,
        message: error.message,
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_FORMAT },
        { status: 422 }
      );
    }

    console.error('[API Error] 예상치 못한 에러:', {
      file: CAROUSEL_DATA_FILE,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
