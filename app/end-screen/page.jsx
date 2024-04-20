'use client'

import { useState, useEffect } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { pickRandom } from '../utils'

import { endMessages } from '../constants/endMessages'

import { useSpeech } from 'react-use'

import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

import { gifs } from '../constants/gifs'

const EndScreen = () => {

    const router = useRouter()
    const params = useSearchParams()

    const score = Number(params.get('score'))
    const subject = params.get('subject');

    const [message, setMessage] = useState('')
    const [gif, setGif] = useState('')

    const { width, height } = useWindowSize()

    const handlePlayAgain = () => {
        router.push(`/${subject}`);
    }

    useEffect(() => {
        let grade = ''
        if (score >= 0.9) {
            grade = 'sobresaliente'
        } else if (score >= 0.5) {
            grade = 'bien'
        } else {
            grade = 'mal'
        }

        let randomMessage = pickRandom(endMessages[grade])
        setMessage(randomMessage)

        let randomGif = pickRandom(gifs[grade])
        setGif(randomGif)

    }, [])

    const getScoreColorClass = () => {
        if (score >= 0.9) {
          return 'green-box green-text fuente'; 
        } else if (score >= 0.5) {
          return 'yellow-box yellow-text fuente'; 
        } else {
          return 'red-box red-text fuente'; 
        }
      };

      const getIconForScore = () => {
        if (score >= 0.9) {
          return '🚀'; 
        } else if (score >= 0.5) {
          return '😮‍💨'; 
        } else {
          return '🥶'; 
        }
      };

    return (
<div className='animated-bg min-h-screen grid place-items-center end-screen'>
    {score >= 0.8 && <Confetti width={width} height={height} className='overflow-hidden'/>}

    <div className='max-w-3xl flex flex-col items-center z-10'>
        <div className={`score-box ${getScoreColorClass()}`}>
            <h2 className='text-7xl text-center fuente'>Nota: {score * 100}%</h2>
        </div>

        <div className='gifs-container flex justify-center space-x-8 mt-8'>
            <iframe
                src={gif}
                width='100'
                height='100'
                className='giphy-embed'
                allowFullScreen
            ></iframe>

            <iframe
                src={gif}
                width='480'
                height='269'
                className='giphy-embed'
                allowFullScreen
            ></iframe>

            <iframe
                src={gif}
                width='100'
                height='100'
                className='giphy-embed'
                allowFullScreen
            ></iframe>
        </div>

        <p className='text-3xl mt-12 text-center fuente'>{message}{getIconForScore()}</p>

        <button
            className='inline-block border-2 border-emerald-400 rounded text-emerald-400 text-center uppercase text-lg font-semibold mx-auto mt-8 px-6 py-2 hover:bg-emerald-400/40 hover:border-emerald-400 hover:text-white duration-75 active:bg-emerald-600 fuente'
            onClick={handlePlayAgain}
        >
            Nuevo test
        </button>
    </div>
</div>
    )
}
export default EndScreen


