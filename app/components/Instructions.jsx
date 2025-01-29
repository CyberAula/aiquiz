import React, { useState } from 'react';

import { HiOutlineXMark } from 'react-icons/hi2'
import { HiInformationCircle } from 'react-icons/hi'

const InstructionsModal = ({ onClose }) => {
  const [showInstructions, setShowInstructions] = useState(true);

  const handleClose = () => {
    setShowInstructions(false);
    onClose();
  };

  return (
    showInstructions && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white py-6 px-8  w-2/3 rounded shadow-lg">
          <div className='flex justify-between '>
            <h2 className="text-2xl font-semibold mb-8">

              <HiInformationCircle size={24} className="inline-block mr-2 text-text" />
              <span className="text-text font-bold fuente " >Instrucciones</span>
            </h2>
            <button className="text-text flex justify-start" onClick={handleClose}>
              <HiOutlineXMark size={24} />
            </button>

          </div>
          <p className="text-text mb-4 mr-8 text-pretty">Para enviar tu respuesta, presiona <span className="btn-quizz btn-xs">Responder</span> </p>
          <p className="text-text mb-4 mr-8 text-pretty">Si alguna pregunta crees que no está bien redactada o es incorrecta, presiona <span className="text-red-600 btn-xs font-bold border border-red-400">Reportar pregunta incorrecta</span> </p>
          <p className="text-text mb-4 mr-8 text-pretty">¡Para obtener tu nota final deberás responder a <b>todas las preguntas! </b></p>

          <div className="text-center">
            <button
              className="q-button btn-md fuente text-white"

              onClick={handleClose}
            >
              ¡ADELANTE!
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default InstructionsModal;