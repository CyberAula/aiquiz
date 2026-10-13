'use client'

import { useState, useEffect } from 'react'
import { buildFactsSequence } from '../constants/facts'

import { Typewriter } from 'react-simple-typewriter'

const TYPE_SPEED_MS = 50;
const READING_TIME_MS = 4000;
const MIN_FACT_DURATION_MS = 8000;

// Muestra frases curiosas mientras se generan las preguntas.
// subject: asignatura elegida (CORE, IWEB, BBDD tienen frases propias; el resto, solo genéricas)
const Facts = ({ subject }) => {
    // La secuencia aleatoria se crea tras montar el componente para que el renderizado
    // del servidor y el del navegador coincidan
    const [sequence, setSequence] = useState([]);
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        setSequence(buildFactsSequence(subject));
        setFactIndex(0);
    }, [subject]);

    useEffect(() => {
        if (sequence.length === 0) return;
        // Tiempo para escribir la frase (TYPE_SPEED_MS por carácter) más unos segundos para leerla
        const duration = Math.max(MIN_FACT_DURATION_MS, sequence[factIndex].length * TYPE_SPEED_MS + READING_TIME_MS);
        const timer = setTimeout(() => {
            setFactIndex((prevIndex) => (prevIndex + 1) % sequence.length);
        }, duration);

        // Limpia el temporizador al desmontar el componente
        return () => clearTimeout(timer);
    }, [factIndex, sequence]);

    const fact = sequence[factIndex];

    return (
        <div className='flex flex-col text-indigo-600 items-center text-center mt-8 z-10'>
            <p className='min-h-[100px] text-lg md:text-2xl fixed mx-4 md:w-1/2'>
                {fact && (
                    <Typewriter
                        key={fact}
                        words={[fact]}
                        loop={false}
                        typeSpeed={TYPE_SPEED_MS}
                        deleteSpeed={10000000}
                    />
                )}
            </p>
        </div>
    )
}
export default Facts
