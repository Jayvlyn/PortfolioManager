import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    
    if (!file || !name) {
      return NextResponse.json(
        { error: 'File and name are required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure thumbnails directory exists in PortfolioWebsite
    const thumbnailsDir = path.join(process.cwd(), '..', 'PortfolioWebsite', 'public', 'thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(thumbnailsDir, `${name}.jpg`);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 