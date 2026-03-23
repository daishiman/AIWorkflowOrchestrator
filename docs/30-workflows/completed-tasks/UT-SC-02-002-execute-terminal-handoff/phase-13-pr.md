# Phase 13: PR 作成・完了

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 13                                    |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

Phase 1-12 の成果物を統合し、Pull Request を作成してコードレビューに提出できる状態にする。
**ユーザーの明示的な承認を受けてから実施する。** 承認前に PR を作成してはならない。

## 実行タスク

| #   | タスク                 | 前提条件                         |
| --- | ---------------------- | -------------------------------- |
| T1  | 最終成果物の確認       | Phase 12 全完了条件チェック PASS |
| T2  | ブランチ作成・コミット | ユーザーの明示承認               |
| T3  | PR 作成                | T2 完了                          |
| T4  | PR URL の報告          | T3 完了                          |

## 参照資料

| 資料                       | パス                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Git & ツーリングルール     | `.claude/rules/07-git-and-tooling.md`                                                |
| Phase 12 完了確認          | `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-12-documentation.md`  |
| 修正対象ファイル（型定義） | `packages/shared/src/types/skillCreator.ts`                                          |
| 修正対象ファイル（Facade） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                |
| 修正対象ファイル（テスト） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |

## 実行手順

### Step 0: ユーザー承認の確認

> **重要**: 以下のステップはユーザーから「PR を作成してください」または同等の明示的な承認を受けた後にのみ実施する。

### Step 1: 最終成果物の確認

PR 作成前に以下を確認する。

```bash
# 変更ファイルの確認
git diff --stat main

# 全テストの PASS 確認
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit
pnpm --filter @repo/shared tsc --noEmit

# Lint チェック
pnpm --filter @repo/desktop lint
```

確認ポイント:

- 変更対象ファイルが3ファイルのみであること（`skillCreator.ts` / `RuntimeSkillCreatorFacade.ts` / `RuntimeSkillCreatorFacade.test.ts`）
- テストが全件 PASS していること
- 型エラーが 0 件であること
- Lint エラーが 0 件であること

### Step 2: ブランチ作成

```bash
git checkout -b fix/UT-SC-02-002-execute-terminal-handoff
```

ブランチ命名規則（07-git-and-tooling.md 準拠）: `fix/` プレフィックス使用。

### Step 3: コミット作成

```bash
git add packages/shared/src/types/skillCreator.ts
git add apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
git add apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

```bash
git commit -m "$(cat <<'EOF'
fix(runtime): execute() の terminal_handoff 未分岐を修正 (#1472)

- RuntimeSkillCreatorExecuteResponse Union型を追加（plan/improve と同一パターン）
- RuntimeSkillCreatorFacade.execute() に terminal_handoff 早期リターン分岐を実装
- terminal_handoff 時は SkillExecutor を呼び出さずハンドオフ結果を即時返却
- void decision; を除去し、decision を分岐条件で正しく使用

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

> 注意: `--no-verify` は絶対に使用しない（CLAUDE.md 禁止事項）。
> pre-commit フックが失敗した場合はエラーを修正して再コミットする。

### Step 4: PR 作成

```bash
git push -u origin fix/UT-SC-02-002-execute-terminal-handoff
```

```bash
gh pr create \
  --title "fix(runtime): execute() の terminal_handoff 未分岐を修正 (#1472)" \
  --body "$(cat <<'EOF'
## Summary

- `packages/shared/src/types/skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` Union 型を追加（plan/improve と同一パターン）
- `RuntimeSkillCreatorFacade.execute()` に `terminal_handoff` 早期リターン分岐を実装し、SkillExecutor を呼び出さずハンドオフ結果を即時返却するよう修正
- `void decision;` を除去し、`decision.type` による if 分岐で正しく使用

## Test Plan

- [ ] `pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` が全件 PASS
- [ ] `terminal_handoff` ケース: LLM が呼び出されないことを確認
- [ ] `integrated_api` ケース: 既存の LLM 呼び出しフローが非破壊であることを確認
- [ ] `pnpm --filter @repo/desktop tsc --noEmit` がエラーなし
- [ ] `pnpm --filter @repo/shared tsc --noEmit` がエラーなし

## 関連

- タスクID: UT-SC-02-002
- 修正ファイル: 3ファイル
EOF
)"
```

### Step 5: PR URL の報告

PR 作成後、URL をユーザーに報告する。

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

Phase 11 および Phase 12 の完了を前提とする。

| 確認項目          | 確認方法                                                        |
| ----------------- | --------------------------------------------------------------- |
| Phase 11 完了確認 | `phase-11-manual-test.md` の完了条件チェックリスト全項目 PASS   |
| Phase 12 完了確認 | `phase-12-documentation.md` の完了条件チェックリスト全項目 PASS |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物 | パス                | 説明                                                                |
| ------ | ------------------- | ------------------------------------------------------------------- |
| PR     | GitHub Pull Request | `fix/UT-SC-02-002-execute-terminal-handoff` ブランチの Pull Request |
| PR URL | GitHub PR URL       | 作成後にユーザーに報告                                              |

## 完了条件

- [ ] ユーザーから明示的な PR 作成承認を受けている
- [ ] Phase 12 の全完了条件チェックリストが PASS している
- [ ] ブランチ `fix/UT-SC-02-002-execute-terminal-handoff` が作成されている
- [ ] コミットメッセージに Summary と Co-Authored-By が含まれている
- [ ] `--no-verify` を使用していない
- [ ] PR タイトルが 70 文字以内である
- [ ] PR 本文に Summary（3箇条書き）と Test Plan（チェックリスト）が含まれている
- [ ] PR URL をユーザーに報告している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

なし（Phase 13 がタスクの最終 Phase）

---

> タスク UT-SC-02-002 の全 Phase（1-13）が完了。
