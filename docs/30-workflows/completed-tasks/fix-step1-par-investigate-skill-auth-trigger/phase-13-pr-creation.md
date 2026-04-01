# Phase 13: PR作成

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 13                        |
| 機能名 | TASK-TRACE-SKILL-AUTH-001 |
| 作成日 | 2026-04-01                |

## 重要事項

- コミットしない
- PR を作成しない
- ユーザー明示指示があるまで実行しない

## PR 準備条件

以下が全て満たされた場合に PR 作成の準備が完了したとみなす:

| 条件                              | 確認方法                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テストが全て PASS    | `manual-test-result.md` 確認                                                                                                                                                                                                       |
| Phase 12 ドキュメント更新が完了   | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` / `lessons-learned.md` 存在確認 |
| デバッグコードの痕跡がないこと    | grep 確認                                                                                                                                                                                                                          |
| TC-01〜TC-08 が全て GREEN         | `pnpm vitest run` 実行確認                                                                                                                                                                                                         |
| lint / typecheck エラーがないこと | 実行確認                                                                                                                                                                                                                           |

## PR タイトル候補

```
fix: スキル生成フローでの不要な auth:login IPC 呼び出しを除去 (TASK-TRACE-SKILL-AUTH-001)
```

## PR 説明候補

```markdown
## 概要

スキル生成ボタン押下時に `auth:login` IPC タイムアウトが発生していたと疑われた問題を調査し、
現行コードでは不要な呼び出し経路がないことを確認したうえで、調査痕跡の整理と回帰防止を行う。
Phase 12 では `implementation-guide.md` を中心に、system spec / unassigned / compliance まで含めて bundle を揃える。

## 変更内容

- `authSlice.ts` の一時的な `console.trace()` を除去
- スキル生成フローが auth:login を呼ばないことをテスト (TC-01) で保護
- 並列タスク `TASK-FIX-AUTH-IPC-001` / `TASK-FIX-IPC-TIMEOUT-001` との関係を明示する
- `outputs/phase-12/implementation-guide.md` を追加し、Phase 12 の PR メッセージ元を固定する
- `outputs/phase-12/system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` を追加し、canonical bundle を固定する

## 調査方法

`authSlice.ts` の `login()` に `console.trace()` を一時追加し、
スタックトレースから呼び出し経路を特定した。

## テスト

- TC-01: スキル生成フローで auth:login が呼ばれないことを確認
- TC-02: AccountSection からの正当な auth:login 呼び出しが継続して動作することを確認
- TC-03〜08: エッジケースのテスト

## 関連タスク

- TASK-TRACE-SKILL-AUTH-001 (本タスク)
- TASK-FIX-AUTH-IPC-001 (並列実行タスク)
- TASK-FIX-IPC-TIMEOUT-001 (並列実行タスク)
```

## 完了条件

- [ ] PR 作成は blocked であると明記されている
- [ ] ユーザーからの明示指示を待つことが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
