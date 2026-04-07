# Phase 12: ドキュメント更新

## メタ情報

- Phase: 12
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 1-11 の出力欠落を補完した上で Phase 12 canonical 6成果物を揃え、共有型定義追加の current facts をドキュメントへ同期する。

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

- [x] **タスク 1**: 実装ガイド作成（Part 1 / Part 2 の 2 パート構成）
- [x] **タスク 2**: システム仕様更新（2 ステップ + 条件付き Step 2）
- [x] **タスク 3**: ドキュメント更新履歴作成
- [x] **タスク 4**: 未タスク検出レポート作成
- [x] **タスク 5**: スキルフィードバックレポート作成
- [x] **タスク 6**: Phase 12 タスク仕様準拠チェック

## 参照資料

| 資料名                       | パス                                                                                | 説明               |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| 追記済みファイル             | `packages/shared/src/types/skillCreator.ts`                                         | ドキュメント化対象 |
| Phase 1-11 outputs           | `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-1/` 〜 `phase-11/` | 台帳補完済み成果物 |
| skill-wizard-redesign レーン | `docs/30-workflows/skill-wizard-redesign-lane/`                                     | 上位レーン仕様書   |
| task-spec 正本               | `.claude/skills/task-specification-creator/SKILL.md`                                | Phase 12 判定基準  |
| system spec 正本             | `.claude/skills/aiworkflow-requirements/SKILL.md`                                   | 更新対象基準       |

## 実行手順

### タスク 1: 実装ガイド Part 1 / Part 2

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生向け説明

**テーマ**: 「スキル情報フォームの型を 1 つの部品箱にまとめる理由」

- 日常のたとえ話を必ず入れる
- `SkillInfoFormData` / `ConversationAnswers` / `SmartDefaultResult` を、部品箱のラベルのように説明する
- なぜ必要かを先に説明してから、何をするかを説明する
- 専門用語を使う場合は、その場で短く説明する

#### Part 2: 技術者向け説明

**テーマ**: 共有型契約と依存関係の実装詳細

- `SkillCategory`
- `SkillInfoFormData`
- `SkillWizardScheduleConfig`
- `QuestionAnswer`
- `ConversationAnswers`
- `SmartDefaultResult`
- `SkeletonQualityFeedback`
- `artifacts.json`
- `outputs/artifacts.json`

必須要素:

- TypeScript の型定義
- 各型の使用例
- `SkillWizardScheduleConfig` と既存 `ScheduleConfig` の違い
- `SmartDefaultResult` と q1〜q6 の対応
- `ConversationAnswers` と `QuestionAnswer` の関係
- 追加型の公開経路は `@repo/shared/types/skillCreator` であり、root `@repo/shared` は既存の `SkillCategory` と衝突するため拡張しないこと

### タスク 2: システム仕様更新

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 完了タスク記録・関連リンク・LOGS.md 更新

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` に完了記録を追加する
- 関連ドキュメントへのリンクを記録する
- 変更履歴を追加する
- `LOGS.md` を 2 ファイル更新する
- `topic-map.md` の関連項目を更新する
- `artifacts.json` と `outputs/artifacts.json` を同期する

#### Step 1-B: 実装状況テーブル更新

- 実装完了: `未実装` -> `完了`
- 仕様書作成のみの段階: `spec_created`
- `QuestionAnswer` / `SmartDefaultResult` / `ConversationAnswers` / `SkillWizardScheduleConfig` の状態を current facts に合わせる

#### Step 1-C: 関連タスクテーブル更新

- 仕様書内の「関連タスク」「未タスク候補」テーブルのステータスを更新する
- W1/W2 が依存する共有型として扱われていることを明記する
- `@repo/shared/types/skillCreator` の subpath export に閉じる理由を記録する

#### Step 2: システム仕様更新（新規インターフェース追加時のみ）

- 新規インターフェース/型の追加
- 既存インターフェースの変更
- 新規定数/設定値の追加
- API 仕様の変更

今回のタスクでは共有型の追加があるため、Step 2 は実施対象である。

### タスク 3: 更新履歴作成

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/documentation-changelog.md`

追記内容の例:

```markdown
## 2026-04-07 UT-SKILL-WIZARD-W0-seq-01 完了

- `packages/shared/src/types/skillCreator.ts` に Skill Wizard Shared Contracts セクションを追加
- 追加型: `SkillCategory` / `SkillInfoFormData` / `SkillWizardScheduleConfig` / `QuestionAnswer` / `ConversationAnswers` / `SmartDefaultResult` / `SkeletonQualityFeedback`
- 既存 `ScheduleConfig` との衝突を `SkillWizardScheduleConfig` 命名で回避
- テスト: `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` を新規作成
```

### タスク 4: 未タスク検出

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/unassigned-task-detection.md`

本タスク実装中に発見した未解決事項・後続タスクの候補を記録する。

**検出観点**:

| 項目                             | 内容                                                            | 優先度 |
| -------------------------------- | --------------------------------------------------------------- | ------ |
| ランタイムバリデーション         | `skillName` の空白 trim ルールや `purpose` の最小長は未実装     | 中     |
| `SkillWizardScheduleConfig` 検証 | cron 式と timezone の妥当性チェックは未実装                     | 低     |
| スマートデフォルト実装           | `SmartDefaultResult` を生成するロジックの細部は後続 wave で調整 | 高     |

### タスク 5: スキルフィードバック

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/skill-feedback-report.md`

フィードバック内容の例:

- `SkillWizardScheduleConfig` の命名衝突は設計段階で明示しておくと迷いが減る
- `SkillInfoFormData.category` を `null` で表す方針は、後続 UI の未選択状態と整合しやすい
- `SmartDefaultResult` の `inferenceLog` は、推論理由の追跡に役立つ
- `@repo/shared/types/skillCreator` に閉じると、root `@repo/shared` の別 `SkillCategory` と衝突しない

### タスク 6: Phase 12 タスク仕様準拠チェック

**出力先**: `docs/30-workflows/W0-seq-01-types-skill-info-form/outputs/phase-12/phase12-task-spec-compliance-check.md`

`implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が揃っていることを確認し、task-specification-creator と aiworkflow-requirements の両方に対する準拠を最終確認する。

- canonical filename の不一致を確認する
- planned wording が残っていないことを確認する
- `artifacts.json` / `outputs/artifacts.json` の 2 ファイル同期を確認する
- PASS / FAIL と不足点を記録する

## 成果物

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

## 完了条件

- [x] タスク 1: 実装ガイドの 2 パートが作成されている
- [x] タスク 2: システム仕様更新が完了している
- [x] タスク 3: 更新履歴が記録されている
- [x] タスク 4: 未タスク検出レポートが 0 件でも作成されている
- [x] タスク 5: スキルフィードバックが 0 件でも作成されている
- [x] タスク 6: 仕様準拠チェックが PASS である
