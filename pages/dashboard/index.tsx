// pages/dashboard/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, MessageSquare, LogOut } from 'lucide-react';

interface Chatbot {
  id: string;
  name: string;
  websiteUrl?: string;
  plan: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotUrl, setNewBotUrl] = useState('');

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chatbots', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        return;
      }

      const data = await response.json();
      setChatbots(data);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBotName,
          websiteUrl: newBotUrl,
        }),
      });

      if (response.ok) {
        const newBot = await response.json();
        setChatbots([...chatbots, newBot]);
        setNewBotName('');
        setNewBotUrl('');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-max flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl">SupportBot</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-max py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Chatbots</h1>
            <p className="text-gray-600">Create and manage your support chatbots</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Chatbot
          </button>
        </div>

        {/* Chatbots Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : chatbots.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No chatbots yet</h3>
            <p className="text-gray-600 mb-6">Create your first chatbot to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Chatbot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => (
              <Link key={bot.id} href={`/dashboard/${bot.id}`}>
                <div className="card hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{bot.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(bot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {bot.plan}
                    </span>
                  </div>
                  
                  {bot.websiteUrl && (
                    <p className="text-sm text-gray-600 truncate mb-4">
                      {bot.websiteUrl}
                    </p>
                  )}
                  
                  <button className="text-blue-600 font-medium text-sm hover:underline">
                    Configure →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Bot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6">Create New Chatbot</h2>

            <form onSubmit={handleCreateBot} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="input"
                  placeholder="e.g., Support Bot"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={newBotUrl}
                  onChange={(e) => setNewBotUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
