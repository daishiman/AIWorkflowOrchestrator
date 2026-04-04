# Phase 2: 設計

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 2                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

Phase 1 で確定した要件に基づき、`postinstall` スクリプト追加の具体的な設計を行い、`rebuild:native` の動作と副作用を分析する。

## アーキテクチャ設計

### native addon の rebuild の仕組み

`better-sqlite3` は C++ で実装された native addon である。`.node` バイナリは ABI に依存するため、読み込みランタイム（Node / Electron）の ABI と一致する形でビルドされている必要がある。

このプロジェクトにはすでに **Node 側の検証と rebuild の正本**が存在する:

- `scripts/setup-native-modules.sh`: `require('better-sqlite3')` の動作確認（Node）と必要時の `pnpm rebuild better-sqlite3`、および `pnpm rebuild esbuild` を実行

一方で、Electron 側の ABI 不一致が疑われる場合、**「どのランタイム向けにビルドされた `.node` が残っているか」**を切り分けないと対策が外れる可能性がある。
このため本タスクでは、Phase 1 で `NODE_ABI` と `ELECTRON_ABI` を採取し、Phase 11 の手動テストで「Electron 実行時に何が起きているか」を確定する。

#### Node 向け rebuild（既存）

`pnpm rebuild better-sqlite3` は、現在の Node.js 環境で `better-sqlite3` のビルド手順（install scripts）を再実行する。

```
1. node-gyp 等のビルド手順が実行される（パッケージ側の scripts に依存）
2. 現在の Node.js ABI / アーキテクチャ向けの `better_sqlite3.node` が生成される
```

`rebuild:native` スクリプトは既に定義済みであり、`better-sqlite3` と `esbuild` の両方を rebuild する:

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)"
```

`esbuild` の rebuild は Electron ABI ではなく **native binary の再構築（主に arch ミスマッチ対策）**として扱う。

#### このタスクで `rebuild:native` が保証する範囲

`rebuild:native` は「今インストールされている Node.js 環境で `pnpm rebuild` を実行する」スクリプトであり、次を狙う:

1. **古い `.node` が残っている状態**（store / worktree / arch 変更など）を、現状の環境へ寄せ直す
2. **Node 側のロード確認（Vitest/Node）**で即座に破綻しているケースを自動で修復する

ただし、`NODE_ABI` と `ELECTRON_ABI` が異なる場合、Node 向け rebuild だけでは Electron 実行時の不一致を完全に解消できない可能性がある。
このリスクは Phase 11 の手動テストで検知し、必要なら Phase 12 の未タスクとして follow-up を formalize する（Phase 1 の前提と整合）。

#### Electron 向け rebuild（必要時のみ）

Phase 1 で採取した `NODE_ABI` と `ELECTRON_ABI` が異なる、または Electron 実行時のみ `NODE_MODULE_VERSION mismatch` が出る場合は、Electron 向けに rebuild する手段が必要になる。

このリポジトリで既に使われている候補:

- `electron-builder install-app-deps`（`apps/desktop` に `electron-builder` が存在する前提）
- `@electron/rebuild`（導入が必要な場合あり）

本タスクのスコープでは、まず「どのランタイムで失敗しているか」を確定し、必要なら follow-up で Electron 向け rebuild を追加する（Phase 8 / Phase 12 の未タスク化で管理）。

### postinstall の動作タイミング

pnpm の `postinstall` フックは `pnpm install` 完了直後に自動実行される:

```
pnpm install
    → node_modules に better-sqlite3@<lock_resolved> を展開（prebuilt / 既存バイナリが残る場合あり）
    → postinstall: pnpm rebuild:native が自動実行
        → better-sqlite3 / esbuild を再構築（Node 側の整合を取り直す）
    → 完了（少なくとも Node 側の native module 整合が取れた状態）
```

### 修正範囲

**単一ファイルへの最小変更**: `apps/desktop/package.json` の `scripts` セクションに `postinstall` エントリを1行追加する。

注意: ルート `package.json` には既に `postinstall` が存在する。`apps/desktop` にも `postinstall` を追加する意図は「filter install / package 単体操作時にも再現可能な修復手段を走らせる」ことに限定し、二重実行の副作用（時間増）を許容するかを Phase 3 でゲート判定する。

## 変更設計

### 変更対象ファイル

| ファイル                    | 変更内容                                                   | 理由                                                                         |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/desktop/package.json` | `scripts` に `"postinstall": "pnpm rebuild:native"` を追加 | pnpm install 後に自動的に rebuild:native を実行して ABI 不一致を解消するため |

### 変更詳細

**変更前** (`apps/desktop/package.json` の `scripts` セクション、抜粋):

```json
"scripts": {
  "dev": "electron-vite dev",
  "build": "electron-vite build",
  "preview": "electron-vite preview",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  ...
  "rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
  "package": "electron-builder --config electron-builder.yml",
  ...
}
```

**変更後** (`apps/desktop/package.json` の `scripts` セクション、抜粋):

```json
"scripts": {
  "dev": "electron-vite dev",
  "build": "electron-vite build",
  "preview": "electron-vite preview",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  ...
  "rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
  "postinstall": "pnpm rebuild:native",
  "package": "electron-builder --config electron-builder.yml",
  ...
}
```

### postinstall の配置位置

`rebuild:native` の直後に配置することで、関連するスクリプトがグループ化され可読性が向上する。

### 副作用分析

| シナリオ                                           | 影響                                                                                                | 評価                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm install` 実行時間の増加                      | rebuild:native の実行時間（数十秒）が追加される                                                     | 許容範囲（初回 install 時のみ顕著、CI でも許容範囲） |
| `pnpm --filter @repo/desktop add <package>` 実行時 | postinstall が実行される                                                                            | 許容範囲（既存パッケージの rebuild は冪等）          |
| モノレポルートの `pnpm install`                    | `@repo/desktop` の postinstall も実行される                                                         | 許容範囲                                             |
| CI での `--frozen-lockfile` 使用時                 | postinstall は lockfile に関係なく実行される                                                        | 問題なし                                             |
| `packages/shared` や `apps/web` の install         | それぞれのパッケージに postinstall はないため影響なし                                               | 問題なし                                             |
| electron-builder によるパッケージング              | `package` スクリプトは rebuild:native を呼ばないが、install 時点で rebuild 済みのバイナリを使用する | 問題なし                                             |

### 既存 rebuild:native との関係

`rebuild:native` は既に定義済みのため、`postinstall` は単にそれを呼び出す薄いラッパーとなる。これにより:

1. 開発者が手動で `pnpm --filter @repo/desktop rebuild:native` を実行する場合の動作は変わらない
2. `postinstall` が将来不要になった場合、1行削除するだけで元に戻せる

## テスト戦略

### Phase 4 で作成するテスト

1. **Node 側のロード確認テスト（補助）**: Node/Vitest で `better-sqlite3` を `require()` できることを確認するテスト
2. **DB 接続テスト**: `better-sqlite3` を `require()` してインメモリ DB を開き、簡単な CRUD が動作することを確認するテスト

### Phase 11 で実施する手動テスト

1. `node_modules` を削除して `pnpm install` を実行
2. `postinstall` が自動的に `rebuild:native` を実行することをログで確認
3. Electron を起動し DB 初期化エラーが発生しないことを確認
4. DevTools で `window.electronAPI.invoke('conversation:list')` が正常に返ることを確認

## 依存関係

### 変更に必要な外部依存

なし（既存 `rebuild:native` スクリプトと pnpm の `postinstall` 機能を使用するのみ）

### ビルド環境の前提

- `node-gyp` が動作するビルドツールチェーンが環境にインストールされていること（macOS: Xcode Command Line Tools, Windows: Visual Studio Build Tools）
- （Electron 向け rebuild を実施する場合）Electron のヘッダーファイルのダウンロードが可能なネットワーク環境であること

## 成果物

| 成果物 | パス                                     | 説明                            |
| ------ | ---------------------------------------- | ------------------------------- |
| 設計書 | `outputs/phase-2/architecture-design.md` | 本ドキュメントの outputs コピー |

## 完了条件

- [ ] 変更対象ファイル（package.json）と変更内容（postinstall 追加）が具体的に記述されている
- [ ] postinstall が実行される全シナリオとその副作用が分析されている
- [ ] `rebuild:native` が保証する範囲（Node 向け rebuild）と、`NODE_ABI` / `ELECTRON_ABI` 不一致時の残リスクと扱い（Phase 11 検知 → follow-up）が説明されている
- [ ] テスト戦略（ABI 確認テスト + 手動テスト）が定義されている
