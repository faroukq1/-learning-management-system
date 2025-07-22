import { env } from '@/lib/env';
import { S3 } from '@/lib/S3Client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const key = body.key;

    if (!key) {
      return NextResponse.json(
        { error: 'Missing or Invalid object key' },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_IMAGES,
      Key: key,
    });
    await S3.send(command);

    return NextResponse.json(
      { message: 'File Deleted Successfully' },
      { status: 200 }
    );
  } catch (error) {
    // handle error
    return NextResponse.json(
      { error: 'Missing or Invalid object key' },
      { status: 500 }
    );
  }
}
