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
    const extension = file.name.split('.').pop();
    
    // Map the names to what the website expects
    const fileNameMap: { [key: string]: string } = {
      'about-left': 'left-image',
      'about-right': 'right-image'
    };
    
    const fileName = `${fileNameMap[name] || name}.${extension}`;

    // Define paths
    const managerImagesDir = path.join(process.cwd(), 'public', 'images');
    const websiteImagesDir = 'C:\\PORTFOLIO_WEB\\PortfolioWebsite\\public\\images';
    const managerPath = path.join(managerImagesDir, fileName);
    const websitePath = path.join(websiteImagesDir, fileName);

    try {
      // Create directories if they don't exist
      await mkdir(managerImagesDir, { recursive: true });
      await mkdir(websiteImagesDir, { recursive: true });

      // Write to manager location
      await writeFile(managerPath, buffer);
      
      // Write to website location
      await writeFile(websitePath, buffer);

      return NextResponse.json({ 
        message: 'File uploaded successfully',
        path: `/images/${fileName}`
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