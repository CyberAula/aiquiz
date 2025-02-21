'use client'

import { useState, useEffect } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { pickRandom } from '../utils'

import { endMessages } from '../constants/endMessages'

import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

import Link from "next/link"
import { gifs } from '../constants/gifs'
import { Suspense } from 'react'
import { useTranslation } from "react-i18next";
import Header from "../components/ui/Header"



function EndScreenFun() {
    const { t, i18n } = useTranslation();

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
        <div className='h-screen sm:h-fit container-layout'>
            <Header/>
            {score >= 0.8 && <Confetti width={width} height={height} className='overflow-hidden' />}

            <div className='max-w-3xl flex flex-col content-between h-2/3   items-center mx-auto  my-4 md:my-8 justify-between z-10'>
                <div className='flex flex-col items-center'>
                <h2 className='mb-1.5'>{t('endscreen.title')}</h2>
                <h2 className={`score-box ${getScoreColorClass()} text-3xl md:text-5xl text-center fuente`}> {score * 100}%</h2>
                </div>
                <div className='gifs-container flex justify-center space-x-8 mt-5'>
                    <iframe
                        src={gif}
                        width='200'
                        height='200'
                        className='giphy-embed'
                        allowFullScreen
                    ></iframe>
                </div>

                <p className='text-xl md:text-2xl mt-8 mx-3 text-center fuente'>{message}{getIconForScore()}</p>

                <div className='flex flex-col sm:flex-row gap-2 md:gap-4 mt-4 md:mt-8'>
                    <button >
                        <Link className='btn-md btn-outline' href="/"> {t('endscreen.back')} </Link>
                    </button>
                    <button
                        className='btn-md btn-quizz inline-block text-center  text-lg font-semibold md:mx-auto'
                        onClick={handlePlayAgain}
                    >
                        {t('endscreen.repeat')}
                    </button>

                </div>
            </div>
        </div>
    )
}


export default function EndScreen() {
    return (
        // You could have a loading skeleton as the `fallback` too
        <Suspense>
          <EndScreenFun />
        </Suspense>
      )
}


