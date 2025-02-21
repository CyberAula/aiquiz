'use client'

import { useState, useEffect } from 'react'
import { facts, jokes } from '../constants/facts'

import { useTypewriter, Typewriter } from 'react-simple-typewriter'

import { HiChevronRight } from 'react-icons/hi2'

import { pickRandom } from '../utils'

// const pickRandom = (arr) => {
//     return arr[Math.floor(Math.random() * arr.length)]
// }

const Facts = () => {
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFactIndex((prevIndex) => (prevIndex + 1) % facts.length);
        }, 8000); 

        // Limpia el temporizador al desmontar el componente
        return () => clearTimeout(timer);
    }, [factIndex]);

    const fact = facts[factIndex];

    return (
        <div className='flex flex-col text-indigo-600 items-center text-center mt-8 z-10'>
            <p className='min-h-[100px] text-lg md:text-2xl fixed mx-4 md:w-1/2'>
                <Typewriter
                    key={fact}
                    words={[fact]}
                    loop={false}
                    typeSpeed={50}
                    deleteSpeed={10000000}
                />
            </p>
        </div>
    )
}
export default Facts
