import { UserCheck, FileCheck, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Fullscreen Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-gradient-to-tr from-blue-100 via-white to-gray-100 opacity-50 w-full h-full"></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          CertiFie
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Revolutionizing trust with blockchain technology. Issue, verify, and manage certificates with
          authenticity and transparency.
        </p>
        <Button
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transform transition"
          onClick={() => navigate('/issuer')}
        >
          Get Started
        </Button>
      </section>

      {/* Dashboard Section */}
      <section className="py-10 px-6 md:px-16">
        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard
            title="Admin Dashboard"
            icon={<UserCheck className="h-8 w-8 text-blue-400" />}
            description="Validate and manage issuers. Keep the ecosystem secure."
            onClick={() => navigate('/admin')}
          />
          <RoleCard
            title="Issuer Dashboard"
            icon={<FileCheck className="h-8 w-8 text-blue-400" />}
            description="Issue tamper-proof blockchain certificates seamlessly."
            onClick={() => navigate('/issuer')}
          />
          <RoleCard
            title="Verification Portal"
            icon={<Shield className="h-8 w-8 text-blue-400" />}
            description="Verify document authenticity with just a few clicks."
            onClick={() => navigate('/verify')}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-blue-50 py-16 text-center rounded-t-2xl">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">Why CertiFie?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<span className="text-blue-400 text-3xl font-extrabold">#1</span>}
              title="Decentralized Trust"
              description="CertiFie leverages blockchain to provide a trustless system that ensures data integrity and security."
            />
            <FeatureCard
              icon={<span className="text-pink-400 text-3xl font-extrabold">🚀</span>}
              title="Instant Verification"
              description="With a few clicks, verify authenticity globally in real time."
            />
            <FeatureCard
              icon={<span className="text-green-400 text-3xl font-extrabold">🌐</span>}
              title="Global Reach"
              description="Whether you're in New York or Nairobi, CertiFie offers a unified platform to issue and verify certificates."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  title,
  icon,
  description,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}) {
  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 opacity-20 blur-md"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="p-4 bg-blue-100 rounded-full shadow-lg">{icon}</div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
        <Button
          className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:scale-105 transition"
          onClick={onClick}
        >
          Explore
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transform hover:scale-105 transition-transform">
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
