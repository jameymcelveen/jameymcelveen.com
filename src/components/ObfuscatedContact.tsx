'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getContactInfo } from '@/data';

// Encode contact info to prevent scraping
// Values are base64 encoded and decoded client-side
// Pre-encoded values (computed at build time)
const contact = getContactInfo();
const ENCODED_EMAIL = typeof window !== 'undefined' ? btoa(contact.email) : 'amFtZXlAbWNlbHZlZW4udXM=';
const ENCODED_PHONE = typeof window !== 'undefined' ? btoa(contact.phone) : 'KDg0MykgNjE4LTgwNzg=';
const ENCODED_PHONE_HREF = typeof window !== 'undefined' ? btoa(contact.phoneHref) : 'KzE4NDM2MTg4MDc4';

function decode(encoded: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return atob(encoded);
  } catch {
    return '';
  }
}

export function ObfuscatedEmail({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setEmail(decode(ENCODED_EMAIL));
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <span className={className} aria-busy="true" aria-label="Email">
        <Mail className="h-4 w-4 shrink-0 text-foreground-muted" />
        <span className="bg-foreground/12 ml-2 inline-block h-4 w-[11.5rem] animate-pulse rounded" />
      </span>
    );
  }

  return (
    <a href={`mailto:${email}`} className={className}>
      <Mail className="h-4 w-4" />
      <span className="ml-2">{email}</span>
    </a>
  );
}

export function ObfuscatedPhone({ className }: { className?: string }) {
  const [phone, setPhone] = useState('');
  const [phoneHref, setPhoneHref] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPhone(decode(ENCODED_PHONE));
      setPhoneHref(decode(ENCODED_PHONE_HREF));
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <span className={className} aria-busy="true" aria-label="Phone">
        <Phone className="h-4 w-4 shrink-0 text-foreground-muted" />
        <span className="bg-foreground/12 ml-2 inline-block h-4 w-[7.5rem] animate-pulse rounded" />
      </span>
    );
  }

  return (
    <a href={`tel:${phoneHref}`} className={className}>
      <Phone className="h-4 w-4" />
      <span className="ml-2">{phone}</span>
    </a>
  );
}

export function ObfuscatedContactBlock({ className }: { className?: string }) {
  const contact = getContactInfo();
  return (
    <div className={className}>
      <ObfuscatedEmail className="hover:text-accent flex items-center gap-2 transition-colors" />
      <ObfuscatedPhone className="hover:text-accent flex items-center gap-2 transition-colors" />
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {contact.location}
      </span>
    </div>
  );
}
