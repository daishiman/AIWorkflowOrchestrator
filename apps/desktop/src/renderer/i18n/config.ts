/**
 * i18n Configuration
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * 国際化設定とブラウザ言語検出
 *
 * @module @repo/desktop/renderer/i18n/config
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 翻訳リソースのインポート
import jaSkillStream from "./locales/ja/skill-stream.json";
import enSkillStream from "./locales/en/skill-stream.json";

const resources = {
  ja: {
    "skill-stream": jaSkillStream,
  },
  en: {
    "skill-stream": enSkillStream,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ja",
    supportedLngs: ["ja", "en"],
    defaultNS: "skill-stream",
    ns: ["skill-stream"],

    interpolation: {
      escapeValue: false, // React already handles escaping
    },

    detection: {
      order: ["navigator", "htmlTag"],
      caches: [],
    },
  });

export default i18n;
