const QUESTIONS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 7) % 90}%`,
  delay: `${(i * 0.65) % 5}s`,
  duration: `${6 + (i % 4)}s`,
  size: `${16 + (i % 5) * 5}px`,
}))

export function FloatingQuestions() {
  return (
    <div className="floating-questions" aria-hidden="true">
      {QUESTIONS.map((q) => (
        <span
          key={q.id}
          className="floating-question"
          style={{
            left: q.left,
            animationDelay: q.delay,
            animationDuration: q.duration,
            fontSize: q.size,
          }}
        >
          ?
        </span>
      ))}
    </div>
  )
}
