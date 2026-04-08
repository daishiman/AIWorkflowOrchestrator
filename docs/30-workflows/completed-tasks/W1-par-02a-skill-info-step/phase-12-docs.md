# Phase 12: ドキュメント整備

## メタ情報

- Phase: 12
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、`SkillInfoStep` 実装の current facts をドキュメントへ同期する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件                        |
| -------- | --------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可                      |
| C        | `system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可                      |
| E        | `unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`              | E と並列可                      |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 実行タスク（必須 6 タスク）

- [ ] コンポーネントの JSDoc コメントを追加する
- [ ] Props の型定義にコメントを追加する
- [ ] README またはコンポーネント一覧を更新する
- [ ] 削除したファイル・型に関する変更履歴を記録する
- [ ] 共有型の参照方針を明示する
- [ ] Phase 12 タスク仕様準拠チェックを作成する（`phase12-task-spec-compliance-check.md` で task-specification-creator / aiworkflow-requirements への準拠を確認する）

## 参照資料

| 資料名           | パス                                                                  | 説明                 |
| ---------------- | --------------------------------------------------------------------- | -------------------- |
| 実装ファイル     | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | ドキュメント追加対象 |
| 共有型定義       | `packages/shared/src/types/skillCreator.ts`                           | 参照元の正本         |
| ウィザード構成   | `apps/desktop/src/renderer/components/skill/wizard/`                  | 全体ドキュメント     |
| task-spec 正本   | `.claude/skills/task-specification-creator/SKILL.md`                  | Phase 12 判定基準    |
| system spec 正本 | `.claude/skills/aiworkflow-requirements/SKILL.md`                     | 更新対象基準         |

## 実行手順

### Step 1: JSDoc コメントの追加

`SkillInfoStep.tsx` にコンポーネント説明の JSDoc を追加する。その際、カテゴリ選択は `SkillCategory` の union 値を常に保持し、一度選んだら `null` に戻らない単一選択であることを明文化する。

```typescript
/**
 * スキルウィザード Step 0 — スキルの基本情報を入力するフォームコンポーネント。
 *
 * - スキル名（任意）、目的・背景（必須・10文字以上）、カテゴリタグ（必須・5種の単一選択）を入力する。
 * - カテゴリは `SkillCategory` の 5 値のいずれかを常に保持し、`null` に戻らない。
 * - カテゴリに `external-integration` を選択した場合、Step 1 の Q5 が必須になる。
 * - 「次へ」ボタンは目的が 10 文字以上入力され、カテゴリが選択済みのときに活性化する。
 *
 * @example
 * <SkillInfoStep
 *   formData={formData}
 *   onFormDataChange={setFormData}
 *   onNext={handleNext}
 * />
 */
export function SkillInfoStep({ ... }: SkillInfoStepProps) { ... }
```

### Props 型定義のコメント追加

`SkillInfoStepProps` の各フィールドに、役割が分かる短いコメントを付与する。

```typescript
interface SkillInfoStepProps {
  /** スキル名・目的・カテゴリをまとめたフォーム全体の入力値。 */
  formData: SkillInfoFormData;
  /** フォーム変更時に親へ全体値を通知する。 */
  onFormDataChange: (data: SkillInfoFormData) => void;
  /** Step 1 へ進む。 */
  onNext: () => void;
}
```

### Step 2: 共有型の参照方針を明示する

`SkillInfoFormData` と `SkillCategory` は `packages/shared/src/types/skillCreator.ts` に定義された正本をそのまま参照する。

```typescript
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";
```

### Step 3: ウィザードコンポーネント一覧の更新方針を記録する

`wizard/index.ts` の exports を current facts に合わせて同期する。

- `SkillInfoStep` を export する
- `DescribeStep` は export しない（`DescribeStep.tsx` / `DescribeStep.test.tsx` は削除済み）

### Step 4: 変更履歴の記録

このタスクで行った変更を簡潔に記録する。

**変更サマリー（2026-04-07）**:

- 追加: `SkillInfoStep.tsx` — スキルウィザード Step 0 コンポーネント
- 削除: `DescribeStep.tsx` / `DescribeStep.test.tsx`
- 変更: `GenerationMode` の standalone 定義を撤去し、`GenerateStep.tsx` の export を正本化
- 参照: `packages/shared/src/types/skillCreator.ts` の `SkillInfoFormData` / `SkillCategory`
- コメント: `SkillInfoStepProps` の各フィールドに説明を追加
- 証跡: `outputs/phase-11/screenshots/` に Step 0 のスクリーンショットを保存

### Step 5: システム仕様更新サマリーの作成

`outputs/phase-12/system-spec-update-summary.md` に、SkillInfoStep の共有型参照方針と W2 への引き継ぎ内容を記録する。

### Step 6: Phase 12 タスク仕様準拠チェックの作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。

- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の存在確認
- canonical filename の不一致、見出し不足、planned wording 残存の確認
- PASS / FAIL と不足点の記録

### Step 7: 関連仕様書の更新確認

以下の仕様書が最新状態であることを確認する:

- `docs/30-workflows/W1-par-02a-skill-info-step/index.md`
- ウィザード全体設計書（存在する場合）
- `outputs/phase-11/screenshots/` を参照する `implementation-guide.md`

## 成果物

- JSDoc コメント付きの `SkillInfoStep.tsx`
- `wizard/index.ts` の更新方針を W2 へ引き継いだ記録
- 変更履歴の記録
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 12 成果物

| 成果物                   | パス                                                     | 説明                    |
| ------------------------ | -------------------------------------------------------- | ----------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の記録  |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴    |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成） |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）   |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認       |

## 完了条件

- [ ] `SkillInfoStep` コンポーネントに JSDoc コメントが付与されている
- [ ] `SkillInfoStepProps` の各フィールドにコメントが付与されている
- [ ] `SkillInfoFormData` / `SkillCategory` は shared 正本に定義されている
- [ ] `wizard/index.ts` の更新方針が W2 へ引き継がれている
- [ ] `DescribeStep` のエクスポートが削除されている
- [ ] `outputs/phase-11/screenshots/` の参照が `implementation-guide.md` に含まれている
- [ ] 変更履歴が記録されている
- [ ] Phase 12 仕様準拠チェックが PASS である
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
