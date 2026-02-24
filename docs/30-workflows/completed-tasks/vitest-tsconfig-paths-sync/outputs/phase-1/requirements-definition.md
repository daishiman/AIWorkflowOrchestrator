# Phase 1 成果物: 要件定義書 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue      | #875                                |
| Phase      | 1（要件定義）                       |
| 作成日     | 2026-02-24                          |
| 分類       | 改善（小規模）                      |
| ステータス | completed                           |

## 目的

`packages/shared` の三層モジュール解決アーキテクチャ（exports / tsconfig paths / vitest alias）において、vitest alias の手動同期を自動化し、サブパス追加時の運用負荷を削減する。具体的には以下の4点を実現する。

1. `vite-tsconfig-paths` プラグイン導入評価と、手動 alias 定義の自動化検討
2. vitest alias の余剰エントリ解消（現状分析で余剰なしと判明）
3. `pnpm check:module-sync` スクリプト追加による開発者体験向上
4. サブパス追加時の運用手順ドキュメント化

---

## 機能要件

### FR-1: vite-tsconfig-paths プラグイン導入評価

**説明**: `vite-tsconfig-paths` プラグインを `apps/desktop/vitest.config.ts` に導入し、`tsconfig.json` の `compilerOptions.paths` から vitest alias を自動生成する方式の導入可否を評価する。

**評価基準（6項目）**:

| #   | 評価項目                | 合格基準                                                                 |
| --- | ----------------------- | ------------------------------------------------------------------------ |
| 1   | tsconfig paths 参照機能 | `tsconfig.json` の `compilerOptions.paths` を自動読み込みし alias を生成 |
| 2   | サブパスエイリアス対応  | `@repo/shared/types/llm` 形式のネストパスを正しく解決                    |
| 3   | 既存テスト互換性        | 既存の224テスト全件が変更なしで PASS                                     |
| 4   | happy-dom 環境互換性    | `environment: "happy-dom"` 設定との競合が発生しない                      |
| 5   | monorepo 構成対応       | pnpm workspace のシンボリックリンク構成で動作                            |
| 6   | パフォーマンス影響      | テスト実行時間の増加が10%以内                                            |

**受入基準**:

- [ ] AC-1-1: プラグイン導入後、`resolve.alias` から `@repo/shared` 系の27エントリを全て削除できる
- [ ] AC-1-2: プラグイン導入後、既存224テスト（module-resolution 57件 + shared-module-resolution 59件 + vitest-alias-consistency 108件）が全件 PASS
- [ ] AC-1-3: `@anthropic-ai/claude-agent-sdk` のモック alias はプラグイン導入後も `resolve.alias` に残留可能
- [ ] AC-1-4: `@`, `@renderer`, `@main` のプロジェクト内部 alias はプラグイン導入後も正常に動作
- [ ] AC-1-5: プラグイン非導入と判断した場合、代替案（既存スクリプト拡張）の設計方針が文書化されている

**評価結果に応じた分岐**:

- **導入可能**: 評価基準6項目を全て PASS した場合、プラグインを導入する
- **導入不可**: いずれかの基準を満たさない場合、既存の `check-shared-module-sync.ts` を拡張する

### FR-2: vitest alias 余剰エントリの解消

**説明**: vitest alias に存在するが exports に存在しない余剰エントリを特定し、削除による三層の完全同期を実現する。

**現状分析結果**: `types/auth` と `types/api-keys` は `exports` に存在するため、余剰エントリではない。現時点で三層は同期済みである（ALL 5 CHECKS PASSED）。

**受入基準**:

- [ ] AC-2-1: `@repo/shared/types/auth` が exports に存在するため残留させる（確認済み）
- [ ] AC-2-2: `@repo/shared/types/api-keys` が exports に存在するため残留させる（確認済み）
- [ ] AC-2-3: `scripts/check-shared-module-sync.ts` のチェック4（aliases -> exports）が PASS する
- [ ] AC-2-4: vitest alias の全エントリが exports と一致していることを `grep -rn` で確認
- [ ] AC-2-5: 余剰エントリを import しているプロダクションコードが存在しないことを確認

### FR-3: pnpm check:module-sync スクリプト追加

**説明**: 開発者がモジュール同期チェックを簡単に実行できるよう、ルート `package.json` に pnpm スクリプトを追加する。

**受入基準**:

- [ ] AC-3-1: `pnpm check:module-sync` でプロジェクトルートから `scripts/check-shared-module-sync.ts` を実行できる
- [ ] AC-3-2: 終了コードが整合性チェック結果に応じて 0（PASS）または 1（FAIL）を返す
- [ ] AC-3-3: CI 環境（`.github/workflows/ci.yml` の `check-module-sync` ジョブ）と同じ結果を返す

### FR-4: サブパス追加時の運用手順ドキュメント化

**説明**: `@repo/shared` に新しいサブパスを追加する際に必要な操作手順を、仕様書（`architecture-monorepo.md`）に反映する。

**受入基準**:

- [ ] AC-4-1: 以下の手順が漏れなく記載: (1) exports 追加、(2) typesVersions 追加、(3) tsconfig paths 追加、(4) vitest alias 追加（プラグイン導入時は不要）
- [ ] AC-4-2: 各ステップで編集するファイルパスが明記されている
- [ ] AC-4-3: `pnpm check:module-sync` による検証手順が記載されている
- [ ] AC-4-4: FR-1 の評価結果（プラグイン導入 or 手動管理）に応じた手順分岐が記載されている

---

## 非機能要件

### NFR-1: パフォーマンス

| 指標                             | 基準値           | 測定方法                                     |
| -------------------------------- | ---------------- | -------------------------------------------- |
| チェックスクリプト実行時間       | 5秒以内          | `time pnpm check:module-sync`                |
| プラグイン導入時のテスト実行時間 | 現行比 +10% 以内 | 全テスト実行時間の before/after 比較         |
| CI ジョブ実行時間                | 2分以内          | GitHub Actions の `check-module-sync` ジョブ |

### NFR-2: 保守性

- 新規サブパス追加時に変更するファイル数:
  - プラグイン導入時: 3ファイル以下（exports + typesVersions + tsconfig paths）
  - 非導入時: 4ファイル以下（exports + typesVersions + tsconfig paths + vitest alias）
- 既存テスト（224件 + 43件）の変更: 0件（余剰エントリ削除による破壊がないことを確認）

### NFR-3: 後方互換性

- 既存の `scripts/check-shared-module-sync.ts` のエクスポート API は変更しない
- CI ジョブ `check-module-sync` の振る舞い（PASS/FAIL 条件）を変更しない
- 既存の5つのチェック関数のインターフェースを変更しない

### NFR-4: 開発者体験

- `pnpm check:module-sync` コマンドで CI と同じ検証をローカルで実行可能にする
- エラーメッセージに具体的な修正アクションヒント（どのファイルのどのセクションを修正すべきか）を含める

---

## 完了条件チェックリスト

- [x] 機能要件が4件定義されている（FR-1〜FR-4）
- [x] 非機能要件が4件定義されている（NFR-1〜NFR-4）
- [x] 全ての受入基準が検証可能な形式（具体的な数値・コマンド・条件）で記載されている
- [x] vite-tsconfig-paths プラグインの導入評価基準（6項目）が定義されている
- [x] 余剰エントリ（types/auth, types/api-keys）の取り扱い方針が明確（exports に存在するため残留）
- [x] 既存224テストへの影響が「0件変更」であることが要件に含まれている
