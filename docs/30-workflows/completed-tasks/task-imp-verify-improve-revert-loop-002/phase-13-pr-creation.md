# Phase 13: PR作成

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| 機能名     | task-imp-verify-improve-revert-loop-002 |
| タスクID   | TASK-P0-02                              |
| タスク種別 | 機能追加                                |
| UI task    | No                                      |
| 作成日     | 2026-03-30                              |

## 目的

ユーザーの明示的な承認を得た後に、ローカル品質チェックを最終実行し、PR を作成する。Phase 12 までの全成果物が揃っていることを前提条件とする。

## 重要ルール

- **ユーザーの承認なしにコミット・PR作成を実行しない**
- **ローカル品質チェック（typecheck / test / lint）が全て PASS であること**

## 前提条件

| 条件                   | 確認方法                                         | 判定 |
| ---------------------- | ------------------------------------------------ | ---- |
| ユーザー承認           | ユーザーからの明示的な「PR作成OK」等の承認       | -    |
| Phase 10 完了          | `outputs/phase-10/final-review-result.md` が存在 | -    |
| Phase 11 完了          | `outputs/phase-11/manual-test-result.md` が存在  | -    |
| Phase 12 完了          | `outputs/phase-12/` 配下に5ファイル全て存在      | -    |
| テスト全PASS           | `pnpm vitest run` が成功                         | -    |
| lint/typecheck PASS    | `pnpm lint` / `pnpm typecheck` が成功            | -    |
| artifacts.json同期済み | `artifacts.json` の全Phaseステータスが正確       | -    |

> **重要**: ユーザーの明示的な承認がない限り、PR作成を実行しないこと。

## 実行タスク

### Task 13-1: ローカル品質チェック最終実行

全てのチェックが PASS であることを確認する。1つでも FAIL の場合は修正してから次に進む。

```bash
# TypeScript 型チェック
pnpm typecheck

# テスト実行
pnpm vitest run

# lint チェック
pnpm lint

# shared パッケージビルド
pnpm --filter @repo/shared build
```

| チェック項目          | コマンド                           | 判定 |
| --------------------- | ---------------------------------- | ---- |
| TypeScript 型チェック | `pnpm typecheck`                   | -    |
| テスト                | `pnpm vitest run`                  | -    |
| lint                  | `pnpm lint`                        | -    |
| shared ビルド         | `pnpm --filter @repo/shared build` | -    |

### Task 13-2: 変更ファイル一覧確認

```bash
# 変更ファイルの確認
git status
git diff --stat main...HEAD
```

確認事項:

- [ ] 意図しないファイルが含まれていないこと
- [ ] 機密ファイル（`.env`, `credentials.json` 等）がステージングされていないこと
- [ ] `node_modules/` や `dist/` がコミットに含まれていないこと

想定される変更ファイル:

| ファイル                                                                 | 変更種別  | 説明                                        |
| ------------------------------------------------------------------------ | --------- | ------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                              | 変更      | `SkillCreatorVerifyResult` 拡張、新規型追加 |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`   | 変更      | `recordVerifyPass()` 等追加                 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | 変更      | `verifyAndImproveLoop()` 追加               |
| `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts` | 新規      | フィードバック変換ユーティリティ            |
| テストファイル群                                                         | 新規/変更 | ユニットテスト・結合テスト                  |
| `docs/30-workflows/task-imp-verify-improve-revert-loop-002/` 配下        | 新規/変更 | タスク仕様書・成果物                        |

### Task 13-3: コミットメッセージ作成

**フォーマット**:

```
feat(skill-creator): TASK-P0-02 verify→improve→re-verify 閉ループ実装

- SkillCreatorWorkflowEngine に recordVerifyPass() / recordImproveAttempt() / getImproveAttemptCount() を追加
- RuntimeSkillCreatorFacade に verifyAndImproveLoop() パイプラインを追加
- formatVerifyChecksAsFeedback() ユーティリティ関数を追加
- SkillCreatorVerifyResult に閉ループ関連フィールドを拡張
- RuntimeSkillCreatorVerifyAndImproveResult 型を新規追加
- maxImproveRetry（デフォルト3、最大10）による無限ループ防止

Closes #1740
```

### Task 13-4: ユーザー承認待ち

**ステータス: blocked** — ユーザーの明示的な承認が必要。

ユーザーに以下を提示して承認を待つ:

1. **コミットメッセージ**: Task 13-3 で作成したもの
2. **変更ファイル一覧**: Task 13-2 の結果
3. **テスト結果**: Task 13-1 の結果（全PASS）
4. **品質チェック結果**: typecheck / lint / test の全結果

> ユーザーが承認するまで Task 13-5 に進まないこと。

### Task 13-5: PR作成

ユーザー承認後、`gh pr create` を使用して PR を作成する。

```bash
gh pr create --title "feat(skill-creator): TASK-P0-02 verify→improve→re-verify 閉ループ実装" --body "$(cat <<'EOF'
## Summary

- `SkillCreatorWorkflowEngine` に `recordVerifyPass()` / `recordImproveAttempt()` / `getImproveAttemptCount()` を追加
- `RuntimeSkillCreatorFacade` に `verifyAndImproveLoop()` パイプラインエントリーポイントを追加
- `formatVerifyChecksAsFeedback()` ユーティリティ関数を新規作成
- `SkillCreatorVerifyResult` に閉ループ関連フィールド（`improveAttemptCount?`, `maxImproveRetry?`, `loopExhausted?`）を拡張
- `RuntimeSkillCreatorVerifyAndImproveResult` 型を新規追加
- `maxImproveRetry`（デフォルト3、最大10）による無限ループ防止

### 受入基準の充足

| AC   | 基準                                                  | 状態 |
| ---- | ----------------------------------------------------- | ---- |
| AC-1 | verify 全チェック PASS 時に recordVerifyPass() が呼ばれる | ✅   |
| AC-2 | verify 失敗時に自動で improve が起動される             | ✅   |
| AC-3 | improve 後に自動で re-verify が実行される              | ✅   |
| AC-4 | maxImproveRetry 到達時にループ停止 + loopExhausted     | ✅   |
| AC-5 | improve 中のエラーでループが安全に停止する             | ✅   |
| AC-6 | Facade に閉ループエントリーポイント追加                | ✅   |
| AC-7 | 既存の手動 reverifyWorkflow() が影響を受けない         | ✅   |

## Test plan

- [ ] `recordVerifyPass()` ユニットテスト PASS
- [ ] `recordImproveAttempt()` / `getImproveAttemptCount()` ユニットテスト PASS
- [ ] `verifyAndImproveLoop()` 各分岐テスト PASS（全PASS / improve成功 / maxRetry / エラー）
- [ ] `formatVerifyChecksAsFeedback()` ユニットテスト PASS
- [ ] 既存テスト全件リグレッションなし
- [ ] lint / typecheck PASS
- [ ] 手動テスト Task 11-2〜11-6 PASS（Phase 11）

Related: #1740

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 13-6: CI確認

1. PR作成後、GitHub Actions の CI が起動することを確認
2. CI の全ジョブが PASS することを確認
3. FAIL の場合:
   - エラーログを確認
   - 原因を特定して修正
   - 修正をコミットしてプッシュ
   - CI を再確認

| CI ジョブ | 結果 |
| --------- | ---- |
| lint      | -    |
| typecheck | -    |
| test      | -    |
| build     | -    |

## 参照資料

| 資料名          | パス                | 説明             |
| --------------- | ------------------- | ---------------- |
| タスク概要      | `index.md`          | AC定義・スコープ |
| Phase 12 成果物 | `outputs/phase-12/` | ドキュメント一式 |
| Phase 11 結果   | `outputs/phase-11/` | 手動テスト結果   |
| Phase 10 結果   | `outputs/phase-10/` | 最終レビュー判定 |

## 成果物

| 成果物 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

### `outputs/phase-13/pr-info.md` の構成

```markdown
# Phase 13: PR情報

## PR

| 項目     | 値   |
| -------- | ---- |
| PR URL   | -    |
| PR番号   | -    |
| ブランチ | -    |
| ベース   | main |

## CI結果

| ジョブ    | 結果 |
| --------- | ---- |
| lint      | -    |
| typecheck | -    |
| test      | -    |
| build     | -    |

## 作成日時

-
```

## 完了条件

- [ ] Task 13-1: ローカル品質チェック（typecheck / test / lint / shared build）が全て PASS
- [ ] Task 13-2: 変更ファイル一覧が確認されている（意図しないファイル・機密ファイルが含まれていない）
- [ ] Task 13-3: コミットメッセージが作成されている
- [ ] Task 13-4: ユーザーの明示的な承認を得ている
- [ ] Task 13-5: PR が作成されている（PR URL が存在する）
- [ ] Task 13-6: CI が全て PASS
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 備考

本 Phase が最終 Phase である。次の Phase はなし。
