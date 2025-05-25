import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SocialLinks } from '@/data/types';

export async function POST(request: Request) {
  try {
    const content: SocialLinks = await request.json();

    // Validate the content
    if (!content.github || !content.itch || !content.linktree || !content.linkedin) {
      return NextResponse.json(
        { error: 'All social links are required' },
        { status: 400 }
      );
    }

    // Save to PortfolioManager
    const managerPath = path.join(process.cwd(), 'data', 'social.ts');
    const managerContent = `import { SocialLinks } from './types';\n\nexport const socialLinks: SocialLinks = ${JSON.stringify(content, null, 2)};\n`;
    fs.writeFileSync(managerPath, managerContent);

    // Save to PortfolioWebsite
    const websitePath = path.join(process.cwd(), '..', 'PortfolioWebsite', 'data', 'social.ts');
    const websiteContent = `import { SocialLinks } from './types';\n\nexport const socialLinks: SocialLinks = ${JSON.stringify(content, null, 2)};\n`;
    fs.writeFileSync(websitePath, websiteContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving social links:', error);
    return NextResponse.json(
      { error: 'Failed to save social links' },
      { status: 500 }
    );
  }
} 