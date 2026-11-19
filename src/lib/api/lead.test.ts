import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLeadEmail, validateLead } from './lead.ts';
import { sanitizeHistory } from './chat-history.ts';
import { hasOffer, stripOffer } from '../ask-jamey-offer.ts';

const good = { name: 'Pat Lee', company: 'Acme, Engineering Manager', email: 'pat@acme.com', linkedin: '', transcript: [] };

test('accepts a name plus an email', () => {
  const r = validateLead(good);
  assert.ok(r.ok);
});

test('accepts a name plus a LinkedIn link without protocol', () => {
  const r = validateLead({ name: 'Pat', linkedin: 'linkedin.com/in/pat' });
  assert.ok(r.ok && r.lead.linkedin.startsWith('https://linkedin.com/in/pat'));
});

test('needs a name and some way to reply', () => {
  assert.equal(validateLead({ email: 'a@b.co' }).ok, false);
  assert.equal(validateLead({ name: 'Pat' }).ok, false);
});

test('rejects a bad email and a non-LinkedIn link', () => {
  assert.equal(validateLead({ name: 'Pat', email: 'not-an-email' }).ok, false);
  assert.equal(validateLead({ name: 'Pat', linkedin: 'https://evil.example/linkedin.com' }).ok, false);
});

test('honeypot marks the request as spam', () => {
  const r = validateLead({ ...good, website: 'http://spam.example' });
  assert.ok(!r.ok && r.spam === true);
});

test('line breaks cannot leak into the subject', () => {
  const r = validateLead({ ...good, name: 'Pat\r\nBcc: x@evil.com' });
  assert.ok(r.ok);
  if (r.ok) assert.doesNotMatch(formatLeadEmail(r.lead).subject, /[\r\n]/);
});

test('email is plain text with the transcript', () => {
  const r = validateLead({ ...good, transcript: [{ role: 'user', text: 'When can you start?' }, { role: 'assistant', text: 'Now.' }] });
  assert.ok(r.ok);
  if (r.ok) {
    const { text } = formatLeadEmail(r.lead);
    assert.match(text, /Visitor: When can you start\?/);
    assert.match(text, /Ask Jamey: Now\./);
  }
});

test('history keeps the last turns, starts with the visitor, drops junk', () => {
  const raw = [{ role: 'assistant', content: 'hi' }, { role: 'user', content: 'q1' }, { role: 'system', content: 'x' }, { role: 'assistant', content: 'a1' }, 5, null];
  assert.deepEqual(sanitizeHistory(raw), [{ role: 'user', content: 'q1' }, { role: 'assistant', content: 'a1' }]);
  assert.deepEqual(sanitizeHistory('nope'), []);
});

test('offer marker is detected and hidden, including half-arrived while streaming', () => {
  assert.ok(hasOffer('Sure. [[offer_contact]]'));
  assert.equal(stripOffer('Sure. [[offer_contact]]'), 'Sure.');
  assert.equal(stripOffer('Sure. [[offer_', true), 'Sure.');
  assert.equal(stripOffer('Array [[1]] is fine', true), 'Array [[1]] is fine');
});

test('the offer marker never reaches the email', () => {
  const r = validateLead({ ...good, transcript: [{ role: 'assistant', text: 'Now. [[offer_contact]]' }] });
  assert.ok(r.ok);
  if (r.ok) assert.doesNotMatch(formatLeadEmail(r.lead).text, /offer_contact/);
});
