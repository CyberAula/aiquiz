import React from 'react';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();
    return (
      <div className='mx-auto flex items-center justify-center w-full'>
            <a
        className="px-4 text-center relative md:absolute mt-3 bottom-2 flex mx-auto gap-2 pb-2  text-xs text-gray-400 tracking-wide transition hover:text-gray-600 "
        href="https://ging.github.io/"
        target="_blank">
       {t('footer.title')}
      </a>

      </div>
    );
}

export default Footer;
