/**
 * i18n Type Definitions
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * Phase 8: リファクタリング - 翻訳キーの型安全性強化
 *
 * @module @repo/desktop/renderer/i18n/types
 */

import "react-i18next";
import type skillStream from "./locales/ja/skill-stream.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "skill-stream";
    resources: {
      "skill-stream": typeof skillStream;
    };
  }
}
