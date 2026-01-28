# Phase 2: i18n設計書

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 2          |
| 作成日   | 2026-01-28 |
| タスクID | TASK-3-2-B |

---

## 1. ライブラリ選定

### 1.1 採用ライブラリ

| ライブラリ                       | バージョン | 用途                     |
| -------------------------------- | ---------- | ------------------------ |
| i18next                          | ^23.x      | 国際化フレームワークコア |
| react-i18next                    | ^14.x      | React統合                |
| i18next-browser-languagedetector | ^7.x       | ブラウザ言語自動検出     |

### 1.2 選定理由

- **i18next**: 業界標準のi18nライブラリ、豊富なプラグインエコシステム
- **react-i18next**: React hooks対応、Suspense統合
- **languagedetector**: ブラウザ言語設定からの自動検出

---

## 2. ディレクトリ構造

```
apps/desktop/src/renderer/
├── i18n/
│   ├── config.ts              # i18n初期化設定
│   ├── index.ts               # エクスポート
│   ├── types.ts               # 翻訳キー型定義
│   └── locales/
│       ├── ja/
│       │   └── skill-stream.json  # 日本語翻訳
│       └── en/
│           └── skill-stream.json  # 英語翻訳
├── components/
│   └── AgentView/
│       └── SkillStreamDisplay.tsx  # i18n適用
└── utils/
    └── formatTime.ts               # locale引数追加
```

---

## 3. i18n設定設計

### 3.1 config.ts

```typescript
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
    defaultNS: "skill-stream",

    interpolation: {
      escapeValue: false, // React already handles escaping
    },

    detection: {
      order: ["navigator", "htmlTag"],
      caches: [],
    },
  });

export default i18n;
```

### 3.2 設定パラメータ

| 設定項目                  | 値                       | 説明                         |
| ------------------------- | ------------------------ | ---------------------------- |
| fallbackLng               | "ja"                     | フォールバック言語（日本語） |
| defaultNS                 | "skill-stream"           | デフォルト名前空間           |
| interpolation.escapeValue | false                    | Reactエスケープ無効化        |
| detection.order           | ["navigator", "htmlTag"] | ブラウザ言語優先検出         |

---

## 4. 翻訳ファイル設計

### 4.1 JSON構造

**ja/skill-stream.json**:

```json
{
  "status": {
    "idle": "待機中",
    "running": "実行中",
    "completed": "完了",
    "error": "エラー",
    "aborted": "中断"
  },
  "time": {
    "justNow": "たった今",
    "secondsAgo": "{{count}}秒前",
    "minutesAgo": "{{count}}分前",
    "hoursAgo": "{{count}}時間前",
    "daysAgo": "{{count}}日前"
  },
  "feedback": {
    "copied": "コピーしました"
  },
  "button": {
    "abort": "中断",
    "reset": "リセット"
  },
  "message": {
    "startPrompt": "スキル実行を開始してください",
    "executing": "実行中..."
  },
  "aria": {
    "loading": "実行中",
    "copyMessage": "メッセージをコピー",
    "abortExecution": "スキル実行を中断",
    "resetState": "状態をリセット"
  }
}
```

**en/skill-stream.json**:

```json
{
  "status": {
    "idle": "Idle",
    "running": "Running",
    "completed": "Completed",
    "error": "Error",
    "aborted": "Aborted"
  },
  "time": {
    "justNow": "Just now",
    "secondsAgo_one": "{{count}} second ago",
    "secondsAgo_other": "{{count}} seconds ago",
    "minutesAgo_one": "{{count}} minute ago",
    "minutesAgo_other": "{{count}} minutes ago",
    "hoursAgo_one": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago",
    "daysAgo_one": "{{count}} day ago",
    "daysAgo_other": "{{count}} days ago"
  },
  "feedback": {
    "copied": "Copied"
  },
  "button": {
    "abort": "Abort",
    "reset": "Reset"
  },
  "message": {
    "startPrompt": "Start skill execution",
    "executing": "Executing..."
  },
  "aria": {
    "loading": "Loading",
    "copyMessage": "Copy message",
    "abortExecution": "Abort skill execution",
    "resetState": "Reset state"
  }
}
```

### 4.2 複数形対応

英語の複数形は i18next の pluralization 機能を使用:

- `_one`: 単数形 (count = 1)
- `_other`: 複数形 (count != 1)

---

## 5. コンポーネント適用設計

### 5.1 SkillStreamDisplay.tsx 変更設計

**変更箇所一覧**:

| 箇所                | 変更前                            | 変更後                                            |
| ------------------- | --------------------------------- | ------------------------------------------------- |
| インポート          | -                                 | `import { useTranslation } from 'react-i18next';` |
| hook追加            | -                                 | `const { t } = useTranslation('skill-stream');`   |
| getStatusText       | ハードコード日本語                | `t(`status.${status}`)` で取得                    |
| LoadingSpinner      | `aria-label="実行中"`             | `aria-label={t('aria.loading')}`                  |
| CopyButton feedback | `コピーしました`                  | `{t('feedback.copied')}`                          |
| CopyButton aria     | `aria-label="メッセージをコピー"` | `aria-label={t('aria.copyMessage')}`              |
| abort button        | `中断`                            | `{t('button.abort')}`                             |
| abort button aria   | `aria-label="スキル実行を中断"`   | `aria-label={t('aria.abortExecution')}`           |
| reset button        | `リセット`                        | `{t('button.reset')}`                             |
| reset button aria   | `aria-label="状態をリセット"`     | `aria-label={t('aria.resetState')}`               |
| idle message        | `スキル実行を開始してください`    | `{t('message.startPrompt')}`                      |
| running message     | `実行中...`                       | `{t('message.executing')}`                        |

### 5.2 getStatusText関数の置き換え

**変更前**:

```typescript
function getStatusText(status: string): string {
  switch (status) {
    case "idle":
      return "待機中";
    // ...
  }
}
```

**変更後**:

```typescript
// getStatusText関数を削除し、t関数で直接取得
// 使用箇所: t(`status.${status}`)
```

---

## 6. formatRelativeTime設計

### 6.1 シグネチャ変更

**変更前**:

```typescript
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string;
```

**変更後**:

```typescript
export function formatRelativeTime(
  timestamp: number,
  locale: string = "ja",
  now: number = Date.now(),
): string;
```

### 6.2 実装設計

```typescript
// 翻訳テンプレートをインライン定義（i18nに依存しない独立関数として維持）
const translations = {
  ja: {
    justNow: "たった今",
    secondsAgo: (count: number) => `${count}秒前`,
    minutesAgo: (count: number) => `${count}分前`,
    hoursAgo: (count: number) => `${count}時間前`,
    daysAgo: (count: number) => `${count}日前`,
  },
  en: {
    justNow: "Just now",
    secondsAgo: (count: number) =>
      `${count} second${count !== 1 ? "s" : ""} ago`,
    minutesAgo: (count: number) =>
      `${count} minute${count !== 1 ? "s" : ""} ago`,
    hoursAgo: (count: number) => `${count} hour${count !== 1 ? "s" : ""} ago`,
    daysAgo: (count: number) => `${count} day${count !== 1 ? "s" : ""} ago`,
  },
};
```

### 6.3 設計方針

- **独立性維持**: formatRelativeTimeはi18nextに依存せず、独自の翻訳テーブルを持つ
- **理由**: ユーティリティ関数としての再利用性を維持、Reactコンテキスト外でも使用可能
- **代替案**: i18nextのt関数を引数として渡す方法もあるが、複雑化を避けるため採用しない

---

## 7. 統合ポイント設計

### 7.1 I18nextProvider配置

**App.tsx（または適切なルートコンポーネント）**:

```typescript
import './i18n/config';  // i18n初期化

function App() {
  return (
    // I18nextProviderは明示的にラップ不要
    // react-i18nextが自動的にI18nContextを提供
    <RouterProvider>
      ...
    </RouterProvider>
  );
}
```

### 7.2 テスト環境設定

**テストユーティリティ**:

```typescript
// test/utils/i18n-test-utils.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export function setupTestI18n() {
  i18n.use(initReactI18next).init({
    lng: "ja",
    fallbackLng: "ja",
    ns: ["skill-stream"],
    defaultNS: "skill-stream",
    resources: {
      ja: {
        "skill-stream": require("../../../src/renderer/i18n/locales/ja/skill-stream.json"),
      },
    },
  });
  return i18n;
}
```

---

## 8. 型安全性設計

### 8.1 翻訳キー型定義

**types.ts**:

```typescript
// 翻訳リソースの型定義
import jaSkillStream from "./locales/ja/skill-stream.json";

export type SkillStreamTranslations = typeof jaSkillStream;

// i18next型拡張（オプション）
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "skill-stream";
    resources: {
      "skill-stream": SkillStreamTranslations;
    };
  }
}
```

### 8.2 型チェックの恩恵

- 存在しない翻訳キーへのアクセスでコンパイルエラー
- IDEでの翻訳キー補完
- リファクタリング時の安全性向上

---

## 9. 要件との整合性確認

| 要件ID | 要件                                 | 設計対応                               |
| ------ | ------------------------------------ | -------------------------------------- |
| FR-01  | UIテキストが翻訳キー経由で表示される | useTranslation hookで翻訳キー取得      |
| FR-02  | formatRelativeTimeがロケール対応     | locale引数追加、内部翻訳テーブル実装   |
| FR-03  | aria-labelが翻訳対応                 | t('aria.xxx')で取得                    |
| FR-04  | ja/en 2言語サポート                  | locales/ja, locales/en ディレクトリ    |
| FR-05  | ブラウザ言語自動検出                 | i18next-browser-languagedetector       |
| NFR-01 | バンドルサイズ10KB以下/言語          | 名前空間分離、JSONファイル最小化       |
| NFR-02 | 翻訳取得100ms以下                    | 同期的なリソースインポート             |
| NFR-03 | 既存テスト互換性                     | テスト用i18nセットアップユーティリティ |
| NFR-04 | TypeScript型安全性                   | カスタム型定義、i18next型拡張          |
