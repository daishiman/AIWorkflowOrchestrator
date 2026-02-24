# Phase 2: 設計 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 2                                   |
| 機能名    | vitest-tsconfig-paths-sync          |
| 作成日    | 2026-02-24                          |
| タスクID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 前提Phase | Phase 1（要件定義）完了済み         |

## 目的

Phase 1 で定義した FR-1〜FR-4 / NFR-1〜NFR-4 を実現するためのアーキテクチャ・技術選定・インターフェース設計を行う。vitest-tsconfig-paths プラグイン導入 vs 既存スクリプト拡張の比較検討を中心に、変更対象ファイルと実装方針を決定する。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 技術選定（vitest-tsconfig-paths プラグイン評価）

`vite-tsconfig-paths` プラグインを実際にインストールし、Phase 1 の評価基準6項目に基づいて導入可否を検証する。

### Task 2: 設計方針決定

Task 1 の評価結果に基づき、採用するアプローチ（プラグイン導入 or 既存スクリプト拡張）を決定し、詳細設計を行う。

### Task 3: 変更対象ファイル一覧とインターフェース設計

変更が必要な全ファイルを列挙し、各ファイルの変更内容を設計する。

## 参照資料

| 資料                   | パス                                                                          | 用途                           |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                                             | FR/NFR/受入基準の参照          |
| 既存チェックスクリプト | `scripts/check-shared-module-sync.ts`                                         | 拡張対象のインターフェース確認 |
| vitest設定（desktop）  | `apps/desktop/vitest.config.ts`                                               | 変更対象の現状確認             |
| tsconfig（desktop）    | `apps/desktop/tsconfig.json`                                                  | paths 定義の参照               |
| package.json（shared） | `packages/shared/package.json`                                                | exports / typesVersions 参照   |
| package.json（root）   | `package.json`                                                                | pnpm スクリプト追加対象        |
| 三層アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | 運用手順追記対象               |
| 品質要件仕様           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト/カバレッジ基準確認      |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`      | CI運用との整合確認             |
| 開発ガイドライン       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | スクリプト運用ルール確認       |

## 実行手順

### Step 1: vitest-tsconfig-paths プラグイン技術評価

#### 1-1. プラグインの概要

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| パッケージ名   | `vite-tsconfig-paths`                                                           |
| npm レジストリ | https://www.npmjs.com/package/vite-tsconfig-paths                               |
| 機能           | tsconfig.json の `compilerOptions.paths` を Vite/Vitest の alias として自動解決 |
| Vitest 互換性  | Vitest は Vite ベースのため `plugins` 配列に追加するだけで動作                  |

#### 1-2. 評価手順

1. `pnpm --filter @repo/desktop add -D vite-tsconfig-paths` でインストール
2. `apps/desktop/vitest.config.ts` の `plugins` 配列に `tsconfigPaths()` を追加
3. `resolve.alias` から `@repo/shared` 系の26エントリを削除（`@`, `@renderer`, `@main`, `@anthropic-ai/claude-agent-sdk` は残留）
4. 全テストを実行し、224件が全て PASS することを確認
5. 失敗した場合、失敗理由を記録し代替案（既存スクリプト拡張）に移行

#### 1-3. 評価基準マトリクス

| #   | 評価項目               | 評価方法                                                           | 合否判定  |
| --- | ---------------------- | ------------------------------------------------------------------ | --------- |
| 1   | tsconfig paths 参照    | `tsconfigPaths()` プラグイン追加後にテスト実行                     | PASS/FAIL |
| 2   | サブパスエイリアス対応 | `@repo/shared/types/llm` 等のネストパスのテストが PASS             | PASS/FAIL |
| 3   | 既存テスト互換性       | 224テスト全件 PASS（module-resolution 57 + shared 59 + alias 108） | PASS/FAIL |
| 4   | happy-dom 互換性       | テスト環境 `happy-dom` でエラーが発生しない                        | PASS/FAIL |
| 5   | monorepo 構成対応      | pnpm workspace のシンボリックリンクで正しくパス解決                | PASS/FAIL |
| 6   | パフォーマンス         | テスト実行時間が現行比 +10% 以内                                   | PASS/FAIL |

### Step 2: 設計方針（2パターン）

#### パターン A: vite-tsconfig-paths プラグイン導入（推奨）

**前提**: Step 1 の評価基準6項目を全て PASS した場合

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

**変更内容**:

| ファイル                        | 変更種別 | 変更内容                                                                                                          |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/package.json`     | 追加     | devDependencies に `vite-tsconfig-paths` を追加                                                                   |
| `apps/desktop/vitest.config.ts` | 変更     | (1) `import tsconfigPaths` 追加 (2) `plugins` 配列に追加 (3) `resolve.alias` から @repo/shared 系26エントリを削除 |
| `package.json`（root）          | 追加     | `scripts` に `"check:module-sync"` を追加                                                                         |
| `architecture-monorepo.md`      | 追加     | サブパス追加手順セクションを追記                                                                                  |

**vitest.config.ts 変更後の構造**:

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

**メリット**:

- vitest alias の手動管理が不要になる（サブパス追加時の変更ファイルが4→2に減少）
- tsconfig paths と vitest alias の不整合が構造的に発生しなくなる
- check-shared-module-sync.ts のチェック3・チェック4（exports↔aliases）が不要になる可能性がある

**デメリット**:

- 新規依存パッケージの追加（`vite-tsconfig-paths`）
- プラグインの内部動作が不透明（パス解決の優先順位が暗黙的）
- `resolve.alias` に手動エントリとプラグイン自動エントリが混在する

#### パターン B: 既存スクリプト拡張（フォールバック）

**前提**: Step 1 の評価基準のいずれかが FAIL した場合

**変更内容**:

| ファイル                              | 変更種別 | 変更内容                                              |
| ------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/vitest.config.ts`       | 変更     | 余剰エントリ（types/auth, types/api-keys）を削除      |
| `package.json`（root）                | 追加     | `scripts` に `"check:module-sync"` を追加             |
| `scripts/check-shared-module-sync.ts` | 変更     | エラーメッセージに修正アクションヒントを追加          |
| `architecture-monorepo.md`            | 追加     | サブパス追加手順セクションを追記（4ファイル編集手順） |

**メリット**:

- 新規依存パッケージ不要
- 既存の検証アーキテクチャがそのまま活用可能
- パス解決の動作が明示的で予測可能

**デメリット**:

- サブパス追加時に4ファイルの手動編集が必要なまま
- vitest alias の手動管理が継続

### Step 3: vitest alias 余剰エントリ解消設計

#### 対象エントリ

| alias キー                    | vitest.config.ts の行 | exports に存在するか | 対処方針                       |
| ----------------------------- | --------------------- | -------------------- | ------------------------------ |
| `@repo/shared/types/auth`     | L159-162              | 確認必要             | exports に存在しない場合は削除 |
| `@repo/shared/types/api-keys` | L155-158              | 確認必要             | exports に存在しない場合は削除 |

#### 削除前確認手順

1. `grep -rn "from ['\"]@repo/shared/types/auth['\"]" apps/desktop/src/` で使用箇所を検索
2. `grep -rn "from ['\"]@repo/shared/types/api-keys['\"]" apps/desktop/src/` で使用箇所を検索
3. 使用箇所が存在する場合:
   - 代替パス（例: `@repo/shared/types` からの re-export）が利用可能か確認
   - 利用可能な場合、import パスを代替パスに変更してからエントリを削除
   - 利用不可能な場合、exports / typesVersions / paths に当該エントリを追加して三層を同期させる
4. 使用箇所が存在しない場合: 安全に削除可能

### Step 4: pnpm スクリプト設計

#### ルート package.json への追加

```json
{
  "scripts": {
    "check:module-sync": "tsx scripts/check-shared-module-sync.ts"
  }
}
```

#### 設計判断

| 検討事項                     | 決定                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| スクリプト名                 | `check:module-sync`（`check:` プレフィックスで検証系コマンドを統一） |
| 実行ランナー                 | `tsx`（既存 CI ジョブと同一）                                        |
| 引数サポート                 | 不要（現行スクリプトは引数なし）                                     |
| `sync:module-paths` コマンド | 今回スコープ外（自動修正機能は複雑度が高く、別タスクで検討）         |

### Step 5: 運用手順ドキュメント設計

`architecture-monorepo.md` に追記するセクションの構造：

```markdown
### サブパス追加手順

#### 前提条件

- `packages/shared` に新しいモジュールファイルが作成済み

#### 手順（パターン A: vite-tsconfig-paths 導入済みの場合）

1. `packages/shared/package.json` の `exports` にエントリを追加
2. `packages/shared/package.json` の `typesVersions["*"]` にエントリを追加
3. `apps/desktop/tsconfig.json` の `compilerOptions.paths` にエントリを追加
4. `pnpm check:module-sync` を実行し、全チェックが PASS することを確認

#### 手順（パターン B: 手動 alias 管理の場合）

1〜3 は パターン A と同じ 4. `apps/desktop/vitest.config.ts` の `resolve.alias` にエントリを追加

- エントリの順序規則: より長い（詳細な）パスを先に定義する

5. `pnpm check:module-sync` を実行し、全チェックが PASS することを確認
```

### Step 6: 既存スクリプトへの変更設計（パターン A の場合）

パターン A（プラグイン導入）の場合、`check-shared-module-sync.ts` に以下の変更を検討する：

| 変更内容                           | 必要性            | 理由                                                                                             |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| チェック3/4（exports↔aliases）削除 | 条件付き          | プラグインが alias を自動生成するなら不要。ただし vitest.config.ts に手動 alias が残る場合は保持 |
| エラーメッセージ改善               | パターン A/B 共通 | 修正アクションのヒント（どのファイルの何を追加すべきか）を表示                                   |
| チェック結果のJSON出力             | 今回スコープ外    | 複雑度が高く、現行のテキスト出力で十分                                                           |

**判断**: プラグイン導入後も `@repo/shared` 系のエントリが vitest alias に残留する可能性がある（プラグインとの競合回避のため）。そのため、チェック3/4 は削除せず保持する。プラグイン導入により alias エントリ数が0になった場合のみ、チェック3/4 をスキップするロジックを追加する。

### Step 7: エラーメッセージ改善設計

`formatReport()` 関数の出力を拡張し、失敗時に修正アクションを表示する：

```
  Check 3: exports -> aliases (FAILED)
   Missing: ./types/new-module
   Action: Add "@repo/shared/types/new-module" to apps/desktop/vitest.config.ts resolve.alias
           (or install vite-tsconfig-paths plugin to auto-resolve from tsconfig.json)
```

変更対象: `scripts/check-shared-module-sync.ts` の `formatReport()` 関数

## 統合テスト連携

| 連携観点           | 実施内容                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| スクリプト単体連携 | `scripts/__tests__/check-shared-module-sync.test.ts` との整合を確認する    |
| desktop テスト連携 | `apps/desktop` のテストで alias 解決が維持される前提を設計に反映する       |
| CIジョブ連携       | `check-module-sync` とローカル `pnpm check:module-sync` の同値性を担保する |

## 多角的チェック観点

| 観点                | 適用判断 | 仕様参照先                                                                    |
| ------------------- | -------- | ----------------------------------------------------------------------------- |
| アーキテクチャ      | 必須     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  |
| 品質/テスタビリティ | 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   |
| CI/CD               | 必須     | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`      |
| エラーハンドリング  | 条件付き | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         |
| 運用保守性          | 必須     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |

---

## 設計トレードオフ分析

| 観点           | パターン A（プラグイン導入）        | パターン B（既存スクリプト拡張）    |
| -------------- | ----------------------------------- | ----------------------------------- |
| 保守コスト     | 低（サブパス追加時の変更2ファイル） | 高（サブパス追加時の変更4ファイル） |
| 新規依存       | 1パッケージ追加                     | 追加なし                            |
| 動作の透明性   | 低（プラグインの暗黙的パス解決）    | 高（明示的な alias 定義）           |
| 既存テスト影響 | 要検証（224件全件 PASS が条件）     | 影響最小（余剰エントリ削除のみ）    |
| 実装複雑度     | 低（設定変更のみ）                  | 中（エラーメッセージ改善）          |
| CI への影響    | なし（check-module-sync は継続）    | なし                                |

**推奨**: パターン A を試行し、評価基準を全て満たさない場合にパターン B にフォールバックする。

---

## 変更対象ファイル一覧（パターン A 最大ケース）

| #   | ファイル                              | 変更種別 | 変更概要                            |
| --- | ------------------------------------- | -------- | ----------------------------------- |
| 1   | `apps/desktop/package.json`           | 変更     | devDependencies に追加              |
| 2   | `apps/desktop/vitest.config.ts`       | 変更     | プラグイン追加・alias 削減          |
| 3   | `package.json`（root）                | 変更     | scripts に check:module-sync 追加   |
| 4   | `scripts/check-shared-module-sync.ts` | 変更     | エラーメッセージ改善・alias 0件対応 |
| 5   | `architecture-monorepo.md`            | 変更     | サブパス追加手順セクション追記      |

## 成果物

| 成果物           | パス                                 | 説明                            |
| ---------------- | ------------------------------------ | ------------------------------- |
| 設計書（本文書） | `outputs/phase-2/design-document.md` | 本文書を成果物としてコピー      |
| 技術評価結果     | `outputs/phase-2/tech-evaluation.md` | プラグイン評価の PASS/FAIL 記録 |

## 完了条件

- [ ] vitest-tsconfig-paths プラグインの評価基準6項目の結果（PASS/FAIL）が記録されている
- [ ] パターン A / B の設計が両方記載されている
- [ ] 推奨パターンが明示されている
- [ ] 変更対象ファイル一覧（最大5ファイル）が列挙されている
- [ ] vitest.config.ts の変更後構造（コード例）が記載されている
- [ ] 余剰エントリ解消の手順（削除前確認 → 削除 → 検証）が記載されている
- [ ] pnpm スクリプトの名前・実行ランナー・引数サポートが決定されている
- [ ] 運用手順ドキュメントの構造（パターン A/B 分岐）が記載されている
- [ ] 設計トレードオフ分析（6観点以上）が記載されている
- [ ] 既存テスト（224件）への影響分析が記載されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
