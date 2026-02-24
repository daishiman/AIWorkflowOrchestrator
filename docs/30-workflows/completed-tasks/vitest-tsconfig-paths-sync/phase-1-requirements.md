# Phase 1: 要件定義 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 1                                   |
| 機能名   | vitest-tsconfig-paths-sync          |
| 作成日   | 2026-02-24                          |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue    | #875                                |
| 分類     | 改善（小規模）                      |

## 目的

`packages/shared` の三層モジュール解決アーキテクチャ（exports / tsconfig paths / vitest alias）において、以下の残課題を解決するための要件を定義する：

1. vitest-tsconfig-paths プラグイン導入評価と手動 alias 定義の自動化検討
2. vitest alias の余剰エントリ（`types/auth`, `types/api-keys`）解消
3. サブパス追加時の運用手順ドキュメント化
4. pnpm スクリプト追加による開発者体験向上

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 現状の不整合分析

既存の `scripts/check-shared-module-sync.ts` を実行し、現時点での不整合状態を定量的に記録する。

### Task 2: 機能要件定義

4つのスコープについて、検証可能な受入基準を持つ機能要件を定義する。

### Task 3: 非機能要件定義

パフォーマンス・保守性・後方互換性に関する非機能要件を定義する。

## 参照資料

| 資料                   | パス                                                                          | 用途                                         |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| 三層アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | 三層モジュール解決の正本                     |
| 品質要件仕様           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | alias 管理ルール・品質ゲート                 |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`      | CI ジョブ構成                                |
| CIワークフロー仕様     | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`         | GitHub Actions 運用の正本                    |
| 開発ガイドライン       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コマンド運用・命名/保守性ルール              |
| 既存チェックスクリプト | `scripts/check-shared-module-sync.ts`                                         | 5つのチェック関数の実装                      |
| 既存テスト             | `scripts/__tests__/check-shared-module-sync.test.ts`                          | 43件のテスト                                 |
| CI設定                 | `.github/workflows/ci.yml`                                                    | check-module-sync ジョブ（L220-244）         |
| package.json（shared） | `packages/shared/package.json`                                                | exports / typesVersions（27エントリ）        |
| tsconfig（desktop）    | `apps/desktop/tsconfig.json`                                                  | paths（27エントリ + ワイルドカード2件）      |
| vitest設定（desktop）  | `apps/desktop/vitest.config.ts`                                               | alias（29エントリ: @repo/shared 26 + 内部3） |

## 実行手順

### Step 1: 現状分析

1. `pnpm check:module-sync` を実行し、5つのチェック結果を記録する
2. vitest alias のエントリ一覧を抽出し、exports に存在しない余剰エントリを特定する
3. 余剰エントリが `types/auth` と `types/api-keys` の2件であることを確認する

### Step 2: vitest-tsconfig-paths プラグイン評価基準の定義

以下の観点で導入可否を判断するための基準を定義する：

| 評価項目                | 合格基準                                                  |
| ----------------------- | --------------------------------------------------------- |
| tsconfig paths 参照機能 | `tsconfig.json` の `compilerOptions.paths` を自動読み込み |
| サブパスエイリアス対応  | `@repo/shared/types/llm` 形式のネストパスを正しく解決     |
| 既存テスト互換性        | 既存の224テスト全件が変更なしで PASS                      |
| happy-dom 環境互換性    | `environment: "happy-dom"` 設定との競合が発生しない       |
| monorepo 構成対応       | pnpm workspace のシンボリックリンク構成で動作             |
| パフォーマンス影響      | テスト実行時間の増加が10%以内                             |

### Step 3: 機能要件定義

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| モジュール同期   | `exports` / `typesVersions` / `paths` / `vitest alias` の4層整合を `pnpm check:module-sync` で検証 |
| CI連携           | `.github/workflows/ci.yml` の `check-module-sync` ジョブで同一チェックを実行                       |
| 回帰テスト連携   | `scripts/__tests__/check-shared-module-sync.test.ts`（43件）との互換性を維持                       |

## 多角的チェック観点

| 観点                | 適用判断 | 仕様参照先                                                                                |
| ------------------- | -------- | ----------------------------------------------------------------------------------------- |
| アーキテクチャ      | 必須     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              |
| 品質/テスタビリティ | 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`               |
| CI/CD               | 必須     | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`                  |
| 運用手順            | 必須     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`             |
| エラーハンドリング  | 条件付き | `.claude/skills/aiworkflow-requirements/references/error-handling.md`（出力改善時に適用） |

---

## 機能要件

### FR-1: vitest-tsconfig-paths プラグイン導入評価

**説明**: `vite-tsconfig-paths`（または同等プラグイン）を vitest.config.ts に導入し、tsconfig.json の paths から vitest alias を自動生成する方式の導入可否を評価する。

**受入基準**:

- [ ] AC-1-1: プラグイン導入後、`apps/desktop/vitest.config.ts` の `resolve.alias` から `@repo/shared` 系の26エントリを全て削除できる
- [ ] AC-1-2: プラグイン導入後、既存の224テスト（module-resolution 57件 + shared-module-resolution 59件 + vitest-alias-consistency 108件）が全件 PASS する
- [ ] AC-1-3: `@anthropic-ai/claude-agent-sdk` のモック alias（テスト用）はプラグイン導入後も `resolve.alias` に残留可能である
- [ ] AC-1-4: `@`, `@renderer`, `@main` のプロジェクト内部 alias はプラグイン導入後も正常に動作する
- [ ] AC-1-5: プラグイン非導入と判断した場合、代替案（既存スクリプト拡張）の設計方針が文書化されている

**評価結果に応じた分岐**:

- **導入可能**: FR-1 の受入基準を全て満たす場合、プラグインを導入する
- **導入不可**: いずれかの基準を満たさない場合、既存の `check-shared-module-sync.ts` を拡張する

### FR-2: vitest alias 余剰エントリの解消

**説明**: vitest alias に存在するが exports に存在しない余剰エントリを削除し、三層の完全同期を実現する。

**受入基準**:

- [ ] AC-2-1: `@repo/shared/types/auth` が exports に存在する場合は残留、存在しない場合は vitest alias から削除する
- [ ] AC-2-2: `@repo/shared/types/api-keys` が exports に存在する場合は残留、存在しない場合は vitest alias から削除する
- [ ] AC-2-3: 削除後、`scripts/check-shared-module-sync.ts` のチェック4（aliases → exports）が PASS する
- [ ] AC-2-4: 削除したエントリを import しているテストファイルが存在しないことを `grep -rn` で確認する
- [ ] AC-2-5: 削除したエントリを import しているプロダクションコードが存在しないことを `grep -rn` で確認する

### FR-3: pnpm スクリプト追加

**説明**: 開発者がモジュール同期チェックを簡単に実行できるよう、pnpm スクリプトを追加する。

**受入基準**:

- [ ] AC-3-1: `pnpm check:module-sync` でプロジェクトルートから `scripts/check-shared-module-sync.ts` を実行できる
- [ ] AC-3-2: 終了コードが整合性チェック結果に応じて 0（PASS）または 1（FAIL）を返す
- [ ] AC-3-3: スクリプトは CI 環境（`.github/workflows/ci.yml`）の `check-module-sync` ジョブと同じ結果を返す

### FR-4: サブパス追加時の運用手順ドキュメント

**説明**: `@repo/shared` に新しいサブパスを追加する際に必要な操作手順を、仕様書（`architecture-monorepo.md`）に反映する。

**受入基準**:

- [ ] AC-4-1: 以下の4ステップが漏れなく記載されている：(1) exports 追加、(2) typesVersions 追加、(3) tsconfig paths 追加、(4) vitest alias 追加（プラグイン導入時は不要）
- [ ] AC-4-2: 各ステップで編集するファイルパスが明記されている
- [ ] AC-4-3: `pnpm check:module-sync` による検証手順が記載されている
- [ ] AC-4-4: FR-1 の評価結果（プラグイン導入 or 手動管理）に応じた手順分岐が記載されている

---

## 非機能要件

### NFR-1: パフォーマンス

| 指標                             | 基準値         | 測定方法                                     |
| -------------------------------- | -------------- | -------------------------------------------- |
| チェックスクリプト実行時間       | 5秒以内        | `time pnpm check:module-sync`                |
| プラグイン導入時のテスト実行時間 | 現行比+10%以内 | 全テスト実行時間の before/after 比較         |
| CI ジョブ実行時間                | 2分以内        | GitHub Actions の `check-module-sync` ジョブ |

### NFR-2: 保守性

- 新規サブパス追加時に変更するファイル数: プラグイン導入時は2ファイル以下（exports + typesVersions）、非導入時は4ファイル以下（exports + typesVersions + paths + alias）
- 既存テスト（224件）の変更: 0件（余剰エントリ削除による破壊がないことを確認）

### NFR-3: 後方互換性

- 既存の `scripts/check-shared-module-sync.ts` のエクスポート API は変更しない
- CI ジョブ `check-module-sync` の振る舞い（PASS/FAIL 条件）を変更しない
- 既存の5つのチェック関数のインターフェースを変更しない

### NFR-4: 開発者体験

- `pnpm check:module-sync` コマンドで CI と同じ検証をローカルで実行可能にする
- エラーメッセージに具体的な修正アクション（どのファイルのどのセクションを修正すべきか）を含める

---

## 成果物

| 成果物               | パス                                        | 説明                                 |
| -------------------- | ------------------------------------------- | ------------------------------------ |
| 要件定義書（本文書） | `outputs/phase-1/requirements.md`           | 本文書を成果物としてコピー           |
| 現状分析結果         | `outputs/phase-1/current-state-analysis.md` | チェックスクリプト実行結果と余剰分析 |

## 完了条件

- [ ] 機能要件が4件定義されている（FR-1〜FR-4）
- [ ] 非機能要件が4件定義されている（NFR-1〜NFR-4）
- [ ] 全ての受入基準が検証可能な形式（具体的な数値・コマンド・条件）で記載されている
- [ ] vitest-tsconfig-paths プラグインの導入評価基準（6項目）が定義されている
- [ ] 余剰エントリ（types/auth, types/api-keys）の取り扱い方針が明確である
- [ ] 既存の224テストへの影響が「0件変更」であることが要件に含まれている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 1
```

## 次のPhase

Phase 2: 設計
