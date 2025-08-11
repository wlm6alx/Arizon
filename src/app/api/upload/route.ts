import { NextRequest, NextResponse } from 'next/server';
import { handleUpload } from '@/lib/cloudinary';
import { withMiddleware, authMiddleware, roleAuthMiddleware } from '@/lib/middleware';
import { RoleType } from '@prisma/client';

async function uploadHandler(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    if (!folder || !['products', 'users'].includes(folder)) {
        return NextResponse.json({ message: 'A valid folder (products, users) must be provided.' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await handleUpload(fileBuffer, folder);

    return NextResponse.json({
      message: 'File uploaded successfully.',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Upload failed.', error: errorMessage }, { status: 500 });
  }
}

// Protect this route with middleware. 
// Only authenticated users (e.g., ADMIN, STOCK_MANAGER for products, or any user for their own profile) should be able to upload.
// The specific roles can be adjusted as needed.
export const POST = withMiddleware(
  uploadHandler,
  authMiddleware(),
  roleAuthMiddleware([RoleType.ADMIN, RoleType.STOCK_MANAGER, RoleType.CLIENT, RoleType.BUSINESS])
);
