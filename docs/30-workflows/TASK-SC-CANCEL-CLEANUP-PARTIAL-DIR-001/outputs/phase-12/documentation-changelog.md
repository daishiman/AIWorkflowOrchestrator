# Documentation Changelog

## 変更概要

TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 の phase spec 再構成による変更

## 変更一覧

### 1. phase spec 再構成

| ファイル                    | 変更内容                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `index.md`                  | `現状整理` / `真の論点` セクションを追加。Phase 一覧と Canonical Artifacts テーブルを整備 |
| `phase-1-requirements.md`   | P50 チェック結果と task classification を確定。AC-1〜AC-5 を定義                          |
| `phase-2-design.md`         | `差分確認 + 回帰確認` 型への転換方針と lane plan を記述                                   |
| `phase-3-design-review.md`  | 30思考法のレビュー観点と gate 判定条件を明文化                                            |
| `phase-4-test-creation.md`  | TC-01〜TC-04 のテストマトリクスと依存関係整合チェックコマンドを定義                       |
| `phase-5-implementation.md` | 「実装」を差分確認型として再定義。`finally + createdByThisRun` 前提を削除                 |
| `phase-11-manual-test.md`   | NON_VISUAL code task 用テンプレートへ寄せ、代替証跡方針を明文化                           |
| `phase-12-documentation.md` | mandatory 5 tasks と NON_VISUAL 視覚証跡セクションを追加                                  |

### 2. artifact 名統一

| Before（旧）                                | After（canonical）                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| 混在していた `*-report.md` と `*-result.md` | canonical 名に統一（`design-review-result.md`, `coverage-report.md` 等） |
| `review-prompt.md`                          | `review-prompt.txt`                                                      |

### 3. NON_VISUAL code task への再分類

| 変更                     | 内容                                                            |
| ------------------------ | --------------------------------------------------------------- |
| task classification 確定 | `NON_VISUAL code task`（UI 変更なし）として明示                 |
| Phase 11 証跡方針        | スクリーンショット不要 → `manual-test-result.md` を一次ソースに |
| Phase 12 視覚証跡        | `## 視覚証跡` セクションで代替証跡を明記                        |

### 4. 新規追加ファイル

| ファイル                                  | 説明                                 |
| ----------------------------------------- | ------------------------------------ |
| `artifacts.json`                          | root の artifact registry            |
| `outputs/artifacts.json`                  | 実行状態を記録する artifact registry |
| `outputs/phase-1/` 〜 `outputs/phase-13/` | 各 phase の canonical 成果物         |

## 変更しなかったもの

| 対象                          | 理由                                              |
| ----------------------------- | ------------------------------------------------- |
| `SkillCreatorService.ts`      | 実装は正しい。コード変更不要                      |
| `SkillCreatorService.test.ts` | 既存テスト SC-CANCEL-001/002 は回帰根拠として維持 |
