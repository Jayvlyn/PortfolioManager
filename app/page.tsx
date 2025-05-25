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
      let thumbnailPath: string | undefined;
      const safeName = (formData.name || editingProject?.name || 'untitled').toLowerCase().replace(/\s+/g, '-');
      const expectedThumbnailPath = `/thumbnails/${safeName}.jpg`;
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
        // Always use the expected path
        thumbnailPath = expectedThumbnailPath;
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
          thumbnail: expectedThumbnailPath,
          github: formData.github,
          itch: formData.itch
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

  const handleDelete = async (projectName: string) => {
    const index = projects.findIndex(p => p.name === projectName);
    if (index === -1) {
      alert('Project not found');
      return;
    }
    if (!confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/projects?index=${index}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      fetchProjects();
    } catch (error) {
      alert('Error deleting project');
      console.error(error);
    }
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
                      link.url && (
                        <a
                          key={link.type}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {link.type === 'github' ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            </svg>
                          )}
                        </a>
                      )
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Edit Project
                    </button>
                    <button
                      onClick={() => handleDelete(project.name)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Project Form */}
          <div id="project-form" className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-white/10 shadow-xl mb-12">
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
                  GitHub URL (Optional)
                </label>
                <input
                  type="url"
                  id="github"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

          {/* Content Management Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/about"
              className="p-6 bg-[#222222] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">Edit About Page</h2>
              <p className="text-gray-400">Update your introduction, background, skills, and images</p>
            </Link>

            <Link 
              href="/social"
              className="p-6 bg-[#222222] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">Edit Social Links</h2>
              <p className="text-gray-400">Manage your social media and contact links</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
} 