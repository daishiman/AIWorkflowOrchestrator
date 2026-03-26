# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 6                      |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

DI 配線変更に関するテストカバレッジの不足箇所を特定し、追加テストを作成する。

## 背景

Phase 5 の実装完了後、カバレッジの不足箇所を特定し、追加テストを作成する。Branch/Function Coverageの改善を目指す。

## 実行タスク

### Task 1: カバレッジ分析

以下のコマンドでカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

特に以下のファイルの Branch Coverage と Function Coverage を確認する:

| ファイル                       | 確認する分岐                                                |
| ------------------------------ | ----------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts` | L111-123（plan の llmAdapter/resourceLoader 未注入分岐）    |
| `RuntimeSkillCreatorFacade.ts` | L242-248（improve の llmAdapter/resourceLoader 未注入分岐） |
| `RuntimeSkillCreatorFacade.ts` | L252-259（improve の skillFileManager 未注入分岐）          |

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

## 成果物

- 追加テストケース（必要な場合のみ）
- カバレッジ計測結果

## 完了条件

- [ ] カバレッジ分析を実施した
- [ ] Branch Coverage の不足箇所を特定した
- [ ] 必要な追加テストを作成した
- [ ] 全テストが PASS した

## 統合テスト連携

Branch/Function Coverage の不足箇所を特定し、追加テストを作成する。特に DI 配線の分岐（llmAdapter 注入/未注入、resourceLoader 注入/未注入、skillFileManager 注入/未注入）のカバレッジを確認。

## 多角的チェック観点

| 観点           | 適用                                               | 仕様参照先                                   |
| -------------- | -------------------------------------------------- | -------------------------------------------- |
| アーキテクチャ | DI 分岐の網羅的テスト（Graceful Degradation パス） | `aiworkflow-requirements: architecture-*.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. カバレッジ計測・分析（Task 1）
2. 不足テストの特定（TE-1〜TE-4 の判定）
3. 追加テスト作成（必要な場合のみ）
4. 全テスト PASS 確認（Task 3）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 6
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                 | 結果 | 備考 |
| ---------------------- | ---- | ---- |
| Task 1: カバレッジ分析 | -    | -    |
| Task 2: 不足テスト追加 | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 7: カバレッジ確認
