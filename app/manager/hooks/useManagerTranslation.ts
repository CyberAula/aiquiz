import { useTranslation } from "react-i18next";

export function useManagerTranslation() {
  const { t: tBase, i18n } = useTranslation();
  
  const t = (key: string, options?: any) => {
    return tBase(`manager.${key}`, options);
  };
  
  return { t, i18n };
}