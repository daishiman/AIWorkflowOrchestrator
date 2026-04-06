# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 11                                                                 |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 10                                                           |
| 後続Phase  | Phase 12                                                           |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

validator スクリプトを実際の入力データで手動実行し、期待通りの出力が得られることを確認する。

## 背景

本タスクはスクリプトとテンプレートの修正のため、追加の画像記録は不要。手動での validator 実行と出力確認を行う。

## 実行タスク

### タスク1: validator 手動実行

**目的**: 実際のワークフローディレクトリに対して validator を手動実行する

**実行手順**:

1. 修正後の validator をテスト用実装ガイドで実行する:
   - `### 使用例` が存在する実装ガイドに対して実行 → OK を確認
   - `### 使用例` が欠落した実装ガイドに対して実行 → エラーを確認
2. 実際の Phase 12 成果物ディレクトリに対して実行し、回帰がないことを確認する
3. changelog テンプレートの必須フィールドをコマンドで確認する

**実行コマンド**:

```bash
# validator の手動実行
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --help

# changelog フィールド確認
grep -c '変更者\|関連 Issue / PR\|validator 実行結果\|current / baseline\|artifacts 同期結果' .claude/skills/task-specification-creator/assets/documentation-changelog-template.md
```

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`

---

## 参照資料

| 参照資料         | パス                               | 用途     |
| ---------------- | ---------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review.md` | 確認基準 |

## 統合テスト連携

- 手動テストでは実際のワークフロー出力を使った統合確認を行う

## 手動テストケース

| No. | テストケース                                     | 入力                              | 期待結果                     |
| --- | ------------------------------------------------ | --------------------------------- | ---------------------------- |
| 1   | `### 使用例` が正しい位置に存在する              | テンプレート準拠の実装ガイド      | `part2_usage_example`: OK    |
| 2   | `### 使用例` 見出しが欠落している                | `### 使用例` を削除した実装ガイド | `part2_usage_example`: NG    |
| 3   | changelog テンプレートに必須フィールドが含まれる | 修正後テンプレート                | 5 フィールド全て存在         |
| 4   | 既存の Phase 12 成果物に対する回帰テスト         | 過去のワークフロー出力            | 既存チェック結果が変わらない |

## 成果物

| 成果物                   | パス                                        | 内容                   |
| ------------------------ | ------------------------------------------- | ---------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実行前の確認項目       |
| 手動テスト要約           | `outputs/phase-11/manual-test-result.md`    | 結果要約・判定         |
| 手動テスト結果           | `outputs/phase-11/manual-test-report.md`    | 手動実行結果・確認記録 |

## 完了条件

- [ ] テストケース 1-4 が全て期待通りの結果
- [ ] 既存 Phase 12 成果物に回帰がない
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
