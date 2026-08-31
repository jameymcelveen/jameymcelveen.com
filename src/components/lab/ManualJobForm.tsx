'use client';

import { useState } from 'react';

export type ManualJobFields = {
  title: string;
  company: string;
  url: string;
  notes?: string;
};

export function ManualJobForm({
  submitLabel,
  defaultTitle = '',
  defaultCompany = '',
  defaultUrl = '',
  showNotes = false,
  onSubmit,
  onCancel,
}: {
  submitLabel: string;
  defaultTitle?: string;
  defaultCompany?: string;
  defaultUrl?: string;
  showNotes?: boolean;
  onSubmit: (fields: ManualJobFields) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [company, setCompany] = useState(defaultCompany);
  const [url, setUrl] = useState(defaultUrl);
  const [notes, setNotes] = useState('');

  return (
    <form
      className="lab-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !company.trim()) return;
        onSubmit({
          title: title.trim(),
          company: company.trim(),
          url: url.trim(),
          notes: notes.trim() || undefined,
        });
      }}
    >
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Company
        <input value={company} onChange={(e) => setCompany(e.target.value)} required />
      </label>
      <label>
        Original URL
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
        />
      </label>
      {showNotes ? (
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
      ) : null}
      <div className="lab-form__actions">
        <button type="submit" className="lab-btn lab-btn--solid">
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="lab-btn" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
