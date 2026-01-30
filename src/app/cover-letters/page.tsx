'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PinGate } from '@/components/PinGate';
import { getCoverLetters } from '@/data';

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


function CoverLettersContent() {
  const coverLetters = getCoverLetters();
  const templates = coverLetters.templates;
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
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500' },
    };
    return colors[color] || colors.accent;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 text-center sm:mb-8">
          <h1 className="text-gradient mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">
            {coverLetters.pageTitle}
          </h1>
          <p className="text-foreground-muted text-sm sm:text-base">
            {coverLetters.pageSubtitle}
          </p>
        </motion.div>

        {/* AI Tip */}
        <motion.div
          variants={itemVariants}
          className="glass-card border-accent mb-6 border-l-4 p-3 sm:mb-8 sm:p-4"
        >
          <p className="text-foreground-muted text-xs sm:text-sm">
            <span className="text-accent font-medium">💡 Pro Tip:</span> {coverLetters.proTip}
          </p>
        </motion.div>

        {/* Template Grid */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {templates.map((template) => {
            const colors = getColorClasses(template.color);
            const isSelected = selectedTemplate === template.id;
            return (
              <motion.button
                key={template.id}
                variants={itemVariants}
                onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                className={`glass-card p-4 text-left transition-all hover:scale-[1.01] sm:p-6 sm:hover:scale-[1.02] ${
                  isSelected ? `border-2 ${colors.border}` : ''
                }`}
              >
                <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-base sm:h-10 sm:w-10 sm:text-xl ${colors.bg}`}
                  >
                    {template.icon}
                  </span>
                  <h3 className="text-foreground text-base font-semibold sm:text-lg">
                    {template.title}
                  </h3>
                </div>
                <p className="text-foreground-muted text-xs sm:text-sm">{template.description}</p>
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
            className="mt-6 sm:mt-8"
          >
            <div className="glass-card overflow-hidden">
              <div className="border-glass-border flex items-center justify-between border-b p-3 sm:p-4">
                <h3 className="text-foreground text-sm font-medium sm:text-base">
                  {activeTemplate.icon} {activeTemplate.title} Template
                </h3>
                <button
                  onClick={copyToClipboard}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-foreground-muted max-h-72 overflow-auto p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap sm:max-h-96 sm:p-6 sm:text-sm">
                {activeTemplate.content}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div variants={itemVariants} className="mt-8 sm:mt-12">
          <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase sm:mb-4">
            How to Use
          </h2>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {coverLetters.instructions.map((instruction) => (
              <div key={instruction.step} className="glass-card p-3 sm:p-4">
                <div className="mb-1 text-xl sm:mb-2 sm:text-2xl">{instruction.emoji}</div>
                <h3 className="text-foreground mb-1 text-sm font-medium">{instruction.title}</h3>
                <p className="text-foreground-muted text-xs sm:text-sm">
                  {instruction.description}
                </p>
              </div>
            ))}
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
