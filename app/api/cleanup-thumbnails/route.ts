import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const thumbnailsDir = path.join(process.cwd(), '../PortfolioWebsite/public/thumbnails');
    const files = await fs.readdir(thumbnailsDir);

    // Read and parse the projects array from the projects.ts file
    const projectsFile = path.join(process.cwd(), '../PortfolioWebsite/data/projects.ts');
    const fileContent = await fs.readFile(projectsFile, 'utf-8');
    const match = fileContent.match(/export const projects: Project\[] = (\[[\s\S]*\]);/);
    const projects = match ? JSON.parse(match[1]) : [];

    // Get all used thumbnail filenames from projects
    const usedThumbnails = new Set(
      projects.map((p) => p.thumbnail.replace('/thumbnails/', ''))
    );

    // Find unused files
    const unused = files.filter((file) => !usedThumbnails.has(file));

    // Delete unused files
    await Promise.all(
      unused.map((file) => fs.unlink(path.join(thumbnailsDir, file)))
    );

    return NextResponse.json({ success: true, deleted: unused });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 