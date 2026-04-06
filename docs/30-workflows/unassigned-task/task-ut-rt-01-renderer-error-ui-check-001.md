# TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001

## 1. メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001              |
| 種別     | follow-up / verification                               |
| 優先度   | Medium                                                 |
| 親タスク | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 |
| 作成日   | 2026-04-06                                             |
| 状態     | open                                                   |

## 2. 背景

TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 のスコープは Main 層のみ（`RuntimeSkillCreatorFacade.ts`・`creatorHandlers.ts`・`skill-creator-api.ts`）。

Renderer 側（`SkillLifecyclePanel.tsx`）でエラーメッセージが実際に UI に表示されているかの E2E 確認は Phase 1 のスコープ「含まないもの」として除外された。

IPC ワイヤリングは実装済みだが、ユーザーが「スキル実行に失敗した原因」を UI から読み取れることの E2E 証跡が存在しない。

### 発見ソース

- Phase 11 既知の制限
- Phase 1 スコープ「含まないもの」

## 3. 実施スコープ

- `SkillLifecyclePanel.tsx` でエラーメッセージ（`error?` 引数）が適切に UI に表示されることをE2Eテストまたは手動テストで確認する
- エラー表示UI（エラーメッセージ文字列の表示箇所）の実装状況を確認する
- 必要に応じて Renderer 側のエラー表示コンポーネントを追加する

## 4. 依存関係

| 依存                                                   | 内容                       |
| ------------------------------------------------------ | -------------------------- |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 | IPC ワイヤリング完了が前提 |

## 5. 備考

IPC ワイヤリングは既存のため低リスクだが、ユーザー体験の改善としての E2E 確認は有用。
