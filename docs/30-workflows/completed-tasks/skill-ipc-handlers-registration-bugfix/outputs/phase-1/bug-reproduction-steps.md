# バグ再現手順

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 1                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## 症状

Agent画面を開くと無限ローディング状態になり、スキル一覧が表示されない。

---

## 再現手順

### 前提条件

- Node.js と pnpm がインストールされていること
- プロジェクトの依存関係がインストール済みであること

### 手順

1. **ビルド実行**

   ```bash
   pnpm --filter @repo/desktop build
   ```

2. **アプリケーション起動**

   ```bash
   pnpm --filter @repo/desktop start
   ```

3. **Agent画面に遷移**
   - サイドバーから「Agent」メニューを選択
   - または直接URLで `/agent` にアクセス

4. **バグ確認**
   - スキル一覧が表示されず、ローディング状態が継続する
   - DevToolsのコンソールで以下のエラーを確認:
     - `skillIds must be an array` (skill:import呼び出し時)
     - `skillId must be a string` (skill:remove, skill:get-detail呼び出し時)

---

## 発生条件

- Agent画面でスキル関連のIPC通信が発生する際に100%再現
- 具体的には以下のチャネル呼び出し時:
  - `skill:import`
  - `skill:remove`
  - `skill:get-detail`

---

## 確認ポイント

| 確認項目                     | 期待結果         | 実際の結果       |
| ---------------------------- | ---------------- | ---------------- |
| Agent画面表示                | スキル一覧が表示 | 無限ローディング |
| skill:import IPC呼び出し     | 正常レスポンス   | VALIDATION_ERROR |
| skill:remove IPC呼び出し     | 正常レスポンス   | VALIDATION_ERROR |
| skill:get-detail IPC呼び出し | 正常レスポンス   | VALIDATION_ERROR |

---

## 再現環境

- OS: macOS (Darwin)
- Electron: プロジェクト依存バージョン
- Node.js: プロジェクト要件バージョン
