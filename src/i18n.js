import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import commonEN from "./locales/en/common.json";
import bondEN from "./locales/en/bond.json";
import globeEN from "./locales/en/globe.json";
import stakeEN from "./locales/en/stake.json";
import wrapEN from "./locales/en/wrap.json";
import redeemEN from "./locales/en/redeem.json";
import commonIT from "./locales/it/common.json";

const resources = {
    en: {
        common: commonEN,
        bond: bondEN,
        globe: globeEN,
        stake: stakeEN,
        wrap: wrapEN,
        redeem: redeemEN,
    },
    it: {
        common: commonIT,
    },
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        ns: ["common", "bond", "globe", "stake"],
        fallbackLng: "en",
        lng: "en",
        debug: false,
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        resources,
    });

export default i18n;
