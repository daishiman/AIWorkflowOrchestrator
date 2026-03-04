# Phase 5: 実装

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001 |
| タスク名   | インポート済みスキル復元の name/id 互換解決      |
| 前提Phase  | Phase 4                                          |
| 後続Phase  | テスト拡充                                       |
| 作成日     | 2026-03-04                                       |
| ステータス | completed                                        |

## 目的

テストを通す最小実装を行い、機能要求を満たす。

## 背景

保存キー形式の揺れにより getImportedSkills が復元に失敗し、UI上で未追加表示から再インポートが誘発されていた。

## SubAgent分担

| SubAgent | 担当                                 |
| -------- | ------------------------------------ |
| A        | Main Service（復元互換ロジック）     |
| B        | IPC契約・型整合（戻り値/エラー契約） |
| C        | テスト戦略・Phase 12仕様同期         |

## 実行タスク

- 最小実装: Red テストを Green にする
- 例外処理実装: 無効入力/欠損データを安全化する
- 結合確認: UIとIPCの整合動作を確認する

## 参照資料

| 参照資料     | パス                                    | 説明           |
| ------------ | --------------------------------------- | -------------- |
| テスト仕様   | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| テストケース | `outputs/phase-4/test-cases.md`         | Phase 4 成果物 |

## 実装対象ファイル（差分追跡）

| 区分         | ファイル                                                              | 実装要点                                          |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------------- |
| Main Service | `apps/desktop/src/main/services/skill/SkillService.ts`                | `getImportedSkills()` で id/name 双方の解決を許容 |
| Unit Test    | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts` | name保存形式の後方互換を Green で保証             |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物           | パス                                        | 内容             |
| ---------------- | ------------------------------------------- | ---------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装方針と差分   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 実装対象ファイル |

## 完了条件

- [x] 実行タスクの成果物が定義されている
- [x] 参照仕様との整合根拠を記録した
- [x] 次Phaseへの引き継ぎ事項を記録した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001
```

## Phase実行記録

| 項目         | 記録                               |
| ------------ | ---------------------------------- |
| 実行タスク   | 完了                               |
| 発見事項     | 主要課題は仕様化済み・追加阻害なし |
| 引き継ぎ事項 | 次Phaseへ成果物を引き継ぎ済み      |

## 次のPhase

Phase 6 テスト拡充
