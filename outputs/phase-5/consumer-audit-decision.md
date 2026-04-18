# Phase 5: EVALS.json コンシューマー監査と判断

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 5 — 実装
**作成日**: 2026-04-18

---

## 監査目的

本タスクの変更が `EVALS.json` の schema に影響を与えないことを確認するため、
`EVALS.json` を参照しているコード (consumer) を調査した。

---

## 調査コマンドと結果

```bash
# EVALS.json を直接参照しているファイルを検索
rg "EVALS\.json" --type-add "code:*.{ts,tsx,js,mjs,cjs}" -t code
```

**結果**: 0件

```bash
# evals キーワードを参照しているコードを検索 (大文字小文字無視)
rg "evals\b" --type-add "code:*.{ts,tsx,js,mjs,cjs}" -t code -i
```

**結果**: テストフィクスチャ内の参照のみ。アプリケーションコードからの参照なし。

```bash
# 設定ファイル・YAML からの参照
rg "EVALS" --type yaml --type json
```

**結果**: `EVALS.json` 自身のみがヒット。他ファイルからの参照なし。

---

## 調査結果まとめ

| 検索対象                         | consumer 件数 | 備考                                    |
| -------------------------------- | ------------- | --------------------------------------- |
| TypeScript / JavaScript ファイル | 0件           | アプリコードからの import/require なし  |
| YAML / JSON 設定ファイル         | 0件           | CI 設定等からの参照なし                 |
| テストフィクスチャ               | 参照あり      | schema キーを直接変更しない読み取りのみ |

---

## schema 変更の判断

**判断**: 本タスク (TASK-CONFLICT-PREVENT-001) では EVALS.json の schema を**変更しない**。

**根拠**:

1. `rg` 調査の結果、アプリケーションコードからの consumer が0件であった。
2. テストフィクスチャでの参照は読み取りのみであり、schema キーの追加・削除・変更は伴わない。
3. 本タスクの変更内容 (`.gitattributes`、`generate-index.js`、`session-init.sh`、`setup-merge-drivers.sh`) はいずれも `EVALS.json` の内容に影響しない。
4. TC-4-05 のスナップショット比較でも差分が0行であることを確認済み。

---

## 将来の schema 変更が必要になった場合の手順

schema 変更が必要になった場合は以下のフローに従うこと。
本タスクのスコープ外であるため、別 Wave / 別 Issue で対応する。

```
1. 変更が必要な schema キーを特定
2. rg で全 consumer を再検索
3. 影響ファイルをリストアップ
4. 別 Issue を作成し、consumer 側の修正もスコープに含める
5. 本タスクの implementation-log.md に「schema 変更は Issue #XXX で対応」と追記
```

---

## 関連ドキュメント

- `outputs/phase-4/mirror-and-consumer-guard.md` — 監査手順の定義
- `outputs/phase-4/test-scenarios.md` — TC-4-05 の定義
- `outputs/phase-5/changed-files-summary.md` — 変更ファイル一覧
