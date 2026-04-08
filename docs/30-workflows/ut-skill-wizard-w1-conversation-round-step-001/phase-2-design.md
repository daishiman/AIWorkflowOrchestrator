# Phase 2: 設計

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| Phase名    | 設計                                           |
| 前提Phase  | Phase 1                                        |
| 後続Phase  | Phase 3                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

コンポーネント Props インターフェース・状態管理設計・質問定義・プリフィル変換ロジックを確定する。
Phase 4 のテスト作成・Phase 5 の実装が迷いなく進めるレベルの設計書を作成する。

---

## 実行タスク

### タスク1: Props インターフェース設計

**目的**: 型安全なコンポーネント入出力契約を確定する

**設計内容**:

```typescript
// ConversationRoundStep の Props インターフェース
export interface ConversationRoundStepProps {
  /** W0-seq-02 で公開された inferSmartDefaults() の結果 */
  smartDefaults: SmartDefaultResult;
  /** 全 6 問への回答完了時に呼ばれるコールバック */
  onComplete: (answers: ConversationAnswers) => void;
  /** ページ 1 の「戻る」（Step 0 へ）コールバック（任意） */
  onBack?: () => void;
}
```

**確認事項**:

- `SmartDefaultResult` の型定義（`packages/shared/src/types/skillCreator.ts`）
- `ConversationAnswers` の型定義（同上）
- Props が Wave 2（`SkillCreateWizard.tsx`）の期待インターフェースと整合しているか

**期待される成果物**:

- `outputs/phase-2/props-interface.md` — Props 設計書

---

### タスク2: 状態管理設計

**目的**: コンポーネント内部の state を明確に定義する

**設計内容**:

```typescript
// ページング状態（1 または 2 のみ）
const [currentPage, setCurrentPage] = useState<1 | 2>(1);

// 回答状態（ConversationAnswers 型・初期値はプリフィル変換で設定）
const [answers, setAnswers] = useState<ConversationAnswers>(() =>
  buildInitialAnswers(smartDefaults),
);
```

**ページング設計**:

- ページ 1: `QUESTIONS[0]`〜`QUESTIONS[2]`（Q1〜Q3、インデックス 0〜2）
- ページ 2: `QUESTIONS[3]`〜`QUESTIONS[5]`（Q4〜Q6、インデックス 3〜5）
- 進捗 N 値: ページ 1 = 1〜3、ページ 2 = 4〜6

**期待される成果物**:

- `outputs/phase-2/state-design.md` — 状態管理設計書

---

### タスク3: プリフィル変換純粋関数設計

**目的**: `SmartDefaultResult` → `ConversationAnswers` の変換ロジックを確定する

**設計内容**:

```typescript
function normalizeSelectedOption(
  questionId: keyof ConversationAnswers,
  value: string | null,
): string | null {
  if (value === null) return null;
  if (questionId === "q1" && value === "自分だけ") return "自分のみ";
  if (questionId === "q3" && value === "scheduled") return "定期実行";
  if (questionId === "q3" && value === "realtime") return "イベント駆動";
  if (questionId === "q5" && value === "slack") return "Slack";
  if (questionId === "q5" && value === "github") return "GitHub";
  if (questionId === "q5" && value === "notion") return "その他";
  if (questionId === "q6" && value === "code") return "Markdown";
  if (questionId === "q6" && value === "structured") return "JSON";
  return value;
}

/**
 * SmartDefaultResult → ConversationAnswers の初期値変換
 * semantic default を UI ラベルへ正規化し、null フィールドは selectedOption: null / freeText: "" として扱う
 * この関数は export して単体テスト可能にする
 */
export function buildInitialAnswers(
  defaults: SmartDefaultResult,
): ConversationAnswers {
  return {
    q1: {
      selectedOption: normalizeSelectedOption("q1", defaults.who),
      freeText: "",
    },
    q2: {
      selectedOption: normalizeSelectedOption("q2", defaults.input),
      freeText: "",
    },
    q3: {
      selectedOption: normalizeSelectedOption("q3", defaults.timing),
      freeText: "",
    },
    q4: {
      selectedOption: normalizeSelectedOption("q4", defaults.output),
      freeText: "",
    },
    q5: {
      selectedOption: normalizeSelectedOption("q5", defaults.tool),
      freeText: "",
    },
    q6: {
      selectedOption: normalizeSelectedOption("q6", defaults.format),
      freeText: "",
    },
  };
}
```

**null フォールバック方針**:

- `null` → `selectedOption: null`（未選択状態）
- UI は `selectedOption === null` を「未選択」として表示
- `inferenceLog` フィールドは無視する（`ConversationAnswers` に対応なし）

---

### タスク4: 質問定義定数設計

**目的**: Q1〜Q6 の質問文・選択肢を定数配列で管理する

**設計内容**:

```typescript
// 6問の定義定数（as const で型安全に管理）
export const QUESTIONS = [
  {
    id: "q1" as const,
    label: "このスキルは誰が使いますか？",
    options: [
      "自分のみ",
      "チームメンバー",
      "社内全体",
      "外部ユーザー",
    ] as const,
  },
  {
    id: "q2" as const,
    label: "どのようなデータを入力しますか？",
    options: ["テキスト", "ファイル", "URLリンク", "構造化データ"] as const,
  },
  {
    id: "q3" as const,
    label: "いつ実行しますか？",
    options: ["手動実行", "定期実行", "イベント駆動", "都度判断"] as const,
  },
  {
    id: "q4" as const,
    label: "結果をどこに出力しますか？",
    options: ["チャット返信", "ファイル保存", "外部ツール", "通知"] as const,
  },
  {
    id: "q5" as const,
    label: "連携する外部ツールはありますか？",
    options: ["なし", "Slack", "GitHub", "その他"] as const,
  },
  {
    id: "q6" as const,
    label: "出力フォーマットはどれですか？",
    options: ["Markdown", "プレーンテキスト", "JSON", "箇条書き"] as const,
  },
] as const;
```

**選択肢整合確認**: `ConversationalInterview.tsx` の既存実装との整合を Phase 1 コードインベントリで確認すること。

### 再利用方針

- 進捗表示は既存の `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx` を再利用し、同等ロジックの重複実装を避ける
- `ConversationRoundStep.tsx` は `apps/desktop/src/renderer/components/skill/wizard/` 配下に配置し、wizard 系コンポーネントと責務を揃える
- `apps/desktop/src/renderer/components/skill/wizard/index.ts` から `ConversationRoundStep` を export し、既存 wizard 構成に自然に接続する

---

## 多角的チェック観点

### システム系

- **責務境界**: Props 入力（`SmartDefaultResult`）と出力（`ConversationAnswers`）の変換は `buildInitialAnswers()` に一元化する
- **状態所有権**: ページング state (`currentPage`) と回答 state (`answers`) は分離。表示質問スライスは `currentPage` から純粋に導出する
- **依存関係**: `inferSmartDefaults()` は Props 受け取り済みの `SmartDefaultResult` を利用。コンポーネント内では呼ばない

### 価値・コスト系

- **初回スコープ**: Q3 スケジュール設定 UI（`scheduleConfig`）は最小実装（`undefined`）とし、詳細は別タスク
- **scope boundary**: `SkillCreateWizard.tsx` への最終統合は W2-seq-03a で実施する。本タスクでは `ConfigureStep.tsx` 削除と `WizardOptions` 参照除去までを完了する
- **Wave 2 整合**: Props インターフェース (`onComplete` の型) を Wave 2 担当者と事前共有すること

### 問題解決系

- **優先順位**: `buildInitialAnswers()` の null フォールバック動作が最重要。ここが崩れると TC-02〜TC-03 が即 FAIL する

---

## 参照資料

| 資料名                                | パス                                                                        | 説明                             |
| ------------------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| ConversationAnswers 型定義            | `packages/shared/src/types/skillCreator.ts`                                 | 回答データ構造                   |
| SmartDefaultResult 型定義             | `packages/shared/src/types/skillCreator.ts`                                 | プリフィル変換元                 |
| inferSmartDefaults 動作仕様           | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` | null フォールバック挙動          |
| 既存ウィザード Props パターン（参考） | `apps/desktop/src/renderer/components/skill/wizard/`                        | DescribeStep.tsx 等の Props 設計 |
| 既存 wizard export 集約               | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                | export 接続点                    |
| 既存進捗バー                          | `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`       | 既存の進捗表示部品               |

---

## 成果物

| 成果物                     | 配置先                                | 形式     |
| -------------------------- | ------------------------------------- | -------- |
| Props インターフェース設計 | `outputs/phase-2/props-interface.md`  | Markdown |
| 状態管理設計書             | `outputs/phase-2/state-design.md`     | Markdown |
| 設計決定サマリー           | `outputs/phase-2/design-decisions.md` | Markdown |

---

## 完了条件

- [ ] Props インターフェース（`ConversationRoundStepProps`）が型安全に設計されている
- [ ] `buildInitialAnswers()` の null フォールバック動作（`null` → `selectedOption: null`）が明文化されている
- [ ] ページング設計（1ページ 3問・2ページ構成）が確定している
- [ ] `QUESTIONS` 定数配列の型定義が確定している
- [ ] Wave 2（`SkillCreateWizard.tsx`）との Props インターフェース整合が確認されている
- [ ] `outputs/phase-2/` に全成果物が生成されていること

---

## 次Phase

**Phase 3: 設計レビューゲート** — Phase 2 の設計が AC を満たすか、Phase 4 へ進んでよいかを判定する。
