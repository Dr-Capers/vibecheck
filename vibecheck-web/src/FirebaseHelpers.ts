// firebaseHelpers.ts
import { collection, getDocs } from 'firebase/firestore'
import { db } from './Firebase'

export const fetchMoodCounts = async (): Promise<{ [key: string]: number }> => {
    const moodCollection = collection(db, 'moods')
    const moodSnapshot = await getDocs(moodCollection)
    const counts: { [key: string]: number } = {}

    moodSnapshot.forEach((doc) => {
        const mood = doc.data().mood
        if (mood) {
            counts[mood] = (counts[mood] || 0) + 1
        }
    })

    return counts
}