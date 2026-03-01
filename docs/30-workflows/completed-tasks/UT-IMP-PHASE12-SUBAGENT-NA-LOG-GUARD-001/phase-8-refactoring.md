# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| Phase     | 8                                           |
| タスクID  | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001    |
| 機能名    | Phase 12 仕様書別SubAgent N/A判定ログガード |
| 作成日    | 2026-03-01                                  |
| 前提Phase | Phase 7（カバレッジ確認）完了               |

## 目的

Phase 5で作成したN/A判定ログテンプレート・三点突合チェック手順・検証コマンドセットの品質を改善し、冗長性を排除して保守性・再利用性を高める。動作（検証結果）を変えずに構造と表現を最適化する。

## 実行タスク

- テンプレート冗長性排除: N/A判定ログテンプレートのフィールド過不足を見直し、記入例を充実させる
- 三点突合手順最適化: チェックステップの統合・簡略化と自動化可能箇所の特定
- 検証コマンド簡潔化: コマンドのパイプライン化・エイリアス化による実行効率の向上
- テンプレート間表現統一: 全テンプレートの用語・形式を統一し一貫性を確保

## 参照資料

| 資料名                     | パス                                                                        | 説明                                                      |
| -------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Phase 5 実装成果物         | `outputs/phase-5/`                                                          | N/A判定ログテンプレート・三点突合手順・検証コマンドセット |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                        | カバレッジ確認結果                                        |
| Phase 6 テスト拡充成果物   | `outputs/phase-6/`                                                          | 追加テストと境界値ケースの確認                            |
| Phase 2 設計成果物         | `outputs/phase-2/`                                                          | 設計意図との整合確認                                      |
| 品質基準                   | `.claude/skills/task-specification-creator/references/quality-standards.md` | コード品質基準                                            |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                        | Phase 12関連のPitfall一覧                                 |
| Phase 12チェックリスト     | `.claude/rules/05-task-execution.md`                                        | Phase 12必須チェックリスト                                |

### システム仕様（aiworkflow-requirements）参照

| 仕様書名           | パス                                                                                        | 参照目的                       |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | ワークフロー全体構造の確認     |
| 仕様書更新手順     | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                 | 仕様書更新フローとの整合性確認 |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既存パターンとの一貫性確認     |

## 実行手順

### ステップ1: リファクタリング対象の特定

Phase 5成果物を一覧化し、改善対象を洗い出す。

| 対象                             | 改善観点                                 | 優先度 |
| -------------------------------- | ---------------------------------------- | ------ |
| N/A判定ログテンプレート          | フィールドの過不足、記入例の充実度       | 高     |
| 三点突合チェック手順             | ステップ数の最適化、自動化可能箇所の特定 | 高     |
| 検証コマンドセット               | コマンド引数の標準化、エラーハンドリング | 中     |
| current/baseline記録テンプレート | 記録粒度の適切性                         | 中     |

### ステップ2: N/A判定ログテンプレートの改善

以下の観点でテンプレートを改善する:

1. **フィールド精査**: 必須フィールドと任意フィールドの区別を明確化
2. **記入例の追加**: 全フィールドに具体的な記入例を併記
3. **バリデーションルール**: 各フィールドの有効値・禁止値を定義
4. **相互参照**: テンプレート間の参照関係を明示

改善前後の差分を記録する:

```bash
# Phase 5成果物との差分を確認
diff outputs/phase-5/na-log-template-original.md outputs/phase-8/na-log-template-refactored.md
```

### ステップ3: 三点突合チェック手順の最適化

三点突合（artifacts.json × phase-12-documentation.md × 実ファイル）のチェック手順を最適化する:

1. **ステップ統合**: 独立実行可能なステップを並列化し、依存関係のあるステップのみ直列化
2. **自動化候補の特定**: 手動確認が不要なステップをスクリプト化対象として明示
3. **エラー検出の早期化**: 致命的な不整合を先にチェックし、早期失敗パターンを適用

最適化前後のステップ数を記録する:

| 項目           | 最適化前 | 最適化後 | 削減率 |
| -------------- | -------- | -------- | ------ |
| 総ステップ数   | N        | N'       | X%     |
| 手動ステップ数 | M        | M'       | Y%     |
| 自動化可能数   | -        | A        | -      |

### ステップ4: 検証コマンドセットの簡潔化

検証コマンドをパイプライン化・エイリアス化する:

1. **パイプライン化**: 複数コマンドを `&&` で連結し、一括実行可能にする
2. **エラーハンドリング**: 各コマンドの終了コードを検査し、失敗時のメッセージを標準化
3. **引数の標準化**: ワークフローパスとPhase番号を変数化し、再利用性を向上

```bash
# パイプライン化の例
WORKFLOW_DIR="docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001"
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow "$WORKFLOW_DIR" --strict \
  && node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  "$WORKFLOW_DIR"
```

### ステップ5: テンプレート間の表現統一

全テンプレートを横断的にレビューし、以下を統一する:

| 統一項目       | 統一ルール                                                 |
| -------------- | ---------------------------------------------------------- |
| 日付形式       | ISO 8601形式（`YYYY-MM-DD`）に統一                         |
| ステータス表記 | `更新` / `N/A` の2値に限定（「対象外」「スキップ」は禁止） |
| 理由記述形式   | 「〜のため」で終わる完結文（曖昧語サンプルA/Bは禁止）      |
| 証跡パス形式   | プロジェクトルートからの相対パス                           |
| テーブルヘッダ | 全テンプレートで同一カラム名を使用                         |

### ステップ6: リファクタリング後の検証

リファクタリングの前後で検証結果が同一であることを確認する:

```bash
# Phase 4のテストケースを再実行し、全PASSを確認
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --strict

# Phase 7のカバレッジ基準を維持していることを確認
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認する:

| 検証項目                     | 検証内容                                                      | 期待結果    |
| ---------------------------- | ------------------------------------------------------------- | ----------- |
| N/A判定ログ記録の完全性      | リファクタリング後のテンプレートで全仕様書のN/A判定を記録可能 | 全記録可能  |
| 三点突合チェックの再現性     | 最適化後の手順で同一の検証結果が得られる                      | 同一結果    |
| 検証コマンドの実行成功       | パイプライン化したコマンドがエラーなく完了する                | 終了コード0 |
| 既存監査スクリプトとの互換性 | 既存の `verify-all-specs.js` が正常動作する                   | 正常動作    |

```bash
# リファクタリング後の統合テスト
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001
```

## 多角的チェック観点

| 観点               | 適用判断                               | 確認内容                                                 |
| ------------------ | -------------------------------------- | -------------------------------------------------------- |
| アーキテクチャ     | Phase 12運用の構造変更のため適用       | テンプレート・手順が既存ワークフローアーキテクチャと整合 |
| エラーハンドリング | 検証コマンドのエラー処理改善のため適用 | コマンド失敗時のメッセージが明確かつ復旧手順が記載       |

## 成果物

| 成果物               | パス                                 | 必須 | 説明                                     |
| -------------------- | ------------------------------------ | ---- | ---------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | ✅   | 改善内容・改善前後の差分・検証結果の記録 |

## 完了条件

- [ ] N/A判定ログテンプレートのフィールド過不足が解消されている
- [ ] N/A判定ログテンプレートの全フィールドに記入例が併記されている
- [ ] 三点突合チェック手順のステップ数が最適化されている（最適化前後の比較を記録）
- [ ] 自動化可能なステップが特定・明示されている
- [ ] 検証コマンドがパイプライン化され、エラーハンドリングが追加されている
- [ ] 全テンプレート間で用語・形式が統一されている（統一ルール表に基づく）
- [ ] リファクタリング後もPhase 4のテストケースが全PASS
- [ ] 既存の監査スクリプト（`verify-all-specs.js`）との互換性が維持されている
- [ ] リファクタリング記録（`outputs/phase-8/refactoring-log.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5成果物、Phase 7カバレッジレポート）
2. N/A判定ログテンプレートの改善
3. 三点突合チェック手順の最適化
4. 検証コマンドセットの簡潔化
5. テンプレート間の表現統一
6. リファクタリング後の検証（テスト再実行・互換性確認）
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --phase 8
```

## 次のPhase

Phase 9: 品質保証
