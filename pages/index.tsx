// pages/index.tsx
import Link from 'next/link';
import { ArrowRight, MessageSquare, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container-max flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl">SupportBot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container-max">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Support Chatbot for Your Business
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Handle 80% of customer support questions automatically. Train it on your FAQ,
            embed it on your website, and let it work 24/7. Escalate complex issues to
            your team with a single Slack message.
          </p>
          <div className="flex gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Get Started Free <ArrowRight className="inline w-5 h-5 ml-2" />
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-max">
          <h2 className="text-3xl font-bold mb-16 text-center">Why Choose SupportBot?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <MessageSquare className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Smart AI Responses</h3>
              <p className="text-gray-600">
                Trained on your knowledge base. Answers questions automatically using
                retrieval-augmented generation (RAG).
              </p>
            </div>

            <div className="card">
              <Zap className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Easy to Setup</h3>
              <p className="text-gray-600">
                Upload your FAQ as JSON, CSV, or Markdown. Copy one line of code to your
                website. That's it.
              </p>
            </div>

            <div className="card">
              <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Full Analytics</h3>
              <p className="text-gray-600">
                Track conversations, satisfaction scores, response times, and escalations
                in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 container-max">
        <h2 className="text-3xl font-bold mb-16 text-center">Simple Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-sm">✓</span>
                100 conversations/month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-sm">✓</span>
                5 KB documents
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-300 rounded text-white flex items-center justify-center text-sm">✗</span>
                Slack integration
              </li>
            </ul>
            <button className="btn-secondary w-full">Get Started</button>
          </div>

          <div className="border-2 border-blue-600 rounded-lg p-8 bg-blue-50">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-6">$500<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-sm">✓</span>
                5,000 conversations/month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-sm">✓</span>
                Unlimited KB documents
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-sm">✓</span>
                Slack integration
              </li>
            </ul>
            <button className="btn-primary w-full">Start Free Trial</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Business</h3>
            <p className="text-4xl font-bold mb-6">$2,000<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-sm">✓</span>
                Unlimited conversations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-sm">✓</span>
                Custom knowledge base
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-sm">✓</span>
                Premium support
              </li>
            </ul>
            <button className="btn-secondary w-full">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to reduce support load by 80%?</h2>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition">
            Start Free Today
          </Link>
        </div>
      </section>
    </div>
  );
}
