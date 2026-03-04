# Phase 12 実装ガイド

## Part 1: 初学者向け説明

### 1) 「公開されたコマンド」の意味

家の鍵を毎回同じ場所に置く運用に近い。置き場所（実行コマンド）が固定されると、誰が作業しても同じ手順で辿れる。

### 2) 文書と実行の一致

レシピと調理手順が一致している状態に近い。文書に書かれたコマンドがそのまま実行できると、再現ミスが減る。

### 3) 検証ログの役割

得点板のように、実行結果を同じ形式で記録することで「成功/失敗」「前回との差分」を機械的に比較できる。

## Part 2: 開発者向け説明

### scripts 追加仕様

- key: `screenshot:skill-import-idempotency-guard`
- value: `node scripts/capture-skill-import-idempotency-guard-screenshots.mjs`

### 文書同期仕様

- 同期対象:
  - workflow02 `outputs/phase-11/manual-test-result.md`
  - workflow02 `outputs/phase-12/spec-update-summary.md`
- 統一記法:
  - `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`

### エラーハンドリング

| 症状               | 優先確認                   | 対応                                     |
| ------------------ | -------------------------- | ---------------------------------------- |
| run一覧に出ない    | package.json scripts       | キー登録漏れを修正                       |
| screenshot実行失敗 | script実体 / optional deps | script存在、依存再解決（`pnpm install`） |
| coverage FAIL      | screenshot不足             | screenshot再取得後にvalidator再実行      |
