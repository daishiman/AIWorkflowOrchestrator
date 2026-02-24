# Phase 2 成果物: 設計書 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue      | #875                                |
| Phase      | 2（設計）                           |
| 作成日     | 2026-02-24                          |
| 前提Phase  | Phase 1（要件定義）完了済み         |
| ステータス | completed                           |

## 目的

Phase 1 で定義した FR-1〜FR-4 / NFR-1〜NFR-4 を実現するためのアーキテクチャ・技術選定・インターフェース設計を行う。vite-tsconfig-paths プラグイン導入 vs 既存スクリプト拡張の比較検討を中心に、変更対象ファイルと実装方針を決定する。

---

## 設計方針: 2パターン比較

### パターン A（推奨）: vite-tsconfig-paths プラグイン導入

**前提**: Phase 5 で実施するプラグイン評価基準6項目を全て PASS した場合

#### アーキテクチャ概要

```
┌──────────────────────────────────────────────────────┐
│ tsconfig.json (compilerOptions.paths)                │  ← 単一正本（層2）
│   @repo/shared → ../../packages/shared/index.ts     │
│   @repo/shared/types → ...                           │
│   ...（27エントリ）                                  │
└──────────────┬───────────────────────────────────────┘
               │ vite-tsconfig-paths プラグインが自動読み込み
               ▼
┌──────────────────────────────────────────────────────┐
│ vitest.config.ts (plugins: [tsconfigPaths()])        │  ← 層3: 自動生成
│   resolve.alias: {                                   │
│     "@": ...,  "@renderer": ...,  "@main": ...,      │  ← 手動残留（3件）
│     "@anthropic-ai/claude-agent-sdk": ...            │  ← モック残留（1件）
│   }                                                  │
└──────────────────────────────────────────────────────┘
```

#### vitest.config.ts 変更後の構造

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // ...既存設定は変更なし
  },
  resolve: {
    alias: {
      // プロジェクト内部 alias（tsconfig paths で解決されないもの）
      "@": resolve(__dirname, "src"),
      "@renderer": resolve(__dirname, "src/renderer"),
      "@main": resolve(__dirname, "src/main"),
      // テスト用モック（tsconfig paths とは無関係）
      "@anthropic-ai/claude-agent-sdk": resolve(
        __dirname,
        "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
      ),
    },
  },
});
```

**削除対象**: `@repo/shared` 系の27手動 alias エントリを全て削除

**残留エントリ**: `@`、`@renderer`、`@main`、`@anthropic-ai/claude-agent-sdk` の4件

#### メリット

- vitest alias の手動管理が不要になる
- サブパス追加時の変更ファイルが 4 → 3 に削減（exports + typesVersions + tsconfig paths）
- tsconfig paths と vitest alias の不整合が構造的に発生しなくなる

#### デメリット

- 新規依存パッケージの追加（`vite-tsconfig-paths`）
- プラグインの内部動作が不透明（パス解決の優先順位が暗黙的）
- `resolve.alias` に手動エントリとプラグイン自動エントリが混在する

---

### パターン B（フォールバック）: 既存スクリプト拡張

**前提**: パターン A の評価基準のいずれかが FAIL した場合

#### 変更内容

| ファイル                              | 変更種別 | 変更内容                                              |
| ------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/vitest.config.ts`       | 変更     | 余剰エントリ削除（該当なし。現状維持）                |
| `package.json`（root）                | 追加     | `scripts` に `"check:module-sync"` を追加             |
| `scripts/check-shared-module-sync.ts` | 変更     | エラーメッセージに修正アクションヒントを追加          |
| `architecture-monorepo.md`            | 追加     | サブパス追加手順セクションを追記（4ファイル編集手順） |

#### メリット

- 新規依存パッケージ不要
- 既存の検証アーキテクチャがそのまま活用可能
- パス解決の動作が明示的で予測可能

#### デメリット

- サブパス追加時に4ファイルの手動編集が必要なまま
- vitest alias の手動管理が継続

---

## 変更対象ファイル一覧（パターン A 最大ケース）

| #   | ファイル                              | 変更種別 | 変更概要                                                                                                        |
| --- | ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `apps/desktop/package.json`           | 変更     | devDependencies に `vite-tsconfig-paths` を追加                                                                 |
| 2   | `apps/desktop/vitest.config.ts`       | 変更     | (1) `import tsconfigPaths` 追加 (2) `plugins` 配列に追加 (3) `resolve.alias` から @repo/shared 系27エントリ削除 |
| 3   | `package.json`（root）                | 変更     | `scripts` に `"check:module-sync"` を追加                                                                       |
| 4   | `scripts/check-shared-module-sync.ts` | 変更     | 第6チェック追加（typesVersions -> exports の逆方向検証）・エラーメッセージ改善                                  |
| 5   | `architecture-monorepo.md`            | 変更     | サブパス追加手順セクションを追記                                                                                |

---

## pnpm スクリプト設計

### ルート package.json への追加

```json
{
  "scripts": {
    "check:module-sync": "tsx scripts/check-shared-module-sync.ts"
  }
}
```

### 設計判断

| 検討事項                     | 決定                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| スクリプト名                 | `check:module-sync`（`check:` プレフィックスで検証系コマンドを統一） |
| 実行ランナー                 | `tsx`（既存 CI ジョブと同一）                                        |
| 引数サポート                 | 不要（現行スクリプトは引数なし）                                     |
| `sync:module-paths` コマンド | 今回スコープ外（自動修正機能は複雑度が高く、別タスクで検討）         |

### CI との整合性

- CI 実行: `pnpm check:module-sync`
- ローカル実行: `pnpm check:module-sync`（内部で同一コマンドを実行）
- 終了コード: 既存の `process.exitCode = 1` がそのまま伝播

---

## 既存スクリプトへの変更設計

### 第6チェック追加: typesVersions -> exports

パターン A / B 共通で、`check-shared-module-sync.ts` に第6チェック（typesVersions -> exports の逆方向検証）を追加する。

```typescript
/**
 * チェック6: typesVersions の各エントリが exports に存在するか検証する。
 */
export function checkTypesVersionsVsExports(
  typesVersions: Map<string, string[]>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  const missing: string[] = [];
  for (const tvKey of typesVersions.keys()) {
    const subpath = `./${tvKey}`;
    if (!exportsMap.has(subpath)) {
      missing.push(tvKey);
    }
  }
  return {
    checkName: "typesVersions -> exports",
    passed: missing.length === 0,
    missing,
  };
}
```

### エラーメッセージ改善設計

`formatReport()` 関数の出力を拡張し、失敗時に修正アクションヒントを表示する。

```
  Check 3: exports -> aliases (FAILED)
   Missing: ./types/new-module
   Action: Add "@repo/shared/types/new-module" to apps/desktop/vitest.config.ts resolve.alias
           (or install vite-tsconfig-paths plugin to auto-resolve from tsconfig.json)
```

変更対象: `scripts/check-shared-module-sync.ts` の `formatReport()` 関数

### alias 0件時のスキップ設計

パターン A（プラグイン導入）の場合、`@repo/shared` 系の vitest alias が0件になる。この場合:

- チェック3（exports -> aliases）: SKIP（alias 0件のため検証不要）
- チェック4（aliases -> exports）: SKIP（同上）
- SKIP 理由をレポートに出力: `Check 3: exports -> aliases (SKIPPED: no @repo/shared aliases found)`

---

## 運用手順ドキュメント設計

`architecture-monorepo.md` に追記するセクションの構造:

### サブパス追加手順（パターン A: vite-tsconfig-paths 導入済みの場合）

1. `packages/shared/package.json` の `exports` にエントリを追加
2. `packages/shared/package.json` の `typesVersions["*"]` にエントリを追加
3. `apps/desktop/tsconfig.json` の `compilerOptions.paths` にエントリを追加
4. `pnpm check:module-sync` を実行し、全チェックが PASS することを確認

### サブパス追加手順（パターン B: 手動 alias 管理の場合）

1〜3 はパターン A と同じ 4. `apps/desktop/vitest.config.ts` の `resolve.alias` にエントリを追加

- エントリの順序規則: より長い（詳細な）パスを先に定義する

5. `pnpm check:module-sync` を実行し、全チェックが PASS することを確認

---

## 設計トレードオフ分析

| 観点               | パターン A（プラグイン導入）           | パターン B（既存スクリプト拡張）         |
| ------------------ | -------------------------------------- | ---------------------------------------- |
| 保守コスト         | 低（サブパス追加時の変更3ファイル）    | 高（サブパス追加時の変更4ファイル）      |
| 新規依存           | 1パッケージ追加（vite-tsconfig-paths） | 追加なし                                 |
| 動作の透明性       | 低（プラグインの暗黙的パス解決）       | 高（明示的な alias 定義）                |
| 既存テスト影響     | 要検証（224件全件 PASS が条件）        | 影響最小（現状維持）                     |
| 実装複雑度         | 低（設定変更のみ）                     | 中（エラーメッセージ改善 + 第6チェック） |
| CI への影響        | なし（check-module-sync は継続）       | なし                                     |
| デバッグ容易性     | 低（プラグイン内部の動作が不透明）     | 高（alias 定義が明示的）                 |
| コミュニティ採用率 | 高（vite-tsconfig-paths は広く使用）   | 該当なし                                 |

**推奨**: パターン A を Phase 5 で試行し、評価基準6項目を全て満たさない場合にパターン B にフォールバックする。

---

## 完了条件チェックリスト

- [x] パターン A / B の設計が両方記載されている
- [x] 推奨パターンが明示されている（パターン A）
- [x] 変更対象ファイル一覧（最大5ファイル）が列挙されている
- [x] vitest.config.ts の変更後構造（コード例）が記載されている
- [x] 余剰エントリ解消の結果（余剰0件、現状維持）が記載されている
- [x] pnpm スクリプトの名前・実行ランナー・引数サポートが決定されている
- [x] 運用手順ドキュメントの構造（パターン A/B 分岐）が記載されている
- [x] 設計トレードオフ分析（8観点）が記載されている
- [x] 既存テスト（224件 + 43件）への影響分析が記載されている
- [x] 第6チェック（typesVersions -> exports）の追加設計が記載されている
