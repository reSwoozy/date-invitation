function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

/** Slot-machine style pick; calls onTick for each highlight, returns final activity id. */
export async function runSurprisePick(
  activityIds: string[],
  onTick: (activityId: string) => void,
): Promise<string> {
  if (activityIds.length === 0) {
    throw new Error('No activities configured')
  }

  const final = pickRandom(activityIds)
  const totalTicks = 18

  for (let i = 0; i < totalTicks; i++) {
    const isLast = i === totalTicks - 1
    onTick(isLast ? final : pickRandom(activityIds))
    await sleep(65 + i * 22)
  }

  return final
}
