# 実装サマリー - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 5 - 実装（TDD: Green）                  |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 実装内容

### 変更ファイル

| ファイル                       | 変更種別 | 説明                     |
| ------------------------------ | -------- | ------------------------ |
| `packages/shared/package.json` | 修正     | dependencies に SDK 追加 |

### 具体的な変更

**変更前**:

```json
{
  "dependencies": {
    "@libsql/client": "^0.15.15",
    ...
  }
}
```

**変更後**:

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.5",
    "@libsql/client": "^0.15.15",
    ...
  }
}
```

---

## 変更が不要だったファイル

Phase 5 仕様書には以下のファイルの変更が記載されていたが、Phase 2 の設計に基づき、これらの変更は不要と判断した。

| ファイル                               | 理由                           |
| -------------------------------------- | ------------------------------ |
| `apps/desktop/package.json`            | 既に SDK が宣言済み            |
| `apps/desktop/electron.vite.config.ts` | externalizeDeps 設定は現状維持 |
| `.npmrc`                               | 設定変更不要                   |

---

## 検証結果

### 依存関係検証

| テストID | 検証内容                            | 結果 |
| -------- | ----------------------------------- | ---- |
| DEP-01   | SDK in packages/shared/node_modules | PASS |
| DEP-02   | SDK in apps/desktop/node_modules    | PASS |
| DEP-03   | SDK in packages/shared/package.json | PASS |

### pnpm ls 結果

```
@repo/shared@1.0.0
dependencies:
@anthropic-ai/claude-agent-sdk 0.2.5
```

### ビルド検証

| テストID | 検証内容                 | 結果 |
| -------- | ------------------------ | ---- |
| BLD-01   | shared パッケージビルド  | PASS |
| BLD-02   | desktop パッケージビルド | PASS |

**ビルド出力**:

- `out/main/index.js`: 221.53 kB
- `out/preload/index.js`: 21.14 kB
- `out/renderer/assets/index-BqaKiiGY.js`: 888.52 kB

### テスト検証

| パッケージ | テストファイル | テスト数 | 結果 |
| ---------- | -------------- | -------- | ---- |
| shared     | -              | 全テスト | PASS |
| desktop    | 231            | 4723     | PASS |

---

## 特記事項

### pnpm isolated モードの動作

pnpm の `node-linker=isolated` 設定により、依存関係は各パッケージの `node_modules` に配置される:

- `packages/shared/node_modules/@anthropic-ai/claude-agent-sdk` (シンボリックリンク)
- `apps/desktop/node_modules/@anthropic-ai/claude-agent-sdk` (シンボリックリンク)

ルートの `node_modules/@anthropic-ai/` には配置されないが、これは正常な動作である。

### SDK バージョンの統一

両パッケージで同一バージョン（`^0.2.5`）を使用しており、pnpm の重複排除により実際には1つのコピーのみがインストールされている。

---

## 完了条件チェック

- [x] パッケージ依存関係が修正されている
- [x] ビルドが成功する
- [x] すべてのテストが成功状態（Green）
- [x] **本Phase内の全タスクを100%実行完了**

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
