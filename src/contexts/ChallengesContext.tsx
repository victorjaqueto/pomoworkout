import { ReactNode, createContext, useEffect, useState } from 'react'
import challenges from '../../challenges.json'
import Cookies from 'js-cookie'
import { LevelUpModal } from '../components/LevelUpModal';

export const ChallengesContext = createContext({} as ChallengesContextData)

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;    
}

interface ChallengesContextData {
    level: number
    levelUp: () => void
    currentExperience: number
    challengesCompleted: number
    startNewChallenge: () => void
    activeChallenge: Challenge
    resetChallenge: () => void
    experienceToNextLevel: number
    completeChallenge: () => void
    closeLevelUpModal: () => void
}

interface ChallengesProviderProps {
    children: ReactNode
    level: number
    currentExperience: number
    challengesCompleted: number
}

export function ChallengesProvider({ 
    children, 
    ...rest
}: ChallengesProviderProps) {
    const [level, setLevel] = useState(rest.level ?? 1)
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0)
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0)
    
    const [activeChallenge, setActiveChallenge] = useState(null)
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)
    
    const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

    useEffect(() => {
        Notification.requestPermission
    }, [])

    useEffect(() => {
        Cookies.set('level', String(level))
        Cookies.set('currentExperience', String(currentExperience))
        Cookies.set('challengesCompleted', String(challengesCompleted))
    }, [level, currentExperience, challengesCompleted])


function levelUp() {
    setLevel(level + 1)
    setIsLevelUpModalOpen(true)
}

function closeLevelUpModal(){
    setIsLevelUpModalOpen(false)
}

function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
    const challenge = challenges[randomChallengeIndex]

    setActiveChallenge(challenge)

    new Audio('/notification.mp3').play()

    if (Notification.permission === 'granted') {
        new Notification ('Novo desafio', {
            body: `Valendo ${challenge.amount} XP!`
        })
    }
}

function resetChallenge() {
    setActiveChallenge(null)
}

function completeChallenge() {
    if (!activeChallenge) {
        return;
    }

    const { amount } = activeChallenge

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel) {
        finalExperience = finalExperience - experienceToNextLevel
        levelUp()
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1)
}
return (
    <ChallengesContext.Provider
        value={{
            level,
            levelUp,
            currentExperience,
            challengesCompleted,
            startNewChallenge,
            activeChallenge,
            resetChallenge,
            experienceToNextLevel,
            completeChallenge,
            closeLevelUpModal,
        }}
    >
        {children}
    { isLevelUpModalOpen && <LevelUpModal />}
    </ChallengesContext.Provider>
    );
}