const REQ_HEAD =
  /(what you.?ll need|requirements|qualifications|what we.?re looking for|who you are|must have|required skills|basic qualifications|minimum qualifications|you have|skills? (?:and|&) experience|experience required)/i;

const NEXT_HEAD =
  /(nice to have|preferred|bonus|benefits|perks|compensation|salary|about (?:us|the team)|why join|equal opportunity|eeo|what we offer|our stack|responsibilities)/i;

export function requirementsBlock(body: string | null | undefined): string {
  if (!body || !body.trim()) return '';
  const m = REQ_HEAD.exec(body);
  if (!m || m.index === undefined) return body;
  const start = m.index + m[0].length;
  if (start >= body.length) return body;
  const searchFrom = Math.min(start + 40, body.length);
  NEXT_HEAD.lastIndex = 0;
  const rest = body.slice(searchFrom);
  const n = NEXT_HEAD.exec(rest);
  const end = n ? searchFrom + n.index : Math.min(body.length, start + 2500);
  const block = body.slice(start, end).trim();
  return block.length > 120 ? block : body;
}
