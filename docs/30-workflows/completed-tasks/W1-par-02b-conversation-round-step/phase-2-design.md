# Phase 2: 設計

## メタ情報

- Phase: 2
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

Phase 1 で確定した要件を基に、`ConversationRoundStep` コンポーネントの詳細設計を行う。コンポーネント構造・ページング状態管理・Q3スケジュールUI・適用サマリーカード・バリデーション方針を定める。

## 前提（Phase 3 ゲート）

- Phase 3 で `task-specification-creator` / `aiworkflow-requirements` 準拠監査と 30思考法監査を行い、**Phase 4 へ進行可能かを判定**する。
- Phase 4 以降は Phase 3 の結論（境界・優先順位・禁止事項）を再利用し、解釈 drift を起こさない。

## 実行タスク

- [ ] コンポーネント全体構造を設計する
- [ ] ページング状態管理を設計する
- [ ] 進捗バーコンポーネントを設計する
- [ ] 各問（QuestionCard）の設計を行う
- [ ] Q3スケジュールUI（ScheduleConfigInput）の設計を行う
- [ ] Q5必須バリデーションロジックを設計する
- [ ] 適用サマリーカード（ApplySummaryCard）を設計する
- [ ] スマートデフォルト適用ロジックを設計する
- [ ] SmartDefault の対応付けが「順序依存」になっていないことを確認する（key-based mapping）
- [ ] ファイル配置を決定する

## 参照資料

| 資料名                  | パス                                                                         | 説明         |
| ----------------------- | ---------------------------------------------------------------------------- | ------------ |
| Phase 1 要件定義        | `phase-1-requirements.md`                                                    | 確定した要件 |
| W1-par-02a Phase 2 設計 | `../skill-wizard-redesign-lane/W1-par-02a-skill-info-step/phase-2-design.md` | 連携先設計   |
| 共有型定義              | `packages/shared/src/types/`                                                 | 型定義参照   |

## 実行手順

### Step 1: コンポーネント構造設計

```
ConversationRoundStep
├── InterviewProgressBar          # 「質問 N/6」進捗バー（常時表示）
├── Page1（currentPage === 1）
│   ├── QuestionCard (Q1)
│   ├── QuestionCard (Q2)
│   └── QuestionCard (Q3)
│       └── ScheduleConfigInput  # Q3で「定期実行」選択時のみ展開
├── Page2（currentPage === 2）
│   ├── QuestionCard (Q4)
│   ├── QuestionCard (Q5)        # category依存で必須/任意
│   └── QuestionCard (Q6)
├── ApplySummaryCard             # 「今すぐ生成する」後に表示
└── NavigationButtons
    ├── BackButton
    ├── NextPageButton（Page1のみ）
    └── GenerateNowButton（全ページで表示。「今すぐ生成する」でサマリーカードを開く）
```

### Step 2: ページング状態設計

```typescript
// コンポーネント内部状態
const [currentPage, setCurrentPage] = useState<1 | 2>(1);
const [showSummaryCard, setShowSummaryCard] = useState(false);

// 進捗バー用の現在問番号計算
const currentQuestionIndex = currentPage === 1 ? 1 : 4; // 表示中の先頭問
```

### Step 3: 進捗バー（InterviewProgressBar）設計

```typescript
interface InterviewProgressBarProps {
  currentQuestion: number; // 1〜6
  totalQuestions: 6;
}

// 表示: 「質問 {currentQuestion}/6」
// 進捗ゲージ: width = (currentQuestion / 6) * 100 %
```

### Step 4: QuestionCard 設計

```typescript
interface QuestionCardProps {
  questionNumber: number; // 1〜6
  label: string; // 問のラベル
  options: string[]; // 4択の選択肢
  answer: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
  required?: boolean; // Q5のみ true になりうる
  smartDefault?: string; // スマートデフォルト値（表示用）
}
```

### Step 5: Q3スケジュールUI（ScheduleConfigInput）設計

```typescript
interface ScheduleConfigInputProps {
  value: SkillWizardScheduleConfig;
  onChange: (config: SkillWizardScheduleConfig) => void;
}

// 表示条件: Q3の selectedOption === "定期実行"
// 入力項目:
//   - cron式入力フィールド（例: "0 9 * * 1-5"）
//   - タイムゾーン選択（セレクトボックス）
// バリデーション: Touched-state 方式（フォーカスが外れたとき検証）
```

### Step 6: Q5必須バリデーション設計

```typescript
// Q5が必須になる条件
const isQ5Required = formData.category === "external-integration";

// 本タスクでは Q5 未回答でも生成をブロックしない（警告のみ）。
// required 表示（ラベルの「必須★」）と、ApplySummaryCard 内の警告表示にのみ利用する。
```

### Step 7: 適用サマリーカード（ApplySummaryCard）設計

```typescript
interface ApplySummaryCardProps {
  answers: ConversationAnswers;
  smartDefaults: SmartDefaultResult;
  formData: SkillInfoFormData;
  onConfirm: () => void;
  onDismiss: () => void;
}

// 表示内容:
//   - 未回答問のスマートデフォルト値一覧
//   - Q5未設定かつ必須の場合: 警告メッセージ
// 操作:
//   - 「×」でカードを閉じる（onDismiss）
//   - 「生成する」で onGenerate("skip") を呼ぶ（onConfirm）
```

注意: 未回答問と `SmartDefaultResult` の対応付けは **key-based**（`q1 -> who` のような明示マップ）で実装し、配列のインデックス等の **順序依存** を作らない。

### Step 8: スマートデフォルト適用設計

```typescript
// 初期化時に smartDefaults から answers を事前入力する。
//
// - 既に回答済みの問は上書きしない（ユーザー入力を優先）
// - デフォルト値が選択肢に無い場合は freeText 側へ入れる
// - Q3 が「定期実行」の場合のみ、scheduleConfig を初期化する
```

### Step 9: ファイル配置設計

| ファイル                                                                      | 操作     | 説明                                  |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 新規作成 | 本コンポーネント（shared 型を再利用） |
| `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`  | 新規作成 | 進捗バー                              |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 新規作成 | サマリーカード                        |
| `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`         | 削除     | 旧実装                                |

## 成果物

- コンポーネント構造図
- ページング状態設計
- 全サブコンポーネントの Props 設計
- Q3スケジュールUI・Q5バリデーション・適用サマリーカードの詳細設計
- ファイル配置計画

## 統合テスト連携

- Phase 1 の AC-01〜AC-08 の実現方針を設計として固定し、Phase 4 テスト設計の入力とする。
- key-based mapping（`DEFAULT_KEY_BY_QUESTION`）はPhase 4/6のテストで回帰確認する。
- ページング状態（`currentPage`）とサマリーカード表示（`showSummaryCard`）は Phase 4 の state テストで検証する。

## 完了条件

- [ ] コンポーネント構造（親〜サブ）が明確に設計されている
- [ ] ページング状態管理（currentPage・showSummaryCard）が設計されている
- [ ] 進捗バーの仕様が設計されている
- [ ] Q3スケジュールUIの展開仕様が設計されている
- [ ] Q5必須バリデーションロジックが設計されている
- [ ] 適用サマリーカードの Props・動作が設計されている
- [ ] スマートデフォルト初期化ロジックが設計されている
- [ ] ファイルの新規作成・削除計画が確定している
