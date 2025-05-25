import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    
    if (!file || !name) {
      return NextResponse.json(
        { error: 'Missing file or name' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Map the names to what the website expects
    const fileNameMap: { [key: string]: string } = {
      'about-left': 'left-image',
      'about-right': 'right-image'
    };
    
    const safeName = (fileNameMap[name] || name).toLowerCase().replace(/\s+/g, '-');
    const fileName = `${safeName}.png`;

    // Define paths
    const websiteThumbnailsDir = path.join(process.cwd(), '..', 'PortfolioWebsite', 'public', 'thumbnails');
    const websitePath = path.join(websiteThumbnailsDir, fileName);

    console.log('Upload request received:', { name, fileName, websitePath });

    try {
      // Create the website thumbnails directory if it doesn't exist
      await mkdir(websiteThumbnailsDir, { recursive: true });

      // Write to website location
      await writeFile(websitePath, buffer);
      console.log('File written to website location:', websitePath);

      return NextResponse.json({ 
        message: 'File uploaded successfully',
        path: `/thumbnails/${fileName}`
      });
    } catch (writeError) {
      console.error('Error writing files:', writeError);
      return NextResponse.json(
        { error: 'Failed to write files' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 