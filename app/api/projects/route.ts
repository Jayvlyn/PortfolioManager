import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

interface ProjectLink {
  type: 'github' | 'itch';
  url: string;
}

interface Project {
  name: string;
  description: string;
  thumbnail: string;
  links: ProjectLink[];
}

const PORTFOLIO_WEBSITE_DATA_FILE = path.join(process.cwd(), '..', 'PortfolioWebsite', 'data', 'projects.ts');

function readProjectsFromFile(): Project[] {
  try {
    const content = fs.readFileSync(PORTFOLIO_WEBSITE_DATA_FILE, 'utf-8');
    const match = content.match(/export const projects: Project\[] = (\[[\s\S]*\]);/);
    if (!match) {
      console.error('Could not parse projects from file');
      return [];
    }
    return JSON.parse(match[1]);
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

function writeProjectsToFile(projects: Project[]) {
  const content = `export interface ProjectLink {
  type: 'github' | 'itch';
  url: string;
}

export interface Project {
  name: string;
  description: string;
  thumbnail: string;
  links: ProjectLink[];
}

export const projects: Project[] = ${JSON.stringify(projects, null, 2)};`;

  fs.writeFileSync(PORTFOLIO_WEBSITE_DATA_FILE, content, 'utf-8');
}

export async function GET() {
  try {
    const projects = readProjectsFromFile();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, description, github, itch, thumbnail } = data;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Read existing projects
    const projects = readProjectsFromFile();

    // Check if project name already exists
    if (projects.some((p) => p.name === name)) {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 400 }
      );
    }

    // Create new project
    const safeName = name.toLowerCase().replace(/\s+/g, '-');
    const links: ProjectLink[] = [];
    if (github && github.trim()) links.push({ type: 'github', url: github });
    if (itch && itch.trim()) links.push({ type: 'itch', url: itch });
    const newProject: Project = {
      name,
      description,
      thumbnail: `/thumbnails/${safeName}.png`,
      links
    };

    // Add to projects and save
    projects.push(newProject);
    writeProjectsToFile(projects);

    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, description, github, itch, thumbnail } = data;

    // Validate required fields
    if (!id || (!name && !description && !github && !itch)) {
      return NextResponse.json(
        { error: 'Project ID and at least one field to update are required' },
        { status: 400 }
      );
    }

    // Read existing projects
    const projects = readProjectsFromFile();

    // Find project index
    const projectIndex = projects.findIndex((p) => p.name === id);
    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project
    const project = projects[projectIndex];
    const updatedLinks: ProjectLink[] = [];
    const githubUrl = github !== undefined ? github : project.links.find((l) => l.type === 'github')?.url || '';
    const itchUrl = itch !== undefined ? itch : project.links.find((l) => l.type === 'itch')?.url || '';
    if (githubUrl && githubUrl.trim()) updatedLinks.push({ type: 'github', url: githubUrl });
    if (itchUrl && itchUrl.trim()) updatedLinks.push({ type: 'itch', url: itchUrl });
    const updatedProject = {
      ...project,
      name: name || project.name,
      description: description || project.description,
      thumbnail: `/thumbnails/${(name || project.name).toLowerCase().replace(/\s+/g, '-')}.png`,
      links: updatedLinks
    };

    // Save updated projects
    projects[projectIndex] = updatedProject;
    writeProjectsToFile(projects);

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get('index');
    
    if (!index) {
      return NextResponse.json({ success: false, error: 'No index provided' }, { status: 400 });
    }
    
    // Read current projects
    const projects = readProjectsFromFile();
    
    // Remove project
    projects.splice(parseInt(index), 1);
    
    // Update file
    writeProjectsToFile(projects);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
} 