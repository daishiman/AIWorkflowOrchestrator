# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| Phase名    | 手動テスト                        |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 10: 最終レビュー            |
| 次Phase    | Phase 12: ドキュメント更新        |
| ステータス | pending                           |
| 視覚種別   | N/A（docs-only修正のため）        |
| 作成日     | 2026-04-14                        |

## 目的

スキル作成ウィザードで新規スキルを作成し、`generate_skill_md.js`が正しく`--plan`/`--output`引数を受け取って実行されることを確認する。
ただし本タスクはコード修正の動作確認であり、UIの視覚的変更を伴わないため、N/A判定可能。

## N/A判定根拠

本タスク（TASK-SC-FIX-GENERATE-SKILL-MD-001）の変更対象は以下の2ファイルのみである。

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（mainプロセスのサービス層）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（テストファイル）

UI層（rendererプロセスのコンポーネント）への変更はなく、ユーザーが視覚的に確認できる画面変更が発生しない。
自動テスト（Phase 9）でAC-1〜AC-5の全条件を網羅しているため、手動VISUALテストは不要と判定する。

## 実行タスク（任意実施）

手動確認を希望する場合は以下の手順で実施する。

### Task 1: アプリ起動と新規スキル作成

- デスクトップアプリを起動する（`pnpm --filter @repo/desktop dev`）
- スキル作成ウィザードを開き、新規スキルを作成する
- スキル名・説明を入力してウィザードを最後まで進める

### Task 2: SKILL.md生成内容の確認

- 生成されたSKILL.mdに`## Task一覧`セクションが含まれていることを確認する（AC-2対応）
- 生成されたSKILL.mdにYAMLフロントマター（`---`で囲まれたブロック）が含まれていることを確認する（AC-3対応）

### Task 3: ログ確認

- SkillCreatorServiceのログで`generate_skill_md.js`が終了コード0で完了していることを確認する（AC-1対応）
- tmpファイルが生成後に削除されていることをファイルシステムまたはログで確認する（AC-5対応）

## 参照資料

| 資料名           | パス                                                          | 説明               |
| ---------------- | ------------------------------------------------------------- | ------------------ |
| 設計書           | `outputs/phase-2/design-document.md`                          | 修正方針B案        |
| 実装記録         | `outputs/phase-5/implementation-record.md`                    | 実装対象           |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                     | 手動確認の要否判定 |
| 変更サービス     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 変更対象ファイル   |

## 統合テスト連携

- 手動テストは自動テストで代替できない観点のみを扱う
- 本Phaseの結論（N/A）を`manual-test-result.md`に記録し、Phase 12へ渡す

## 成果物

| 成果物                   | パス                                        | 説明                      |
| ------------------------ | ------------------------------------------- | ------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目                  |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | N/A（自動テストで代替済） |

## 完了条件

- [ ] N/A判定根拠が記録されている
- [ ] 自動テストによるAC-1〜AC-5のカバレッジが確認されている
- [ ] Phase 12へ渡すevidence状態が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
