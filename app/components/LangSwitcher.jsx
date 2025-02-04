"use client";

import { useTranslation } from "react-i18next";
import LanguageIcon from '@mui/icons-material/Language';

const lngs = {
  en: {
    nativeName: "English",
    abbreviation: "EN",
  },
  es: {
    nativeName: "Spanish",
    abbreviation: "ES",
  },
};

export default function LangSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex flex-nowrap justify-center md:justify-end items-center gap-2 py-2 px-4 md:px-0 md:py-0">
      <LanguageIcon className="icon text-18 mt-0.5" />
      {Object.keys(lngs).map((lng) => (
        <a key={lng} className="text-14 font-medium"  onClick={() => i18n.changeLanguage(lng)}>
          {lngs[lng].abbreviation}
          {lng === "en" && <span className="font-normal"> / </span>}
        </a>
      ))}
    </div>
  );
}
