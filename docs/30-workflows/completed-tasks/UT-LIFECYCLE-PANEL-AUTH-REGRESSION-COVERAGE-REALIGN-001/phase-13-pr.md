# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 13                                                      |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | ブロック中（ユーザー承認待ち）                          |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 12: ドキュメント更新                                    |

---

## 目的

Phase 1〜12 で実施したテスト責務再設計（旧 TC-06 / TC-07 の削除・rapid click / rerender
条件の新テストケース追加）を PR として main ブランチへマージする。

## 実行タスク

以下の承認確認、PR 情報整理、作成記録を順に実施する。ユーザー承認がない場合は Phase 13 を blocked のまま維持する。

- ユーザー承認の有無を確認する
- 承認済みなら PR 情報を作成する

---

## 実行条件

> **重要**: 以下の条件が全て満たされ、かつユーザーの明示的な承認を得た場合のみ PR を作成する。
> ユーザーの承認なしに PR を作成してはならない。

- [ ] ユーザーの明示的な承認を得た
- [ ] Phase 10 の最終レビューが PASS / MINOR である
- [ ] Phase 11 の手動テスト（テスト実行目視確認）が完了している
- [ ] Phase 12 の全ドキュメントが揃っている
- [ ] ローカルで全テストが PASS している

---

## ブロック理由

**ユーザーの明示承認待ち。PR はユーザー指示があるまで作成しない。**

本 Phase は blocked のままとする。承認が得られるまで、以下の事前準備のみ実施する。

---

## 事前準備（承認前に実施可能）

### ブランチ名

```
fix/ut-lifecycle-panel-auth-regression-coverage-realign-001
```

### PR タイトル

```
[UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001] auth regression coverage realignment
```

### PR description 雛形

````markdown
## 変更サマリー

`SkillLifecyclePanel.auth-regression.test.tsx` のテスト責務を現行 UI に合わせて再設計する。

### 削除

- TC-06 / TC-07: 旧 prepare フロー依存テストケースを削除
  - 削除理由: prepare フロー廃止後も残存していた死んだテストコード

### 追加

- rapid click 条件テスト: 短時間に複数回クリックしても `auth:login` を発火しないことを検証
- rerender 条件テスト: props 変更による rerender 後も `auth:login` を発火しないことを検証

## テスト計画

- [ ] 対象テストファイルの全テストケースが PASS
- [ ] 既存テストへの回帰がない（FAIL 件数: 0 件）
- [ ] typecheck エラーゼロ
- [ ] lint エラーゼロ

## 確認コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```
````

## 関連

- タスクID: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001
- タスク種別: NON_VISUAL（UI 変更なし、テストコードのみ）

🤖 Generated with Claude Code

````

---

## PR 作成手順（ユーザー承認後）

### 1. ブランチ確認

```bash
git status
git branch
````

### 2. PR 作成

```bash
gh pr create \
  --title "[UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001] auth regression coverage realignment" \
  --body "$(cat <<'EOF'
## 変更サマリー

`SkillLifecyclePanel.auth-regression.test.tsx` のテスト責務を現行 UI に合わせて再設計する。

### 削除

- TC-06 / TC-07: 旧 prepare フロー依存テストケースを削除
  - 削除理由: prepare フロー廃止後も残存していた死んだテストコード

### 追加

- rapid click 条件テスト: 短時間に複数回クリックしても `auth:login` を発火しないことを検証
- rerender 条件テスト: props 変更による rerender 後も `auth:login` を発火しないことを検証

## テスト計画

- [ ] 対象テストファイルの全テストケースが PASS
- [ ] 既存テストへの回帰がない（FAIL 件数: 0 件）
- [ ] typecheck エラーゼロ
- [ ] lint エラーゼロ

## 確認コマンド

\`\`\`bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
\`\`\`

## 関連

- タスクID: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001
- タスク種別: NON_VISUAL（UI 変更なし、テストコードのみ）

🤖 Generated with Claude Code
EOF
)"
```

### 3. CI の確認

```bash
# PR 番号を確認して CI ステータスを監視
gh pr checks <PR番号> --watch
```

確認項目:

- [ ] lint: PASS
- [ ] typecheck: PASS
- [ ] test（vitest）: PASS
- [ ] build: PASS

### 4. PR URL の記録

PR 作成後、URL を `outputs/phase-13/pr-url.md` に記録する。

---

## blocked 時の最低限の記録

ユーザーの明示承認がない限り、本 Phase は blocked のままとする。
blocked の場合でも以下を `outputs/phase-13/` に記録する:

- `pr-url.md`: PR 作成後に URL を記録（未作成の場合は「承認待ち・未作成」と記録）
- `local-check-result.md`: PR 作成前に確認済みのローカルチェック要約
- `change-summary.md`: 変更概要と対象ファイル群
- `pr-info.md`: 想定ブランチ名・タイトル・本文・blocked 理由

---

## 参照資料

| 参照資料                  | パス                                       | 内容                  |
| ------------------------- | ------------------------------------------ | --------------------- |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | PASS / MINOR 判定結果 |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`   | テスト実行ログ        |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md` | 変更内容の説明        |

---

## 成果物

| 成果物               | パス                                     | 内容                                       |
| -------------------- | ---------------------------------------- | ------------------------------------------ |
| PR URL               | `outputs/phase-13/pr-url.md`             | 作成した PR の URL（未作成時は承認待ち旨） |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | PR 作成前のローカル確認要約                |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更概要と対象ファイル群                   |
| PR 情報              | `outputs/phase-13/pr-info.md`            | 想定ブランチ・タイトル・本文・blocked 理由 |

---

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] Phase 10 最終レビューが PASS / MINOR
- [ ] Phase 11 手動テストが完了（全テスト PASS）
- [ ] Phase 12 全ドキュメントが揃っている
- [ ] PR が作成されている（承認後）
- [ ] CI が全て PASS している（承認後）
- [ ] `outputs/phase-13/pr-url.md` に PR URL が記録されている（承認後）

---

## タスク100%実行確認【必須】

- [ ] ユーザー承認ゲートを通過した（承認なしに PR を作成していない）
- [ ] `outputs/phase-13/` 配下の事前記録ファイルが全て存在する
- [ ] 承認後は PR 作成・CI 確認・URL 記録まで完了している
