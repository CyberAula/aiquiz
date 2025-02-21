import React, { useState } from 'react';

import { HiOutlineXMark } from 'react-icons/hi2'
import { HiInformationCircle } from 'react-icons/hi'
import { useTranslation } from "react-i18next";


const InstructionsModal = ({ onClose }) => {
  const { t, i18n } = useTranslation();

  const [showInstructions, setShowInstructions] = useState(true);

  const handleClose = () => {
    setShowInstructions(false);
    onClose();
  };

  return (
    showInstructions && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white py-3 px-4 md:py-6 md:px-8 w-11/12  md:w-1/2 rounded shadow-lg">
          <div className='flex justify-between '>
            <h2 className="text-2xl font-semibold mb-8">

              <HiInformationCircle size={24} className="inline-block mr-2 text-text" />
              <span className="text-text font-bold fuente " >{t('instructions.title')}</span>
            </h2>
            <button className="text-text flex mt-1.5 justify-start" onClick={handleClose}>
              <HiOutlineXMark size={24} />
            </button>

          </div>
          <p className="text-text mb-4 mr-8 text-pretty">{t('instructions.line1')} <span className="btn-quizz btn-xs">{t('instructions.respond')}</span> </p>
          <p className="text-text mb-4 mr-8 text-pretty">{t('instructions.line2')} <br></br><span className="text-red-600 font-bold">{t('instructions.report')}</span> </p>
          <p className="text-text mb-4 mr-8 text-pretty">{t('instructions.line3')} <b>{t('instructions.line4')} </b></p>

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