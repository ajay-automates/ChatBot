// pages/dashboard/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';

interface Chatbot {
  id: string;
  name: string;
  websiteUrl?: string;
  plan: string;
  slackWebhookUrl?: string;
  kbDocuments: any[];
  _count: {
    conversations: number;
  };
}

export default function ChatbotDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [slackUrl, setSlackUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchChatbot();
    }
  }, [id]);

  const fetchChatbot = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chatbots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChatbot(data);
        setSlackUrl(data.slackWebhookUrl || '');
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching chatbot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/knowledge/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully imported ${data.imported} documents`);
        fetchChatbot();
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSlackUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slackWebhookUrl: slackUrl }),
      });

      if (response.ok) {
        alert('Slack webhook updated');
        fetchChatbot();
      }
    } catch (error) {
      console.error('Error updating Slack:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chatbot not found</p>
      </div>
    );
  }

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/api/chatbots/${id}/widget.js"></script>`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container-max flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">{chatbot.name}</h1>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {chatbot.plan}
          </span>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-4 font-medium border-b-2 transition ${
              activeTab === 'knowledge'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-4 font-medium border-b-2 transition ${
              activeTab === 'embed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Embed
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 font-medium border-b-2 transition ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 font-medium border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container-max py-10">
        {activeTab === 'overview' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Chatbot Name</p>
                <p className="text-lg font-medium">{chatbot.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Website</p>
                <p className="text-lg font-medium">{chatbot.websiteUrl || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Conversations</p>
                <p className="text-lg font-medium">{chatbot._count.conversations}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Knowledge Base Documents</p>
                <p className="text-lg font-medium">{chatbot.kbDocuments.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Knowledge Base</h2>
            
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold mb-2">Upload Knowledge Base</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload FAQ data in JSON, CSV, or Markdown format
              </p>
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                  </span>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept=".json,.csv,.md,.txt"
                />
              </label>
            </div>

            <h3 className="font-bold mb-4">Uploaded Documents ({chatbot.kbDocuments.length})</h3>
            {chatbot.kbDocuments.length === 0 ? (
              <p className="text-gray-600">No documents uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {chatbot.kbDocuments.map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.sourceType}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Embed Code</h2>
            <p className="text-gray-600 mb-4">
              Copy this code and paste it into your website HTML, just before the closing &lt;/body&gt; tag:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
              {embedCode}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
                alert('Copied to clipboard!');
              }}
              className="btn-primary"
            >
              Copy Code
            </button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm">Total Conversations</p>
                <p className="text-3xl font-bold">{chatbot._count.conversations}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm">Knowledge Docs</p>
                <p className="text-3xl font-bold">{chatbot.kbDocuments.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Slack Webhook URL
                </label>
                <p className="text-gray-600 text-sm mb-4">
                  Get escalation notifications in Slack
                </p>
                <input
                  type="text"
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  className="input mb-4"
                  placeholder="https://hooks.slack.com/services/..."
                />
                <button onClick={handleSlackUpdate} className="btn-primary">
                  Update Slack Webhook
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
