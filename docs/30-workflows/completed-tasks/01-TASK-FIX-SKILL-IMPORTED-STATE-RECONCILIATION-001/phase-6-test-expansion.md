# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| 機能名     | TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001 |
| タスク名   | インポート済みスキル復元の name/id 互換解決      |
| 前提Phase  | Phase 5                                          |
| 後続Phase  | テストカバレッジ確認                             |
| 作成日     | 2026-03-04                                       |
| ステータス | completed                                        |

## 目的

回帰防止ケースと異常系テストを拡充する。

## 背景

保存キー形式の揺れにより getImportedSkills が復元に失敗し、UI上で未追加表示から再インポートが誘発されていた。

## SubAgent分担

| SubAgent | 担当                                 |
| -------- | ------------------------------------ |
| A        | Main Service（復元互換ロジック）     |
| B        | IPC契約・型整合（戻り値/エラー契約） |
| C        | テスト戦略・Phase 12仕様同期         |

## 実行タスク

- 異常系テスト追加: undefined/null/重複呼び出しを網羅する
- 境界値テスト追加: 0件・空文字・重複データを検証する
- 回帰シナリオ追加: 再発パターンを固定化する

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| テスト仕様       | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| テストケース     | `outputs/phase-4/test-cases.md`             | Phase 4 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |

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

| 成果物         | パス                                       | 内容           |
| -------------- | ------------------------------------------ | -------------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | 追加ケース結果 |
| 回帰テスト記録 | `outputs/phase-6/regression-test.md`       | 再発防止結果   |

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

Phase 7 テストカバレッジ確認
