import { NextResponse } from 'next/server';

export function createErrorResponse(
  message: string,
  statusCode: number,
  errorCode?: string
) {
  const errorResponse: { message: string; errorCode?: string } = { message };
  if (errorCode) {
    errorResponse.errorCode = errorCode;
  }
  return new NextResponse(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
