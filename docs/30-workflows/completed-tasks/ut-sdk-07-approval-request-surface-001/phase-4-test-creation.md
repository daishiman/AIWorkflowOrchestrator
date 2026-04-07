# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 4                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 3                                     |
| 後続Phase  | Phase 5                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

TDD Red フェーズとして、`onApprovalRequest` の実装前にテストケースを作成し、失敗することを確認する。

## 背景

Phase 3 ゲートを通過した設計に基づき、以下のテストを作成する：

- `skill-creator-api.ts` の `onApprovalRequest` メソッド存在確認・動作テスト
- `SkillLifecyclePanel.tsx` の `ApprovalSheet` 再利用・クリーンアップテスト

## 命名規則整合確認（Phase 1-3 確認済み）

| 対象           | パターン                          |
| -------------- | --------------------------------- |
| テストファイル | `*.test.ts` / `*.test.tsx`        |
| テストケースID | `TC-APPR-01` 〜 形式              |
| mock パターン  | `vi.mock('electron')` + `vi.fn()` |
| describe 命名  | camelCase メソッド名に対応        |

## private method テスト方針（Phase 4 必須記載）

`safeOn` は `skill-creator-api.ts` 内の private 関数。テスト方針：

- **方針A**: `ipcRenderer.on` を mock して `safeOn` の呼び出しを間接確認する（推奨）
- **方針B**: `skillCreatorAPI` オブジェクト経由で `onApprovalRequest` を呼び出し、登録された callback が IPC イベントで呼ばれることを確認する

方針B を採用（public interface 経由のテストとして整合）。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                |
| ---------- | ------------------ | ------------------------------------- |
| SubAgent-A | Preload テスト     | skill-creator-api.ts テストケース設計 |
| SubAgent-B | Renderer テスト    | SkillLifecyclePanel テストケース設計  |
| SubAgent-C | Integration テスト | IPC疎通テストケース設計               |
| SubAgent-D | 統合審査           | テストケース網羅性・命名規則整合確認  |

## テストケース一覧

### TC-APPR-01: onApprovalRequest メソッド存在確認

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| 対象     | `skillCreatorAPI.onApprovalRequest`               |
| 種別     | Unit                                              |
| 前提     | `skill-creator-api.ts` の実装がない（Red）        |
| 手順     | `typeof skillCreatorAPI.onApprovalRequest` を確認 |
| 期待結果 | `'function'` を返す                               |

### TC-APPR-02: onApprovalRequest が正しいチャンネルを購読する

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 対象     | `skillCreatorAPI.onApprovalRequest`                           |
| 種別     | Unit                                                          |
| 前提     | `ipcRenderer.on` を `vi.fn()` でモック                        |
| 手順     | `onApprovalRequest(callback)` を呼び出す                      |
| 期待結果 | `ipcRenderer.on` が `'approval:request'` チャンネルで呼ばれる |

### TC-APPR-03: onApprovalRequest がコールバックを受信する

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 対象     | `skillCreatorAPI.onApprovalRequest`                                                                       |
| 種別     | Unit                                                                                                      |
| 前提     | `ipcRenderer` を `vi.doMock('electron')` でモック                                                         |
| 手順     | `onApprovalRequest(callback)` 登録後、IPC イベントを emit する                                            |
| 期待結果 | `callback` が `{ operationType, description, destination?, sessionId, operationId }` を受け取って呼ばれる |

### TC-APPR-04: onApprovalRequest がアンサブスクライブ関数を返す

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 対象     | `skillCreatorAPI.onApprovalRequest` の戻り値             |
| 種別     | Unit                                                     |
| 手順     | `const unsubscribe = onApprovalRequest(callback)` を実行 |
| 期待結果 | `typeof unsubscribe === 'function'`                      |

### TC-APPR-05: アンサブスクライブ後にコールバックが呼ばれない

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 対象     | `onApprovalRequest` の unsubscribe 動作                            |
| 種別     | Unit                                                               |
| 手順     | `unsubscribe()` 後に IPC イベントを emit する                      |
| 期待結果 | `callback` が呼ばれない（`ipcRenderer.removeListener` が呼ばれる） |

### TC-APPR-06: SkillLifecyclePanel が onApprovalRequest を購読する

| 項目     | 内容                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 対象     | `SkillLifecyclePanel.tsx`                                                                                                     |
| 種別     | Unit (React Testing Library)                                                                                                  |
| 前提     | `window.skillCreatorAPI.onApprovalRequest` もしくは `window.electronAPI.skillCreator.onApprovalRequest` を `vi.fn()` でモック |
| 手順     | コンポーネントをレンダリングする                                                                                              |
| 期待結果 | `getSkillCreatorApi()` 経由で `onApprovalRequest` が呼び出される                                                              |

### TC-APPR-07: SkillLifecyclePanel が approval request を受信して UI を表示する

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 対象     | `SkillLifecyclePanel.tsx` の approval UI 表示                                |
| 種別     | Unit                                                                         |
| 手順     | `onApprovalRequest` callback を trigger して approval payload を渡す         |
| 期待結果 | `data-testid="approval-sheet"` が確認でき、approve/reject ボタンが表示される |

### TC-APPR-08: approve ボタン押下で respondToApproval が呼ばれる

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| 対象     | `SkillLifecyclePanel.tsx` の approve アクション                   |
| 種別     | Unit                                                              |
| 手順     | approve ボタンをクリックする                                      |
| 期待結果 | `respondToApproval(sessionId, operationId, 'approve')` が呼ばれる |

### TC-APPR-09: reject ボタン押下で respondToApproval が呼ばれる

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 対象     | `SkillLifecyclePanel.tsx` の reject アクション                   |
| 種別     | Unit                                                             |
| 手順     | reject ボタンをクリックする                                      |
| 期待結果 | `respondToApproval(sessionId, operationId, 'reject')` が呼ばれる |

### TC-APPR-10: SkillLifecyclePanel アンマウント時に unsubscribe が呼ばれる

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 対象     | `SkillLifecyclePanel.tsx` の cleanup                         |
| 種別     | Unit                                                         |
| 手順     | コンポーネントをアンマウントする                             |
| 期待結果 | `onApprovalRequest` が返したアンサブスクライブ関数が呼ばれる |

## 参照資料

| 参照資料             | パス                                               | 説明           |
| -------------------- | -------------------------------------------------- | -------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`           | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物 |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`          | Phase 3 成果物 |
| ゲート判定           | `outputs/phase-3/gate-decision.md`                 | Phase 3 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`           | Phase 1 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物 |
| 矛盾チェック表       | `outputs/phase-3/contradiction-checklist.md`       | Phase 3 成果物 |

## 実行手順

1. Phase 3 成果物を確認する。
2. テストファイルを作成する（実装前 = Red）：
   - `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx`
3. テストを実行して全ケースが Red（失敗）であることを確認する。
4. Red 結果を `outputs/phase-4/red-test-result.md` に記録する。

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | TC一覧と手順詳細   |
| Red結果        | `outputs/phase-4/red-test-result.md`       | 実装前失敗確認記録 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | IPC疎通テスト計画  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-APPR-01〜10 が全て定義されている
- [ ] private method テスト方針が仕様書に明記されている
- [ ] Phase 1-3 で確認した命名規則と整合している
- [ ] Red テスト結果が記録されている（実装前失敗確認済み）
- [ ] 矛盾がないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 実行タスク

- TC-APPR-01〜10 のテストケース作成（Red フェーズ）
- `pnpm vitest run` で全テスト Red を確認
- テスト仕様書を `outputs/phase-4/` に出力

## 統合テスト連携

Phase 4 で作成したテストは Phase 5 実装の Green フェーズで使用される。
Phase 7 カバレッジ確認まで TC-APPR-01〜10 を継続的に利用する。

## 次のPhase

Phase 5: 実装
