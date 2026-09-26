import { slideBackground, withAlpha } from '../../lib/themes'
import type { Theme } from '../../lib/types'
import { cn } from '../../lib/utils'

export function ThemeSwatch({ theme, className }: { theme: Theme; className?: string }) {
  const tokens = theme.tokens
  const line = (width: string, height: number, color: string, radius = 3) => (
    <div style={{ width, height, borderRadius: radius, background: color }} />
  )

  return (
    <div
      className={cn('relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-line', className)}
      style={slideBackground(tokens)}
    >
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tokens.kickerStyle === 'chip' ? (
          <div
            style={{
              width: 44,
              height: 12,
              borderRadius: 999,
              background: withAlpha(tokens.accent, 0.18),
            }}
          />
        ) : (
          <div style={{ width: 26, height: 4, borderRadius: 999, background: tokens.accent }} />
        )}
        {line('86%', 9, withAlpha(tokens.text, 0.9), 3)}
        {line('62%', 9, withAlpha(tokens.text, 0.9), 3)}
        <div style={{ height: 4 }} />
        {line('72%', 5, withAlpha(tokens.muted, 0.85), 3)}
        {line('54%', 5, withAlpha(tokens.muted, 0.85), 3)}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 14,
          bottom: 14,
          width: 54,
          height: 16,
          borderRadius: 999,
          background: tokens.accent,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 14,
          bottom: 16,
          width: 22,
          height: 4,
          borderRadius: 999,
          background: withAlpha(tokens.muted, 0.8),
        }}
      />
    </div>
  )
}
