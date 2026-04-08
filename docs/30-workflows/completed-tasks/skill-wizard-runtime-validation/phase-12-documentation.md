# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| Phase名    | ドキュメント更新                |
| 前提Phase  | Phase 11                        |
| 後続Phase  | Phase 13                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

実装ガイド・システム仕様更新・未タスク検出・スキルフィードバックを完了する。
本Phaseは6タスク全て完了必須であり、未完了のタスクがある場合は Phase 13 へ進まないこと。

## 実行タスク

- Task 12-1: 実装ガイド作成（中学生レベル + 技術者レベルの2パート構成）
- Task 12-2: システム仕様書更新（task-workflow / topic-map / LOGS / skill reference 同期）
- Task 12-3: ドキュメント更新履歴作成（更新内容と成果物の記録）
- Task 12-4: 未タスク検出（0件でも結果を出力）
- Task 12-5: スキルフィードバックレポート作成（教訓と改善点を記録）
- Task 12-6: Phase12仕様準拠チェック（全6タスク完了確認）

---

### Phase 12 必須6タスク（全て完了必須）

---

### Task 12-1: 実装ガイド作成

**目的**: 本タスクで実装したバリデーション機能の理解を促進するガイドを2パート構成で作成する

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの説明

日常生活の例え話を用いて、以下を説明する。

**「バリデーションとは何か」の例え話**:

- たとえば、図書館で本を借りるときに「学生証を見せてください」と確認するのと同じ
- フォームに入力した内容が「正しいかどうかチェックする仕組み」
- 間違いを早めに教えてくれることで、後から困らないようにする

**「なぜバリデーションが必要か」の例え話**:

- スキル名を入力せずに登録しようとすると、後でスキルを見つけられなくなる
- 目的を短く書きすぎると、他の人が「このスキルは何のためのもの？」と困る
- 入力ミスを入力直後に教えてくれるので、最初からやり直す必要がない

#### Part 2: 技術者レベルの説明

以下を網羅した技術ドキュメントを記載する。

**インターフェース型定義**:

```typescript
import type { SkillInfoFormData } from "./skillCreator";

// フィールド単位バリデーション結果の型（専用名）
export interface SkillInfoFieldValidationResult {
  valid: boolean;
  error?: string; // エラー時のみ日本語メッセージ
}

// フォーム全体の入力境界（category は対象外）
export type SkillInfoValidationInput = Pick<
  SkillInfoFormData,
  "skillName" | "purpose"
>;

// フォーム全体の戻り値
export interface SkillInfoFormValidationResult {
  skillName?: string;
  purpose?: string;
  isValid: boolean;
}

export const SKILL_INFO_VALIDATION_LIMITS = {
  skillName: {
    maxLength: 100,
  },
  purpose: {
    minLength: 10,
    maxLength: 500,
  },
} as const;

export const SKILL_INFO_VALIDATION_MESSAGES = {
  skillName: {
    required: "スキル名を入力してください",
    maxLength: "スキル名は100文字以内で入力してください",
  },
  purpose: {
    minLength: "目的は10文字以上で入力してください",
    maxLength: "目的は500文字以内で入力してください",
  },
} as const;
```

**関数シグネチャ**:

```typescript
// skillName バリデーション（undefined / null は valid）
function validateSkillName(
  skillName: string | undefined | null,
): SkillInfoFieldValidationResult;

// purpose バリデーション
function validatePurpose(purpose: string): SkillInfoFieldValidationResult;

// フォーム全体バリデーション
function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult;
```

**使用例**:

```typescript
const result = validateSkillName("   ");
// => { valid: false, error: "スキル名を入力してください" }

const result2 = validatePurpose("短い");
// => { valid: false, error: "目的は10文字以上で入力してください" }

const formResult = validateSkillInfoForm({
  skillName: "スキルA",
  purpose: "十分な長さの目的です",
});
// => { skillName: undefined, purpose: undefined, isValid: true }
// category は SkillInfoValidationInput で対象外
```

**エラーハンドリング**:

- `SkillInfoFieldValidationResult.valid === false` のとき `error` フィールドにメッセージが格納される
- `SkillInfoFormValidationResult.isValid === false` のとき、失敗したフィールドのメッセージが `skillName` / `purpose` に格納される
- 呼び出し元は `valid` フラグで分岐し、`error` をUIに表示する

---

### Task 12-2: システム仕様書更新

**目的**: 本タスクの実装完了をシステム仕様書に反映する

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: タスク完了記録

以下のドキュメントを更新する（追記）。

- `task-workflow.md`: タスク `UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001` の進行状態を追記
- `task-workflow-completed.md`: タスク `UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001` の完了エントリを追記
- `task-workflow-backlog.md`: 未完了の follow-up がある場合のみ追記し、0件なら no-op を記録
- `LOGS.md`（該当する2箇所）: 実装完了ログを追記
- `SKILL.md` history（該当する2箇所）: 仕様更新履歴を追記
- `topic-map.md`: `skillInfoFormValidation` トピックを追記
- `artifacts.json` / `outputs/artifacts.json`: phase artifact / status parity を同期

#### Step 1-B: 実装状況テーブル更新

該当タスクの実装状況を以下の通り更新する。

| 変更前         | 変更後      |
| -------------- | ----------- |
| `spec_created` | `completed` |

#### Step 1-C: 関連タスクテーブル更新

関連タスク（Issue #1999）の状態を完了として更新する。

#### Step 1-D: index 再生成

仕様見出し・行番号・参照導線に変更がある場合、index 再生成を実施する。

#### Step 1-E: 未タスク登録

未タスク候補を検出し、0件でも `unassigned-task-detection.md` に結果を出力する。1件以上の場合は unassigned task を formalize する。

#### Step 1-F: 補助更新

必要に応じて lessons learned、cross-skill spec、workflow summary を同期する。

#### Step 1-G: 検証

以下の検証コマンドを実行し、結果を `system-spec-update-summary.md` / `documentation-changelog.md` に転記する。

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-wizard-runtime-validation
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-wizard-runtime-validation --json
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-wizard-runtime-validation
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

#### Step 2: domain spec sync（条件付き）

Step 1 完了後に、interface / API / architecture / state / security / UI contract の外部公開面が変わったかを判定する。

- 変更あり: aiworkflow-requirements 正本を更新する
- 変更なし: `Step 2 更新なし（理由付き）` として記録する。root `packages/shared/index.ts` は `./types` 再エクスポート経由で追随するため、今回の direct update は `packages/shared/src/types/index.ts` を基準に判断する

更新が必要な場合は、追加された以下の公開要素をシステム仕様書に反映する。

| 追加項目                              | 種別     | 配置先ファイル                                         |
| ------------------------------------- | -------- | ------------------------------------------------------ |
| `SkillInfoFieldValidationResult` 型   | 型定義   | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `SkillInfoValidationInput` 型         | 型定義   | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `SkillInfoFormValidationResult` 型    | 型定義   | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `SKILL_INFO_VALIDATION_LIMITS` 定数   | 定数     | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `SKILL_INFO_VALIDATION_MESSAGES` 定数 | 定数     | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `validateSkillName` 関数              | 純粋関数 | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `validatePurpose` 関数                | 純粋関数 | `packages/shared/src/types/skillInfoFormValidation.ts` |
| `validateSkillInfoForm` 関数          | 純粋関数 | `packages/shared/src/types/skillInfoFormValidation.ts` |
| 公開エクスポート更新                  | barrel   | `packages/shared/src/types/index.ts`                   |

> Step 2 は「条件付き必須」。判断結果（更新あり / なし）を必ず記録する。

---

### Task 12-3: ドキュメント更新履歴作成

**目的**: Step 1-A〜1-G および Step 2 の各実施結果を個別に記録する

**出力先**: `outputs/phase-12/documentation-changelog.md`

**記録フォーマット**:

```markdown
## ドキュメント更新履歴

| Step     | 対象ファイル               | 更新内容                                      | 実施日     | 結果 |
| -------- | -------------------------- | --------------------------------------------- | ---------- | ---- |
| Step 1-A | task-workflow.md           | 進行状態追記                                  | 2026-04-08 |      |
| Step 1-A | task-workflow-completed.md | タスク完了エントリ追記                        | 2026-04-08 |      |
| Step 1-A | task-workflow-backlog.md   | follow-up がある場合のみ追記（0件なら no-op） | 2026-04-08 |      |
| Step 1-A | LOGS.md（1箇所目）         | 実装完了ログ追記                              | 2026-04-08 |      |
| Step 1-A | LOGS.md（2箇所目）         | 実装完了ログ追記                              | 2026-04-08 |      |
| Step 1-A | SKILL.md（1箇所目）        | 仕様更新履歴追記                              | 2026-04-08 |      |
| Step 1-A | SKILL.md（2箇所目）        | 仕様更新履歴追記                              | 2026-04-08 |      |
| Step 1-A | topic-map.md               | skillInfoFormValidation トピック追記          | 2026-04-08 |      |
| Step 1-A | artifacts.json             | phase artifact / status 同期                  | 2026-04-08 |      |
| Step 1-A | outputs/artifacts.json     | phase artifact / status 同期                  | 2026-04-08 |      |
| Step 1-B | 実装状況テーブル           | spec_created → completed                      | 2026-04-08 |      |
| Step 1-C | 関連タスクテーブル         | Issue #1999 完了状態に更新                    | 2026-04-08 |      |
| Step 1-D | index.md                   | topic-map / keywords / quick ref 同期         | 2026-04-08 |      |
| Step 1-E | 未タスク検出               | 0件でも検出レポート出力                       | 2026-04-08 |      |
| Step 1-F | 補助更新                   | lessons / summary の必要差分同期              | 2026-04-08 |      |
| Step 1-G | 検証                       | validator 実行結果を記録                      | 2026-04-08 |      |
| Step 2   | システム仕様書             | 条件判定結果に応じて更新/更新なし記録         | 2026-04-08 |      |
```

current / baseline の差分がある項目は、`documentation-changelog.md` で必ず区別して記録する。

---

### Task 12-4: 未タスク検出レポート作成

**目的**: 本タスクのスコープ外として除外した項目を確認し、未割り当てタスクを検出・記録する
（0件の場合でも出力必須）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**確認観点**:

| 確認項目                                         | スコープ内/外 | 備考                      |
| ------------------------------------------------ | ------------- | ------------------------- |
| UIコンポーネントへのバリデーション統合           | スコープ外    | 後続 Wave（UI変更）で対応 |
| IPCハンドラでのサーバーサイドバリデーション統合  | スコープ外    | 本タスクのスコープ外      |
| `SkillInfoFormData` 型定義の変更                 | スコープ外    | 既存型を変更しない方針    |
| フォームコンポーネントへのバリデーション表示統合 | スコープ外    | 後続 Wave で対応          |

**記録フォーマット**:

```markdown
## 未タスク検出結果

検出件数: N件（スコープ外として除外）

| No. | タスク内容 | 除外理由 | 推奨対応 |
| --- | ---------- | -------- | -------- |
```

---

### Task 12-5: スキルフィードバックレポート作成

**目的**: 本タスクの実施を通じて得た改善提案・学びをスキルフィードバックとして記録する
（改善点なしの場合でも出力必須）

**出力先**: `outputs/phase-12/skill-feedback-report.md`

**記録フォーマット**:

```markdown
## スキルフィードバックレポート

### 実施タスク概要

- タスクID: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001
- 実施日: 2026-04-08
- 対象機能: skill-wizard-runtime-validation

### フィードバック一覧

| No. | カテゴリ | 内容               | 優先度 |
| --- | -------- | ------------------ | ------ |
| -   | -        | フィードバックなし | -      |

### 総評
```

---

### Task 12-6: `phase12-task-spec-compliance-check.md` 作成（root evidence）

**目的**: Phase 12 の全6タスクが仕様書通りに完了していることを証明する root evidence を作成する

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**記録内容**:

- Task 12-1〜12-6 それぞれの完了確認チェックリスト
- 各タスクの成果物ファイルパスと生成確認
- Phase 12 全体の完了判定（PASS/FAIL）

---

## 参照資料

| 資料名                     | パス                                                   | 説明                       |
| -------------------------- | ------------------------------------------------------ | -------------------------- |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`               | Phase 11 の確認結果        |
| 発見事項リスト             | `outputs/phase-11/discovered-issues.md`                | 改善提案の取り込み元       |
| バリデーション実装ファイル | `packages/shared/src/types/skillInfoFormValidation.ts` | ドキュメント化対象コード   |
| 公開エクスポート           | `packages/shared/src/types/index.ts`                   | 公開APIの同期確認          |
| 受入基準                   | `outputs/phase-1/acceptance-criteria.md`               | AC-1〜AC-5 の定義元        |
| 設計決定書                 | `outputs/phase-2/design-decisions.md`                  | インターフェース設計の根拠 |
| P50チェック結果            | `outputs/phase-1/p50-check-result.md`                  | Phase 1 成果物             |
| スコープ定義書             | `outputs/phase-1/scope-definition.md`                  | Phase 1 成果物             |
| バリデーションI/F設計      | `outputs/phase-2/validation-interface.md`              | Phase 2 成果物             |
| エラーメッセージ設計       | `outputs/phase-2/error-messages.md`                    | Phase 2 成果物             |
| 実装結果記録               | `outputs/phase-5/implementation-result.md`             | Phase 5 成果物             |
| Green確認記録              | `outputs/phase-5/green-confirmation.md`                | Phase 5 成果物             |
| リファクタリング結果       | `outputs/phase-8/refactoring-result.md`                | Phase 8 成果物             |
| 品質チェック結果           | `outputs/phase-9/quality-check-result.md`              | Phase 9 成果物             |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`              | Phase 10 成果物            |
| AC検証ドキュメント         | `outputs/phase-10/ac-verification.md`                  | Phase 10 成果物            |

---

## 成果物

| 成果物                        | 配置先                                                   | 形式     |
| ----------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                    | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様書更新サマリ      | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴          | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| Phase12タスク仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件（全6タスクの完了チェックリスト）

- [ ] Task 12-1: 実装ガイド（2パート構成）が `outputs/phase-12/implementation-guide.md` に生成されていること
- [ ] Task 12-2: システム仕様書の Step 1-A〜1-G と Step 2 判定結果が `outputs/phase-12/system-spec-update-summary.md` に記録されていること
- [ ] Task 12-3: ドキュメント更新履歴が `outputs/phase-12/documentation-changelog.md` に生成されていること
- [ ] Task 12-4: 未タスク検出レポートが `outputs/phase-12/unassigned-task-detection.md` に生成されていること（0件でも出力）
- [ ] Task 12-5: スキルフィードバックレポートが `outputs/phase-12/skill-feedback-report.md` に生成されていること（改善点なしでも出力）
- [ ] Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 12-1〜12-6）を100%実行完了
- [ ] 各タスクの成果物ファイルが全て生成されていることを確認
- [ ] `phase12-task-spec-compliance-check.md` で全タスク完了を証明

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-13-pr-creation.md`
