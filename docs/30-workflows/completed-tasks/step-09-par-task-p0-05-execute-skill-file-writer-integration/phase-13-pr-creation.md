# Phase 13: PR作成

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| 機能名     | execute-skill-file-writer-integration |
| タスクID   | TASK-P0-05                            |
| タスク種別 | 機能追加                              |
| UI task    | No                                    |
| 作成日     | 2026-03-30                            |

## 目的

ユーザーの明示的な承認を得た後に、PR を作成する。Phase 12 までの全成果物が揃っていることを前提条件とし、`/ai:diff-to-pr` を使用して品質検証からPR作成までを一貫して実行する。

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

> **重要**: ユーザーの明示的な承認がない限り、PR作成を実行しないこと。`spec_created` 状態では本Phaseは `blocked` を維持する。

## 実行タスク

### Task 13-1: PR作成前の最終確認

1. `git status` で未コミットの変更がないことを確認
2. `git diff main...HEAD` で PR に含まれる全変更を確認
3. `pnpm lint && pnpm typecheck` で品質チェック
4. `pnpm vitest run` で全テストPASS確認

### Task 13-2: `/ai:diff-to-pr` によるPR作成

`/ai:diff-to-pr` スキルを使用して以下を自動実行する:

1. リモート main 同期・コンフリクト解消
2. 品質検証（typecheck, lint, test）
3. 差分分析・ブランチ作成・コミット
4. PR本文生成・PR作成
5. CI/CD 確認

### Task 13-3: PR本文テンプレート

```markdown
## Summary

- `execute()` 内で LLM 応答から `SkillGeneratedContent` を抽出し、`SkillFileWriter.persist()` に渡すパスを実装
- LLM 応答のコードブロック抽出パーサー（`parseLlmResponseToContent`）を追加
- `RuntimeSkillCreatorExecuteResult` に `persistResult` / `persistError` フィールドを追加
- persist 失敗時の graceful degradation（execute 自体は success）

### 受入基準の充足

| AC   | 基準                                        | 状態 |
| ---- | ------------------------------------------- | ---- |
| AC-1 | LLM応答解析・コードブロック抽出             | ✅   |
| AC-2 | SkillGeneratedContent型変換                 | ✅   |
| AC-3 | SkillFileWriter.persist()によるファイル書出 | ✅   |
| AC-4 | ExecuteResultに書出結果含む                 | ✅   |
| AC-5 | パース失敗時エラーハンドリング              | ✅   |

### 変更ファイル

- `packages/shared/src/types/skillCreator.ts` — 型拡張
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — execute内persist呼出
- LLM応答パーサーユーティリティ
- テストファイル

## Test plan

- [ ] `parseLlmResponseToContent` ユニットテスト PASS
- [ ] `execute()` 統合テスト PASS（正常系・異常系）
- [ ] SkillFileWriter未DI時のgraceful degradation テスト PASS
- [ ] persist失敗時のエラーハンドリング テスト PASS
- [ ] lint / typecheck PASS
- [ ] 手動テスト TC-01〜TC-04 PASS（Phase 11）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Task 13-4: CI確認

1. PR作成後、GitHub Actions の CI が起動することを確認
2. CI の全ジョブが PASS することを確認
3. FAIL の場合は修正してプッシュ

### Task 13-5: タスクディレクトリの移動

PR がマージされた後、タスクディレクトリを `completed-tasks` へ移動する。

```bash
# PR マージ後に実行
mv docs/30-workflows/step-09-par-task-p0-05-execute-skill-file-writer-integration \
   docs/30-workflows/completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration
```

> **注意**: この移動は PR マージ後に別コミットで行う。PR 内には含めない。

## 参照資料

| 資料名             | パス                                 | 説明             |
| ------------------ | ------------------------------------ | ---------------- |
| タスク概要         | `index.md`                           | AC定義・スコープ |
| Phase 12 成果物    | `outputs/phase-12/`                  | ドキュメント一式 |
| diff-to-pr スキル  | `/ai:diff-to-pr`                     | PR作成自動化     |
| レビューゲート基準 | `references/review-gate-criteria.md` | PR作成の前提条件 |

## 統合テスト連携

| 観点          | 内容                                                |
| ------------- | --------------------------------------------------- |
| Phase 12 依存 | 全Phase 12成果物が揃っていることが前提              |
| CI/CD         | PR作成後に GitHub Actions で自動検証                |
| マージ後作業  | completed-tasks への移動、artifacts.json の最終更新 |

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

- [ ] ユーザーの明示的な承認を得ている
- [ ] Phase 10〜12 の全成果物が存在する
- [ ] lint / typecheck / test が全て PASS
- [ ] PR が作成されている
- [ ] CI が全て PASS
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**
