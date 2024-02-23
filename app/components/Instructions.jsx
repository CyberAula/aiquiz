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
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-black p-8 rounded shadow-lg">
          <div className="flex justify-end">
            <button className="text-white-500" style={{ color: '#86efac' }} onClick={handleClose}>
              <HiOutlineXMark size={24} />
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-4">
          <HiInformationCircle size={24} className="inline-block mr-2 text-blue-700" style={{ color: '#86efac' }} />
          <span className="text-blue-700 font-bold fuente" style={{ color: '#86efac' }}>Instrucciones</span>
          </h2>
          
          <p className="text-white mb-4">- Presiona <span className="border border-blue-500 p-1 rounded text-blue-500 font-bold fuente">Responder</span> para enviar tu respuesta</p>
          <p className="text-white mb-4">- Presiona <span className="border border-pink-500 p-1 rounded text-pink-500 font-bold fuente">Reportar pregunta incorrecta</span> si alguna pregunta crees que no está bien redactada o es incorrecta</p>
          <p className="text-white mb-4">- ¡Para obtener tu nota final deberás responder a todas!</p>
          
          <div className="text-center">
          <button
            className="q-button fuente"
            style={{ color: '#86efac' }}
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