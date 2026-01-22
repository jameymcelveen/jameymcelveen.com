'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

// Encode contact info to prevent scraping
// Values are base64 encoded and decoded client-side
const ENCODED_EMAIL = 'amFtZXlAbWNlbHZlZW4udXM='; // jamey@mcelveen.us
const ENCODED_PHONE = 'KDg0MykgNjE4LTgwNzg='; // (843) 618-8078
const ENCODED_PHONE_HREF = 'KzE4NDM2MTg4MDc4'; // +18436188078

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
    // Decode after a small delay to further confuse scrapers
    const timer = setTimeout(() => {
      setEmail(decode(ENCODED_EMAIL));
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <span className={className}>
        <Mail className="h-4 w-4" />
        <span className="ml-2 animate-pulse">Loading...</span>
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
    const timer = setTimeout(() => {
      setPhone(decode(ENCODED_PHONE));
      setPhoneHref(decode(ENCODED_PHONE_HREF));
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <span className={className}>
        <Phone className="h-4 w-4" />
        <span className="ml-2 animate-pulse">Loading...</span>
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
  return (
    <div className={className}>
      <ObfuscatedEmail className="hover:text-accent flex items-center gap-2 transition-colors" />
      <ObfuscatedPhone className="hover:text-accent flex items-center gap-2 transition-colors" />
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Timmonsville, SC
      </span>
    </div>
  );
}
