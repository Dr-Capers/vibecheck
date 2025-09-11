import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
    serverTimestamp
} from 'firebase/firestore'

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

/**
 * Submit a mood vote to Firestore
 */
export async function submitVote(mood: string) {
    const voteRef = doc(collection(db, 'votes'))
    await setDoc(voteRef, {
        mood,
        timestamp: serverTimestamp()
    })
}

/**
 * Fetch recent votes and return a mood count map
 */
export async function fetchRecentVotes(): Promise<{ [key: string]: number }> {
    const querySnapshot = await getDocs(collection(db, 'votes'))
    const moodCounts: { [key: string]: number } = {}

    querySnapshot.forEach((doc) => {
        const data = doc.data()
        const mood = data.mood
        if (typeof mood === 'string') {
            moodCounts[mood] = (moodCounts[mood] || 0) + 1
        }
    })

    return moodCounts
}

/**
 * Check if the user has already voted today (based on localStorage)
 */
export async function hasVotedToday(): Promise<boolean> {
    const voted = localStorage.getItem('hasVoted')
    return voted === 'true'
}