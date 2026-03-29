# Phase 13: PR作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 13                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

全 Phase の成果を集約し、ローカルチェックを実施した上で変更サマリーを作成する。ユーザー承認後に PR を作成する。

## 実行タスク

- ローカルチェック（typecheck / lint / test）を最終実行する
- 変更サマリーを作成する
- コミットメッセージを作成する
- ユーザー承認後に PR を作成する

## 参照資料

| 資料名                | パス                        | 説明         |
| --------------------- | --------------------------- | ------------ |
| index.md              | `index.md`                  | タスク概要   |
| Phase 10 レビュー     | `phase-10-final-review.md`  | AC 充足確認  |
| Phase 12 ドキュメント | `phase-12-documentation.md` | ドキュメント |

## 実行手順

### ステップ1: ローカルチェックを実行する

```bash
pnpm typecheck
pnpm lint
pnpm vitest run
```

- 全チェックがエラー 0 件で通ることを確認する。
- 結果を `{outputs/phase-13/local-check-result.md` に記録する。

### ステップ2: 変更サマリーを作成する

`{outputs/phase-13/change-summary.md` に以下を記載:

**変更ファイル**:

| ファイル                                                              | 変更内容                           |
| --------------------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | `status` / `degradedReason` 型追加 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | スタブ → エラー変換                |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | エラー検出・IpcResult 変換         |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | エラー表示追加                     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | エラー表示追加                     |
| `RuntimeSkillCreatorFacade.test.ts`                                   | テスト追加（TC-01〜TC-16）         |

**AC 充足状況**:

- AC-1〜AC-7: 全て充足（Phase 10 で確認済み）

### ステップ3: コミットメッセージを作成する

```
fix(skill-creator): TASK-RT-02 スタブレスポンスを明示的エラーに変換

- RuntimeSkillCreatorPlanResponse に status/degradedReason/userMessage を追加
- plan()/execute()/improve() のスタブを error レスポンスに置換
- creatorHandlers.ts に IPC エラー変換を追加
- SkillLifecyclePanel/SkillCreateWizard にエラー表示を追加
- reason code: llm_adapter_unavailable / resource_loader_unavailable
```

### ステップ4: PR を作成する（ユーザー承認後）

- **注意**: `spec_created` ステータスのため、ユーザー承認なしに PR / commit は実行しない。
- ユーザー承認後に `gh pr create` を実行する。

**PR タイトル**: `fix(skill-creator): TASK-RT-02 stub response → error notification`

**PR 本文**:

```markdown
## Summary

- スタブレスポンス（空データ）を明示的エラーに変換し、UI にフィードバック
- reason code: `llm_adapter_unavailable` / `resource_loader_unavailable`
- AC-1〜AC-7 充足確認済み

## Test plan

- [ ] TC-01〜TC-10: Facade / IPC handler のユニットテスト
- [ ] TC-11〜TC-16: エッジケーステスト
- [ ] 手動テスト: Electron アプリでエラー表示確認
- [ ] 正常系回帰テスト: 既存パスが非破壊
```

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない。
- `spec_created` ステータスのため、local check と change summary までで止める。

## 統合テスト連携

- PR 作成後に CI パイプラインで全テストが通ることを確認する。

## 成果物

| 成果物               | パス                                      | 説明                      |
| -------------------- | ----------------------------------------- | ------------------------- |
| ローカルチェック結果 | `{outputs/phase-13/local-check-result.md` | typecheck/lint/test 結果  |
| 変更サマリー         | `{outputs/phase-13/change-summary.md`     | 変更ファイル・AC 充足状況 |

## 完了条件

- [ ] ローカルチェックがエラー 0 件で通る
- [ ] 変更サマリーが作成されている
- [ ] コミットメッセージが作成されている
- [ ] ユーザー承認後に PR が作成されている（または blocked 状態で待機）
- [ ] **本Phase内の全タスクを100%実行完了**
