# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 12                                   |
| Phase名    | ドキュメント更新                     |
| 前提Phase  | Phase 11: 手動テスト（VISUAL）       |
| 後続Phase  | Phase 13: PR作成                     |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

実装ガイドの作成・システム仕様の同期・変更履歴の記録・未タスクの検出・スキルフィードバックの記録を行い、
プロジェクトのナレッジベースを最新状態に保つ。

本 Phase は以下の 6 タスクで構成される。全タスクが完了して初めて Phase 13 へ進める。

| タスクID  | タスク名                 | 必須成果物                              |
| --------- | ------------------------ | --------------------------------------- |
| Task 12-1 | 実装ガイド作成           | `implementation-guide.md`               |
| Task 12-2 | システム仕様更新         | `system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント変更履歴作成 | `documentation-changelog.md`            |
| Task 12-4 | 未タスク検出             | `unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバック記録 | `skill-feedback-report.md`              |
| Task 12-6 | Phase 12 準拠チェック    | `phase12-task-spec-compliance-check.md` |

---

## Task 12-1: 実装ガイド作成

### 目的

`VisualCronPicker` および関連コンポーネント・ユーティリティの使い方を、
**Part 1（中学生向け）** と **Part 2（技術者向け）** の 2 部構成で説明する実装ガイドを作成する。

### Part 1: 中学生向け概念説明（日常の例え話）

**作成指針**:

- VisualCronPicker を「アラーム時計の設定パネル」に例える
- cron 式を「先生が毎週月曜の朝 9 時に出席を取る約束」のように説明する
- 「時計の針を合わせる感覚で、繰り返しのタイミングを決めるツール」として紹介する
- 技術用語（cron、cronExpression 等）は使わず、日常語で説明する

**含めるべき内容**:

1. VisualCronPicker とは何か（1 段落）
2. FrequencySelector の役割（「いつ？」を決める選択肢）
3. WeekdaySelector の役割（「何曜日？」を選ぶボタン群）
4. TimePickerSection の役割（「何時？」を合わせる時計）
5. CronPreview の役割（「どんなお約束をしたか見せてくれる窓）
6. AdvancedToggle の役割（「もっと細かく設定したい人向けのスイッチ」）

### Part 2: 技術者向けリファレンス

**作成指針**:

- TypeScript の型定義・Props API を完全に記載する
- `cronConverter.ts` の主要関数の使用例を記載する
- エッジケース（逆変換失敗時のフォールバック等）を明示する

**含めるべき内容**:

#### 型定義

```typescript
// VisualCronConfig: VisualCronPicker の内部状態型
type FrequencyType =
  | "every-minute"
  | "every-hour"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

interface VisualCronConfig {
  frequency: FrequencyType;
  hour: number;
  minute: number;
  weekdays: number[]; // 0=日, 1=月, ..., 6=土
  dayOfMonth: number; // 1-31, monthly 時のみ使用
  rawCronExpression?: string; // advanced mode 時のみ使用
}
```

#### Props API

```typescript
interface VisualCronPickerProps {
  value?: string; // cronExpression（例: "0 9 * * 1,3,5"）
  onChange: (cronExpression: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean; // デフォルト: true
  className?: string;
}
```

#### cronConverter 使用例

```typescript
import { cronToVisualConfig, visualConfigToCron } from "@/utils/cronConverter";

// VisualCronConfig → cronExpression
const cron = visualConfigToCron({
  frequency: "weekly",
  hour: 9,
  minute: 0,
  weekdays: [1, 3, 5],
  dayOfMonth: 1,
  rawCronExpression: "",
});
// => "0 9 * * 1,3,5"

// cronExpression → VisualCronConfig（逆変換）
const config = cronToVisualConfig("0 9 * * 1,3,5");
// => { frequency: 'weekly', hour: 9, minute: 0, weekdays: [1, 3, 5], ... }

// weekday range も復元可能
const configRange = cronToVisualConfig("0 8 * * 1-5");
// => { frequency: 'weekly', hour: 8, minute: 0, weekdays: [1, 2, 3, 4, 5], ... }

// 逆変換できない場合（custom フォールバック）
const config2 = cronToVisualConfig("*/5 * * * *");
// => { frequency: 'custom', rawCronExpression: '*/5 * * * *', ... }
```

#### 共通バリデーション

```typescript
import { validateSkillWizardScheduleConfig } from "@/utils/scheduleConfigValidator";

const validation = validateSkillWizardScheduleConfig({
  cronExpression,
  timezone,
});
```

- `cronExpression` は 5 フィールド構文のみを検証する
- `timezone` は `Intl.DateTimeFormat("en-US", { timeZone })` で妥当性を確認する
- issue #2000 の保存前エラー表示に使用する
- `ScheduleDialog` と `ConversationRoundStep` の両方で再利用する
- weekday range（例: `1-5`）は `cronParser` で `1,2,3,4,5` に展開される

#### エッジケース

| ケース                        | 挙動                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| 逆変換不可能な cron 式        | `frequency: 'custom'` でフォールバック。AdvancedToggle が自動 ON になる |
| weekdays が空配列で weekly    | バリデーションエラー。保存不可。エラーメッセージ表示                    |
| dayOfMonth が範囲外で monthly | バリデーションエラー。保存不可                                          |
| hour / minute が範囲外        | cronConverter が clamp 処理。コンソール警告を出力                       |
| `showAdvancedToggle=false`    | 高度な設定ボタンを表示しない                                            |
| `disabled=true`               | 編集 UI を無効化する                                                    |

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/implementation-guide.md`

---

## Task 12-2: システム仕様更新

### 目的

実装完了した VisualCronPicker の情報を、プロジェクトの正本ドキュメントに反映する。

### Step 1-A: UI/UX ガイドライン更新

**更新対象ファイル**: `docs/00-requirements/16-ui-ux-guidelines.md`

**追加セクション**: `スケジュール設定 UI` セクションを新規追加または既存セクションに追記

**追記内容**:

- VisualCronPicker の使用シーン・推奨配置
- FrequencySelector の選択肢一覧と表示ラベル
- WeekdaySelector の曜日順・初期状態
- TimePickerSection の入力形式（HH:MM / 24 時間制）
- エラー表示位置・メッセージトーン（ユーザーフレンドリー）
- AdvancedToggle の表示条件（showAdvancedToggle prop）

### Step 1-B: マスターシステム設計更新

**更新対象ファイル**: `docs/00-requirements/master_system_design.md`

**更新箇所**: スケジュール設定 UI 実装状況テーブル

**更新内容**:

| コンポーネント             | 実装状況 | 備考                                    |
| -------------------------- | -------- | --------------------------------------- |
| VisualCronPicker           | 実装済み | TASK-UI-SCHEDULE-VISUAL-PICKER-001      |
| FrequencySelector          | 実装済み | VisualCronPicker のサブコンポーネント   |
| WeekdaySelector            | 実装済み | VisualCronPicker のサブコンポーネント   |
| TimePickerSection          | 実装済み | VisualCronPicker のサブコンポーネント   |
| DayOfMonthSelector         | 実装済み | VisualCronPicker のサブコンポーネント   |
| CronPreview                | 実装済み | cronHumanizer と連携                    |
| cronConverter.ts           | 実装済み | visualConfigToCron / cronToVisualConfig |
| cronParser.ts              | 実装済み | VisualCronPicker の逆変換ユーティリティ |
| cronHumanizer.ts           | 実装済み | 人間可読テキスト生成                    |
| scheduleConfigValidator.ts | 実装済み | cronExpression / timezone の保存前検証  |

### Step 1-C: 関連 IPC ドキュメント確認

**確認対象**: TASK-9G の IPC チャンネル仕様書

**確認内容**: 新規 UI 追加により IPC 仕様に変更がないことを確認し、変更なし/変更ありを記録する。

### Step 2: 更新内容の記録

更新内容・判断根拠・残存課題を `system-spec-update-summary.md` に記録する。コミット操作はこの Phase のスコープ外とする。

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/system-spec-update-summary.md`

---

## Task 12-3: ドキュメント変更履歴作成

### 目的

Phase 12 内での全ドキュメント変更を 1 ファイルに記録し、レビュー時の差分確認を容易にする。

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/documentation-changelog.md`

### 記録内容

```markdown
# ドキュメント変更履歴 - TASK-UI-SCHEDULE-VISUAL-PICKER-001

| 変更日時   | 変更ファイル                                 | 変更種別 | 変更概要                     | 担当      |
| ---------- | -------------------------------------------- | -------- | ---------------------------- | --------- |
| 2026-04-09 | implementation-guide.md                      | 新規作成 | Part1・Part2 実装ガイド      | Task 12-1 |
| 2026-04-09 | system-spec-update-summary.md                | 新規作成 | システム仕様更新の要約       | Task 12-2 |
| 2026-04-09 | docs/00-requirements/16-ui-ux-guidelines.md  | 更新     | スケジュールUIセクション追記 | Task 12-2 |
| 2026-04-09 | docs/00-requirements/master_system_design.md | 更新     | 実装状況テーブル更新         | Task 12-2 |
| 2026-04-09 | 16-ui-ux-guidelines.md                       | 更新     | スケジュールUIセクション追記 | Task 12-2 |
| 2026-04-09 | master_system_design.md                      | 更新     | 実装状況テーブル更新         | Task 12-2 |
| 2026-04-09 | documentation-changelog.md                   | 新規作成 | 変更履歴記録                 | Task 12-3 |
| 2026-04-09 | unassigned-task-detection.md                 | 新規作成 | 未タスク検出結果             | Task 12-4 |
| 2026-04-09 | skill-feedback-report.md                     | 新規作成 | スキルフィードバック         | Task 12-5 |
| 2026-04-09 | phase12-task-spec-compliance-check.md        | 新規作成 | Phase 12 準拠チェック        | Task 12-6 |
```

---

## Task 12-4: 未タスク検出

### 目的

実装・手動テスト・ドキュメント更新の過程で発見された「未対応の課題・改善点・技術的負債」を検出し記録する。
**0 件の場合でも必ずファイルを作成すること。**

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/unassigned-task-detection.md`

### 記録フォーマット

```markdown
# 未タスク検出レポート - TASK-UI-SCHEDULE-VISUAL-PICKER-001

検出日時: YYYY-MM-DD
検出 Phase: Phase 12 (Task 12-4)

## 検出結果サマリー

| 重篤度   | 件数 |
| -------- | ---- |
| CRITICAL | 0    |
| HIGH     | 0    |
| MEDIUM   | 0    |
| LOW      | 0    |
| 合計     | 0    |

## 検出された未タスク一覧

（0 件の場合は「未タスクは検出されませんでした。」と記載する）

## 次のアクション

未タスクが 0 件のため、Phase 13 へ進む。
```

### HIGH/CRITICAL 件数が 1 件以上の場合

`docs/30-workflows/unassigned-task/` 配下にタスク仕様書を個別作成し、
本ファイルの「検出された未タスク一覧」にファイルパスを記載する。

---

## Task 12-5: スキルフィードバック記録

### 目的

本タスクを通じて得られた Claude Code スキル・ワークフロー・設計パターンへのフィードバックを記録する。
**0 件の場合でも必ずファイルを作成すること。**

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/skill-feedback-report.md`

### 記録フォーマット

```markdown
# スキルフィードバックレポート - TASK-UI-SCHEDULE-VISUAL-PICKER-001

作成日時: YYYY-MM-DD
対象 Phase: Phase 1-12

## フィードバックサマリー

| カテゴリ             | 件数 |
| -------------------- | ---- |
| スキル改善提案       | 0    |
| ワークフロー改善提案 | 0    |
| 設計パターン候補     | 0    |
| 合計                 | 0    |

## フィードバック一覧

（0 件の場合は「フィードバックは記録されませんでした。」と記載する）

## まとめ

（本タスクを通じた学習・改善点の総括）
```

---

## Task 12-6: Phase 12 準拠チェック

### 目的

Task 12-1 から Task 12-5 までの出力が、`task-specification-creator` skill のフォーマットと issue #2000 / easy cron input の両要件に整合しているかを確認する。

### 成果物

`docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/phase12-task-spec-compliance-check.md`

### 記録フォーマット

```markdown
# Phase 12 準拠チェック - TASK-UI-SCHEDULE-VISUAL-PICKER-001

| 確認項目                                       | 結果      | 備考 |
| ---------------------------------------------- | --------- | ---- |
| Task 12-1 の成果物が仕様に一致する             | PASS/FAIL |      |
| Task 12-2 の成果物が仕様に一致する             | PASS/FAIL |      |
| Task 12-3 の成果物が仕様に一致する             | PASS/FAIL |      |
| Task 12-4 の成果物が仕様に一致する             | PASS/FAIL |      |
| Task 12-5 の成果物が仕様に一致する             | PASS/FAIL |      |
| issue #2000 の validation 要件が反映されている | PASS/FAIL |      |
| easy cron input の UX 要件が反映されている     | PASS/FAIL |      |
```

---

## 統合テスト連携

Phase 10（統合テスト）・Phase 11（手動テスト）の結果を参照し、
ドキュメント内の「既知の制限事項」セクションに反映すること。

特に以下を確認する:

- cron の意味論的解析は行わず、5 フィールド syntax-only で検証する制限事項
- Electron レンダラープロセスでの動作制限

## 多角的チェック観点

- **正確性**: 実装コードと実装ガイドの型定義・関数シグネチャが一致しているか
- **完全性**: 全 6 サブコンポーネント・全 4 ユーティリティが実装ガイドに記載されているか
- **一貫性**: 既存ドキュメント（TASK-9G 系）との用語・命名が統一されているか
- **追跡性**: 変更履歴から「どの Phase で何を変更したか」が追跡できるか
- **ゼロ件許容**: Task 12-4・12-5 は 0 件でもファイルが存在するか

## 成果物テーブル

| 成果物ファイル名                                       | 説明                           | 対応タスク | 必須 |
| ------------------------------------------------------ | ------------------------------ | ---------- | ---- |
| `implementation-guide.md`                              | Part1・Part2 実装ガイド        | Task 12-1  | 必須 |
| `system-spec-update-summary.md`                        | システム仕様更新の要約         | Task 12-2  | 必須 |
| `docs/00-requirements/16-ui-ux-guidelines.md`（更新）  | スケジュールUIセクション追記   | Task 12-2  | 必須 |
| `docs/00-requirements/master_system_design.md`（更新） | 実装状況テーブル更新           | Task 12-2  | 必須 |
| `documentation-changelog.md`                           | 全 Step 変更履歴               | Task 12-3  | 必須 |
| `unassigned-task-detection.md`                         | 未タスク検出結果（0 件可）     | Task 12-4  | 必須 |
| `skill-feedback-report.md`                             | スキルフィードバック（0 件可） | Task 12-5  | 必須 |
| `phase12-task-spec-compliance-check.md`                | Phase 12 準拠チェック          | Task 12-6  | 必須 |

## 完了条件チェックリスト

- [ ] Task 12-1: `implementation-guide.md` が作成されている（Part 1・Part 2 両方含む）
- [ ] Task 12-2: `16-ui-ux-guidelines.md` にスケジュールUIセクションが追記されている
- [ ] Task 12-2: `master_system_design.md` の実装状況テーブルが更新されている
- [ ] Task 12-2: `system-spec-update-summary.md` が作成されている
- [ ] Task 12-3: `documentation-changelog.md` が作成されている
- [ ] Task 12-4: `unassigned-task-detection.md` が作成されている（0 件でも可）
- [ ] Task 12-5: `skill-feedback-report.md` が作成されている（0 件でも可）
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` が作成されている
- [ ] 全成果物が `artifacts.json` の `phase.12.artifacts` に記録されている

## 次の Phase へのリンク

完了後は [Phase 13: PR作成](./phase-13-pr-creation.md) へ進む。
