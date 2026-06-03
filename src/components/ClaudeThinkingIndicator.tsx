/**
 * Shown while Bill/Claude is generating (empty stream state). Original CSS animation — not a GIF.
 */
export function ClaudeThinkingIndicator({ showCredit = true }: { showCredit?: boolean }) {
  return (
    <div className="claude-thinking" role="status" aria-live="polite" aria-label="Bill is thinking">
      <span className="claude-thinking__dots" aria-hidden>
        <span className="claude-thinking__dot" />
        <span className="claude-thinking__dot" />
        <span className="claude-thinking__dot" />
      </span>
      {showCredit ? <span className="claude-thinking__credit">Powered by Claude</span> : null}
    </div>
  );
}
