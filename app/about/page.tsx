'use client';

import { useState, FormEvent } from 'react';
import { aboutContent } from '@/data/about';
import { AboutContent } from '@/data/types';

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(aboutContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [leftImage, setLeftImage] = useState<File | null>(null);
  const [rightImage, setRightImage] = useState<File | null>(null);
  const [draggedImage, setDraggedImage] = useState<{ side: 'left' | 'right', index: number } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload images if they exist
      if (leftImage) {
        const leftImageForm = new FormData();
        leftImageForm.append('file', leftImage);
        const timestamp = Date.now();
        leftImageForm.append('name', `left-image-${timestamp}`);
        
        const leftUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: leftImageForm
        });

        if (!leftUploadRes.ok) {
          throw new Error('Failed to upload left image');
        }

        const leftData = await leftUploadRes.json();
        setContent(prev => ({
          ...prev,
          leftImages: [...prev.leftImages, leftData.path]
        }));
      }

      if (rightImage) {
        const rightImageForm = new FormData();
        rightImageForm.append('file', rightImage);
        const timestamp = Date.now();
        rightImageForm.append('name', `right-image-${timestamp}`);
        
        const rightUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: rightImageForm
        });

        if (!rightUploadRes.ok) {
          throw new Error('Failed to upload right image');
        }

        const rightData = await rightUploadRes.json();
        setContent(prev => ({
          ...prev,
          rightImages: [...prev.rightImages, rightData.path]
        }));
      }

      // Update about content
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error('Failed to update about content');
      }

      setMessage({ type: 'success', text: 'About content updated successfully!' });
      setLeftImage(null);
      setRightImage(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update about content. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...content.skills];
    newSkills[index] = value;
    setContent({ ...content, skills: newSkills });
  };

  const addSkill = () => {
    setContent({ ...content, skills: [...content.skills, ''] });
  };

  const removeSkill = (index: number) => {
    const newSkills = content.skills.filter((_: string, i: number) => i !== index);
    setContent({ ...content, skills: newSkills });
  };

  const removeImage = (side: 'left' | 'right', index: number) => {
    setContent(prev => ({
      ...prev,
      [side === 'left' ? 'leftImages' : 'rightImages']: prev[side === 'left' ? 'leftImages' : 'rightImages'].filter((_, i) => i !== index)
    }));
  };

  const moveImage = (side: 'left' | 'right', fromIndex: number, toIndex: number) => {
    setContent(prev => {
      const images = [...prev[side === 'left' ? 'leftImages' : 'rightImages']];
      const [movedImage] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, movedImage);
      return {
        ...prev,
        [side === 'left' ? 'leftImages' : 'rightImages']: images
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Edit About Content</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Left Images
            </label>
            <div className="space-y-4">
              {content.leftImages.map((image, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage('left', index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage('left', index, Math.min(content.leftImages.length - 1, index + 1))}
                      disabled={index === content.leftImages.length - 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <img 
                    src={image} 
                    alt={`Left image ${index + 1}`} 
                    className="w-20 h-20 object-cover rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('left', index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLeftImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer"
              />
            </div>
          </div>

          {/* Right Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Right Images
            </label>
            <div className="space-y-4">
              {content.rightImages.map((image, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage('right', index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage('right', index, Math.min(content.rightImages.length - 1, index + 1))}
                      disabled={index === content.rightImages.length - 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <img 
                    src={image} 
                    alt={`Right image ${index + 1}`} 
                    className="w-20 h-20 object-cover rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('right', index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setRightImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Introduction
          </label>
          <textarea
            value={content.introduction}
            onChange={(e) => setContent({ ...content, introduction: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Background
          </label>
          <textarea
            value={content.background}
            onChange={(e) => setContent({ ...content, background: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Skills
          </label>
          <div className="space-y-2">
            {content.skills.map((skill: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* What Drives Me */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What Drives Me
          </label>
          <textarea
            value={content.whatDrivesMe}
            onChange={(e) => setContent({ ...content, whatDrivesMe: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
} 