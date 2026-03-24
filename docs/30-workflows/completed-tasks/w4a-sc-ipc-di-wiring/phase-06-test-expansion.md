# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 6                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

DI 配線変更に関するテストカバレッジの不足箇所を特定し、追加テストを作成する。

## 実行タスク

### Task 1: カバレッジ分析

以下のコマンドでカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

特に以下のファイルの Branch Coverage と Function Coverage を確認する:

| ファイル                       | 確認する分岐                                                |
| ------------------------------ | ----------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts` | L120-132（plan の llmAdapter/resourceLoader 未注入分岐）    |
| `RuntimeSkillCreatorFacade.ts` | L257-262（improve の llmAdapter/resourceLoader 未注入分岐） |
| `RuntimeSkillCreatorFacade.ts` | L266-274（improve の skillFileManager 未注入分岐）          |

### Task 2: 不足テストの追加

Phase 4 で「既存テストでカバー済み」と判定したケースが、実際のカバレッジ結果で未カバーの場合は追加する。

追加候補テストケース:

| ID   | テストケース名                                                                           | 対象ファイル                                |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| TE-1 | plan() で llmAdapter 注入済み + resourceLoader 注入済みの場合、sendChat が呼ばれる       | `RuntimeSkillCreatorFacade.plan.test.ts`    |
| TE-2 | improve() で全3依存注入済みの場合、sendChat が呼ばれる                                   | `RuntimeSkillCreatorFacade.improve.test.ts` |
| TE-3 | plan() で llmAdapter のみ注入・resourceLoader 未注入の場合、スタブ応答を返す             | `RuntimeSkillCreatorFacade.plan.test.ts`    |
| TE-4 | improve() で llmAdapter + resourceLoader 注入・skillFileManager 未注入の場合、READ_ERROR | `RuntimeSkillCreatorFacade.improve.test.ts` |

### Task 3: テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

## 参照資料

- Phase 4 テスト作成（`phase-04-test-creation.md`）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`

## 統合テスト連携

以下のコマンドで関連テストを実行し、全て PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

## 多角的チェック観点（AIが判断）

IPC 配線タスクとして、以下の観点で実装内容を評価する:

- IPC 通信: `aiworkflow-requirements: api-*.md`, `interfaces-*.md`
- セキュリティ: `aiworkflow-requirements: security-api-electron.md`
- アーキテクチャ: `aiworkflow-requirements: architecture-*.md`

## サブタスク管理

| #   | タスク名         | ステータス |
| --- | ---------------- | ---------- |
| 1   | カバレッジ分析   | 未着手     |
| 2   | 不足テストの追加 | 未着手     |
| 3   | テスト実行       | 未着手     |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 成果物

- 追加テストケース（必要な場合のみ）
- カバレッジ計測結果

## 完了条件

- [ ] カバレッジ分析を実施した
- [ ] Branch Coverage の不足箇所を特定した
- [ ] 必要な追加テストを作成した
- [ ] 全テストが PASS した

## 次のPhase

Phase 7: カバレッジ確認
