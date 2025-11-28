import { BlogPost, Comment } from '../types';

// Configuration for the Flask Backend (Default port is 5000)
const API_BASE_URL = 'http://localhost:5000/api';

const POSTS_KEY = 'safehaven_posts';
const REPORTS_KEY = 'safehaven_reports';

// Initial Mock Data (Fallback)
const INITIAL_POSTS: BlogPost[] = [
    {
      id: '1',
      author: 'Sarah Jenkins',
      content: 'Recovery is not a straight line. Some days are harder than others, but finding a community that understands has been my saving grace. Remember, you are not alone in this journey.',
      timestamp: '2 hours ago',
      likes: 24,
      comments: [
        { id: 'c1', author: 'Mike T.', content: 'Thank you for sharing this. Needed to hear it today.', timestamp: '1 hour ago' }
      ]
    },
    {
      id: '2',
      author: 'Anonymous',
      content: 'Today marks one year since I left my abusive situation. It was the hardest thing I ever did, but the freedom I feel now is worth every struggle. To anyone thinking about leaving: You can do it.',
      timestamp: '5 hours ago',
      likes: 156,
      comments: []
    }
];

export const db = {
  // Utility to check connection status for the UI
  checkHealth: async (): Promise<boolean> => {
    try {
        // We assume the backend has a root or health endpoint, or we just try fetching posts
        const response = await fetch(`${API_BASE_URL}/posts/`, { method: 'GET' }); 
        return response.ok;
    } catch (e) {
        return false;
    }
  },

  // --- Blog Logic ---
  getPosts: async (): Promise<BlogPost[]> => {
    try {
        // Try Flask API
        const response = await fetch(`${API_BASE_URL}/posts/`);
        if (!response.ok) throw new Error('Backend unavailable');
        return await response.json();
    } catch (error) {
        // Fallback to LocalStorage
        console.warn("Flask backend unreachable. Using LocalStorage.");
        const stored = localStorage.getItem(POSTS_KEY);
        if (!stored) {
            localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
            return INITIAL_POSTS;
        }
        return JSON.parse(stored);
    }
  },

  addPost: async (post: BlogPost): Promise<BlogPost[]> => {
    try {
        // Try Flask API
        const response = await fetch(`${API_BASE_URL}/posts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        if (!response.ok) throw new Error('Backend Error');
        
        // If successful, re-fetch all posts to ensure sync
        return await db.getPosts();
    } catch (error) {
        // Fallback
        const posts = await db.getPosts(); 
        const newPosts = [post, ...posts];
        localStorage.setItem(POSTS_KEY, JSON.stringify(newPosts));
        return newPosts;
    }
  },

  addComment: async (postId: string, comment: Comment): Promise<BlogPost[]> => {
    try {
         // Try Flask API
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment)
        });
        if (!response.ok) throw new Error('Backend Error');
        return await db.getPosts();
    } catch (error) {
        // Fallback
        const posts = await db.getPosts();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...p.comments, comment] };
            }
            return p;
        });
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        return updatedPosts;
    }
  },

  toggleLike: async (postId: string): Promise<BlogPost[]> => {
    try {
         // Try Flask API
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Backend Error');
        return await db.getPosts();
    } catch (error) {
        // Fallback
        const posts = await db.getPosts();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, likes: p.likes + 1 };
            }
            return p;
        });
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        return updatedPosts;
    }
  },

  // --- Reports Logic ---
  saveReport: async (report: any) => {
    try {
        // Try Flask API
        const response = await fetch(`${API_BASE_URL}/reports/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
        if (!response.ok) throw new Error('Backend Error');
        console.log("Backend: Report sent to server.");
        return true;
    } catch (error) {
        // Fallback
        console.warn("Flask backend unreachable. Saving report locally.");
        const stored = localStorage.getItem(REPORTS_KEY);
        const reports = stored ? JSON.parse(stored) : [];
        const newReport = { 
            ...report, 
            id: Date.now().toString(), 
            submittedAt: new Date().toISOString() 
        };
        reports.push(newReport);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
        return true;
    }
  }
};