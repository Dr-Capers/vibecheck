export const MOOD_OPTIONS = [
  { key: 'happy', label: 'On Fire', emoji: '🔥' },
  { key: 'meh', label: 'Solid', emoji: '🙂' },
  { key: 'sad', label: 'Meh', emoji: '😵‍💫' }
] as const

export type MoodOption = (typeof MOOD_OPTIONS)[number]
export type MoodKey = MoodOption['key']
export type MoodCounts = Record<MoodKey, number>

const MOOD_KEY_SET = new Set<MoodKey>(MOOD_OPTIONS.map((option) => option.key))

export const isMoodKey = (value: string): value is MoodKey =>
  MOOD_KEY_SET.has(value as MoodKey)

export const KEY_TO_EMOJI: Record<MoodKey, string> = MOOD_OPTIONS.reduce(
  (result, option) => {
    result[option.key] = option.emoji
    return result
  },
  {} as Record<MoodKey, string>
)

export const EMOJI_TO_KEY: Record<string, MoodKey> = Object.fromEntries(
  Object.entries(KEY_TO_EMOJI).map(([key, emoji]) => [emoji, key])
) as Record<string, MoodKey>

export const createEmptyCounts = (): MoodCounts => ({
  happy: 0,
  meh: 0,
  sad: 0
})
