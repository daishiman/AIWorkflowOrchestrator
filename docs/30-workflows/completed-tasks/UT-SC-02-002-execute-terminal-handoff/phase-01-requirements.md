# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 1                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

`RuntimeSkillCreatorFacade.execute()` の terminal_handoff 未分岐を修正するための要件を定義する。

## 実行手順

## P50チェック: 既実装状態の調査

### 確認コマンド

```bash
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
grep -n "terminal_handoff\|void decision" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### 調査結果

| 判定     | 条件                                        | 結果 |
| -------- | ------------------------------------------- | ---- |
| 未実装   | `execute()` に `terminal_handoff` 分岐なし  | 該当 |
| 残存     | `void decision;` が L118 に存在             | 該当 |
| 型未定義 | `RuntimeSkillCreatorExecuteResponse` 未定義 | 該当 |

結論: **完全に未実装。新規実装が必要。**

## 実行タスク

1. 要件抽出: セキュリティリスクの影響範囲を特定する
2. 受入基準作成: 修正完了の検証可能な基準を定義する
3. 既存パターン分析: `plan()` / `improve()` の terminal_handoff 実装パターンを正本とする

## 要件抽出

### FR（機能要件）

| ID   | 要件                                                                                  | 優先度 |
| ---- | ------------------------------------------------------------------------------------- | ------ |
| FR-1 | `execute()` が `terminal_handoff` 判定時に `SkillExecutor.execute()` を呼び出さない   | 高     |
| FR-2 | `execute()` が `terminal_handoff` 時に `TerminalHandoffBundle` を含むレスポンスを返す | 高     |
| FR-3 | `RuntimeSkillCreatorExecuteResponse` Union型が `skillCreator.ts` に定義される         | 高     |
| FR-4 | `execute()` の戻り値型が `RuntimeSkillCreatorExecuteResponse` に変更される            | 高     |
| FR-5 | `void decision;` が除去される                                                         | 高     |

### NFR（非機能要件）

| ID    | 要件                                                                | 優先度 |
| ----- | ------------------------------------------------------------------- | ------ |
| NFR-1 | `plan()` / `improve()` / `execute()` の分岐パターンが統一されている | 高     |
| NFR-2 | 既存の `integrated_api` パスの動作が変更されない（後方互換性）      | 高     |
| NFR-3 | テストカバレッジ基準を維持（Line 80%+, Branch 60%+, Function 80%+） | 中     |

## 受入基準

| ID   | 基準                                                                                 | 検証方法                                      |
| ---- | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| AC-1 | `execute()` が `terminal_handoff` 判定時に `SkillExecutor.execute()` を呼ばない      | テスト: executeMock が呼ばれないことを assert |
| AC-2 | `execute()` が `terminal_handoff` 時に `{ type: "terminal_handoff", bundle }` を返す | テスト: 戻り値の shape を assert              |
| AC-3 | `RuntimeSkillCreatorExecuteResponse` 型が `plan`/`improve` と同じパターンで定義      | TypeCheck: `pnpm typecheck` PASS              |
| AC-4 | `void decision;` が除去されている                                                    | grep: `void decision` が0件                   |
| AC-5 | 既存の `integrated_api` テストケースが引き続き PASS                                  | テスト: 既存テスト全 PASS                     |
| AC-6 | terminal_handoff テストで `TerminalHandoffBuilder.build()` が正しい引数で呼ばれる    | テスト: buildSpy の引数を assert              |

## 影響範囲

### 修正対象ファイル

| ファイル                                                                             | 変更内容                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                          | `RuntimeSkillCreatorExecuteResponse` 型追加 |
| `packages/shared/src/types/index.ts`（該当する場合）                                 | re-export 追加                              |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | `execute()` に分岐追加、戻り値型変更        |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | テスト修正・追加                            |

### 波及影響を確認すべきファイル（本タスクスコープ外、未タスク化対象）

| ファイル                                        | 確認内容                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`  | 戻り値型 `IpcResult<RuntimeSkillCreatorExecuteResult>` の Union 型対応 |
| `apps/desktop/src/preload/skill-creator-api.ts` | Preload 型定義の Union 型対応                                          |

> 注意: `execute()` の戻り値が Union 型になるため、上記 IPC ハンドラ・Preload の型定義に波及する。
> 本タスクでは `RuntimeSkillCreatorFacade` 層の修正に集中し、IPC/Preload 層の型対応は未タスク化する（P44/P45 対策）。

### 影響を受けないファイル

- RuntimePolicyResolver.ts（内部ロジック変更なし）
- TerminalHandoffBuilder.ts（変更なし）

## 参照資料

| 資料名                    | パス                                                                                 | 説明                                          |
| ------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 修正対象（L93-128: execute()）                |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                                          | Union型パターン（L354-369: plan/improve参考） |
| テストファイル            | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | L162-246: execute テスト                      |
| 親タスク index            | `docs/30-workflows/completed-tasks/w1b-sc-runtime-policy-closure/index.md`           | 元タスクの受入基準                            |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                      |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ------------------------- |
| execution capability contract | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | RuntimePolicy 設計契約    |
| security-api-electron         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`              | Electron IPC セキュリティ |

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

- 既存の `RuntimeSkillCreatorFacade.test.ts` を修正・拡充する
- `execute()` の terminal_handoff テストケースを `plan()` / `improve()` のパターンに合わせて追加する
- `integrated_api` パスの既存テストが引き続き PASS することを確認する

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物     | パス                                         | 説明         |
| ---------- | -------------------------------------------- | ------------ |
| 要件定義書 | `phase-01-requirements.md`（本ファイル）     | 要件定義     |
| 要件概要   | `outputs/phase-1/requirements-definition.md` | 要件サマリー |

## 完了条件

- [x] FR-1〜FR-5、NFR-1〜NFR-3 が定義されている
- [x] AC-1〜AC-6 が検証方法付きで定義されている
- [x] 修正対象ファイルと影響範囲が特定されている
- [x] P50チェックで既実装状態が確認されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている

## 次のPhase

Phase 2: 設計
