import React from 'react';
import LangSwitcher from '../LangSwitcher';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();
    return (
      <div className='mx-auto flex items-center justify-center w-full'>
            <a
        className="mt-3 bottom-2 flex mx-auto gap-2 pb-2 font-mono text-sm text-customColor transition hover:text-emerald-300 "
        href="https://ging.github.io/"
        target="_blank">
       {t('footer.title')}
      </a>
      <LangSwitcher />
      </div>
    );
}

export default Footer;
