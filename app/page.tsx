'use client';

import { useState, useEffect, FormEvent } from 'react';
import Background3D from './components/Background3D';
import Link from 'next/link';

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

export default function PortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    github: '',
    itch: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.thumbnail && !editingProject) {
      alert('Please select a thumbnail image');
      return;
    }

    try {
      // Upload thumbnail if there's a new one
      if (formData.thumbnail) {
        const thumbnailForm = new FormData();
        thumbnailForm.append('file', formData.thumbnail);
        thumbnailForm.append('name', formData.name || editingProject?.name || 'untitled');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: thumbnailForm
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload thumbnail');
        }
      }

      // Create or update the project
      const projectRes = await fetch('/api/projects', {
        method: editingProject ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(editingProject && { id: editingProject.name }), // Use name as ID for updating
          name: formData.name || editingProject?.name,
          description: formData.description || editingProject?.description,
          github: formData.github || editingProject?.links.find(l => l.type === 'github')?.url,
          itch: formData.itch || editingProject?.links.find(l => l.type === 'itch')?.url
        })
      });

      if (!projectRes.ok) {
        throw new Error(editingProject ? 'Failed to update project' : 'Failed to create project');
      }

      // Reset form and refresh projects
      setFormData({
        name: '',
        description: '',
        thumbnail: null,
        github: '',
        itch: ''
      });
      setEditingProject(null);
      fetchProjects();

      alert(editingProject ? 'Project updated successfully!' : 'Project added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error ' + (editingProject ? 'updating' : 'adding') + ' project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      thumbnail: null,
      github: project.links.find(l => l.type === 'github')?.url || '',
      itch: project.links.find(l => l.type === 'itch')?.url || ''
    });
    // Scroll to the form
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Background3D />
      <main className="min-h-screen p-8 relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Portfolio Manager
          </h1>

          {/* Project List */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-white/90">Existing Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.name} 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={project.thumbnail} 
                      alt={project.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white/90">{project.name}</h3>
                  <p className="text-white/70 mb-4 line-clamp-3">{project.description}</p>
                  <div className="flex gap-3 mb-4">
                    {project.links.map((link) => (
                      <a
                        key={link.type}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          link.type === 'github' 
                            ? 'bg-gray-700/50 hover:bg-gray-700 text-white/90' 
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                        }`}
                      >
                        {link.type === 'github' ? 'GitHub' : 'Itch.io'}
                      </a>
                    ))}
                  </div>
                  <button
                    onClick={() => handleEdit(project)}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Edit Project
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Project Form */}
          <div id="project-form" className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-white/10 shadow-xl">
            <h2 className="text-3xl font-semibold mb-6 text-white/90">
              {editingProject ? `Edit "${editingProject.name}"` : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/70">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required={!editingProject}
                  placeholder={editingProject ? editingProject.name : 'Enter project name'}
                />
              </div>

              {/* Project Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-white/70">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={4}
                  required={!editingProject}
                  placeholder={editingProject ? editingProject.description : 'Enter project description'}
                />
              </div>

              {/* Current Thumbnail Preview */}
              {editingProject && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">
                    Current Thumbnail
                  </label>
                  <img 
                    src={editingProject.thumbnail} 
                    alt={editingProject.name} 
                    className="w-48 h-32 object-cover rounded-lg border border-white/10"
                  />
                </div>
              )}

              {/* Thumbnail */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium mb-2 text-white/70">
                  {editingProject ? 'New Thumbnail (Optional)' : 'Thumbnail Image'}
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 file:cursor-pointer"
                  required={!editingProject}
                />
              </div>

              {/* GitHub Link */}
              <div>
                <label htmlFor="github" className="block text-sm font-medium mb-2 text-white/70">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="github"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required={!editingProject}
                  placeholder={editingProject?.links.find(l => l.type === 'github')?.url || 'Enter GitHub URL'}
                />
              </div>

              {/* Itch.io Link (Optional) */}
              <div>
                <label htmlFor="itch" className="block text-sm font-medium mb-2 text-white/70">
                  Itch.io URL (Optional)
                </label>
                <input
                  type="url"
                  id="itch"
                  value={formData.itch}
                  onChange={(e) => setFormData({ ...formData, itch: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder={editingProject?.links.find(l => l.type === 'itch')?.url || 'Enter Itch.io URL'}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {editingProject ? 'Update Project' : 'Add Project'}
                </button>
                {editingProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setFormData({
                        name: '',
                        description: '',
                        thumbnail: null,
                        github: '',
                        itch: ''
                      });
                    }}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white/90 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* About Section */}
          <Link href="/about" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold mb-4">About Content</h2>
              <p className="text-gray-300">Edit your introduction, background, skills, and what drives you.</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
} 