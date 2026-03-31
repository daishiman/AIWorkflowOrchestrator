# Phase 2: 問題B設計 — better-sqlite3 ABI 再ビルド導線

## 設計方針

**三層の防御**: install 時検査 + 開発 rebuild + packaging afterPack

### 方針1: setup-native-modules.sh の Electron ABI 対応強化

現在のスクリプトは Node.js ABI のみ検査している。Electron ABI での検査を追加する。

**変更内容:**

- Electron バイナリパスを検出し、`ELECTRON_RUN_AS_NODE=1` でロードテスト
- Electron ABI 不一致時に `electron-rebuild` または `pnpm rebuild --runtime=electron` を実行
- 検査結果をログに出力

**重要:** スクリプトは worktree でも動作するよう、`node_modules/.pnpm/electron@*/` からバイナリを探す。

### 方針2: desktop の rebuild:electron スクリプト

`apps/desktop/package.json` に `rebuild:electron` スクリプトを追加する。

```json
{
  "rebuild:electron": "electron-rebuild -f -w better-sqlite3"
}
```

`electron-rebuild` を devDependencies に追加する。

**代替案検討:**

- `@electron/rebuild` (新パッケージ名) を使用
- `pnpm rebuild better-sqlite3 --runtime=electron --target=39.8.5` でも可能だが、electron-rebuild がより堅牢

### 方針3: afterPack hook — rebuild-native-for-electron.mjs

パッケージング時に `better-sqlite3` を Electron ABI で再ビルドする afterPack スクリプトを新規作成する。

**ファイル:** `apps/desktop/scripts/rebuild-native-for-electron.mjs`

**処理フロー:**

1. `context.electronPlatformName` と `context.arch` を取得
2. `app.getAppPath()` から `better-sqlite3` の native module パスを特定
3. `@electron/rebuild` で再ビルド
4. ビルド後にロードテスト

**electron-builder.yml への登録:**

```yaml
afterPack: scripts/rebuild-native-for-electron.mjs
```

## AC 接続

| AC   | 達成手段                                      |
| ---- | --------------------------------------------- |
| AC-5 | 方針1+2: Electron ABI でのロードテストが PASS |
| AC-6 | 方針1+2+3: ビルド検証テストが PASS            |

## リスク

| リスク                                              | 対策                                                        |
| --------------------------------------------------- | ----------------------------------------------------------- |
| electron-rebuild が pnpm ワークスペースで動作しない | `@electron/rebuild` を使用し、workspace root で実行         |
| afterPack が CI 環境で失敗                          | 環境変数で分岐、CI では cross-platform build 用の設定を用意 |
| ワークツリーで node_modules が共有される            | setup-native-modules.sh で worktree 検出時に警告            |

## 依存パッケージ追加

| パッケージ          | 追加先                         | 用途                                 |
| ------------------- | ------------------------------ | ------------------------------------ |
| `@electron/rebuild` | `apps/desktop/devDependencies` | Electron 向け native module 再ビルド |
