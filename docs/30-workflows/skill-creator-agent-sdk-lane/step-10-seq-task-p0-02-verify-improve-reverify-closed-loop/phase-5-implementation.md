# Phase 5: 実装

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| Phase名    | 実装                                             |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 4: テスト作成                              |
| 次Phase    | Phase 6: テスト拡充                              |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

WorkflowEngine に `recordVerifyPass()` を追加し、improve→verify 遷移を実装し、Facade・IPC handler を更新して閉ループを成立���せる。

## 実行タスク

### Task 1: WorkflowEngine への recordVerifyPass() 追加

- `SkillCreatorWorkflowEngine.ts` に `recordVerifyPass()` メソッドを実装する
- `recordVerifyFailure()` と対称的なインターフェースにする
- verify phase であることを前提条件として assert する
- verify pass 後の phase 遷移先を設定する

### Task 2: phase 遷移テーブルの修正

- improve→verify（re-verify）遷移を遷移テーブルに追加する
- verify(pass) 時の遷移先を遷移テーブルに追加する
- `requestReverify()` の eligibility check を新遷移と整合させる
- 不正遷移のガードを維持する

### Task 3: RuntimeSkillCreatorFacade 更新

- `recordVerifyPass()` を Facade 経由で呼び出せるようにする
- improve 完了後に re-verify を要求するメソッドを追加または修正する
- 既存の `recordVerifyFailure()` 経路との並列配置を確認する

### Task 4: IPC handler 更新

- `creatorHandlers.ts` に verify pass のハンドラを追加する
- 既存の verify fail ハンドラとの一貫性を確認する
- renderer からの verify pass 通知を受け取る経路を確立する

### Task 5: UI snapshot 拡張

- `getCreatorSnapshot` が verify の pass/fail/pending 状態を含むよう修正する
- `SkillCreatorVerifyResult` の status を snapshot に���映する

## 参照資料

| ���料名            | パス                                                                   | 説明            |
| ------------------ | ---------------------------------------------------------------------- | --------------- |
| テスト仕様書       | `outputs/phase-4/test-specifications.md`                               | fail-first 観点 |
| 設計成果物         | `outputs/phase-2/design-document.md`                                   | 実装の根拠      |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 修正本体        |
| RuntimeFacade      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | Facade 修正対象 |
| creatorHandlers    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | IPC 修正対象    |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                            | 型定義の参��    |

## 統合テスト連携

- Phase 4 で定義した fail-first ケースを pass に反転する
- 完全サイクルテストが green になることを確認する

## 成果物

| 成果物   | パス                                       | 説明                                      |
| -------- | ------------------------------------------ | ----------------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更点、遷移テーブル修正、Facade/IPC 更新 |

## 完了条件

- [ ] `recordVerifyPass()` が WorkflowEngine に実装されている
- [ ] improve→verify 遷移が遷移テーブルに追加��れている
- [ ] Facade 経由で verify pass が呼び出せ��
- [ ] IPC handler が verify pass を処理する
- [ ] UI snapshot が verify 状態を含む
- [ ] Phase 4 のテストが全て pass する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各���スクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
