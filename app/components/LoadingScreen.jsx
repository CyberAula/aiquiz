import Facts from './Facts'

import { ThreeDots } from 'react-loader-spinner'

const LoadingScreen = ({ responseStream }) => {
    return (
        <>
            <div className=' text-white/10 text-xs text-justify'>
                {/* <div className='fixed'>{responseStream}</div> */}
                {/*<div className='fixed bottom-0 rotate-180 left-0'>
                    {responseStream}
                </div>*/}
                <div className='fixed bottom-0 right-0 reverse-text'>
                    {responseStream}
                </div>
                <div className='fixed bottom-0 left-0 reverse-text rotate-180'>
                    {responseStream}
                </div>
            </div>
            <div className='min-h-screen grid place-items-center'>
                <div className='w-[80%] flex flex-col items-center'>
                    <div className='flex items-center gap-4'>
                    <ThreeDots width='60' height='60' color='#6ee7b7' />
                        <div className='text-emerald-300 uppercase text-4xl font-bold text-center translate-y-2'>
                            {/* <div className='text-emerald-300 uppercase text-2xl font-bold text-center translate-y-2 bg-gradient-to-r from-emerald-500  to-white/0 bg-clip-text text-transparent'> */}
                            <p className=' animate-pulse'>Generando Test...</p>
                            <p className='text-xs text custom-gradient'>
                                (Puede tardar unos segundos...)
                            </p>
                        </div>
                        <ThreeDots width='60' height='60' color='#6ee7b7' />
                    </div>
                    <div className='mt-8'>
                        <Facts />
                    </div>
                </div>
            </div>
        </>
    )
}
export default LoadingScreen
