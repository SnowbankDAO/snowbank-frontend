import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import it from "./locales/it";
import de from "./locales/de";

const resources = {
    en: en,
    it: {
        lang: en.lang,
        ...it,
    },
    de: {
        lang: en.lang,
        ...de,
    },
};

i18n.use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        ns: ["common", "bond", "globe", "stake", "lang"],
        fallbackLng: "en",
        debug: false,
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detector: {
            lookupLocalStorage: "i18nextLng",
        },
        resources,
    });

export default i18n;
