import type { Metadata } from 'next';
import { BlogShell } from '@/components/blog/BlogShell';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact | Jamey McElveen',
  description: 'Send Jamey McElveen a message about a role, a project or anything else.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <BlogShell>
      <div className="bl-head">
        <div className="bl-meta">Contact</div>
        <h1>Send me a message</h1>
        <p>A role, a project, or just to say hello. It comes straight to my inbox.</p>
      </div>
      <ContactForm />
    </BlogShell>
  );
}
