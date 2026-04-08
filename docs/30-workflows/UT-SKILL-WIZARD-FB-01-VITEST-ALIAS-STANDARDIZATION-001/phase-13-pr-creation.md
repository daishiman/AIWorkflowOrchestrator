# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 13                                                                    |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 12                                                              |
| 後続Phase  | 完了                                                                  |
| 作成日     | 2026-04-08                                                            |
| ステータス | 未実施（ユーザー承認待ち）                                            |

## 目的

ユーザーの明示的な承認を得た上で、PR を作成する。

## ⚠️ 重要: PR作成はユーザー承認後のみ実施

**このPhaseはユーザーの明示的な指示があるまで実行しないこと。**

```
Phase 13 は user の明示承認後のみ実施する。
Issue #2029 はすでに CLOSED のため、
PR の必要性についてユーザーに確認すること。
```

## PR blocked 条件

以下のいずれかに該当する場合、PR 作成を行わない:

- ユーザーの明示的な承認がない
- AC-1〜AC-3 のいずれかが未達
- CI/CD パイプラインでエラーが発生している
- Issue #2029 が CLOSED のため PR 不要とユーザーが判断した場合

## PR作成手順（承認後に実施）

### 1. ブランチ確認

```bash
git branch --show-current
git status
git diff --stat main
```

### 2. 変更サマリー確認

```bash
git log --oneline main..HEAD
git diff main -- packages/shared/vitest.config.ts
```

### 3. PR作成コマンド

```bash
gh pr create \
  --title "fix(shared): vitest.config.ts に @repo/shared resolve alias を追加 (#2029)" \
  --body "$(cat <<'EOF'
## Summary

- `packages/shared/vitest.config.ts` に `resolve.alias` を追加
- ESLint post-tool-use フックによる import パス自動変換後もテストが正常解決されるよう修正
- `@repo/shared` → `path.resolve(__dirname, './index.ts')` のエイリアスを設定

## 背景

ESLint フックが `../path` → `@repo/shared` に import を自動変換するが、
vitest に alias 設定がなくテストが全件失敗する問題（FB-01）を根本対応。

## 変更ファイル

- `packages/shared/vitest.config.ts`: `resolve.alias` 追加

## Test plan

- [ ] `pnpm --filter @repo/shared test` が全件 PASS することを確認
- [ ] `CI=true pnpm --filter @repo/shared test` が全件 PASS することを確認
- [ ] `grep "resolve.alias" packages/shared/vitest.config.ts` で設定が確認できる

Closes #2029

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 4. CI確認

```bash
gh run list --branch $(git branch --show-current) --limit 5
gh run watch
```

### 5. タスク完了処理

```bash
# Issue は既に CLOSED のため、完了記録のみ行う
echo "Task UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001 completed"
```

## PR本文テンプレート変数

| 変数         | 値                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| タイトル     | fix(shared): vitest.config.ts に @repo/shared resolve alias を追加 (#2029) |
| 関連Issue    | #2029（CLOSED）                                                            |
| 変更ファイル | `packages/shared/vitest.config.ts`                                         |
| テスト       | `pnpm --filter @repo/shared test`                                          |

## 参照資料

| 資料名           | パス                                       | 用途       |
| ---------------- | ------------------------------------------ | ---------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md` | PR本文参照 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | AC確認     |

## 成果物

| 成果物 | パス | 説明           |
| ------ | ---- | -------------- |
| PR URL | -    | PR作成後に記録 |

## 完了条件

- [ ] ユーザーの承認取得（**必須前提条件**）
- [ ] PR が作成されている（承認後）
- [ ] CI/CD が PASS している
- [ ] Issue #2029 との紐付けが完了

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得た（実施前必須）
- [ ] PR作成コマンドを実行した（承認後）
- [ ] CI確認を実施した

## 注意事項

**Issue #2029 は CLOSED 状態です。**
実装は既に完了しているため、PR作成の要否についてはユーザーに確認してください。

## 完了

Phase 13 完了をもってタスク全体が完了となります。
