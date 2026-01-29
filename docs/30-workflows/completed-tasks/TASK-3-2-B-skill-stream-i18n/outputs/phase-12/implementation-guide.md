# SkillStreamDisplay i18n対応 実装ガイド

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| 機能名   | skill-stream-i18n        |
| 作成日   | 2026-01-28               |
| 対応言語 | 日本語（ja）、英語（en） |

---

# Part 1: 概念的説明（中学生でもわかる版）

## 1. なぜ多言語対応が必要？

### 日常生活での例え話

スマートフォンの「翻訳アプリ」を想像してください。海外旅行に行ったとき、看板や案内表示が日本語で表示されたら便利ですよね。逆に、外国の人が日本に来たときに、英語で表示されると助かります。

コンピュータのアプリケーションも同じです。日本語を話す人と英語を話す人では、表示される言葉が違った方が使いやすいのです。

### この機能が解決する問題

SkillStreamDisplayという画面コンポーネントがあります。このコンポーネントには「実行中」「完了」「エラー」などの状態を表示する部分があります。

**これまでの問題**:

- すべての人に日本語で表示していた
- 英語圏のユーザーには理解しにくかった

**解決後**:

- ブラウザの言語設定を見て、自動で言語を切り替える
- 日本語ブラウザ → 日本語で表示
- 英語ブラウザ → 英語で表示

## 2. この機能で何ができるようになる？

| できること                 | 具体例                               |
| -------------------------- | ------------------------------------ |
| ステータス表示の多言語化   | 「実行中」→「Running」               |
| 時間表示の多言語化         | 「5秒前」→「5 seconds ago」          |
| ボタンの多言語化           | 「中断」→「Abort」                   |
| アクセシビリティの多言語化 | スクリーンリーダーが各言語で読み上げ |

## 3. どうやって言語が切り替わる？

### 仕組みの簡単な説明

1. **ブラウザが教えてくれる**: あなたのブラウザは「私の使い手は日本語を話す人です」という情報を持っています。

2. **アプリがそれを読み取る**: アプリが起動するときに、この情報を確認します。

3. **正しい言語ファイルを選ぶ**: 日本語なら日本語の翻訳ファイル、英語なら英語の翻訳ファイルを使います。

4. **画面に表示する**: 選んだ言語で画面の文字を表示します。

### 翻訳ファイルのイメージ

翻訳ファイルは「辞書」のようなものです。

**日本語の辞書（ja）**:

```
running → 実行中
completed → 完了
abort → 中断
```

**英語の辞書（en）**:

```
running → Running
completed → Completed
abort → Abort
```

アプリは「running」というキーワードを辞書で引いて、対応する言葉を見つけて表示します。

---

# Part 2: 技術的詳細（開発者向け）

## 1. アーキテクチャ概要

### ディレクトリ構造

```
apps/desktop/src/renderer/
├── i18n/
│   ├── config.ts              # i18n初期化設定
│   ├── types.d.ts             # 翻訳キー型定義
│   └── locales/
│       ├── ja/
│       │   └── skill-stream.json  # 日本語翻訳
│       └── en/
│           └── skill-stream.json  # 英語翻訳
├── components/
│   └── AgentView/
│       └── SkillStreamDisplay.tsx  # i18n適用済み
└── utils/
    └── formatTime.ts               # locale引数追加済み
```

### 使用ライブラリ

| ライブラリ                       | バージョン | 用途                 |
| -------------------------------- | ---------- | -------------------- |
| i18next                          | ^23.x      | 国際化フレームワーク |
| react-i18next                    | ^14.x      | React統合            |
| i18next-browser-languagedetector | ^7.x       | 言語自動検出         |

## 2. i18n設定詳細

### config.ts

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import jaSkillStream from "./locales/ja/skill-stream.json";
import enSkillStream from "./locales/en/skill-stream.json";

const resources = {
  ja: { "skill-stream": jaSkillStream },
  en: { "skill-stream": enSkillStream },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ja",
    defaultNS: "skill-stream",
    interpolation: { escapeValue: false },
    detection: { order: ["navigator", "htmlTag"], caches: [] },
  });

export default i18n;
```

### 設定パラメータ

| 設定項目        | 値                       | 説明               |
| --------------- | ------------------------ | ------------------ |
| fallbackLng     | "ja"                     | フォールバック言語 |
| defaultNS       | "skill-stream"           | デフォルト名前空間 |
| detection.order | ["navigator", "htmlTag"] | 言語検出優先順位   |

## 3. 翻訳キー一覧

### status（ステータス）

| キー             | 日本語 | 英語      |
| ---------------- | ------ | --------- |
| status.idle      | 待機中 | Idle      |
| status.running   | 実行中 | Running   |
| status.completed | 完了   | Completed |
| status.error     | エラー | Error     |
| status.aborted   | 中断   | Aborted   |

### time（時間）

| キー            | 日本語          | 英語（単数/複数）       |
| --------------- | --------------- | ----------------------- |
| time.justNow    | たった今        | Just now                |
| time.secondsAgo | {{count}}秒前   | {{count}} second(s) ago |
| time.minutesAgo | {{count}}分前   | {{count}} minute(s) ago |
| time.hoursAgo   | {{count}}時間前 | {{count}} hour(s) ago   |
| time.daysAgo    | {{count}}日前   | {{count}} day(s) ago    |

### button（ボタン）

| キー         | 日本語   | 英語  |
| ------------ | -------- | ----- |
| button.abort | 中断     | Abort |
| button.reset | リセット | Reset |

### aria（アクセシビリティ）

| キー                | 日本語             | 英語                  |
| ------------------- | ------------------ | --------------------- |
| aria.loading        | 実行中             | Loading               |
| aria.copyMessage    | メッセージをコピー | Copy message          |
| aria.abortExecution | スキル実行を中断   | Abort skill execution |
| aria.resetState     | 状態をリセット     | Reset state           |

## 4. コンポーネント使用例

### useTranslation hookの使用

```typescript
import { useTranslation } from "react-i18next";

function SkillStreamDisplay() {
  const { t } = useTranslation("skill-stream");

  // ステータステキストの取得
  const statusText = t(`status.${status}`);

  // ボタンラベルの取得
  const abortLabel = t("button.abort");

  // aria-labelの設定
  return (
    <button aria-label={t("aria.abortExecution")}>
      {abortLabel}
    </button>
  );
}
```

### formatRelativeTimeの使用

```typescript
import { formatRelativeTime } from "../utils/formatTime";

// ロケールを指定して相対時間を取得
const timeText = formatRelativeTime(timestamp, "ja"); // "30秒前"
const timeTextEn = formatRelativeTime(timestamp, "en"); // "30 seconds ago"
```

## 5. テスト方法

### テストユーティリティの使用

```typescript
import { renderWithI18n } from "../test-utils/i18n-test-utils";

describe("SkillStreamDisplay", () => {
  it("should display Japanese status", () => {
    const { getByText } = renderWithI18n(
      <SkillStreamDisplay />,
      "ja"
    );
    expect(getByText("待機中")).toBeInTheDocument();
  });
});
```

### テスト用i18nインスタンス作成

```typescript
import { createTestI18n } from "../test-utils/i18n-test-utils";

describe("i18n config", () => {
  it("should translate correctly", async () => {
    const testI18n = createTestI18n("en");
    expect(testI18n.t("status.running")).toBe("Running");
  });
});
```

## 6. トラブルシューティング

### よくある問題と解決策

| 問題                         | 原因                           | 解決策                   |
| ---------------------------- | ------------------------------ | ------------------------ |
| 翻訳キーがそのまま表示される | 翻訳ファイルにキーが存在しない | JSONファイルにキーを追加 |
| 英語が表示されない           | 言語検出が正しく動作していない | navigator.languageを確認 |
| テストで翻訳が表示されない   | I18nProviderがない             | renderWithI18nを使用     |
| TypeScriptエラー             | 型定義が不足                   | types.d.tsを確認         |

### 新しい翻訳キーの追加手順

1. `locales/ja/skill-stream.json`に日本語を追加
2. `locales/en/skill-stream.json`に英語を追加
3. コンポーネントで`t("新しいキー")`を使用
4. テストを追加して動作確認

---

## 参考リンク

- [i18next公式ドキュメント](https://www.i18next.com/)
- [react-i18next公式ドキュメント](https://react.i18next.com/)
