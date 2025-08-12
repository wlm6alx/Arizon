import { twMerge } from "tailwind-merge";
import { NextResponse } from 'next/server';
import { clsx, type ClassValue } from "clsx";

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

