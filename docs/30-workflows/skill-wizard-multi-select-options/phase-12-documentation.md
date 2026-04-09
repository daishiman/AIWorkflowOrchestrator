# Phase 12: ドキュメント更新 - スキルウィザード複数選択対応

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 12                                                    |
| タスクID   | skill-wizard-multi-select-options                     |
| 機能名     | ConversationRoundStep 複数選択（selectedOptions）対応 |
| 前提Phase  | Phase 11（手動テスト）                                |
| 後続Phase  | Phase 13（PR 作成）                                   |
| 作成日     | 2026-04-08                                            |
| ステータス | pending                                               |

## 目的

`task-specification-creator` / `aiworkflow-requirements` の正本に照らして、Phase 12 canonical 6成果物を揃え、ドキュメントとシステム仕様を最新状態に維持する。

## 実行オーケストレーション

| SubAgent | 主担当                                            | 並列条件              |
| -------- | ------------------------------------------------- | --------------------- |
| A        | Task 12-1 `implementation-guide.md` Part 1 草案   | B と並列可            |
| B        | Task 12-1 `implementation-guide.md` Part 2 草案   | A と並列可            |
| C        | Task 12-2 `system-spec-update-summary.md`         | Part 2 確定後に並列可 |
| D        | Task 12-3 `documentation-changelog.md`            | C と並列可            |
| E        | Task 12-4 `unassigned-task-detection.md`          | D と並列可            |
| F        | Task 12-5 `skill-feedback-report.md`              | E と並列可            |
| G        | Task 12-6 `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行  |

---

## 必須6タスク

### Task 12-1: 実装ガイド作成

Part 1（中学生向け）と Part 2（技術者向け）の2部構成で作成する。

#### Part 1: 中学生向け説明

**スキルウィザードの複数選択対応とは何か？**

たとえば、スマートフォンのアンケートアプリを思い浮かべてください。今まで「好きな食べ物は何ですか？」という質問に対して、1つしか選べなかったとします。でも実際には「ラーメンもカレーも好き！」という人がたくさんいますよね？

今回の変更は、スキル作成ウィザードの質問（Q1〜Q6）に対する回答を「1つしか選べない」から「複数選べる」に変更する作業です。

**例え話：チェックボックスとラジオボタン**

- 変更前（ラジオボタン）：「好きな食べ物は1つだけ選んでください」→ ラーメン◎ / カレー○ / 寿司○
- 変更後（チェックボックス）：「好きな食べ物を全部選んでください」→ ラーメン✓ / カレー✓ / 寿司○

ボタンを押すたびに「選ばれる↔選ばれない」がトグル（切り替え）される仕組みです。

**何が変わったか（プログラムの言葉で）：**

- 変更前：`selectedOption: "ラーメン"` → 1つの文字列で保存
- 変更後：`selectedOptions: ["ラーメン", "カレー"]` → リスト（配列）で保存

選んでいないときは、変更前は「`null`（何もない）」、変更後は「`[]`（空っぽのリスト）」で表します。

**専門用語の説明：**

- **配列（array）**：複数の値を順番に並べたリスト。`["A", "B", "C"]` のような形
- **トグル（toggle）**：ボタンを押すたびにオン/オフが切り替わる操作
- **null**：「値がない」を表す特別な記号。配列に変えることで「空リスト = 未選択」と明確に表現できる
- **型定義（type definition）**：プログラムが扱うデータの「形」を決めるルール
- **SmartDefault**：AIが「たぶんこれが良いですよ」と推測して初期値を入れてくれる機能

---

#### Part 2: 技術者向け説明

**変更概要：**

`QuestionAnswer.selectedOption: string | null` を廃止し `selectedOptions: string[]` に完全置換した。
`SmartDefaultResult`（`string | null` × 6）は変更せず、UI層の `createQuestionAnswer()` で `string → [string]` 変換を吸収する。

**Current contract / Target delta:**

| 区分             | 内容                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| Current contract | `QuestionAnswer.selectedOption: string                                                                                | null`、`SmartDefaultResult`は`string | null` × 6 のまま、ApplySummaryCard は未回答問の SmartDefault 値のみを表示 |
| Target delta     | `selectedOption` を `selectedOptions: string[]` に置換し、トグル選択・Q3 展開・初期値・外部連携参照を UI 層で吸収する |

**変更ファイル一覧：**

| ファイル                                                                      | 変更種別         | 主な変更点                                                                                    |
| ----------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                   | 型変更           | `selectedOption: string \| null` → `selectedOptions: string[]`                                |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 動作変更         | `handleOptionSelect` トグル化・`isQuestionAnswered`・`createQuestionAnswer`・`renderQuestion` |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 判定変更         | `selectedOption === null` → `selectedOptions.length === 0`                                    |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 初期値・参照変更 | `DEFAULT_ANSWERS` / `resolveExternalIntegration`                                              |

**型変更（T-01）の詳細：**

```typescript
// 変更前
export interface QuestionAnswer {
  selectedOption: string | null; // 廃止
  freeText: string;
  scheduleConfig?: SkillWizardScheduleConfig;
}

// 変更後
export interface QuestionAnswer {
  selectedOptions: string[]; // 追加（空配列 = 未選択）
  freeText: string;
  scheduleConfig?: SkillWizardScheduleConfig;
}
```

**SmartDefaultResult の変換ポイント（`createQuestionAnswer`）：**

```typescript
// SmartDefaultResult の string → selectedOptions[] への変換
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) return { selectedOptions: [], freeText: "" };
  if (options.includes(defaultValue as QuestionOption)) {
    return { selectedOptions: [defaultValue], freeText: "" }; // string → [string]
  }
  return { selectedOptions: [], freeText: defaultValue };
}
```

**トグルロジック（`handleOptionSelect`）：**

```typescript
const current = prev[key].selectedOptions;
const isSelected = current.includes(option);
const nextSelectedOptions = isSelected
  ? current.filter((o) => o !== option) // 選択解除
  : [...current, option]; // 選択追加
```

**Q3 定期実行の複数選択対応（状態遷移）：**

| 操作                                | selectedOptions の変化                    | scheduleConfig の変化                 | ScheduleConfigInput |
| ----------------------------------- | ----------------------------------------- | ------------------------------------- | ------------------- |
| 「定期実行」クリック（未選択→選択） | `[] → ["定期実行"]`                       | `undefined → DEFAULT_SCHEDULE_CONFIG` | 展開                |
| 「手動実行」も追加                  | `["定期実行"] → ["定期実行", "手動実行"]` | 変化なし                              | 展開維持            |
| 「定期実行」クリック（選択→解除）   | `["定期実行", "手動実行"] → ["手動実行"]` | `DEFAULT_SCHEDULE_CONFIG → undefined` | 閉じる              |

**展開判定式**: `selectedOptions.includes("定期実行")`

**`resolveExternalIntegration` の先頭値参照方針：**

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

**設計根拠**: `resolveExternalIntegration` は「外部連携の有無と対象ツール」を1値で判断する関数。Q5の選択肢（なし/Slack/GitHub/その他）の性質上、先頭値参照で実用上問題なし。

**アクセシビリティ（WCAG 2.1 AA）：**

```html
<!-- 各ボタンが独立した押下状態を持つ（トグルボタン群） -->
<button aria-pressed="{selectedOptions.includes(opt)}">...</button>
```

**エッジケース：**

- `handleCronChange` / `handleTimezoneChange` 内で `selectedOptions` に「定期実行」が含まれない場合は自動追加するフォールバックを実装
- `resolveExternalIntegration` は `selectedOptions[0]` の先頭参照を採用（M-01 MINOR 指摘対処済み）
- 永続化データとの互換性：`QuestionAnswer` はインメモリ state に閉じており IPC 型・永続化スキーマには含まれないため、移行の問題なし

**設定可能なパラメータ / 定数一覧:**

| 項目                      | 内容                                         |
| ------------------------- | -------------------------------------------- |
| `DEFAULT_SCHEDULE_CONFIG` | Q3 の定期実行を初回展開する既定値            |
| `selectedOptions: []`     | 未選択時の初期値                             |
| `aria-pressed`            | ボタンの選択状態を表す `true` / `false` 属性 |

---

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・LOGS.md 更新

以下の2ファイルの LOGS.md に本タスクの完了記録を追加する。

**対象 LOGS.md（2ファイル）:**

1. `.claude/skills/aiworkflow-requirements/LOGS.md`
   - 追加内容: `2026-04-08 - skill-wizard-multi-select-options Phase 12 close-out sync（QuestionAnswer.selectedOption → selectedOptions 型移行 / ConversationRoundStep トグル選択実装 / ApplySummaryCard 未回答判定対応 / SkillCreateWizard DEFAULT_ANSWERS・resolveExternalIntegration 更新 / LOGS.md 2ファイル更新 / index.md・artifacts.json・outputs/artifacts.json 同期）`

2. `.claude/skills/task-specification-creator/LOGS.md`
   - 追加内容: `2026-04-08 - skill-wizard-multi-select-options Phase 12 close-out sync（Phase 12 canonical 6成果物 PASS / implementation-guide Part1/Part2 完成 / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check 作成）`

**SKILL.md 変更履歴の更新:**

`.claude/skills/aiworkflow-requirements/SKILL.md` の `## 変更履歴` セクションに以下を追加する。

```markdown
## 変更履歴

### 2026-04-08: skill-wizard-multi-select-options Phase 12 完了

- `QuestionAnswer.selectedOption: string | null` → `selectedOptions: string[]` 型移行を記録
- 変更ファイル: skillCreator.ts / ConversationRoundStep.tsx / ApplySummaryCard.tsx / SkillCreateWizard.tsx
- SmartDefaultResult は `string | null` × 6 を維持（設計決定）
- `artifacts.json` / `outputs/artifacts.json` の parity を same-wave で維持
```

#### Step 1-B: topic-map.md の再生成

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を再生成し、skill-wizard-multi-select-options タスクに関する以下のトピックが含まれていることを確認する。

- `QuestionAnswer.selectedOptions` 参照の UI/状態管理カテゴリへの追記
- `ConversationRoundStep` のトグル選択ロジックの参照更新

**実行コマンド:**

```bash
node /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: 新規 I/F 追加の仕様更新判定

本タスクの変更は既存の `QuestionAnswer` 型のフィールド置換（`selectedOption` → `selectedOptions`）であり、新規インターフェースの追加はない。

**判定**: Step 2 は no-op。`system-spec-update-summary.md` に「新規 I/F 追加なし（型フィールド置換のみ）」として記録する。

**追加の台帳同期**: `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4点同期結果を `system-spec-update-summary.md` と `documentation-changelog.md` の両方へ記録する。

---

### Task 12-3: ドキュメント更新履歴

`documentation-changelog.md` を作成し、以下の全 Step 結果を記録する。

**記録内容（最低限）:**

| 日付       | 対象ファイル                                                            | 変更種別   | 変更内容                                                  |
| ---------- | ----------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| 2026-04-08 | `packages/shared/src/types/skillCreator.ts`                             | 型変更     | `QuestionAnswer.selectedOption` → `selectedOptions`       |
| 2026-04-08 | `ConversationRoundStep.tsx`                                             | 動作変更   | トグル選択ロジック実装                                    |
| 2026-04-08 | `ApplySummaryCard.tsx`                                                  | 判定変更   | 未回答判定を `selectedOptions.length === 0` に更新        |
| 2026-04-08 | `SkillCreateWizard.tsx`                                                 | 初期値変更 | `DEFAULT_ANSWERS` / `resolveExternalIntegration` 更新     |
| 2026-04-08 | LOGS.md × 2                                                             | 記録追加   | Phase 12 完了ヘッドライン追加                             |
| 2026-04-08 | topic-map.md                                                            | 再生成     | generate-index.js 実行                                    |
| 2026-04-08 | `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` | 同期       | 4点同期と canonical 6成果物の parity 固定                 |
| 2026-04-08 | `phase12-task-spec-compliance-check.md`                                 | 準拠確認   | Task 12-1〜12-6 / Step 1-A〜1-G / Step 2 の root evidence |

---

### Task 12-4: 未タスク検出

プロジェクト全体で `skill-wizard-multi-select-options` に関連する未着手タスクを検出し、**0件でも** `unassigned-task-detection.md` を出力する。

**検出観点:**

- `selectedOption`（単数形）が残存している参照（テストファイル含む）
- ApplySummaryCard で選択値を別表示する UI 要素（`selectedOptions.join("、")`）は本タスク外
- `resolveExternalIntegration` の複数ツール並列対応（本タスクスコープ外・別タスクとして記録）

**期待出力（0件の場合の例）:**

```markdown
# 未タスク検出レポート

## 検出結果

未着手タスク: 0件

## 検出スコープ

- `selectedOption` 残存参照: 検索済み・0件
- `selectedOptions.join` 表示追加: 検索済み・0件（現行設計では ApplySummaryCard が SmartDefault 値表示のみのため、独立表示は未タスク化しない）
- resolveExternalIntegration 複数ツール対応: 別タスク（CONST_FUTURE-001）として記録

## 備考

M-01（resolveExternalIntegration 先頭値参照）の TODO コメント追加は Phase 5 実装時に対処済み。
```

---

### Task 12-5: スキルフィードバックレポート

実装・テスト・設計を通じて発見した改善点を記録する。**改善点が0件でも** `skill-feedback-report.md` を出力する。

**フィードバック記録観点:**

1. `task-specification-creator` スキルへのフィードバック
   - 型移行タスク（`selectedOption` → `selectedOptions`）のような「フィールド廃止」パターンに対応したチェックリスト追加の検討
   - Phase 4 開始時の「既存テスト `selectedOption` 参照洗い出し」を必須アクションとしてテンプレートに組み込む提案

2. `aiworkflow-requirements` スキルへのフィードバック
   - `QuestionAnswer` の型変更が IPC 型・永続化型に波及しないことを確認するクイックチェック項目を `resource-map.md` に追加する提案

3. 設計・実装へのフィードバック
   - SmartDefaultResult を変更しない設計判断（`createQuestionAnswer` での `string → [string]` 変換）は将来の類似タスクでも参照価値がある。`lessons-learned-current.md` への記録を推奨

**期待出力の形式:**

```markdown
# スキルフィードバックレポート

## task-specification-creator へのフィードバック

| ID         | 提案内容                                                  | 優先度 |
| ---------- | --------------------------------------------------------- | ------ |
| FB-MSO-001 | 「フィールド廃止型変更」チェックリストの追加              | Low    |
| FB-MSO-002 | 既存テスト残存参照洗い出しを Phase 4 必須アクションに追加 | Medium |

## aiworkflow-requirements へのフィードバック

| ID         | 提案内容                                                       | 優先度 |
| ---------- | -------------------------------------------------------------- | ------ |
| FB-MSO-003 | IPC/永続化型への波及確認クイックチェックを resource-map に追加 | Low    |

## 教訓記録推奨

- SmartDefaultResult 不変設計（`createQuestionAnswer` 変換パターン）を lessons-learned-current.md v3.x.x に記録
```

---

### Task 12-6: phase12-task-spec-compliance-check

`Task 12-1〜12-5` の成果物と `Step 1-A〜1-G / Step 2` の記録を 1 ファイルへ集約し、Phase 12 の root evidence として PASS / FAIL を固定する。`artifacts.json` と `outputs/artifacts.json` の parity、`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4点同期、planned wording の残存なしを必須確認とする。

**期待出力の形式:**

```markdown
# Phase 12 コンプライアンスチェック

## 検証結果

| 項目      | 結果 | 補足                               |
| --------- | ---- | ---------------------------------- |
| Task 12-1 | PASS | implementation-guide 完成          |
| Task 12-2 | PASS | Step 1-A〜1-G / Step 2 記録済み    |
| Task 12-3 | PASS | changelog 作成済み                 |
| Task 12-4 | PASS | unassigned-task-detection 作成済み |
| Task 12-5 | PASS | skill-feedback-report 作成済み     |
| Task 12-6 | PASS | 本ファイル                         |

## 4点同期

- `index.md`
- `phase-*.md`
- `artifacts.json`
- `outputs/artifacts.json`

## 備考

- planned wording なし
- root evidence と outputs の内容一致
```

---

## 参照資料

| 資料名               | パス                                                                                    | 用途                       |
| -------------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| 要件定義             | `docs/30-workflows/skill-wizard-multi-select-options/phase-1-requirements.md`           | AC-01〜AC-13 確認          |
| 設計書               | `docs/30-workflows/skill-wizard-multi-select-options/phase-2-design.md`                 | 型・ロジック確認           |
| 設計レビュー         | `docs/30-workflows/skill-wizard-multi-select-options/phase-3-design-review.md`          | MINOR 指摘確認             |
| 実装ガイド要件       | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | Part 1 / Part 2 要件       |
| 技術ガイド           | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1 / Part 2 記述ルール |
| Phase 12 公式ガイド  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 12-1〜12-6 手順       |
| 更新手順             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 順序       |
| task-spec 正本       | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase 12 判定基準          |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | 更新対象基準               |
| resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                        | 先読みの正本               |
| topic-map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                           | インデックス更新           |
| LOGS.md (aiworkflow) | `.claude/skills/aiworkflow-requirements/LOGS.md`                                        | 完了記録追加               |
| LOGS.md (task-spec)  | `.claude/skills/task-specification-creator/LOGS.md`                                     | 完了記録追加               |

---

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成する（SubAgent A/B 並列可）
2. Task 12-2 Step 1-A: LOGS.md（2ファイル）に完了ヘッドラインを追加し、SKILL.md 変更履歴を更新する
3. Task 12-2 Step 1-B: `generate-index.js` を実行し `topic-map.md` を再生成する
4. Task 12-2 Step 2: 新規 I/F 追加なし（no-op）として `system-spec-update-summary.md` に記録する
5. Task 12-3: `documentation-changelog.md` を作成する
6. Task 12-4: `unassigned-task-detection.md` を作成する（0件でも必須）
7. Task 12-5: `skill-feedback-report.md` を作成する（改善点0件でも必須）
8. Task 12-6: `phase12-task-spec-compliance-check.md` を作成し、6成果物の parity を固定する

---

## 成果物

| 成果物                   | 出力先                                                                                                       | 説明                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 実装ガイド               | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成       |
| システム仕様更新サマリー | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/Step 2 記録 |
| 更新履歴                 | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴     |
| 未タスク検出             | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）  |
| スキルフィードバック     | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）    |
| 仕様準拠チェック         | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の root evidence  |

---

## Phase 12 実装ガイド要件（必須チェック）

- Part 1: 中学生向け説明・日常例え話・専門用語の即時説明を含む（必須）
- Part 2: TypeScript 型・変更前後のコード差分・エッジケース・状態遷移表を含む
- 未タスク検出レポートは 0件でも必ず出力する
- スキルフィードバックは改善点 0件でも必ず出力する
- `phase12-task-spec-compliance-check.md` は Task 12-1〜12-6 の root evidence として必ず出力する

---

## 完了条件

- [ ] 実行タスクで定義した成果物（6件）を全件作成
- [ ] Task 12-1 実装ガイドが Part 1/Part 2 で完成していること
- [ ] Task 12-2 LOGS.md（2ファイル）に完了記録が追加されていること
- [ ] Task 12-2 SKILL.md 変更履歴が更新されていること
- [ ] Task 12-2 topic-map.md が再生成されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0件でも）
- [ ] Task 12-6 仕様準拠チェックが作成されていること
- [ ] MINOR 指摘事項 M-01〜M-03（Phase 3）への対処が記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. 参照資料の確認（Phase 1-3・SKILL.md 正本）
2. Task 12-1: 実装ガイド作成（Part 1/Part 2）
3. Task 12-2: システム仕様更新（LOGS.md 2ファイル・SKILL.md・topic-map.md 再生成）
4. Task 12-3/12-4/12-5/12-6: changelog・未タスク・フィードバック・準拠チェック出力
5. 完了条件判定

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイル（6件）を全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

---

## 次のPhase

Phase 13: PR 作成
