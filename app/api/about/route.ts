import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { AboutContent } from '@/data/types';

export async function POST(request: Request) {
  try {
    const content: AboutContent = await request.json();

    // Validate the content
    if (!content.introduction || !content.background || !content.whatDrivesMe) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert the content to a string that can be written to the file
    const fileContent = `import { AboutContent } from './types';

export const aboutContent: AboutContent = ${JSON.stringify(content, null, 2)};
`;

    // Define paths
    const managerDataDir = path.join(process.cwd(), 'data');
    const websiteDataDir = 'C:\\PORTFOLIO_WEB\\PortfolioWebsite\\data';
    const managerPath = path.join(managerDataDir, 'about.ts');
    const websitePath = path.join(websiteDataDir, 'about.ts');

    try {
      // Create directories if they don't exist
      await mkdir(managerDataDir, { recursive: true });
      await mkdir(websiteDataDir, { recursive: true });

      // Write to manager location
      await writeFile(managerPath, fileContent, 'utf-8');
      
      // Write to website location
      await writeFile(websitePath, fileContent, 'utf-8');

      return NextResponse.json({ message: 'About content updated successfully' });
    } catch (writeError) {
      console.error('Error writing files:', writeError);
      return NextResponse.json(
        { error: 'Failed to write about content to files' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    );
  }
} 