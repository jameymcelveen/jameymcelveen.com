import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatContactEmail, validateContact } from './contact.ts';

const good = {
  name: 'Ann Lee',
  email: 'ann@example.com',
  company: 'Acme',
  message: 'Hello there.',
};

describe('validateContact', () => {
  it('accepts a normal message', () => {
    const r = validateContact(good);
    assert.equal(r.ok, true);
    if (r.ok) assert.deepEqual(r.contact, good);
  });

  it('requires name, a valid email and a message', () => {
    assert.equal(validateContact({ ...good, name: ' ' }).ok, false);
    assert.equal(validateContact({ ...good, email: '' }).ok, false);
    assert.equal(validateContact({ ...good, email: 'not-an-email' }).ok, false);
    assert.equal(validateContact({ ...good, message: '' }).ok, false);
    assert.equal(validateContact(null).ok, false);
  });

  it('flags the honeypot as spam', () => {
    const r = validateContact({ ...good, website: 'http://spam.example' });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.spam, true);
  });

  it('strips control characters and keeps line breaks in the message', () => {
    const r = validateContact({ ...good, name: 'Ann\u0007 Lee', message: 'Line one\r\nLine two' });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.contact.name, 'Ann Lee');
      assert.equal(r.contact.message, 'Line one\nLine two');
    }
  });

  it('caps long fields', () => {
    const r = validateContact({ ...good, message: 'x'.repeat(9000) });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.contact.message.length, 5000);
  });
});

describe('formatContactEmail', () => {
  it('builds a plain text email with the sender details', () => {
    const { subject, text } = formatContactEmail(good, new Date('2026-11-26T12:00:00Z'));
    assert.equal(subject, 'jameymcelveen.com: message from Ann Lee (Acme)');
    assert.match(text, /Email: ann@example.com/);
    assert.match(text, /Hello there\./);
  });
});
