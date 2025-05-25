'use client';

import { useState, FormEvent } from 'react';
import { socialLinks } from '@/data/social';
import { SocialLinks } from '@/data/types';
import Link from 'next/link';

export default function SocialPage() {
  const [content, setContent] = useState<SocialLinks>(socialLinks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error('Failed to update social links');
      }

      setMessage({ type: 'success', text: 'Social links updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update social links. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/" className="inline-block mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">← Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-8">Edit Social Links</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            value={content.github}
            onChange={(e) => setContent({ ...content, github: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            placeholder="https://github.com/username"
          />
        </div>

        {/* Itch.io */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Itch.io URL
          </label>
          <input
            type="url"
            value={content.itch}
            onChange={(e) => setContent({ ...content, itch: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            placeholder="https://username.itch.io"
          />
        </div>

        {/* Linktree */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Linktree URL
          </label>
          <input
            type="url"
            value={content.linktree}
            onChange={(e) => setContent({ ...content, linktree: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            placeholder="https://linktr.ee/username"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={content.linkedin}
            onChange={(e) => setContent({ ...content, linkedin: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
} 