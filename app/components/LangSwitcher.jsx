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
    <div className="flex flex-nowrap justify-center md:justify-end cursor-pointer items-center gap-1.5  md:px-0 md:py-0">
      <LanguageIcon sx={{ fontSize: 18}} className="icon text-18 "  />
      {Object.keys(lngs).map((lng) => (
        <a key={lng} className={`text-14 ${  i18n.language === lng ? "font-bold" : "font-light" }` 
           }  onClick={() => i18n.changeLanguage(lng)}>
          {lngs[lng].abbreviation}
          {lng === "en" && <span className="font-normal"> / </span>}
        </a>
      ))}
    </div>
  );
}
