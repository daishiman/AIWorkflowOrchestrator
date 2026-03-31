# Phase 9: 品質保証

## 目的

実装・リファクタリング完了後、出荷品質を確認するためのチェックリストを実施する。

---

## 自動品質チェック

```bash
# 1. 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# 2. Lint チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# 3. テスト（関連テストすべて）
pnpm --filter @repo/desktop vitest run

# 4. ビルド確認
pnpm --filter @repo/desktop build
```

---

## TASK-P0-07: 品質チェックリスト

### コード品質

- [ ] `PLAN_PROMPT_CONSTANTS.AGENT_NAMES` への参照が 0 件（型チェック・grep で確認）
- [ ] `RuntimeSkillCreatorFacade.plan()` が `PLAN_RESOURCE_REQUESTS` の agent エントリだけを読む
- [ ] `PLAN_RESOURCE_REQUESTS` の non-agent エントリが agent 名導出に混入しない
- [ ] agent 名の変更が `PLAN_RESOURCE_REQUESTS` の修正だけで追従する
- [ ] エラーハンドリングがサイレントでなく、ログ出力がある

### 後方互換性

- [ ] 既存テストが全て PASS している
- [ ] fallback path が current source of truth を読んでいる
- [ ] `PLAN_PROMPT_CONSTANTS` の他のフィールド（区切り文字など）に変更がない

### セキュリティ・安全性

- [ ] request 由来の値を agent 名として読むだけで、実行コマンドとして扱っていない
- [ ] non-agent request が混ざっても runtime の挙動に影響しない

---

## TASK-SDK-04-U2: 品質チェックリスト

### コード品質

- [ ] `handleGeneratePlan` で plan 承認時点の request snapshot を保存している
- [ ] `approvedSkillSpec` の意味がコメントまたは命名で明確になっている
- [ ] `handleExecutePlan` 内で `approvedSkillSpec` が `undefined` のケースが適切に処理されている
- [ ] `handleExecutePlan` が live textarea ではなく approved snapshot を使っている

### drift 防止

- [ ] T-S4-05 の drift テストシナリオが PASS している
- [ ] `request` state（textarea）の変更が `approvedSkillSpec` に影響しないことをテストで保証
- [ ] `handleCancelPlan` で `approvedSkillSpec` が確実に `null` になる

### UI 動作の不変性確認

- [ ] 「実行する」ボタンの動作に見た目上の変更がない
- [ ] plan review 表示に変更がない
- [ ] エラーメッセージに変更がない

---

## 共通品質ゲート

| チェック項目          | コマンド                                 | 結果   |
| --------------------- | ---------------------------------------- | ------ |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`  | （未） |
| ESLint                | `pnpm --filter @repo/desktop lint`       | （未） |
| ユニットテスト        | `pnpm --filter @repo/desktop vitest run` | （未） |
| ビルド                | `pnpm --filter @repo/desktop build`      | （未） |

全て PASS の場合 → Phase 10 へ進む
いずれかが FAIL の場合 → 原因を修正し、再度チェックする
