import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petfairId: string }> }
) {
  try {
    const { petfairId } = await params;

    if (!petfairId || isNaN(Number(petfairId))) {
      return NextResponse.json(
        { error: '유효하지 않은 펫페어 ID입니다.' },
        { status: 400 }
      );
    }

    const file = join(process.cwd(), 'src', 'mock', 'petfairDetail.json');
    const data = await readFile(file, 'utf-8');
    const petfairs = JSON.parse(data) as { petFairId: number }[];

    const petFairDetail = petfairs.find(
      (fair) => fair.petFairId === Number(petfairId)
    );

    if (!petFairDetail) {
      return NextResponse.json(
        { error: '해당 펫페어를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(petFairDetail);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 에러:', error.message);
      return NextResponse.json(
        { error: 'JSON 데이터 형식이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    console.error('펫페어 데이터 로드 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
