# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR 作成                        |
| 機能名     | ipc-response-unwrap            |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 前提Phase  | Phase 12 (ドキュメント更新)    |
| 後続Phase  | -（完了）                      |
| ステータス | 未実施                         |
| 作成日     | 2026-02-14                     |

---

## 目的

成果物の最終確認を行い、コミット・PR を作成する。全 Phase が完了した状態で、変更を本番ブランチにマージするための準備を行う。

**重要: PR 作成は自動実行しない。ユーザーの明示的な許可を得てから実行すること。**

---

## 実行タスク

| タスク | 内容                             |
| ------ | -------------------------------- |
| Task 1 | 最終品質確認                     |
| Task 2 | コミット準備                     |
| Task 3 | コミット作成                     |
| Task 4 | PR 作成（ユーザー許可後）        |
| Task 5 | artifacts.json 全 Phase 完了更新 |

---

## 参照資料

| 種別            | パス                                                                       | 内容                   |
| --------------- | -------------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物  | `outputs/phase-1/`                                                         | 要件定義               |
| Phase 2 成果物  | `outputs/phase-2/`                                                         | 設計                   |
| Phase 3 成果物  | `outputs/phase-3/`                                                         | 設計レビュー           |
| Phase 4 成果物  | `outputs/phase-4/`                                                         | テストケース           |
| Phase 5 成果物  | `outputs/phase-5/`                                                         | 実装コード             |
| Phase 6 成果物  | `outputs/phase-6/`                                                         | 拡充テスト             |
| Phase 7 成果物  | `outputs/phase-7/`                                                         | カバレッジレポート     |
| Phase 8 成果物  | `outputs/phase-8/`                                                         | リファクタリング結果   |
| Phase 9 成果物  | `outputs/phase-9/`                                                         | 品質検証レポート       |
| Phase 10 成果物 | `outputs/phase-10/`                                                        | 最終レビュー結果       |
| Phase 11 成果物 | `outputs/phase-11/`                                                        | 手動テスト結果         |
| Phase 12 成果物 | `outputs/phase-12/`                                                        | ドキュメント・未タスク |
| Preload API     | `apps/desktop/src/preload/skill-api.ts`                                    | 修正対象ファイル       |
| テストファイル  | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                     | テストファイル         |
| 元タスク仕様書  | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md` | 元タスク指示書         |

---

## 実行手順

### Task 1: 最終品質確認

以下の3つのチェックが全て PASS であることを確認する。

```bash
# 型チェック
pnpm typecheck

# Lint
pnpm lint

# テスト（desktop パッケージ）
cd apps/desktop && pnpm vitest run
```

| チェック項目          | コマンド                             | 期待結果 |
| --------------------- | ------------------------------------ | -------- |
| TypeScript 型チェック | `pnpm typecheck`                     | PASS     |
| ESLint                | `pnpm lint`                          | PASS     |
| 全テスト              | `cd apps/desktop && pnpm vitest run` | PASS     |

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 全テスト PASS

---

### Task 2: コミット準備

#### 2-1. 変更ファイルの確認

```bash
git status
```

- [ ] 変更ファイルが修正対象のみであることを確認

#### 2-2. 想定される変更ファイル

| ファイル                                               | 変更種別 |
| ------------------------------------------------------ | -------- |
| `apps/desktop/src/preload/skill-api.ts`                | 修正     |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 修正     |
| `docs/30-workflows/ipc-response-unwrap/` 配下          | 新規     |

#### 2-3. セキュリティ確認

- [ ] `.env` ファイルが変更に含まれていない
- [ ] `credentials` / `secret` / `token` を含むファイルが変更に含まれていない
- [ ] `node_modules/` が変更に含まれていない

---

### Task 3: コミット作成

#### コミットメッセージ

```
fix(preload): IPC レスポンスラッパー展開修正 (UT-FIX-IPC-RESPONSE-UNWRAP-001)
```

#### コミット作成時の禁止事項

- `--no-verify` オプションは**絶対に使用禁止**
- `git commit -n` も**絶対に使用禁止**

#### コミットが失敗した場合の対処

1. pre-commit フックのエラー内容を確認する
2. エラーを修正する
3. 修正ファイルを re-stage する
4. **新しいコミットを作成する**（`--amend` は使用しない）

- [ ] コミット作成完了
- [ ] `--no-verify` 未使用

---

### Task 4: PR 作成（ユーザーの明示的な許可を得てから実行）

**このタスクはユーザーの明示的な許可を得てから実行すること。自動実行は禁止。**

#### PR 情報

| 項目           | 値                                                    |
| -------------- | ----------------------------------------------------- |
| ブランチ名     | `fix/ut-fix-ipc-response-unwrap-001`                  |
| ベースブランチ | `main`                                                |
| PR タイトル    | `fix(preload): IPC レスポンスラッパー展開修正 (#816)` |
| 関連 Issue     | #816                                                  |

#### PR 本文テンプレート

```markdown
## Summary

- Preload 層の `safeInvokeUnwrap<T>()` 汎用関数を追加し、IPC ハンドラの `{ success, data }` レスポンスラッパーを Preload 層で展開するよう修正
- `skill-api.ts` の4メソッド（list, getImported, import, rescan）を `safeInvokeUnwrap` 呼び出しに変更
- AgentView の `importedSkills.forEach is not a function` ランタイムエラーを解消

## Test plan

- [ ] `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts` が全て PASS
- [ ] `pnpm typecheck` が PASS
- [ ] `pnpm lint` が PASS
- [ ] AgentView でスキル一覧が正常に表示される
- [ ] DevTools で `Array.isArray(await window.electronAPI.skill.getImported())` が `true` を返す

Closes #816
```

#### PR 作成コマンド

```bash
gh pr create \
  --title "fix(preload): IPC レスポンスラッパー展開修正 (#816)" \
  --body "$(cat <<'EOF'
## Summary

- Preload 層の `safeInvokeUnwrap<T>()` 汎用関数を追加し、IPC レスポンスラッパーを展開
- `skill-api.ts` の4メソッド（list, getImported, import, rescan）を修正
- AgentView の `importedSkills.forEach is not a function` エラーを解消

## Test plan

- [ ] skill-api.test.ts 全テスト PASS
- [ ] pnpm typecheck PASS
- [ ] pnpm lint PASS
- [ ] AgentView でスキル一覧が正常表示
- [ ] DevTools で戻り値が配列であることを確認

Closes #816

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main
```

- [ ] ユーザーの許可を取得済み
- [ ] PR 作成完了

---

### Task 5: artifacts.json 全 Phase 完了更新

`artifacts.json` の全 Phase のステータスを `completed` に更新する。

- [ ] `artifacts.json` の Phase 1-13 全てが `completed` ステータスに更新

---

## タスク完了時の移動手順

PR 作成後、以下の手順でタスクディレクトリを移動する。

```bash
# 1. タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/ipc-response-unwrap/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep ipc-response-unwrap

# 3. 元タスク指示書を削除（unassigned 側に残っている場合のみ）
rm docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-001.md

# 4. 削除を確認
ls docs/30-workflows/unassigned-task/ | grep ut-fix-ipc-response-unwrap || echo "削除完了"

# 5. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): ipc-response-unwrap を completed-tasks に移動、元タスク指示書を削除"
```

> **注意**: Phase 12 で検出・作成した**新規**未タスク指示書は削除しないこと。削除対象は元タスク指示書のみ。

---

## 統合テスト連携

### Phase 13 での必須アクション

- [ ] CI/CD の全チェックが PASS であることを確認
- [ ] PR のレビューコメントに未対応のものがないことを確認

---

## 多角的チェック観点

| 観点         | 確認内容                                             |
| ------------ | ---------------------------------------------------- |
| CI 整合性    | ローカルテスト結果と CI 結果が一致していること       |
| コミット品質 | コミットメッセージが変更内容を正確に反映していること |
| PR 品質      | PR 本文に Summary と Test Plan が含まれていること    |
| ブランチ命名 | `fix/` プレフィックスが付いていること                |

---

## 成果物

| 成果物  | パス                          | 内容            |
| ------- | ----------------------------- | --------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・CI 結果 |

---

## 完了条件

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 全テスト PASS
- [ ] コミット作成完了（`--no-verify` 未使用）
- [ ] PR 作成完了（ユーザーの明示的な許可を取得後に実行）
- [ ] `artifacts.json` 全 Phase が `completed`
- [ ] GitHub Issue #816 に PR リンク追記
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] 元タスク指示書が削除済み

---

## Phase 末端アクション

- [ ] 本 Phase 内の全作業を 100% 実行完了
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] タスクディレクトリが移動されている
- [ ] `artifacts.json` が更新されている

---

## 依存関係

- **前提**: Phase 11, 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録

Phase 完了後、以下を記録すること:

```markdown
## Phase 13 実行記録

### PR 情報

- PR URL: {{URL}}
- CI 結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-tasks 移動: {{完了/未完了}}
- artifacts.json 更新: {{完了/未完了}}
- 元タスク指示書削除: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

-
```

---

## ワークフロー完了

Phase 13 が完了したら、このタスクは完了となる。

タスクディレクトリは `docs/30-workflows/completed-tasks/ipc-response-unwrap/` に移動される。
