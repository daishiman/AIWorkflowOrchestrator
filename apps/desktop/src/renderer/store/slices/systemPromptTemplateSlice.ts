import { StateCreator } from "zustand";
import type { PromptTemplate } from "../types";
import { ERROR_MESSAGES } from "../../constants/systemPrompt";
import { validateTemplateData } from "../../utils/systemPromptValidation";

// プリセットテンプレート
const PRESET_TEMPLATES: PromptTemplate[] = [
  {
    id: "preset-translation",
    name: "翻訳アシスタント",
    content: `あなたは正確で自然な翻訳を提供するアシスタントです。

## 役割
- ユーザーから提供されたテキストを指定された言語に翻訳します
- 文脈を考慮した自然な表現を心がけます
- 専門用語は適切に訳します

## ガイドライン
- 原文の意味を正確に伝えることを最優先します
- 文化的なニュアンスも考慮します
- 不明な点があれば確認してください`,
    isPreset: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "preset-programming",
    name: "プログラミング支援",
    content: `あなたはプログラミングの専門家です。

## 役割
- コードの作成、レビュー、デバッグを支援します
- ベストプラクティスに基づいたアドバイスを提供します
- 分かりやすい説明を心がけます

## ガイドライン
- コードは読みやすく保守しやすいものを提案します
- セキュリティとパフォーマンスを考慮します
- 必要に応じてコメントを追加します`,
    isPreset: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "preset-writing",
    name: "ライティング支援",
    content: `あなたは文章作成のプロフェッショナルです。

## 役割
- 記事、レポート、メールなどの文章作成を支援します
- 文章の校正と改善提案を行います
- 読者に合わせた表現を提案します

## ガイドライン
- 明確で簡潔な文章を心がけます
- 論理的な構成を意識します
- 読み手の視点を大切にします`,
    isPreset: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export interface SystemPromptTemplateSlice {
  // State
  templates: PromptTemplate[];

  // Actions
  initializeTemplates: () => Promise<void>;
  saveTemplate: (name: string, content: string) => Promise<void>;
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => PromptTemplate | undefined;
}

// Generate unique ID
const generateId = (): string => {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createSystemPromptTemplateSlice: StateCreator<
  SystemPromptTemplateSlice,
  [],
  [],
  SystemPromptTemplateSlice
> = (set, get) => ({
  // Initial state
  templates: [],

  // Actions
  initializeTemplates: async () => {
    try {
      // Load custom templates from electron-store (if available)
      let customTemplates: PromptTemplate[] = [];

      if (typeof window !== "undefined" && window.electronAPI?.store?.get) {
        const response = await window.electronAPI.store.get({
          key: "systemPromptTemplates",
        });
        if (response.success && Array.isArray(response.data)) {
          customTemplates = response.data.map((t: PromptTemplate) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          }));
        }
      }

      // Combine presets and custom templates
      set({
        templates: [...PRESET_TEMPLATES, ...customTemplates],
      });
    } catch (error) {
      console.error("Failed to initialize templates:", error);
      // Fall back to presets only
      set({ templates: [...PRESET_TEMPLATES] });
    }
  },

  saveTemplate: async (name: string, content: string) => {
    // Validate input
    const { trimmedName } = validateTemplateData(name, content);

    // Check for duplicates (case-insensitive)
    const { templates } = get();
    const isDuplicate = templates.some(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      throw new Error(ERROR_MESSAGES.TEMPLATE_NAME_DUPLICATE);
    }

    const newTemplate: PromptTemplate = {
      id: generateId(),
      name: trimmedName,
      content,
      isPreset: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTemplates = [...templates, newTemplate];

    set({ templates: newTemplates });

    // Persist to electron-store
    await persistCustomTemplates(newTemplates);
  },

  updateTemplate: async (id: string, name: string, content: string) => {
    const { templates } = get();
    const template = templates.find((t) => t.id === id);

    if (!template) {
      throw new Error(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
    }

    if (template.isPreset) {
      throw new Error(ERROR_MESSAGES.PRESET_NOT_EDITABLE);
    }

    // Validate input
    const { trimmedName } = validateTemplateData(name, content);

    const newTemplates = templates.map((t) =>
      t.id === id
        ? {
            ...t,
            name: trimmedName,
            content,
            updatedAt: new Date(),
          }
        : t,
    );

    set({ templates: newTemplates });

    // Persist to electron-store
    await persistCustomTemplates(newTemplates);
  },

  deleteTemplate: async (id: string) => {
    const { templates } = get();
    const template = templates.find((t) => t.id === id);

    if (!template) {
      throw new Error(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
    }

    if (template.isPreset) {
      throw new Error(ERROR_MESSAGES.PRESET_NOT_DELETABLE);
    }

    const newTemplates = templates.filter((t) => t.id !== id);

    set({ templates: newTemplates });

    // Persist to electron-store
    await persistCustomTemplates(newTemplates);
  },

  getTemplateById: (id: string) => {
    const { templates } = get();
    return templates.find((t) => t.id === id);
  },
});

// Helper function to persist custom templates
async function persistCustomTemplates(
  templates: PromptTemplate[],
): Promise<void> {
  try {
    if (typeof window !== "undefined" && window.electronAPI?.store?.set) {
      const customTemplates = templates.filter((t) => !t.isPreset);
      await window.electronAPI.store.set({
        key: "systemPromptTemplates",
        value: customTemplates,
      });
    }
  } catch (error) {
    console.error("Failed to persist templates:", error);
    throw new Error(ERROR_MESSAGES.PERSIST_FAILED);
  }
}
