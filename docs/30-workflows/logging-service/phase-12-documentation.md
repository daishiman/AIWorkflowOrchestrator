# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 12              |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 使用スキル

| スキル                       | 選定理由                     |
| ---------------------------- | ---------------------------- |
| `documentation-architecture` | ドキュメント構造設計         |
| `user-centric-writing`       | わかりやすいドキュメント作成 |

## 参照資料

| 資料名           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> 仕様変更時は必ず以下のシステム仕様も更新し、整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |
| 型定義仕様       | `.claude/skills/aiworkflow-requirements/references/types.md`      | 共通型定義パターン         |

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的な説明

- ログ記録とは何か（日記のような記録）
- バッファリングとは何か（まとめて書き込む仕組み）
- なぜこの設計にしたのか

#### Part 2: 技術的な詳細

- ConversionLoggerクラスの構造
- Zodスキーマ定義
- 使用例コードスニペット
- LogRepositoryとの連携

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下（該当あれば）
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`

### Phase 12-3: 未タスク検出【必須】

| #   | ソース               | 確認項目                      |
| --- | -------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果  | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果 | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト   | スコープ外の発見事項          |
| 4   | 各Phase成果物        | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース         | TODO/FIXME/HACK/XXXコメント   |
| 6   | スキルLOGS.md        | partial/failure記録           |

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 関連ドキュメントが更新されている（該当あれば）
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. documentation-architectureスキルの実行
2. user-centric-writingスキルの実行
3. 実装ガイドPart 1の作成
4. 実装ガイドPart 2の作成
5. システムドキュメント更新確認
6. 未タスク検出の実施
7. 未タスク検出レポートの作成
8. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 12
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                     | 結果                        | 備考                        |
| -------------------------- | --------------------------- | --------------------------- |
| documentation-architecture | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| user-centric-writing       | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 13: PR作成
