# Phase 5: 実装

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 5                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

再発防止の恒久対策として、`apps/desktop/package.json` に `postinstall` を追加する。

注意: ローカル環境の一時復旧（手動 rebuild / node_modules 削除）は **実装仕様ではなく検証/運用手順**のため、本 Phase では主手順から外し、必要なら補助として末尾に分離する。

## 実装手順

### Step 1: `package.json` への postinstall 追加（恒久対策）

`apps/desktop/package.json` の `scripts` セクションに `postinstall` を追加する。

**変更対象ファイル**: `apps/desktop/package.json`

**変更前** (`scripts` セクション内、`rebuild:native` の前後):

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
```

**変更後** (`rebuild:native` の直後に `postinstall` を追加):

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
"postinstall": "pnpm rebuild:native",
```

**注意事項**:

- JSON のカンマ区切りに注意すること（`rebuild:native` の行末にカンマが必要、`postinstall` が最後の要素でない場合もカンマが必要）
- `rebuild:native` の直後に配置することで、関連スクリプトのグループ化を維持する

### Step 2: JSON と scripts の静的検証

```bash
node -e "require('./apps/desktop/package.json')"
node -e "const s = require('./apps/desktop/package.json').scripts; console.log(s.postinstall); console.log(s['rebuild:native'])"
```

`postinstall` の実行確認（クリーンインストール、Electron 起動、ログ証跡）は Phase 6 / Phase 11 で行う。

## 変更ファイルと変更内容

| ファイル                    | 変更種別 | 変更内容                                                      |
| --------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/package.json` | 修正     | `scripts` に `"postinstall": "pnpm rebuild:native"` を1行追加 |

## rebuild:native が行う処理の詳細

```
pnpm rebuild better-sqlite3
  └─ better-sqlite3 のビルド手順（install scripts）を再実行
  └─ 現状の Node.js 環境に合わせて `better_sqlite3.node` を再生成
  └─ build/Release/better_sqlite3.node を上書き

pnpm rebuild esbuild
  └─ esbuild の native バイナリを再構築（主に arch ミスマッチ対策）
```

## 補助: ローカルの即時復旧（仕様外 / 任意）

現在すでにローカルで起動不能な場合、作業者の復旧として `pnpm --filter @repo/desktop rebuild:native` を実行して一時的に復旧できることがある。
ただしこれは「恒久対策（git 管理される変更）」ではないため、本 Phase の完了条件には含めない。

## 成果物

| 成果物                | パス                        | 説明                 |
| --------------------- | --------------------------- | -------------------- |
| 修正済み package.json | `apps/desktop/package.json` | postinstall 追加済み |

## 完了条件

- [ ] `apps/desktop/package.json` の `scripts` に `"postinstall": "pnpm rebuild:native"` が追加されている
- [ ] JSON として有効であり、scripts 一覧に `postinstall` が出現することが確認されている
