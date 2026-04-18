# task-execute-async-snapshot-error-propagation-001 - タスク実行仕様書

## ユーザーからの元の指示

```text
GitHub Issue #1937: executeAsync() adapter エラーの onWorkflowStateSnapshot 伝搬統一
```

## メタ情報

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| タスクID     | TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001                                        |
| タスク名     | task-execute-async-snapshot-error-propagation-001                                        |
| 分類         | NON_VISUAL / runtime contract verification / docs close-out                              |
| 対象機能     | `RuntimeSkillCreatorFacade.executeAsync()` と `onWorkflowStateSnapshot` のエラー伝搬契約 |
| 優先度       | Low                                                                                      |
| 見積もり規模 | 小規模（Small）                                                                          |
| ステータス   | completed                                                                                |
| 作成日       | 2026-04-18                                                                               |
| 親タスク     | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 (#1959)                   |
| 関連Issue    | #1937                                                                                    |

## タスク概要

### 目的

本ブランチ上の current facts を基準に、`executeAsync()` の adapter error 伝搬仕様を過不足なく再確認し、2つの skill 定義に準拠した実行可能な workflow 仕様へ再構成する。

### 真の論点

1. `executeAsync()` の error 伝搬契約は、現在どのファイル境界で成立しているか。
2. `errorCode` / `errorMessage` を snapshot 本体へ追加すべきか、それとも callback 第3引数で十分か。
3. NON_VISUAL タスクとして必要な証跡と Phase 12 close-out を、skill 準拠でどう閉じるか。
4. Phase 13 を blocked として扱い、commit / PR 禁止ポリシーと矛盾なく運用できるか。

### 背景

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` では、`executeAsync()` の error パスで `onWorkflowStateSnapshot(planId, snapshot ?? null, errorMessage)` が既に使われている
- `apps/desktop/src/main/ipc/creatorHandlers.ts` では、snapshot または `errorMessage` を `emitWorkflowStateChanged()` へ中継している
- `aiworkflow-requirements` の completed ledger には、近縁タスク `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` が 2026-04-06 完了として記録済み
- したがって本 workflow は「未実装機能の新規開発」ではなく、「branch current facts と skill 定義の整合確認・差分確認・close-out 設計」が中心になる

### スコープ

#### 含む

- `executeAsync()` / `creatorHandlers` / workflow state 型まわりの current facts 調査
- `errorCode` を snapshot へ追加する必要性の判定
- NON_VISUAL 証跡、Phase 12 の必須6成果物、`outputs/artifacts.json` parity の定義
- 既存 branch 変更を前提とした差分確認型の Phase 5 設計

#### 含まない

- commit
- PR作成
- push
- Renderer UI の新規変更
- 実装済み current facts を無視した speculative redesign

## 受入基準

| ID   | 基準                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Phase 1 で `RuntimeSkillCreatorFacade.ts` / `SkillCreatorWorkflowEngine.ts` / `creatorHandlers.ts` の current facts が記録される |
| AC-2 | Phase 2 で `errorCode` を snapshot 本体へ追加するか否かの判断基準が明示され、不要なら不要理由が記録される                        |
| AC-3 | Phase 4〜10 が「未確定の新規実装」ではなく「差分確認と最小修正」の流れに再構成されている                                         |
| AC-4 | Phase 11 が NON_VISUAL 証跡の正本として `manual-test-result.md` を要求している                                                   |
| AC-5 | Phase 12 が 6 成果物、system spec sync、`artifacts.json` / `outputs/artifacts.json` parity、skill feedback を定義している        |
| AC-6 | Phase 13 が user approval 未取得のため `blocked` として扱われている                                                              |

## 4条件評価

| 条件         | 初期評価 | 方針                                                             |
| ------------ | -------- | ---------------------------------------------------------------- |
| 矛盾なし     | 要補強   | `errorCode` 追加前提を廃し、current facts を先に確定する         |
| 漏れなし     | 要補強   | Phase 11/12/13 と artifacts parity を補完する                    |
| 整合性あり   | 要補強   | phase 名称、成果物名、NON_VISUAL 運用、status を揃える           |
| 依存関係整合 | 概ね良好 | runtime → IPC relay → manual evidence → close-out の順で明示する |

## Phase 構成

| Phase | 名称                 | ステータス | 仕様書ファイル                 |
| ----- | -------------------- | ---------- | ------------------------------ |
| 1     | 要件定義             | completed  | `phase-1-requirements.md`      |
| 2     | 設計                 | completed  | `phase-2-design.md`            |
| 3     | 設計レビューゲート   | completed  | `phase-3-design-review.md`     |
| 4     | テスト作成           | completed  | `phase-4-test-creation.md`     |
| 5     | 差分確認・最小修正   | completed  | `phase-5-implementation.md`    |
| 6     | テスト拡充           | completed  | `phase-6-test-expansion.md`    |
| 7     | カバレッジ確認       | completed  | `phase-7-coverage-check.md`    |
| 8     | リファクタリング確認 | completed  | `phase-8-refactoring.md`       |
| 9     | 品質保証             | completed  | `phase-9-quality-assurance.md` |
| 10    | 最終レビューゲート   | completed  | `phase-10-final-review.md`     |
| 11    | 手動テスト           | completed  | `phase-11-manual-test.md`      |
| 12    | ドキュメント更新     | completed  | `phase-12-documentation.md`    |
| 13    | PR作成               | blocked    | `phase-13-pr-creation.md`      |

## 参照資料

| 資料名            | パス                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| runtime 実装      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                       |
| workflow state 型 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                      |
| IPC relay         | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                              |
| runtime テスト    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`           |
| completed ledger  | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`                              |
| 近縁完了タスク    | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001.md`               |
| 親タスク          | `docs/30-workflows/completed-tasks/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/index.md` |

## 注意事項

- Phase 1 の結論で「current branch で既に仕様充足」と判明した場合、Phase 5 は新規実装ではなく差分確認と no-op 記録へ切り替える
- `errorCode` の snapshot 拡張は、shared/public contract 変更が必要と確認できた場合だけ許可する
- Phase 12 までは docs / evidence の整備のみを行い、Phase 13 は blocked のまま維持する
