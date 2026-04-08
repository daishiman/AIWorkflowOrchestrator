# ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問） - タスク指示書

## メタ情報

```yaml
issue_number: 2013
task_id: UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001
status: open
priority: high
scale: large
task_type: NON_VISUAL
wave: W1
lane: skill-wizard-redesign-lane
```

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001              |
| タスク名     | ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問）    |
| 分類         | 新機能実装                                                  |
| 対象機能     | スキル作成ウィザード - Step 1（会話ラリー質問）             |
| 優先度       | 高                                                          |
| 見積もり規模 | 大規模                                                      |
| ステータス   | 未実施（`status:open`）                                     |
| 発見元       | skill-wizard-redesign-lane Wave 0 完了後                    |
| 発見日       | 2026-04-08                                                  |
| タスク分類   | NON_VISUAL タスク（Renderer 内部の計装のみ / 視覚差分なし） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル作成ウィザード改善レーン（skill-wizard-redesign-lane）の Wave 0 では、型定義（`SkillInfoFormData`、
`SmartDefaultResult`、`ConversationAnswers` 等）と `inferSmartDefaults()` API の公開（W0-seq-01、W0-seq-02）
が完了した。

Wave 1 では Wave 0 で確立した基盤を使い、ウィザードの各ステップコンポーネントを並列実装する。
`ConversationRoundStep.tsx` は Step 1（会話ラリー質問）を担うコンポーネントであり、ユーザーが
スキルの目的・利用者・入力・出力・ツール・フォーマットに関する 6 問に順番に回答するための
インターフェースを提供する。

設計確定事項（skill-wizard-redesign-lane/index.md より）:

- **Step 1**: 6問固定・2ページ（3+3）
- **進捗表示**: 「質問N/6」を常時表示
- **スマートデフォルト**: `inferSmartDefaults()` の結果をプリフィル値として表示
- **ページング**: 前3問（Q1-Q3）/ 後3問（Q4-Q6）でページ分割
- **型**: `SmartDefaultResult` 型（`@repo/shared` から import）を使用

### 1.2 問題点・課題

1. **Step 1 コンポーネント未実装**: `ConversationRoundStep.tsx` が存在しない。Wave 2 の
   `SkillCreateWizard.tsx` オーケストレーション（W2-seq-03a）がこのコンポーネントに依存するため、
   Wave 2 開始がブロックされている。

2. **スマートデフォルトのプリフィル未対応**: W0-seq-02 で `inferSmartDefaults()` が公開済みだが、
   その結果を Step 1 の各質問フォームに初期値として表示するロジックが存在しない。
   プリフィルなしでは「なぜ入力欄に値が入っているのか」がユーザーに伝わらず UX が低下する。

3. **ページング状態管理の設計が未定**: 6問を 3+3 で分割するページング状態（現在ページ、ページ遷移）
   をどの state で管理するかが実装レベルで確定していない。

4. **null フォールバックの UI ハンドリング未定**: `inferSmartDefaults()` が推論不能なフィールドに
   `null` を返す場合、プリフィル欄に何も表示しないのか、プレースホルダーを表示するのかが
   コンポーネントレベルで未定義。

### 1.3 放置した場合の影響

- Wave 2（`SkillCreateWizard.tsx` オーケストレーション）が開始できない。ウィザード全体の完成が遅延する。
- Step 1 が未実装のままウィザードをユーザーに公開した場合、スキル作成フローの根幹部分が欠落する。
- Wave 0 で整備した型定義・推論 API が活用されず、実装上の技術的負債になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/components/skill/` に `ConversationRoundStep.tsx` を新規作成し、
スキル作成ウィザードの Step 1（6問の会話ラリー質問）を実装する。

### 2.2 最終ゴール

- 6問固定・2ページ（3+3）の質問フォームが動作する
- 「質問N/6」形式の進捗インジケーターが常時表示される
- `inferSmartDefaults()` の結果が各質問のプリフィル値として表示される
- `null` フィールドは空欄として表示される（プレースホルダーのみ表示）
- 前3問（ページ1）と後3問（ページ2）のページング遷移が動作する
- `ConversationAnswers` 型の回答データが親コンポーネントへコールバックで渡せる
- `pnpm --filter @repo/desktop typecheck` が PASS する
- 関連テストが PASS する

### 2.3 スコープ

#### 含むもの

- `ConversationRoundStep.tsx` の新規作成（Step 1 コンポーネント本体）
- 6問（Q1〜Q6）の質問定義と選択肢の定義
- ページング状態管理（ページ 1/2 の切り替え）
- 「質問N/6」進捗インジケーターの表示
- `inferSmartDefaults()` の結果をプリフィル値として反映するロジック
- `null` フォールバックハンドリング（null の場合は空欄 / プレースホルダー表示）
- `ConversationAnswers` 型の回答状態管理と親への callback
- 対応するユニットテスト（`__tests__/ConversationRoundStep.test.tsx`）

#### 含まないもの

- `SkillCreateWizard.tsx` への統合（Wave 2 の W2-seq-03a が担当）
- Q3 スケジュール設定 UI の詳細実装（別タスク候補）
- Step 0（`SkillInfoStep.tsx`）の実装（W1-par-02a が担当）
- Step 2（`CompleteStep.tsx`）の実装（W1-par-02c が担当）
- アニメーション・トランジション効果（別タスク候補）

### 2.4 成果物

| 種別     | ファイル                                                                              |
| -------- | ------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/ConversationRoundStep.tsx`                |
| 新規作成 | `apps/desktop/src/renderer/components/skill/__tests__/ConversationRoundStep.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **W0-seq-01 完了**: `SkillInfoFormData`、`SmartDefaultResult`、`ConversationAnswers`、
  `QuestionAnswer`、`SkillWizardScheduleConfig` が `@repo/shared` から import 可能であること
- **W0-seq-02 完了**: `inferSmartDefaults()` が `@repo/shared` から import 可能であること
  （`packages/shared/src/services/skillCreator/index.ts` で export 済み）
- `pnpm install` が完了しており、monorepo のパッケージ解決が正常であること
- `packages/shared` の TypeScript ビルド設定が Renderer から import できる状態であること

### 3.2 依存タスク

| タスクID         | 状態 | 内容                                                                   |
| ---------------- | ---- | ---------------------------------------------------------------------- |
| W0-seq-01 (完了) | 完了 | 型定義（SkillInfoFormData 等）の実装                                   |
| W0-seq-02 (完了) | 完了 | `inferSmartDefaults()` の `@repo/shared` 公開                          |
| W1-par-02a       | open | `SkillInfoStep.tsx`（Wave 1 並列・依存なし）                           |
| W1-par-02c       | open | `CompleteStep.tsx`（Wave 1 並列・依存なし）                            |
| W2-seq-03a       | open | `SkillCreateWizard.tsx` オーケストレーション（本タスク完了後に開始可） |

### 3.3 必要な知識

- React の `useState` / `useCallback` による状態管理
- TypeScript の判別型（discriminated union）と型ガード
- `@repo/shared` からの型・関数 import パス（monorepo 設定）
- `ConversationAnswers` / `SmartDefaultResult` 型の構造と各フィールドの意味
- `inferSmartDefaults()` の動作仕様（推論不能フィールドは `null` を返す）
- NON_VISUAL タスクの Phase 11 証跡取得方法（console ログ / mock / automation evidence）

### 3.4 推奨アプローチ

1. **質問定義を定数配列で管理する**: Q1〜Q6 の質問文・選択肢を `QUESTIONS` 定数配列として定義し、
   インデックスで動的に参照する。質問内容の変更が定数変更のみで済む設計にする。

2. **ページング状態は `currentPage` で管理する**: `useState<1 | 2>(1)` で現在ページを保持し、
   「ページ 1 の質問インデックス = 0, 1, 2」「ページ 2 の質問インデックス = 3, 4, 5」と
   スライス範囲を導出する。

3. **回答状態は `ConversationAnswers` 型で直接管理する**: `useState<ConversationAnswers>` として
   初期値を `inferSmartDefaults()` の結果からプリフィルした値で初期化する。

4. **スマートデフォルトのプリフィル変換を純粋関数で行う**: `SmartDefaultResult` → `ConversationAnswers`
   の変換を `buildInitialAnswers(smartDefaults: SmartDefaultResult): ConversationAnswers` という
   純粋関数として実装する。null フィールドは `selectedOption: null` / `freeText: ""` とする。

5. **進捗表示は `currentQuestionIndex`（0〜5）から導出する**: 現在ページと質問ポジションから
   「質問N/6」のN値を計算する。

6. **コールバックは `onComplete(answers: ConversationAnswers): void`** として受け取り、
   全 6 問への回答が完了して「次へ」を押したときに呼び出す。

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成

| Phase | 名称                     | ステータス | 概要                                                                 |
| ----- | ------------------------ | ---------- | -------------------------------------------------------------------- |
| 1     | 要件定義                 | open       | スコープ・受入条件・コードインベントリ確定                           |
| 2     | 設計                     | open       | コンポーネント設計・状態管理・Props インターフェース・質問定義       |
| 3     | 設計レビュー             | open       | Phase 4 進行可否判定                                                 |
| 4     | テスト作成               | open       | テストマトリクス・TDD Red ケース作成                                 |
| 5     | 実装                     | open       | ConversationRoundStep.tsx 本体実装・プリフィルロジック・ページング   |
| 6     | テスト拡充               | open       | エッジケース・null フォールバック・ページング境界テスト追加          |
| 7     | カバレッジ確認           | open       | 変更ファイルの line/branch カバレッジ実測                            |
| 8     | リファクタリング         | open       | 重複除去・命名整理・対象/Before/After/理由テーブル記録               |
| 9     | 品質検証                 | open       | typecheck / lint / test 通過確認                                     |
| 10    | 最終レビュー             | open       | 受入条件チェック・ブロッカー判定                                     |
| 11    | 手動テスト（NON_VISUAL） | open       | console / mock / automation evidence による証跡取得                  |
| 12    | ドキュメント更新         | open       | 実装ガイド Part1/2・仕様書更新・未タスク検出・フィードバックレポート |
| 13    | PR 作成                  | blocked    | ユーザー明示承認後のみ実施                                           |

---

### Phase 1: 要件定義

**ステータス**: open

#### 目的

タスクの受入条件、タスク分類、コードインベントリを確定する。

#### タスク分類（Phase 1 時点）

- **タスク種別**: NON_VISUAL タスク（Renderer 内部実装のみ / 視覚差分なし）
- **影響 Process**: Renderer（ブラウザ環境）
- **新規追加コンポーネント**: `ConversationRoundStep.tsx`
- **参照する既存型**: `ConversationAnswers`、`SmartDefaultResult`、`QuestionAnswer`（`@repo/shared`）
- **参照する既存 API**: `inferSmartDefaults()`（`@repo/shared`）

#### 受入条件（AC）

| AC    | 内容                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `ConversationRoundStep` コンポーネントが `apps/desktop/src/renderer/components/skill/` に存在する                   |
| AC-2  | Props として `smartDefaults: SmartDefaultResult` と `onComplete: (answers: ConversationAnswers) => void` を受け取る |
| AC-3  | 6問（Q1〜Q6）が「質問N/6」形式の進捗インジケーターとともに表示される                                                |
| AC-4  | ページ 1 には Q1〜Q3、ページ 2 には Q4〜Q6 が表示される                                                             |
| AC-5  | `smartDefaults` の各フィールドが対応する質問の初期値（プリフィル）として表示される                                  |
| AC-6  | `smartDefaults` のフィールドが `null` の場合、該当質問は空欄（未選択 / 空文字）で表示される                         |
| AC-7  | ページ 1 の「次へ」ボタン押下でページ 2 に遷移する                                                                  |
| AC-8  | ページ 2 の「完了」ボタン押下で `onComplete(answers)` が呼ばれる                                                    |
| AC-9  | `onComplete` には現時点の `ConversationAnswers` 型の回答データが渡される                                            |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                                                |
| AC-11 | `__tests__/ConversationRoundStep.test.tsx` が PASS する                                                             |

#### 手順

1. `packages/shared/src/types/skillCreator.ts` で `ConversationAnswers`、`SmartDefaultResult`、
   `QuestionAnswer`、`SkillWizardScheduleConfig` の型定義を精読し、完全に理解する
2. `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` で
   `inferSmartDefaults()` の入力・出力・null フォールバック挙動を確認する
3. `apps/desktop/src/renderer/components/skill/wizard/` 配下の既存ステップコンポーネント
   （`DescribeStep.tsx`、`ConfigureStep.tsx`）の実装パターンを参照する
4. `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` の実装を参照し、
   既存の質問表示 UI パターンを把握する
5. 上記の AC-1〜AC-11 を仕様書に記録する

#### 成果物

- 受入条件（AC）一覧
- コードインベントリ（参照対象ファイル一覧）

#### 完了条件

- AC-1〜AC-11 が明文化されている
- NON_VISUAL タスクとして分類されていることが記録されている

---

### Phase 2: 設計

**ステータス**: open

#### 目的

コンポーネント Props インターフェース・状態管理設計・質問定義・プリフィル変換ロジックを確定する。

#### Props インターフェース設計

```typescript
// ConversationRoundStep の Props
export interface ConversationRoundStepProps {
  /** W0-seq-02 で公開された inferSmartDefaults() の結果 */
  smartDefaults: SmartDefaultResult;
  /** 全 6 問への回答完了時に呼ばれるコールバック */
  onComplete: (answers: ConversationAnswers) => void;
  /** ページ 1 の「戻る」（Step 0 へ）コールバック（任意） */
  onBack?: () => void;
}
```

#### 状態管理設計

```typescript
// ページング状態
const [currentPage, setCurrentPage] = useState<1 | 2>(1);

// 回答状態（ConversationAnswers 型・初期値はプリフィル変換で設定）
const [answers, setAnswers] = useState<ConversationAnswers>(() =>
  buildInitialAnswers(smartDefaults),
);
```

#### プリフィル変換純粋関数設計

```typescript
// SmartDefaultResult → ConversationAnswers の初期値変換
function buildInitialAnswers(
  defaults: SmartDefaultResult,
): ConversationAnswers {
  return {
    q1: { selectedOption: defaults.who ?? null, freeText: "" },
    q2: { selectedOption: defaults.input ?? null, freeText: "" },
    q3: { selectedOption: defaults.timing ?? null, freeText: "" },
    q4: { selectedOption: defaults.output ?? null, freeText: "" },
    q5: { selectedOption: defaults.tool ?? null, freeText: "" },
    q6: { selectedOption: defaults.format ?? null, freeText: "" },
  };
}
```

#### 質問定義

```typescript
// 6問の定義（ラベル・選択肢は確定後に更新）
const QUESTIONS = [
  {
    id: "q1",
    label: "このスキルは誰が使いますか？",
    options: ["自分だけ", "チーム全員", "特定ユーザー", "その他"],
  },
  {
    id: "q2",
    label: "どのようなデータを入力しますか？",
    options: ["テキスト", "ファイル", "API応答", "その他"],
  },
  {
    id: "q3",
    label: "いつ実行しますか？",
    options: ["手動実行", "定期実行", "イベントトリガー", "その他"],
  },
  {
    id: "q4",
    label: "結果をどこに出力しますか？",
    options: ["画面表示", "ファイル保存", "外部サービス", "その他"],
  },
  {
    id: "q5",
    label: "連携する外部ツールはありますか？",
    options: ["Slack", "GitHub", "Notion", "なし"],
  },
  {
    id: "q6",
    label: "出力フォーマットはどれですか？",
    options: ["テキスト", "コード", "構造化データ", "その他"],
  },
] as const;
```

#### ページング設計

- ページ 1: `QUESTIONS[0]`〜`QUESTIONS[2]`（Q1〜Q3）
- ページ 2: `QUESTIONS[3]`〜`QUESTIONS[5]`（Q4〜Q6）
- 進捗 N 値: `currentPage === 1 ? 1〜3 : 4〜6`（現在表示中の質問番号）

#### 手順

1. Phase 1 のインベントリをもとに Props インターフェースを確定する
2. `buildInitialAnswers()` の null フォールバック挙動（`null` → `selectedOption: null`）を設計する
3. 質問定義の選択肢を `ConversationalInterview.tsx` の既存実装と整合させる
4. ページ遷移と進捗 N 値の計算ロジックを設計する

#### 成果物

- Props インターフェース設計（上記）
- 状態管理設計（上記）
- `buildInitialAnswers()` 純粋関数設計（上記）
- 質問定義定数（上記）

#### 完了条件

- Props インターフェースが型安全に設計されている
- `buildInitialAnswers()` の null フォールバック動作が明文化されている
- ページング設計（1ページ 3問・2ページ構成）が確定している

---

### Phase 3: 設計レビュー

**ステータス**: open

#### 目的

Phase 2 の設計が AC を満たし、Phase 4 のテスト作成に進められるかを判定する。

#### レビューチェックリスト

| チェック項目                                                                               | 判定   |
| ------------------------------------------------------------------------------------------ | ------ |
| `SmartDefaultResult` のすべてのフィールドが `ConversationAnswers` の各質問に対応しているか | 要確認 |
| `null` フィールドのフォールバックが UI 上で明確に処理されているか                          | 要確認 |
| ページング状態が `useState<1 \| 2>` で正しく管理できるか                                   | 要確認 |
| `QUESTIONS` 定数配列の型が TypeScript で type-safe に定義されているか                      | 要確認 |
| `buildInitialAnswers()` が純粋関数（副作用なし）として実装できるか                         | 要確認 |
| `onComplete` コールバックに正しい型の `ConversationAnswers` が渡されるか                   | 要確認 |
| AC-1〜AC-11 を全て満たす設計になっているか                                                 | 要確認 |
| テスト可能な設計（純粋関数 + コンポーネント分離）になっているか                            | 要確認 |

#### 手順

1. Phase 2 の設計資料を精読し、上記チェックリストを評価する
2. CRITICAL 問題（Phase 4 進行不可レベル）があれば Phase 2 へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 4 へ進む

#### 成果物

- 設計レビュー結果（PASS / FAIL）
- MINOR 指摘事項リスト（あれば）

#### 完了条件

- チェックリスト全項目が PASS または MINOR として記録されている
- Phase 4 進行可否が明確に判定されている

---

### Phase 4: テスト作成（TDD Red）

**ステータス**: open

#### 目的

実装前にテストを作成し（TDD Red 状態）、テストマトリクスを確定する。

#### テストマトリクス

| TC    | 対象                     | 入力・条件                                     | 期待出力 / 動作                                                 | テストファイル                   |
| ----- | ------------------------ | ---------------------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| TC-01 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールドに値あり      | `ConversationAnswers` の各 `selectedOption` に値が入る          | `ConversationRoundStep.test.tsx` |
| TC-02 | `buildInitialAnswers()`  | `SmartDefaultResult` の `tool` が `null`       | `q5.selectedOption` が `null`                                   | `ConversationRoundStep.test.tsx` |
| TC-03 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールド `null`       | 全質問が `selectedOption: null` / `freeText: ""`                | `ConversationRoundStep.test.tsx` |
| TC-04 | 初期表示（ページ 1）     | `smartDefaults` を渡してレンダリング           | Q1〜Q3 が表示され、Q4〜Q6 は非表示                              | `ConversationRoundStep.test.tsx` |
| TC-05 | 進捗インジケーター       | ページ 1 表示時                                | 「質問1/6」「質問2/6」「質問3/6」が表示される                   | `ConversationRoundStep.test.tsx` |
| TC-06 | プリフィル表示           | `smartDefaults.who = "自分だけ"` の場合        | Q1 の選択肢「自分だけ」が初期選択された状態で表示される         | `ConversationRoundStep.test.tsx` |
| TC-07 | null プリフィル表示      | `smartDefaults.tool = null` の場合             | Q5 の選択肢が未選択状態で表示される                             | `ConversationRoundStep.test.tsx` |
| TC-08 | ページ遷移（→ ページ 2） | ページ 1 の「次へ」ボタン押下                  | Q4〜Q6 が表示され、Q1〜Q3 は非表示になる                        | `ConversationRoundStep.test.tsx` |
| TC-09 | 進捗インジケーター       | ページ 2 表示時                                | 「質問4/6」「質問5/6」「質問6/6」が表示される                   | `ConversationRoundStep.test.tsx` |
| TC-10 | 完了コールバック         | ページ 2 の「完了」ボタン押下                  | `onComplete` が呼ばれ、`ConversationAnswers` 型の引数が渡される | `ConversationRoundStep.test.tsx` |
| TC-11 | 回答更新                 | Q1 の選択肢変更（「チーム全員」を選択）        | `onComplete` に渡される `q1.selectedOption === "チーム全員"`    | `ConversationRoundStep.test.tsx` |
| TC-12 | 自由入力更新             | Q2 の `freeText` に入力                        | `onComplete` に渡される `q2.freeText` に入力値が含まれる        | `ConversationRoundStep.test.tsx` |
| TC-13 | 戻るコールバック         | ページ 1 の「戻る」ボタン押下（`onBack` あり） | `onBack` が呼ばれる                                             | `ConversationRoundStep.test.tsx` |
| TC-14 | 戻るボタン非表示         | `onBack` を渡さなかった場合                    | 「戻る」ボタンが表示されない                                    | `ConversationRoundStep.test.tsx` |

#### 手順

1. `apps/desktop/src/renderer/components/skill/__tests__/ConversationRoundStep.test.tsx` を
   新規作成し、TC-01〜TC-14 を記述する（Red 状態）
2. `pnpm vitest run` を実行して全テストが FAIL することを確認する（TDD Red 確認）
3. `buildInitialAnswers()` は `ConversationRoundStep.tsx` からエクスポートして
   単体テスト可能にする設計を採用する

#### 成果物

- `__tests__/ConversationRoundStep.test.tsx`（Red 状態）
- TDD Red 確認のテスト実行ログ

#### 完了条件

- TC-01〜TC-14 がテストファイルとして作成されている
- 全テストが意図した理由（実装がないため）で FAIL している

---

### Phase 5: 実装

**ステータス**: open

#### 目的

Phase 4 で作成したテストを Green にする実装を行う。

#### 実装計画

**新規作成ファイル**:

- `apps/desktop/src/renderer/components/skill/ConversationRoundStep.tsx`

**実装タスク**

**Task 5-1: 質問定義定数・プリフィル変換関数を実装する**

1. `QUESTIONS` 定数配列を定義する（Q1〜Q6 の質問文・選択肢・ID）
2. `buildInitialAnswers(defaults: SmartDefaultResult): ConversationAnswers` を
   エクスポート可能な純粋関数として実装する
3. `null` フィールドを `selectedOption: null` / `freeText: ""` に変換することを確認する

**Task 5-2: ページング・回答状態管理を実装する**

1. `useState<1 | 2>(1)` でページ状態を管理する
2. `useState<ConversationAnswers>` の初期値を `buildInitialAnswers(smartDefaults)` で設定する
3. 現在ページに対応する質問スライス（インデックス 0〜2 または 3〜5）を導出するロジックを実装する
4. 「次へ」ボタンで `currentPage` を `2` に更新するハンドラを実装する

**Task 5-3: 進捗インジケーターを実装する**

1. 現在のページと表示質問位置から「質問N/6」の N 値を計算するロジックを実装する
2. 各質問に対して「質問N/6」の進捗テキストを表示する

**Task 5-4: 回答 UI を実装する**

1. 選択肢（`SingleSelectChips` 相当）のレンダリングを実装する
2. 自由入力（`FreeTextInput` 相当）のレンダリングを実装する
3. プリフィル値が初期状態として正しく表示されることを確認する

**Task 5-5: コールバック・ページ遷移を完成させる**

1. ページ 1 の「次へ」→ `setCurrentPage(2)` 遷移を実装する
2. ページ 2 の「完了」→ `onComplete(answers)` 呼び出しを実装する
3. `onBack` が渡された場合のみ「戻る」ボタンを表示し、押下時に `onBack()` を呼ぶ

#### 成果物

- `ConversationRoundStep.tsx`（実装済み）
- `pnpm vitest run` の Green 確認ログ

#### 完了条件

- TC-01〜TC-14 が全て Green になっている
- `pnpm --filter @repo/desktop typecheck` が PASS している

---

### Phase 6: テスト拡充

**ステータス**: open

#### 目的

エッジケース・回帰ガードを追加し、テストの網羅性を高める。

#### 追加テストケース

| TC    | 対象                       | 内容                                                                                      |
| ----- | -------------------------- | ----------------------------------------------------------------------------------------- |
| TC-15 | ページ 2 → ページ 1 に戻る | ページ 2 表示中に「前へ」ボタン押下でページ 1 に戻れるか（実装する場合）                  |
| TC-16 | `inferenceLog` の無視      | `SmartDefaultResult.inferenceLog` が存在しても `buildInitialAnswers` がエラーにならないか |
| TC-17 | 全問未回答で完了           | 全質問未選択のまま「完了」を押した場合、`onComplete` が空回答で呼ばれるか                 |
| TC-18 | 回答変更後の完了           | ページ 1 で回答変更 → ページ 2 へ遷移 → 「完了」で変更が反映されているか                  |
| TC-19 | スナップショット           | レンダリング結果のスナップショットテスト（回帰ガード）                                    |

#### 手順

1. `ConversationRoundStep.test.tsx` に TC-15〜TC-19 を追加する
2. `pnpm vitest run` で全テストが PASS することを確認する

#### 成果物

- 拡充済みテストファイル
- テスト実行 PASS ログ

#### 完了条件

- TC-01〜TC-19 が全て PASS している

---

### Phase 7: カバレッジ確認

**ステータス**: open

#### 目的

変更したファイルの line カバレッジ・branch カバレッジを実測し、品質基準を満たしていることを確認する。

#### カバレッジ対象ファイル

| ファイル                                                               | 目標 line | 目標 branch |
| ---------------------------------------------------------------------- | --------- | ----------- |
| `apps/desktop/src/renderer/components/skill/ConversationRoundStep.tsx` | 90%+      | 80%+        |
| `buildInitialAnswers()` 関数（ConversationRoundStep.tsx 内）           | 100%      | 100%        |

#### 手順

1. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
2. `ConversationRoundStep.tsx` の line/branch カバレッジを記録する
3. 目標未達の場合は Phase 6 へ戻りテストを追加する

#### 成果物

- カバレッジレポート（`outputs/phase-7/coverage-result.md`）

#### 完了条件

- `ConversationRoundStep.tsx` が line 90%+ / branch 80%+ を達成している
- `buildInitialAnswers()` が line 100% / branch 100% を達成している

---

### Phase 8: リファクタリング

**ステータス**: open

#### 目的

実装後の重複除去・命名整理・設計改善を記録する。

#### リファクタリング記録テーブル（実施後に記入）

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実施後に記入） | -      | -     | -    |

#### 手順

1. 実装コードを見直し、重複ロジック・不要な `console.log` 等を除去する
2. 命名揺れ（camelCase / PascalCase）を確認し、プロジェクト規則に統一する
3. リファクタリング内容を上記テーブルに記録する
4. `pnpm vitest run` で全テストが引き続き PASS することを確認する

#### 成果物

- リファクタリング記録テーブル（上記テーブルに記入済み）

#### 完了条件

- リファクタリング記録が `対象/Before/After/理由` テーブル形式で残っている
- 全テストが PASS している

---

### Phase 9: 品質検証

**ステータス**: open

#### 目的

typecheck / lint / test の全通過を確認する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行して PASS を確認する
2. `pnpm --filter @repo/desktop lint` を実行して PASS を確認する
3. `pnpm vitest run` を実行して全テスト PASS を確認する

#### 成果物

- 品質検証結果レポート（`outputs/phase-9/quality-check-result.md`）

#### 完了条件

- typecheck / lint / test が全て PASS している

---

### Phase 10: 最終レビュー

**ステータス**: open

#### 目的

受入条件（AC-1〜AC-11）の充足確認と、Phase 11 手動テストへの進行可否を判定する。

#### 受入条件チェック

| AC    | 内容                                                           | 判定   |
| ----- | -------------------------------------------------------------- | ------ |
| AC-1  | `ConversationRoundStep` コンポーネントが所定のパスに存在する   | 未確認 |
| AC-2  | Props として `smartDefaults` と `onComplete` を受け取る        | 未確認 |
| AC-3  | 6問が「質問N/6」形式の進捗とともに表示される                   | 未確認 |
| AC-4  | ページ 1 に Q1〜Q3、ページ 2 に Q4〜Q6 が表示される            | 未確認 |
| AC-5  | `smartDefaults` の各フィールドが初期値としてプリフィルされる   | 未確認 |
| AC-6  | `smartDefaults` フィールドが `null` の場合、空欄で表示される   | 未確認 |
| AC-7  | 「次へ」押下でページ 2 に遷移する                              | 未確認 |
| AC-8  | 「完了」押下で `onComplete(answers)` が呼ばれる                | 未確認 |
| AC-9  | `onComplete` に `ConversationAnswers` 型の回答データが渡される | 未確認 |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する           | 未確認 |
| AC-11 | `__tests__/ConversationRoundStep.test.tsx` が PASS する        | 未確認 |

#### 手順

1. 上記の AC-1〜AC-11 を一つずつ確認し、PASS / FAIL を記録する
2. CRITICAL 問題（AC FAIL）があれば対応 Phase へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 11 へ進む

#### 成果物

- 最終レビュー結果（`outputs/phase-10/final-review.md`）

#### 完了条件

- AC-1〜AC-11 が全て PASS している
- Phase 11 への進行が承認されている

---

### Phase 11: 手動テスト（NON_VISUAL）

**ステータス**: open

> **NON_VISUAL タスク**: UI の視覚差分はない。
> console ログ / mock / automation evidence を主証跡とする。
> Phase 12 での `phase12-task-spec-compliance-check.md` に証跡を集約する。

#### 目的

NON_VISUAL タスクとして、コンポーネントの動作を automation evidence で検証する。

#### 証跡取得方針

| 証跡種別           | 内容                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| テスト実行ログ     | `pnpm vitest run` の全テスト PASS ログ（TC-01〜TC-19）                          |
| カバレッジレポート | `pnpm vitest run --coverage` の出力（line/branch 数値）                         |
| typecheck ログ     | `pnpm --filter @repo/desktop typecheck` の PASS ログ                            |
| コンポーネント動作 | テストランナーのレポート（`buildInitialAnswers` null フォールバック動作の証跡） |

#### NON_VISUAL タスクの証跡取得手順

1. `pnpm vitest run` を実行し、TC-01〜TC-19 の全テスト PASS ログを記録する
2. `pnpm --filter @repo/desktop vitest run --coverage` を実行し、カバレッジ数値を記録する
3. `pnpm --filter @repo/desktop typecheck` を実行し、PASS ログを記録する
4. `inferSmartDefaults()` の結果を `buildInitialAnswers()` に渡した際の変換結果を
   コンソールログまたはスナップショットテストで記録する

#### 成果物

- 手動テスト結果（`outputs/phase-11/manual-test-result.md`）
  - 各テストケースの PASS / SKIP 記録
  - NON_VISUAL 理由の明記

#### 完了条件

- TC-01〜TC-19 の全 PASS が確認されている
- NON_VISUAL として automation evidence が記録されている

---

### Phase 12: ドキュメント更新

**ステータス**: open

#### 目的

実装ガイド（Part 1/2）、システム仕様書更新、未タスク検出、スキルフィードバックレポートを完成させる。

#### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 中学生でも理解できる説明**

スキルを作る時、どんなスキルを作るかを決めるために「6つの質問」に答えます。
「誰が使うの？」「何のデータを入力するの？」「いつ動かすの？」といった質問です。

ただ、6つの質問を全部一度に表示すると、画面がごちゃごちゃして見づらいですよね。
そこで「3問ずつ」の2ページに分けて、少しずつ答えられるようにしました。

また、Step 0（スキル名・目的・カテゴリ入力）で入力した内容をもとに、
「このスキルは自分だけが使うものかな？」「Slackと連携するスキルっぽいな」という
推測（スマートデフォルト）を自動的に計算して、最初から答えを入れておきます。
ユーザーはそれを確認・修正するだけでよいので、手入力の手間が減ります。

推測できないときは、質問の答えを空欄のままにします（無理に答えを入れると逆に混乱するため）。

**Part 2: 技術者向けの詳細説明**

（Phase 5 実装後に記入）

#### Task 12-2: システム仕様書更新

- Step 1-A: 完了タスク記録（`task-workflow-completed.md` へ追記）
- Step 1-B: 実装状況テーブル更新（`skill-wizard-redesign-lane/index.md` の Wave 1 状況更新）
- Step 1-C: 関連タスクテーブル更新（`task-workflow-backlog.md` のステータス更新）

#### Task 12-3〜12-5: 各レポート作成

- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`（0件でも出力必須）
- `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

#### 成果物

| ファイル                                                 | 内容                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド Part1（中学生レベル）+ Part2（技術者）  |
| `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書更新サマリー                         |
| `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                               |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも出力必須）            |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバックレポート（改善点なしでも必須） |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック（root evidence）             |

#### 完了条件

- 上記 6ファイルが全て作成されている
- `outputs/artifacts.json` と `outputs/phase-12/` が同期されている

---

### Phase 13: PR 作成

**ステータス**: blocked

> **重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行しない。
> Wave 1 の他タスク（W1-par-02a, 02c, 02d）の完了を待って Wave 2 と合わせた PR 作成も検討する。

#### 目的

実装・テスト・ドキュメント更新が完了した内容を Pull Request として提出する。

#### PR タイトル（案）

```
feat(skill-wizard): W1-par-02b ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問）
```

#### 完了条件

- ユーザーの承認を得た後に PR が作成されている
- CI が PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `ConversationRoundStep.tsx` が所定のパスに存在する
- [ ] AC-2: `smartDefaults` と `onComplete` の Props が受け取れる
- [ ] AC-3: 6問が「質問N/6」進捗とともに表示される
- [ ] AC-4: ページ 1 に Q1〜Q3、ページ 2 に Q4〜Q6 が表示される
- [ ] AC-5: `smartDefaults` 各フィールドがプリフィルされる
- [ ] AC-6: `smartDefaults` が `null` のフィールドは空欄表示
- [ ] AC-7: 「次へ」でページ 2 に遷移する
- [ ] AC-8: 「完了」で `onComplete(answers)` が呼ばれる
- [ ] AC-9: `onComplete` に `ConversationAnswers` 型が渡される

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm vitest run` で TC-01〜TC-19 が全て PASS
- [ ] `ConversationRoundStep.tsx` の line 90%+ / branch 80%+ カバレッジ
- [ ] `buildInitialAnswers()` の line 100% / branch 100% カバレッジ

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`（Part1/Part2 両方）
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも出力必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）

---

## 6. 検証方法

### 自動テスト

```bash
# desktop パッケージの型チェックとテスト
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop vitest run

# カバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage

# lint
pnpm --filter @repo/desktop lint
```

### NON_VISUAL 証跡取得

```bash
# テスト実行ログを保存
pnpm vitest run 2>&1 | tee outputs/phase-11/test-run.log
```

---

## 7. リスクと対策

| リスク                                                                    | 影響度 | 発生確率 | 対策                                                                                                     |
| ------------------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `inferSmartDefaults()` の null フォールバックが UI で未ハンドリングのまま | 高     | 高       | `buildInitialAnswers()` で明示的に null → `selectedOption: null` へ変換し、UI での null チェックを排除   |
| `SmartDefaultResult` と `ConversationAnswers` のフィールド対応が不明確    | 中     | 中       | Phase 2 設計で対応テーブルを明文化し、`buildInitialAnswers()` の単体テストで網羅する                     |
| ページング状態管理が複雑になり回答データとの同期が崩れる                  | 中     | 中       | `currentPage` を `1 \| 2` の型で管理し、回答データは別途 `ConversationAnswers` に統一する                |
| NON_VISUAL タスクの Phase 11 証跡が不十分で close-out できない            | 中     | 低       | 自動テストのログ・カバレッジレポート・typecheck ログを証跡として明示的に保存する                         |
| Wave 2（`SkillCreateWizard.tsx`）との Props インターフェース不整合        | 高     | 中       | Phase 2 で Props 設計を確定し、Wave 2 担当者（W2-seq-03a）に事前共有する                                 |
| Q3（定期実行）の `scheduleConfig` UI が複雑で実装工数が大幅に増加する     | 中     | 中       | Phase 5 では Q3 の `scheduleConfig` を最小実装（未設定 = `undefined`）とし、詳細 UI は別タスクに切り出す |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                              | パス                                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| skill-wizard-redesign-lane タスク一覧・設計根拠                           | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                     |
| W0-seq-02 smart-default-reasoning-service 仕様                            | `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/`              |
| 型定義（SkillInfoFormData / SmartDefaultResult / ConversationAnswers 等） | `packages/shared/src/types/skillCreator.ts`                                 |
| inferSmartDefaults() 実装                                                 | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` |
| inferSmartDefaults() public API エクスポート                              | `packages/shared/src/services/skillCreator/index.ts`                        |
| 既存ウィザードコンポーネント（参考）                                      | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`        |
| 既存インタビューコンポーネント（参考）                                    | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`    |
| 既存インタビューウィジェット（SingleSelectChips 等）                      | `apps/desktop/src/renderer/components/skill/interview-widgets/`             |
| Phase 1-13 フォーマット                                                   | `.claude/skills/task-specification-creator/SKILL.md`                        |

### 関連タスク

| タスクID                                                 | 関係       | 内容                                                                 |
| -------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| W0-seq-01                                                | 完了・前提 | 型定義（SkillInfoFormData, SmartDefaultResult 等）実装               |
| W0-seq-02                                                | 完了・前提 | `inferSmartDefaults()` の `@repo/shared` 公開                        |
| W1-par-02a (UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001 相当) | 並列       | SkillInfoStep.tsx（Step 0）実装                                      |
| W1-par-02c (UT-SKILL-WIZARD-W1-COMPLETE-STEP-001 相当)   | 並列       | CompleteStep.tsx（完了画面）実装                                     |
| W2-seq-03a (UT-SKILL-WIZARD-W2-CREATE-WIZARD-001 相当)   | 後続       | SkillCreateWizard.tsx オーケストレーション（本タスク完了後に開始可） |

---

## 9. 備考

### 苦戦箇所【記入必須】

W0 実装（wave 0）から得られた知見を以下に記録する。

#### 苦戦箇所 1: `inferSmartDefaults` の null フォールバック UI ハンドリング

| 項目     | 内容                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状     | `inferSmartDefaults()` が推論不能なフィールドに `null` を返すが、UI コンポーネント側でその null をどう扱うか設計が未定                                                                                             |
| 原因     | W0-seq-02 の実装では `tool: null`、`timing: null` 等が正常な「推論不能」状態として返されるが、UI の初期値として null を渡すと選択肢 UI が誤動作するリスクがある                                                    |
| 推奨対策 | `buildInitialAnswers(defaults: SmartDefaultResult): ConversationAnswers` 純粋関数で null → `selectedOption: null` に一元変換し、UI コンポーネントは `selectedOption === null` を「未選択」として扱うように統一する |
| 再発防止 | UI と推論 API の間にアダプター関数を必ず挟み、null の意味（推論不能 / 未選択）を一箇所で定義する                                                                                                                   |

#### 苦戦箇所 2: NON_VISUAL 判定時の Phase 11 証跡取得方法

| 項目     | 内容                                                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | skill-wizard-redesign-lane は NON_VISUAL タスクとして分類されており、Phase 11 で「手動テスト・スクリーンショット」を省略できる。ただし何を証跡とするかが不明確になりやすい                    |
| 原因     | NON_VISUAL タスクの証跡基準が「console / mock / automation evidence」と定義されているが、具体的な取得手順がタスク仕様書に記載されていないケースがある                                         |
| 推奨対策 | Phase 11 では「テスト実行ログ（TC 番号 + PASS / FAIL）」「カバレッジレポートの数値」「typecheck PASS ログ」を最低限の証跡として保存する。スナップショットテストを追加すると回帰ガードも兼ねる |
| 再発防止 | NON_VISUAL タスクの仕様書テンプレートに「証跡取得方針」セクションを必ず含める（本仕様書 Phase 11 参照）                                                                                       |

#### 苦戦箇所 3: ページング状態管理（3問ずつ表示の state 設計）

| 項目     | 内容                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | 6問を 3+3 でページ分割する際、「現在ページ」と「回答データ」をどの state で管理するかが設計段階では不明確になりやすい                                                         |
| 原因     | ページング状態（どのページを表示するか）と回答データ（6問の回答内容）は直交する概念だが、実装段階で混同されるリスクがある                                                     |
| 推奨対策 | `currentPage: 1 \| 2` と `answers: ConversationAnswers` を独立した state として管理し、表示する質問スライスは `currentPage` から純粋に導出する。回答は常に6問分を保持し続ける |
| 再発防止 | ページング state と回答データ state を分離し、どちらも型付きで管理することを設計フェーズで明示する                                                                            |

### 補足事項

- 本タスクは skill-wizard-redesign-lane の Wave 1 タスク（W1-par-02b）であり、
  W0-seq-01（型定義）および W0-seq-02（`inferSmartDefaults` 公開）の完了を前提とする。
- Wave 1 の他タスク（W1-par-02a: `SkillInfoStep.tsx`、W1-par-02c: `CompleteStep.tsx`、
  W1-par-02d: `SkillLifecyclePanel.tsx`）とは並列実行可能。
- タスク分類は NON_VISUAL（Renderer 内部の計装のみ）であるため、
  Phase 11 は automation evidence を主証跡とする。
