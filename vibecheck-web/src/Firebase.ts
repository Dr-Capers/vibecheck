import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore'
import {
    createEmptyCounts,
    EMOJI_TO_KEY,
    KEY_TO_EMOJI,
    isMoodKey,
    type MoodCounts,
    type MoodKey
} from './moods'
import type { LocationLookupResult } from './location'

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCE5yytgFmOgcXrKsBjmqJTlfqX7hk1Qd0",
    authDomain: "vibecheck-11991.firebaseapp.com",
    projectId: "vibecheck-11991",
    storageBucket: "vibecheck-11991.firebasestorage.app",
    messagingSenderId: "831471196012",
    appId: "1:831471196012:web:5310ddf460d62f5173c549",
    measurementId: "G-8Y1425FN99"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

const LAST_VOTE_KEY = 'vibecheck:lastVote'
const VOTE_COLLECTIONS = ['moods', 'votes'] as const

export interface VoteLocation {
    latitude: number
    longitude: number
    city?: string
    region?: string
    country?: string
}

export interface VotePoint extends VoteLocation {
    mood: MoodKey
    timestamp: number
}

export interface VoteData {
    counts: MoodCounts
    points: VotePoint[]
}

/**
 * Submit a mood vote to Firestore
 */
export async function submitVote(mood: MoodKey, location?: LocationLookupResult | null) {
    const voteRef = doc(collection(db, 'moods'))
    await setDoc(voteRef, {
        key: mood,
        mood: KEY_TO_EMOJI[mood],
        timestamp: serverTimestamp(),
        location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                city: location.city ?? null,
                region: location.region ?? null,
                country: location.country ?? null
            }
            : null
    })
}

/**
 * Fetch recent votes and return a mood count map
 */
export async function fetchRecentVotes(): Promise<VoteData> {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const moodCounts = createEmptyCounts()
    const points: VotePoint[] = []

    const applyVote = (data: Record<string, unknown>) => {
        const timestamp = data.timestamp
        if (timestamp instanceof Timestamp) {
            if (timestamp.toMillis() < cutoff) {
                return
            }
        } else if (typeof timestamp === 'number') {
            if (timestamp < cutoff) {
                return
            }
        }

        const moodKey = normaliseMoodKey(data)
        if (!moodKey) {
            return
        }

        moodCounts[moodKey] += 1

        const timestampMs = timestamp instanceof Timestamp ? timestamp.toMillis() : typeof timestamp === 'number' ? timestamp : Date.now()
        const locationData = normaliseLocation(data.location)
        if (locationData) {
            points.push({
                mood: moodKey,
                timestamp: timestampMs,
                ...locationData
            })
        }
    }

    for (const name of VOTE_COLLECTIONS) {
        const snapshot = await getDocs(collection(db, name))
        snapshot.forEach((doc) => {
            applyVote(doc.data())
        })
    }

    return { counts: moodCounts, points }
}

/**
 * Check if the user has already voted today (based on localStorage)
 */
export function hasVotedToday(): boolean {
    const storedDate = localStorage.getItem(LAST_VOTE_KEY)
    const today = new Date().toISOString().slice(0, 10)
    return storedDate === today
}

/**
 * Record that the user has submitted today's vote.
 */
export function markVotedToday() {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(LAST_VOTE_KEY, today)
}

/**
 * Returns the timestamp (in ms) when the current vote lock will reset.
 */
export function getVoteResetTimestamp(): number | null {
    const storedDate = localStorage.getItem(LAST_VOTE_KEY)
    if (!storedDate) {
        return null
    }

    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)
    if (storedDate !== todayKey) {
        return null
    }

    const nextMidnight = new Date()
    nextMidnight.setHours(24, 0, 0, 0)
    return nextMidnight.getTime()
}

function normaliseMoodKey(data: Record<string, unknown>): MoodKey | null {
    const keyValue = data.key
    if (typeof keyValue === 'string' && isMoodKey(keyValue)) {
        return keyValue
    }

    const moodValue = data.mood
    if (typeof moodValue === 'string') {
        if (moodValue in EMOJI_TO_KEY) {
            return EMOJI_TO_KEY[moodValue]
        }
        if (isMoodKey(moodValue)) {
            return moodValue
        }
    }

    return null
}

function normaliseLocation(value: unknown): VoteLocation | null {
    if (!value || typeof value !== 'object') {
        return null
    }

    const candidate = value as Record<string, unknown>
    const latitude = Number(candidate.latitude)
    const longitude = Number(candidate.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
    }

    const location: VoteLocation = {
        latitude,
        longitude
    }

    if (typeof candidate.city === 'string') {
        location.city = candidate.city
    }
    if (typeof candidate.region === 'string') {
        location.region = candidate.region
    }
    if (typeof candidate.country === 'string') {
        location.country = candidate.country
    }

    return location
}
