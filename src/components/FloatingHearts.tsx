const HEARTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 7) % 90}%`,
  delay: `${(i * 0.7) % 5}s`,
  duration: `${6 + (i % 4)}s`,
  size: `${14 + (i % 5) * 4}px`,
}))

export function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {HEARTS.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  )
}
