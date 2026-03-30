# Phase 13: PR 作成

## メタ情報

| 項目      | 内容         |
| --------- | ------------ |
| Phase     | 13           |
| 名称      | PR 作成      |
| 前提Phase | Phase 12     |
| 成果物    | Pull Request |

## 目的

全 Phase の成果物をまとめ、main ブランチへの Pull Request を作成する。

## 実行タスク

### Task 13-1: ブランチの最終確認

```bash
# 現在のブランチを確認
git branch --show-current

# main との差分を確認
git diff --stat main...HEAD

# コミット履歴を確認
git log --oneline main...HEAD
```

**確認項目**:

- 作業ブランチ名が `fix/electron-build-infra` または同等の命名であること
- 不要なファイルがコミットに含まれていないこと
- コミットメッセージが適切であること

### Task 13-2: リモートへのプッシュ

```bash
git push -u origin HEAD
```

### Task 13-3: PR 本文の作成

以下のテンプレートで PR を作成する：

```markdown
## Summary

- Electron preload スクリプトの `@repo/shared` モジュール解決エラーを修正（`externalizeDepsPlugin` の exclude 設定 + CJS デュアル出力）
- better-sqlite3 の NODE_MODULE_VERSION 不整合を修正（`@electron/rebuild` 導入 + afterPack フック追加）
- ビルドインフラ検証テスト 30 件を追加

## 問題の詳細

### 問題A: Preload モジュール解決エラー

`electron.vite.config.ts` の `externalizeDepsPlugin()` が `@repo/shared` を外部依存として扱い、
CJS 形式の preload バンドルで `require("@repo/shared/...")` がランタイムに残る。
`packages/shared` は ESM のみで出力されていたため、CJS の `require()` で解決不能。

### 問題B: better-sqlite3 ABI 不整合

`pnpm install` で Node.js v22 (ABI 127) 向けにビルドされた better-sqlite3 が
Electron 39.x (ABI 140) のランタイムで読み込めない。

## 修正内容

### 問題A の修正

1. `packages/shared/tsup.config.ts`: `format: ["esm"]` → `["esm", "cjs"]`
2. `packages/shared/package.json`: 全 exports に `require` キー追加
3. `electron.vite.config.ts`: main/preload で `externalizeDepsPlugin({ exclude: ['@repo/shared'] })`

### 問題B の修正

1. `@electron/rebuild` を devDependencies に追加
2. `scripts/setup-native-modules.sh` に Electron 向けリビルドモード追加
3. `electron-builder.yml` に `afterPack` フック追加
4. `apps/desktop/scripts/rebuild-native-for-electron.mjs` を新規作成

## 変更ファイル一覧

| ファイル                                               | 変更種別 |
| ------------------------------------------------------ | -------- |
| `packages/shared/tsup.config.ts`                       | 修正     |
| `packages/shared/package.json`                         | 修正     |
| `apps/desktop/electron.vite.config.ts`                 | 修正     |
| `apps/desktop/package.json`                            | 修正     |
| `apps/desktop/electron-builder.yml`                    | 修正     |
| `scripts/setup-native-modules.sh`                      | 修正     |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | 新規     |
| `package.json`                                         | 修正     |
| テストファイル群 (6ファイル)                           | 新規     |

## Test plan

- [ ] `pnpm lint` がエラー 0 件
- [ ] `pnpm typecheck` がエラー 0 件
- [ ] `pnpm test` が全 PASS（新規 30 テスト + 既存テスト回帰なし）
- [ ] `pnpm --filter @repo/shared build` が成功（ESM + CJS 出力）
- [ ] `pnpm --filter @repo/desktop build` が成功（preload バンドルに require(@repo/shared) なし）
- [ ] `pnpm install` でElectron 向けネイティブモジュールリビルドが自動実行される
- [ ] `pnpm --filter @repo/desktop dev` でアプリが起動し、preload エラー・ABI エラーなし
- [ ] 手動テスト: 画面表示、IPC 通信、DB 操作が正常動作
```

### Task 13-4: PR の作成

```bash
gh pr create \
  --title "fix(electron): preload モジュール解決エラーと better-sqlite3 ABI 不整合を修正" \
  --body "$(cat <<'EOF'
（Task 13-3 で作成した PR 本文）
EOF
)"
```

### Task 13-5: CI 結果の確認

PR 作成後、CI のステータスを確認する：

```bash
gh pr checks
```

**確認項目**:

- lint チェックが PASS
- typecheck が PASS
- テストが PASS
- ビルドが PASS

CI が失敗した場合は原因を調査し、修正コミットを追加する。

### Task 13-6: レビュー依頼

PR が作成され CI が PASS した後、レビューを依頼する：

- PR にラベル `bug-fix`, `infrastructure` を追加する
- 関連 Issue がある場合はリンクする

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                   |
| ---------------- | -------------------------------------- |
| 開発ガイドライン | `references/development-guidelines.md` |

## 成果物

| 成果物       | 配置先 | 説明                     |
| ------------ | ------ | ------------------------ |
| Pull Request | GitHub | 修正コードのレビュー依頼 |

## 完了条件

- [ ] 作業ブランチがリモートにプッシュされている
- [ ] PR が作成され、本文に問題の詳細と修正内容が記述されている
- [ ] CI が全て PASS している
- [ ] レビュー依頼が完了している
- [ ] **本Phase内の全タスクを100%実行完了**
