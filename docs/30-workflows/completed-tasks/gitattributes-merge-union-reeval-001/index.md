# gitattributes-merge-union-reeval - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| 機能名       | gitattributes-merge-union-reeval                                                  |
| タスクID     | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001                                         |
| 作成日       | 2026-04-19                                                                        |
| タスク種別   | NON_VISUAL                                                                        |
| ステータス   | 完了                                                                              |
| 総Phase数    | 13                                                                                |
| 優先度       | medium                                                                            |
| 規模         | small                                                                             |
| カテゴリ     | リファクタリング/設計見直し                                                       |
| 対象機能     | Git マージ戦略 / `.gitattributes`                                                 |
| Source Issue | [#2281](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281) (CLOSED) |
| 依存タスク   | TASK-CONFLICT-PREVENT-001（完了済み）                                             |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス                  |
| ----- | -------------------- | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了                        |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了                        |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了                        |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了                        |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了                        |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了                        |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了                        |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了                        |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了                        |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了                        |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了                        |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了                        |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー指示待ち（blocked） |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## タスク概要

### 解決する問題

`.gitattributes` で `.claude/skills/*/references/*.md` および `.agents/skills/*/references/*.md` に一律 `merge=union` を適用しているが、`references/` 配下には append-only な完了記録だけでなく、見出し・テーブル・箇条書きを含む構造化ドキュメント（`task-workflow.md` / `lessons-learned.md` 等）も含まれる。`merge=union` は行レベルで両ブランチの変更を残すため、構造化ドキュメントに適用すると重複行・テーブル破損・順序不明な箇条書きを引き起こす長期リスクがある。

### ゴール

1. `references/*.md` 配下のファイルを **append-only** か **構造化** かで分類する
2. 分類結果に応じて `.gitattributes` のパターンを精緻化する（`merge=union` 適用範囲を縮小）
3. `merge=ours` カスタムドライバの登録 (`setup-merge-drivers.sh`) を確実に動作させる
4. 判断基準と適用ルールを文書化し、新規ファイル追加時に再評価できる体制を整える

### 非スコープ

- `indexes/*.json` / `indexes/*.md` への `merge=ours` 設定（既存維持・本タスクではレビューのみ）
- `EVALS.json` のスキーマ変更（EVALS consumer 監査タスク完了まで凍結）
- Git フック / CI ワークフローの変更
- `.gitattributes` 以外の Git 設定ファイル（`.gitignore` / `.gitconfig`）

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行する
2. **成果物確認**: 全ての必須成果物が `outputs/phase-N/` 配下に生成されていることを検証する
3. **artifacts.json更新**: `complete-phase.js` で Phase 完了ステータスを更新する
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記する

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/gitattributes-merge-union-reeval-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, ファイル分類インベントリ                                                                                                 |
| 2     | マージ戦略設計書, `.gitattributes` 修正パッチ案, ドライバー設定戦略                                                                                |
| 3     | 設計レビュー結果（Gate 判定）                                                                                                                      |
| 4     | テスト設計, マージシミュレーションスクリプト, 期待挙動マトリクス                                                                                   |
| 5     | `.gitattributes` 修正実装, 実装サマリー                                                                                                            |
| 6     | テスト拡充記録（fail path, 新規ファイル追加 guard）                                                                                                |
| 7     | カバレッジ確認レポート（パターン別カバレッジ, edge case 列挙）                                                                                     |
| 8     | リファクタリング記録（コメント整理 / パターン重複削除）                                                                                            |
| 9     | 品質保証レポート（line budget / Markdown link / mirror parity）                                                                                    |
| 10    | 最終レビュー結果（Gate 判定）                                                                                                                      |
| 11    | 手動テスト報告書（マージシミュレーション実測 + setup-merge-drivers.sh 実行確認）, 発見事項一覧                                                     |
| 12    | 実装ガイド（Part1+Part2）, システム仕様更新サマリー, ドキュメント更新履歴, 未タスク検出レポート, スキルフィードバックレポート, Phase12準拠チェック |
| 13    | ローカル確認結果, 変更サマリー, PR情報                                                                                                             |

---

## 関連ドキュメント

| ドキュメント                                                                            | 用途                                                 |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `.gitattributes`                                                                        | 修正対象のマージ戦略設定ファイル                     |
| `.claude/scripts/setup-merge-drivers.sh`                                                | `merge.ours.driver` 登録スクリプト                   |
| 元タスク Issue [#2281](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281) | 本タスクの起票元（CLOSED状態）                       |
| TASK-CONFLICT-PREVENT-001                                                               | 本タスクの前提となる `.gitattributes` 初期設定タスク |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 構造化ドキュメント代表例（マージ戦略再分類対象）     |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                  | 構造化ドキュメント代表例（マージ戦略再分類対象）     |

---

_このファイルは task-specification-creator skill のテンプレートに基づいて手動生成されました。_
_最終更新: 2026-04-19_
