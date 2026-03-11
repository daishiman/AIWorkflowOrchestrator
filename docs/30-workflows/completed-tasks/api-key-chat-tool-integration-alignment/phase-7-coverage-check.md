# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 7                                         |
| Phase名    | カバレッジ確認                            |
| カテゴリ   | 品質                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 5, Phase 6                          |
| 後続Phase  | Phase 8                                   |

## 目的

変更範囲のテストカバレッジを測定し、不足領域を特定して補完計画へ接続する。

## 実行タスク

- タスク1: 変更範囲カバレッジを測定する
- タスク2: Team別カバレッジ差分を分析する
- タスク3: 補完対象を確定する

### タスク1: 変更範囲カバレッジを測定する

**目的**: Team-A/B/C の変更ファイルに対する coverage を取得する。

**手順**:

1. 単体テスト coverage を生成する。
2. 変更ファイル単位で line/branch/function を集計する。
3. 測定結果を Team-A/B/C に分けて出力する。

**期待される成果物**:

- 変更範囲カバレッジレポート

### タスク2: Team別カバレッジ差分を分析する

**目的**: 目標未達箇所を明確化する。

**手順**:

1. Team-A/B/C の未達項目を抽出する。
2. 未達理由をテスト不足と設計不足に分類する。
3. Phase 8 の補完対象一覧を作成する。

**期待される成果物**:

- Team別不足分析

### タスク3: 補完対象を確定する

**目的**: Phase 8 で実施するリファクタ兼補完の範囲を固定する。

**手順**:

1. 目標値を line 85% / branch 75% / function 85% に設定する。
2. 未達項目の補完順序を定義する。
3. 補完後の再計測計画を定義する。

**期待される成果物**:

- カバレッジ補完計画

## 参照資料

| 参照資料       | パス                                                                                         | 説明           |
| -------------- | -------------------------------------------------------------------------------------------- | -------------- |
| Phase 5成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/` | 実装結果       |
| Phase 6成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/` | テスト拡充結果 |
| テスト実行設定 | `apps/desktop/package.json`                                                                  | テストコマンド |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容     |
| -------- | --------------------------------------------------------------------------- | -------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

## 統合テスト連携

- Team-A/B/C の統合テスト coverage を別テーブルで管理する。
- 統合テスト未達項目は Phase 8 でテスト補完対象に入れる。

## 成果物

| 成果物             | パス                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| カバレッジ測定結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/coverage-summary.md`       |
| Team別分析         | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/team-coverage-analysis.md` |
| 補完計画           | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/coverage-gap-plan.md`      |

## 完了条件

- [x] 変更範囲のカバレッジ測定結果が作成されている
- [x] Team-A/B/C の不足箇所が抽出されている
- [x] 補完対象と順序が定義されている
- [x] Phase 8 再計測手順が定義されている
- [x] 本Phase内の全タスクを100%実行完了
