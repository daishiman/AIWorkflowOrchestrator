# Phase 13: PR作成

## タスク情報

- **タスクID**: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- **タスク名**: useMainlineExecutionAccess の healthPolicy 移行
- **フェーズ**: Phase 13 - PR作成
- **前提フェーズ**: Phase 12（ドキュメント更新）完了

---

## 重要: PR作成はユーザーの明示的な承認後のみ実行すること

Phase 13 の実行（PR作成コマンドの実行）は、**ユーザーが明示的に承認した後にのみ**行うこと。

自動的に PR を作成してはならない。必ずユーザーに確認し、承認を得てから実行すること。

---

## PR 概要の下書き

### PR タイトル

```
refactor(hooks): useMainlineExecutionAccess に resolveHealthPolicy を統合
```

### PR 説明

```markdown
## 変更概要

`useMainlineExecutionAccess.ts` 内の `apiKeyDegraded` 独自算出ロジックを削除し、
`resolveHealthPolicy()` で生成した `HealthPolicy` を `buildMainlineExecutionAccessState()` に渡す形に統一しました。

## 変更の背景

`apiKeyDegraded` フラグを独自ロジックで算出していた箇所（L117-120）は、
`resolveHealthPolicy()` が持つ同等ロジックと二重管理になっていました。
本 PR でこの重複を解消し、ヘルスポリシーの判断ロジックを一元管理します。

## 変更内容

- `resolveHealthPolicy` を `@repo/shared/types` からインポートを追加
- `resolveHealthPolicy()` を呼び出して `HealthPolicy` を生成するコードを追加
- `buildMainlineExecutionAccessState()` の引数に `healthPolicy` を追加
- `apiKeyDegraded` の独自算出ロジック（L117-120）を削除

## 変更ファイル

- `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`

## テスト

- `pnpm --filter @repo/desktop test`: 全テスト PASS
- `pnpm typecheck`: 型エラーなし

## タスクID

UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
```

---

## CI 確認方法

PR 作成後、以下の方法で CI の状態を確認すること。

```bash
# PR の CI ステータスを確認
gh pr checks <PR番号>

# CI が失敗した場合はログを確認
gh run view --log-failed
```

CI で確認すべき項目：

| チェック項目            | 期待する結果       |
| ----------------------- | ------------------ |
| TypeScript 型チェック   | PASS               |
| ESLint                  | PASS（エラーなし） |
| Vitest（@repo/desktop） | 全テスト PASS      |
| Prettier フォーマット   | PASS               |

---

## マージ前最終チェックリスト

PR をマージする前に、以下をすべて確認すること。

### コード品質

- [ ] `pnpm typecheck` がエラーなく通過している
- [ ] `pnpm lint` がエラーなく通過している
- [ ] `pnpm --filter @repo/desktop test` が全 PASS している
- [ ] `apiKeyDegraded` 独自算出ロジックが完全に削除されている
- [ ] `resolveHealthPolicy()` が正しい引数で呼び出されている
- [ ] `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている

### ドキュメント

- [ ] Phase 12 のドキュメント更新が完了している
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-12/` 配下の全成果物が作成されている

### CI / レビュー

- [ ] すべての CI チェックが PASS している
- [ ] レビュアーが承認している（必要な場合）
- [ ] コンフリクトがない

### ユーザー承認

- [ ] **ユーザーから PR 作成の明示的な承認を得ている**

---

## PR 作成コマンド（承認後に実行）

```bash
gh pr create \
  --title "refactor(hooks): useMainlineExecutionAccess に resolveHealthPolicy を統合" \
  --body "$(cat <<'EOF'
## 変更概要

`useMainlineExecutionAccess.ts` 内の `apiKeyDegraded` 独自算出ロジックを削除し、
`resolveHealthPolicy()` で生成した `HealthPolicy` を `buildMainlineExecutionAccessState()` に渡す形に統一しました。

## 変更の背景

`apiKeyDegraded` フラグを独自ロジックで算出していた箇所（L117-120）は、
`resolveHealthPolicy()` が持つ同等ロジックと二重管理になっていました。
本 PR でこの重複を解消し、ヘルスポリシーの判断ロジックを一元管理します。

## 変更内容

- `resolveHealthPolicy` を `@repo/shared/types` からインポートを追加
- `resolveHealthPolicy()` を呼び出して `HealthPolicy` を生成するコードを追加
- `buildMainlineExecutionAccessState()` の引数に `healthPolicy` を追加
- `apiKeyDegraded` の独自算出ロジック（L117-120）を削除

## 変更ファイル

- `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`

## テスト

- `pnpm --filter @repo/desktop test`: 全テスト PASS
- `pnpm typecheck`: 型エラーなし

## タスクID

UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
EOF
)"
```

---

## 成果物

| 成果物              | 説明                        |
| ------------------- | --------------------------- |
| GitHub Pull Request | 本タスクの変更をまとめた PR |
