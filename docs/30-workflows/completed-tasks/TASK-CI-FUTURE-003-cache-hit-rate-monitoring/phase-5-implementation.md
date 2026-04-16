# Phase 5: 実装

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| 機能名     | TASK-CI-FUTURE-003                   |
| タスク名   | キャッシュヒット率のモニタリング設定 |
| 前提Phase  | Phase 4                              |
| 後続Phase  | Phase 6                              |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

## 目的

Phase 2 の設計に基づき、`.github/workflows/ci.yml` にキャッシュヒット率判定ステップを実装する。

## 実行タスク

### Task 5-A: キャッシュステップへの `id` 追加

Phase 1 の現状確認で `id` が未設定だったキャッシュステップに `id` を追加する。

**実装方針**:

- 既存のキャッシュステップ（`actions/cache@v4` または `pnpm-install-retry`）に `id` 属性を追加する
- `id` の命名は Phase 2 の設計に従う（`cache-node-modules` 等）
- 既存ロジックへの変更は `id` の追加のみとし、他を変更しない

### Task 5-B: キャッシュヒット率判定ステップの追加

Phase 2 の YAML サンプル（`outputs/phase-2/yaml-sample.yml`）を `.github/workflows/ci.yml` の全対象ジョブに追加する。

**実装チェックリスト**:

- [ ] `if: always()` が設定されている
- [ ] `continue-on-error: true` が設定されている
- [ ] `CACHE_HIT` 環境変数が `steps.<id>.outputs.cache-hit` から正しく参照されている
- [ ] cache restore 直後の `node_modules` 存在確認でフォールバックヒットを判定している
- [ ] `cache-status` / `cache-kind` / `cache-reason` / `annotation-level` が `GITHUB_OUTPUT` に書き出されている
- [ ] `$GITHUB_STEP_SUMMARY` への Markdown テーブル書き込みが正しく実装されている
- [ ] `::warning::` アノテーションがミス時に出力される
- [ ] `::notice::` アノテーションがフォールバックヒット時に出力される

### Task 5-C: 対象ジョブへの適用

Phase 1/2 で確定した全対象ジョブに判定ステップを追加する。

| ジョブ    | 追加済み | 備考 |
| --------- | -------- | ---- |
| lint      | -        | -    |
| typecheck | -        | -    |
| test      | -        | -    |

### Task 5-D: 実装差分の記録

| 対象               | Before（変更前）                 | After（変更後）                       | 理由                              |
| ------------------ | -------------------------------- | ------------------------------------- | --------------------------------- |
| キャッシュステップ | `id` 未設定                      | `id: cache-node-modules` 追加         | `outputs` 参照と cache 判定のため |
| 全対象ジョブ       | キャッシュヒット確認ステップなし | `キャッシュヒット率確認` ステップ追加 | FR-001〜FR-006 の実現             |

## 参照資料

| 資料名                      | パス                                            | 用途             |
| --------------------------- | ----------------------------------------------- | ---------------- |
| Phase 2 YAML サンプル       | `outputs/phase-2/yaml-sample.yml`               | 実装テンプレート |
| Phase 4 テスト仕様書        | `outputs/phase-4/test-specification.md`         | 実装後の確認基準 |
| CI ワークフロー             | `.github/workflows/ci.yml`                      | 実装対象ファイル |
| pnpm インストールアクション | `.github/actions/pnpm-install-retry/action.yml` | outputs 名称確認 |
| phase 4 成果物              | `outputs/phase-4/ci-execution-plan.md`          | Phase 4 成果物   |

## 実行手順

1. `.github/workflows/ci.yml` の現在の内容を確認する
2. Phase 1 で特定したキャッシュステップに `id` を追加する（Task 5-A）
3. Phase 2 の YAML サンプルを元に判定ステップを実装する（Task 5-B）
4. 全対象ジョブに判定ステップを追加する（Task 5-C）
5. 実装差分を記録する（Task 5-D）
6. 成果物を `outputs/phase-5/` に保存する

## 成果物

| 成果物名         | 保存先                                      | 説明                           |
| ---------------- | ------------------------------------------- | ------------------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 変更内容・差分・影響範囲の記録 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルのパス一覧     |

## 完了条件

- [ ] `.github/workflows/ci.yml` の全対象ジョブにキャッシュヒット率判定ステップが追加されている
- [ ] 全キャッシュステップに `id` が設定されている
- [ ] Task 5-B の実装チェックリストが全て ✅
- [ ] Task 5-C の全対象ジョブが「追加済み」
- [ ] 実装差分テーブル（Task 5-D）が記録されている
- [ ] 成果物 2 件が `outputs/phase-5/` に保存されている
