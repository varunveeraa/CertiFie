import { Shield, FileCheck, UserCheck, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome to the Blockchain Certificate Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Issue, revoke, and verify certificates securely on the blockchain. 
          Trusted by verified issuers worldwide.
        </p>
      </section>

      {/* Role Cards */}
      <section className="grid md:grid-cols-3 gap-8">
        <RoleCard
          title="Admin Dashboard"
          icon={UserCheck}
          description="Verify issuers and maintain platform credibility"
          onClick={() => navigate('/admin')}
        />
        <RoleCard
          title="Issuer Dashboard"
          icon={FileCheck}
          description="Issue and manage blockchain-verified certificates"
          onClick={() => navigate('/issuer')}
        />
        <RoleCard
          title="Certificate Verification"
          icon={Shield}
          description="Verify the authenticity of certificates instantly"
          onClick={() => navigate('/verify')}
        />
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 rounded-2xl p-8 space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Why Choose CertiFie?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Blockchain Security"
            description="Immutable records ensuring certificate authenticity"
          />
          <FeatureCard
            title="Instant Verification"
            description="Verify certificates in seconds with complete trust"
          />
          <FeatureCard
            title="Trusted Issuers"
            description="Platform verified institutions and organizations"
          />
        </div>
      </section>
    </div>
  );
}

function RoleCard({ 
  title, 
  icon: Icon, 
  description, 
  onClick 
}: { 
  title: string; 
  icon: LucideIcon; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <Button variant="outline" icon={ArrowRight} onClick={onClick}>
          Access Dashboard
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}