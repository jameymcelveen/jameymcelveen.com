'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PinGate } from '@/components/PinGate';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const templates = [
  {
    id: 'christian-tech',
    title: 'Christian Tech',
    icon: '⛪',
    description: 'For mission-driven organizations in the faith technology space',
    color: 'accent',
    content: `Dear [Hiring Manager],

I am excited to apply for the [Position] role at [Company]. Your mission to serve churches and faith communities through technology resonates deeply with my 25+ years of experience building solutions in this space.

At ACS Technologies, I led the engineering of Realm, a platform serving 50,000+ churches. I directed an R&D team of 20+ developers and pioneered ChurchLife in 2008—one of the first 100 apps on the Apple App Store. This experience gave me unique insight into the needs of faith organizations and the technical challenges of serving them at scale.

More recently at SecureGive, I architected high-performance APIs and integrated AI-augmented development workflows using Cursor, increasing our sprint velocity by approximately 30% while maintaining high code quality. I believe this combination of domain expertise and modern engineering practices can significantly benefit your team.

I am particularly drawn to [Company]'s commitment to [specific value/feature]. I would welcome the opportunity to contribute my experience in .NET Core, React, and scalable architecture to your mission.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Sincerely,
Jamey McElveen`,
  },
  {
    id: 'fintech',
    title: 'FinTech',
    icon: '💳',
    description: 'For financial technology and payment processing companies',
    color: 'emerald',
    content: `Dear [Hiring Manager],

I am writing to express my interest in the [Position] role at [Company]. With extensive experience in payment processing and financial software, I am excited about the opportunity to contribute to your team.

At SecureGive, I architected high-performance APIs using Snowflake and .NET Core, processing transactions for thousands of organizations. I developed full-stack solutions using Scala, Angular, and React Native, ensuring secure and reliable financial operations.

My 25+ years of experience spans architecting scalable solutions for platforms serving 50,000+ organizations. I have pioneered AI-augmented development workflows that increase velocity while maintaining the rigorous quality standards essential in financial applications.

I am impressed by [Company]'s approach to [specific feature/value]. My background in both technical architecture and team leadership would allow me to contribute immediately while growing with your organization.

I am available to start immediately in a remote capacity and am willing to adjust my work hours to accommodate team timezones. Thank you for your consideration.

Sincerely,
Jamey McElveen`,
  },
  {
    id: 'healthcare',
    title: 'Healthcare Tech',
    icon: '🏥',
    description: 'For healthcare systems and medical technology companies',
    color: 'pink',
    content: `Dear [Hiring Manager],

I am eager to apply for the [Position] role at [Company]. My experience modernizing healthcare infrastructure at McLeod Health has prepared me well for this opportunity.

At McLeod Health, I modernized legacy C# codebases to .NET Core standards for critical HR and healthcare systems. I introduced Git SCM and CI/CD practices to the organization, significantly improving our development workflow and code reliability. I also mentored interns using Agile methodologies, ensuring quality output and knowledge transfer.

With 25+ years of software architecture experience, I understand the importance of reliability, security, and compliance in healthcare systems. My recent work with AI-augmented development (Cursor) has shown me how to increase productivity while maintaining the rigorous standards healthcare demands.

I am drawn to [Company]'s commitment to [specific value/feature] and would welcome the opportunity to bring my experience to your team.

Thank you for considering my application.

Sincerely,
Jamey McElveen`,
  },
  {
    id: 'general',
    title: 'General Tech',
    icon: '💻',
    description: 'Adaptable template for any technology company',
    color: 'violet',
    content: `Dear [Hiring Manager],

I am excited to apply for the [Position] role at [Company]. With 25+ years of experience as a software architect and engineering leader, I am confident in my ability to contribute to your team.

Throughout my career, I have:
• Directed R&D teams of 20+ developers, managing hiring, mentorship, and product roadmaps
• Architected platforms serving 50,000+ organizations
• Pioneered mobile development with apps among the first 100 on the Apple App Store
• Modernized legacy systems to modern .NET Core standards
• Integrated AI-augmented development workflows, increasing sprint velocity by ~30%

My technical expertise spans C#, .NET Core, React, TypeScript, Angular, and data platforms like Snowflake and PostgreSQL. I bring both hands-on coding skills and leadership experience to every role.

I am particularly impressed by [Company]'s [specific value/feature]. I am available to start immediately in a remote capacity and am flexible with timezone accommodations.

Thank you for your consideration. I look forward to discussing how I can contribute to your success.

Sincerely,
Jamey McElveen`,
  },
];

function CoverLettersContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTemplate = templates.find((t) => t.id === selectedTemplate);

  const copyToClipboard = async () => {
    if (activeTemplate) {
      await navigator.clipboard.writeText(activeTemplate.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      accent: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500' },
    };
    return colors[color] || colors.accent;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold sm:text-5xl">Cover Letters</h1>
          <p className="text-foreground-muted">Industry-tailored templates ready to customize</p>
        </motion.div>

        {/* AI Tip */}
        <motion.div
          variants={itemVariants}
          className="glass-card border-accent mb-8 border-l-4 p-4"
        >
          <p className="text-foreground-muted text-sm">
            <span className="text-accent font-medium">💡 Pro Tip:</span> Use these templates as a
            starting point. For AI-powered customization with specific job descriptions, see the{' '}
            <code className="bg-accent/10 text-accent rounded px-1.5 py-0.5 font-mono text-xs">
              /tools
            </code>{' '}
            folder in the repo for Cursor-based generation scripts.
          </p>
        </motion.div>

        {/* Template Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => {
            const colors = getColorClasses(template.color);
            const isSelected = selectedTemplate === template.id;
            return (
              <motion.button
                key={template.id}
                variants={itemVariants}
                onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                className={`glass-card p-6 text-left transition-all hover:scale-[1.02] ${
                  isSelected ? `border-2 ${colors.border}` : ''
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${colors.bg}`}
                  >
                    {template.icon}
                  </span>
                  <h3 className="text-foreground text-lg font-semibold">{template.title}</h3>
                </div>
                <p className="text-foreground-muted text-sm">{template.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Template Preview */}
        {activeTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <div className="glass-card overflow-hidden">
              <div className="border-glass-border flex items-center justify-between border-b p-4">
                <h3 className="text-foreground font-medium">
                  {activeTemplate.icon} {activeTemplate.title} Template
                </h3>
                <button
                  onClick={copyToClipboard}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-foreground-muted max-h-96 overflow-auto p-6 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                {activeTemplate.content}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div variants={itemVariants} className="mt-12">
          <h2 className="text-accent mb-4 font-mono text-xs tracking-widest uppercase">
            How to Use
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card p-4">
              <div className="mb-2 text-2xl">1️⃣</div>
              <h3 className="text-foreground mb-1 font-medium">Select Template</h3>
              <p className="text-foreground-muted text-sm">
                Choose the industry that best matches the role
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="mb-2 text-2xl">2️⃣</div>
              <h3 className="text-foreground mb-1 font-medium">Customize</h3>
              <p className="text-foreground-muted text-sm">
                Replace [bracketed] placeholders with specifics
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="mb-2 text-2xl">3️⃣</div>
              <h3 className="text-foreground mb-1 font-medium">AI Polish</h3>
              <p className="text-foreground-muted text-sm">
                Use Cursor to tailor for specific job descriptions
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CoverLettersPage() {
  return (
    <PinGate>
      <CoverLettersContent />
    </PinGate>
  );
}
