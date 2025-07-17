import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';

export async function GET() {
  try {
    const file = join(process.cwd(), 'src', 'mock', 'petfairs.json');

    if (!existsSync(file)) {
      console.error('펫페어 데이터 파일이 존재하지 않습니다:', file);
      return NextResponse.json(
        { error: '데이터 파일을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    const data = await readFile(file, 'utf-8');
    const petfairs = JSON.parse(data);

    return NextResponse.json(petfairs);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 에러:', error.message);
      return NextResponse.json(
        { error: 'JSON 데이터 형식이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    console.error('펫페어 리스트 로드 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
