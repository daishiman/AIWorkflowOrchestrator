# Phase 13: PR作成

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 13                                                     |
| タスクID | TASK-SW-CANCEL-004                                     |
| 前Phase  | [phase-12-documentation.md](phase-12-documentation.md) |
| 目的     | user 承認後に commit / push / PR を実行する            |

## 目的

user 承認後に commit / push / PR を実行する。

## 実行タスク

### タスク1: user 承認待ちの維持

**目的**: scope 外の操作を承認前に実行しない。

**実行手順**:

1. Phase 12 close-out evidence 完了を確認する。
2. user 承認待ちとして blocked 理由を記録する。

**期待される成果物**:

- blocked 記録

### タスク2: 承認後の実行手順提示

**目的**: commit / push / PR の非自動化手順を固定する。

**実行手順**:

1. ローカルチェック手順を記載する。
2. commit / push / PR 作成手順を記載する。
3. PR Summary / Test plan を定義する。

**期待される成果物**:

- local-check-result.md
- change-summary.md
- pr-info.md
- pr-creation-result.md

## ルール

1. user 承認があるまで commit / push / PR を実行しない
2. Phase 12 の close-out evidence が全て揃った後に user に確認する
3. Phase 13 成果物は user 承認後に作成する

## blocked 記録

- 理由: user 承認待ち
- 完了根拠: Phase 12 mandatory 5 tasks 完了後に user へ確認する

## PR 作成手順（user 承認後）

```bash
# 1. ローカルチェック
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint

# 2. コミット
git add docs/30-workflows/TASK-SW-CANCEL-004/
# 実装修正があった場合は対象ファイルも追加
git commit -m "feat(cancel): TASK-SW-CANCEL-004 IPC E2E接続確認・CANCEL chain 完結 (#2299)"

# 3. push
git push origin <branch-name>

# 4. PR 作成
gh pr create --title "feat(cancel): TASK-SW-CANCEL-004 IPC E2E接続確認 - skill-creator cancel chain 完結" \
  --body "..."
```

## PR 記載内容

### Summary

- CANCEL-001〜004 チェーン完結（IPC E2E 接続確認）
- Renderer → Preload → Main の全層 IPC フロー確認済み
- E2E 統合テスト追加（TC-E2E-01〜04）
- 実装修正（あった場合はパターン A/B/C の内容）

### Test plan

- [ ] `pnpm --filter @repo/desktop test` 全 pass
- [ ] `pnpm --filter @repo/desktop typecheck` エラーなし
- [ ] `pnpm --filter @repo/desktop lint` エラーなし
- [ ] Electron アプリ手動確認（任意）

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/index.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-12-documentation.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/artifacts.json`

## 成果物

| 成果物                                   | 条件        |
| ---------------------------------------- | ----------- |
| `outputs/phase-13/local-check-result.md` | user 承認後 |
| `outputs/phase-13/change-summary.md`     | user 承認後 |
| `outputs/phase-13/pr-info.md`            | PR 作成後   |
| `outputs/phase-13/pr-creation-result.md` | PR 作成後   |

## 完了条件

- [ ] scope 外（user 承認待ち）である理由が明記されている
- [ ] user 承認後の手順が明記されている
- [ ] 成果物定義が `index.md` と一致している
