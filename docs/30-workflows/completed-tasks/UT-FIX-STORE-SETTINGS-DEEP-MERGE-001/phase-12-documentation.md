# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 12                                           |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | store-settings-deep-merge                    |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 11                                     |
| 後続Phase  | Phase 13                                     |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

Phase 11（手動テスト検証）の完了後、実装ドキュメントを更新して将来の開発者が参照できる状態にする。
`deepMerge` 関数の設計判断・マージルール・型安全性の注意点を記録し、IPC設計パターンに追記することで
同様の問題が再発しないようにする。

## 背景

`settings:update` IPCハンドラをシャローマージからディープマージに対応したことで、
ネストされた設定オブジェクトの部分更新時にデータ消失が発生しなくなった。
本 Phase では実装の知見をドキュメント化し、システム仕様書を最新状態に保つ。

発見元: `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` Phase 12 スキルFBレポート（シャロー vs ディープマージ戦略の明示的設計決定が必要という指摘）。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                       |
| ---------- | ------------------ | -------------------------------------------- |
| SubAgent-A | 実装ガイド作成     | Part1（概要）・Part2（技術詳細）の記述       |
| SubAgent-B | システム仕様書更新 | IPC設計パターンへのdeepMerge実装パターン追記 |
| SubAgent-C | 変更履歴・未タスク | 変更ファイル一覧・未タスク検出の記録         |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合性・依存関係の最終確認       |

## 実行タスク

- **Task 12-1 実装ガイド作成**: Part 1（タスク概要・問題点・解決策）とPart 2（deepMerge関数の使用方法・マージルール・型安全性注意点）を作成する
- **Task 12-2 システム仕様書更新**: `.claude/skills/aiworkflow-requirements/references/` の該当ファイルにdeepMerge実装パターンを追記する（Step 2A 計画記録→Step 2B 実更新まで完了させる。planned wording を残さないこと）
- **Task 12-3 ドキュメント変更履歴作成**: 変更ファイル一覧（`apps/desktop/src/main/ipc/storeHandlers.ts` / `apps/desktop/src/main/ipc/storeHandlers.test.ts`）とシステム仕様書の更新履歴を記録する
- **Task 12-4 未タスク検出**: 3候補（UserSettings型定義のネスト構造明示化・設定マイグレーション戦略・undefined省略シナリオ明示化）を検出してレポートを作成する
- **Task 12-5 スキルフィードバックレポート作成**: IPCハンドラ実装時のマージ戦略設計決定に関する知見を記録する
- **Task 12-6 Phase 12 準拠チェック**: Task 12-1〜12-5の全完了を確認する

## 参照資料

### 前Phase成果物

| 参照資料             | パス                                               | 説明            |
| -------------------- | -------------------------------------------------- | --------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物  |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物  |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物  |
| IPC 契約設計書       | `outputs/phase-2/ipc-contract-design.md`           | Phase 2 成果物  |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物  |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物  |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`          | Phase 3 成果物  |
| ゲート判定書         | `outputs/phase-3/gate-decision.md`                 | Phase 3 成果物  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`        | Phase 5 成果物  |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`                 | Phase 5 成果物  |
| 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`           | Phase 6 成果物  |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`        | Phase 6 成果物  |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`               | Phase 7 成果物  |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`               | Phase 8 成果物  |
| QA結果               | `outputs/phase-9/qa-results.md`                    | Phase 9 成果物  |
| 最終レビュー         | `outputs/phase-10/final-review.md`                 | Phase 10 成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`           | Phase 11 成果物 |

### システム仕様書

| 参照資料             | パス                                                                             | 説明                      |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| IPC設計パターン      | `.claude/skills/aiworkflow-requirements/references/`                             | 更新対象の正本仕様        |
| Phase 12テンプレート | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | SF-02/SF-03対応ルール参照 |

## 実行手順

### Task 12-1: 実装ガイド作成

1. Part 1（タスク概要）を作成する:
   - 問題点: `settings:update` ハンドラのシャローマージが将来のネスト設定でデータ消失を引き起こすリスク
   - 解決策: `deepMerge<T>` 関数を `storeHandlers.ts` 内プライベート関数として実装
   - 実装ファイル: `apps/desktop/src/main/ipc/storeHandlers.ts`（変更）/ `apps/desktop/src/main/ipc/storeHandlers.test.ts`（テスト追加）
2. Part 2（技術詳細）を作成する:

- `deepMerge` 関数の使用方法と型シグネチャ
- マージルール（配列上書き・null上書き・undefined省略・プレーンオブジェクト再帰）
- 入力安全性（plain object 限定・危険キー除外・prototype pollution 防止）
- 型安全性の注意点（`Record<string, unknown>` 制約との整合性）

### Task 12-2: システム仕様書更新（SF-02対応）

**Step 2A（計画記録）**: 更新予定ファイルと変更内容を `system-spec-update-summary.md` に記録する。

**Step 2B（実更新）**: 以下を完了させる:

1. `.claude/skills/aiworkflow-requirements/references/` 配下の IPC設計パターンファイルを特定する
2. 「マージ戦略」セクションに `deepMerge` 実装パターンを追記する
3. planned wording（`仕様策定のみ`・`実行予定`・`保留として記録`）が残っていないことを確認する

**planned wording 残存確認コマンド（完了前に必ず実行）**:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"
```

### Task 12-3: ドキュメント変更履歴作成

変更ファイル一覧を記録する:

- `apps/desktop/src/main/ipc/storeHandlers.ts`: `deepMerge<T>` 関数追加・`settings:update` ハンドラ修正
- `apps/desktop/src/main/ipc/storeHandlers.test.ts`: TC-01〜TC-12 テストケース追加

### Task 12-4: 未タスク検出（SF-03対応）

以下3候補を確認し、SF-03対応の4パターンに照らして未タスク候補を記録する:

| 候補                                           | 優先度 | 理由                                             |
| ---------------------------------------------- | ------ | ------------------------------------------------ |
| `UserSettings` 型定義のネスト構造明示化        | low    | 現時点ではネスト構造がないため実害なし           |
| 設定マイグレーション戦略の設計                 | low    | 将来ネスト構造追加時に必要。現時点で緊急性なし   |
| `undefined` 省略による設定削除シナリオの明示化 | medium | 意図的な削除ができないケースを仕様書に明記すべき |

0件の場合も `unassigned-task-detection.md` に「設計タスクパターン確認済み、N件」と明記する。

**未タスク配置先**:

| 条件                     | 配置先                               |
| ------------------------ | ------------------------------------ |
| 未完了の未タスク（通常） | `docs/30-workflows/unassigned-task/` |

**確認コマンド（Phase 12 完了前に必ず実行）**:

```bash
ls docs/30-workflows/unassigned-task/
```

### Task 12-5: スキルフィードバックレポート作成

以下の知見を記録する:

- **知見1**: IPCハンドラ実装時に「シャロー vs ディープ」マージ戦略をPhase 2設計で明示的に決定すべきである（今回は Phase 12 で後発的に発見された）
- **知見2**: `Record<string, unknown>` 型はマージ戦略の設計を曖昧にしやすい。設計書には `deepMerge` の型シグネチャとマージルールを明示する
- **知見3**: IPC 経由の設定更新は plain object のみに制限し、危険キーを無視して prototype pollution を防ぐ必要がある

### Task 12-6: Phase 12 準拠チェック

Task 12-1〜12-5の全完了を確認する（下記「タスク100%実行確認」参照）。

**成果物ファイル名照合チェック**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## 統合テスト連携

| 判定項目             | 基準     | 結果    |
| -------------------- | -------- | ------- |
| ドキュメント整合性   | 矛盾なし | pending |
| planned wording なし | 0件      | pending |
| 未タスク配置確認     | OK       | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| 矛盾     | `deepMerge` の設計書記述とシステム仕様書の記述が一致しているか確認する                     |
| 漏れ     | TC-01〜TC-12の全テストケースが変更履歴に反映されているか確認する                           |
| 整合性   | IPC設計パターンへの追記内容がPhase 2設計書（`ipc-contract-design.md`）と整合するか確認する |
| 依存関係 | Phase 11 手動テスト結果が本Phase の変更履歴の根拠として参照されているか確認する            |

## サブタスク管理

1. 参照資料（Phase 1〜11 成果物）の確認
2. Task 12-1: 実装ガイド（Part 1 / Part 2）作成
3. Task 12-2: システム仕様書更新（Step 2A → Step 2B）
4. Task 12-3: ドキュメント変更履歴作成
5. Task 12-4: 未タスク検出・未タスク指示書配置
6. Task 12-5: スキルフィードバックレポート作成
7. Task 12-6: 全完了準拠チェック

## 成果物

| 成果物               | パス                                                     | 説明                                     |
| -------------------- | -------------------------------------------------------- | ---------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part1（概要）/ Part2（技術詳細）         |
| 仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md`         | Step 2A 計画記録→Step 2B 実更新ログ      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧・システム仕様書更新履歴 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）                  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 知見・改善点（0件でも作成）              |
| Phase12準拠チェック  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の全完了確認             |

## 完了条件

- [ ] Task 12-1: `implementation-guide.md` が Part 1 / Part 2 の2部構成で作成されている
- [ ] Task 12-2: システム仕様書の実更新が完了しており planned wording が残っていない（SF-02対応）
- [ ] Task 12-3: `documentation-changelog.md` に変更ファイル一覧とシステム仕様書更新履歴が記録されている
- [ ] Task 12-4: `unassigned-task-detection.md` が作成されており、SF-03対応の4パターン（型定義→実装 / 契約→テスト / UI仕様→コンポーネント / 仕様書間差異→設計決定）の確認が記録されている
- [ ] Task 12-5: `skill-feedback-report.md` が作成されており、マージ戦略設計に関する知見が記録されている
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` で Task 12-1〜12-5 の全完了を確認済み
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] Task 12-1（実装ガイド作成）を完了した
- [ ] Task 12-2（システム仕様書更新）を完了した（Step 2A・Step 2B 両方）
- [ ] Task 12-3（ドキュメント変更履歴作成）を完了した
- [ ] Task 12-4（未タスク検出）を完了した（SF-03対応の4パターン確認済み）
- [ ] Task 12-5（スキルフィードバックレポート作成）を完了した
- [ ] Task 12-6（Phase 12 準拠チェック）を完了した
- [ ] 成果物テーブル記載の6ファイルを全件生成した
- [ ] planned wording 残存確認コマンドを実行し 0 件であることを確認した
- [ ] 未タスク配置先ディレクトリ確認コマンドを実行した
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認した
- [ ] 実行記録を残した

```bash
# Phase 12 完了前 必須実行コマンド

# 1. planned wording 残存確認
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"

# 2. 未タスク配置先確認
ls docs/30-workflows/unassigned-task/

# 3. バリデーションスクリプト
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## Phase 12 Task 2 判定基準（SF-02対応）

| 判定項目 | 実行条件       | 完了条件                                                                      |
| -------- | -------------- | ----------------------------------------------------------------------------- |
| Step 2A  | 全タスクで必須 | 更新予定ファイルと変更内容の計画記録を `system-spec-update-summary.md` に記録 |
| Step 2B  | 全タスクで必須 | `.claude/skills/` 配下の実更新完了・planned wording の除去                    |

## Phase 12 実装ガイド要件

- Part 1: タスク概要（問題点・解決策・実装ファイル）
- Part 2: `deepMerge` 関数の使用方法、配列・null・undefinedの扱い、型安全性の注意点（`Record<string, unknown>` 制約との整合）
- `## 視覚証跡` セクションを追加し、`UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する（`screenshots/.gitkeep` は残さない）
- 未タスク検出レポートは 0 件でも必ず出力する
- スキルフィードバックは改善点 0 件でも必ず出力する

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘がある場合、以下テーブルに追跡結果を記録する。

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| ---------------- | -------- | ------------- | ------------- | -------- | ---------- |
| （実行時に記録） | -        | -             | -             | -        | -          |

## 次Phase

Phase 13: PR作成
