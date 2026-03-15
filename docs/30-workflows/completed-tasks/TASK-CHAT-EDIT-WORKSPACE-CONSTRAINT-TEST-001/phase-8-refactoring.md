# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                        |
| Phase名    | リファクタリング                                                                         |
| タスクID   | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                                               |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                                                      |
| ステータス | not_started                                                                              |
| 作成日     | 2026-03-14                                                                               |
| 機能名     | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                                             |

## 目的

`chatEditHandlers.workspace-constraint.test.ts` のテストコード品質を改善する。重複排除・ファクトリパターン導入・describe ブロック構成の見直しにより、保守性と可読性を高める。TC-WS-01〜06 が全 PASS のまま維持されていることをリファクタ後に確認する。

## 実行タスク

- **重複排除**: 各テストケースで繰り返されるモックセットアップをヘルパー関数（`createMockContext`、`createWorkspaceEvent`）に抽出する
- **ファクトリパターン検討**: テストデータ（コンテキスト配列、ファイルパス）を生成するファクトリ関数を導入し、テスト間の一貫性を確保する
- **describe ブロック構成見直し**: TC-WS-01〜06 を以下の3グループに再編成する
  - `workspacePath 指定あり`（TC-WS-01, TC-WS-02, TC-WS-04, TC-WS-05）
  - `workspacePath 未指定`（TC-WS-03）
  - `空コンテキスト配列`（TC-WS-06）
- **リファクタ後テスト実行**: 全 TC が PASS のまま維持されていることを確認する

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7

| 参照資料                  | パス                                                                                       | 内容                                         |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Phase 4（テスト作成）     | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-4-test-creation.md`  | テスト設計の前提を確認する                   |
| Phase 7（カバレッジ確認） | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-7-coverage-check.md` | Branch Coverage 70% 以上の達成状況を確認する |
| テストファイル            | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`        | リファクタリング対象のテストコード           |
| 実装ファイル              | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                            | workspacePath 制約ガードの実装を確認する     |

### システム仕様（aiworkflow-requirements）

> リファクタリング前に以下の正本仕様を確認し、テスト設計との整合性を維持する。

| 参照資料                   | パス                                                                              | 内容                                         |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| security-electron-ipc-core | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | workspace 境界と sender 検証の契約           |
| api-ipc-agent-core         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:*` IPC 契約と `PERMISSION_DENIED` |
| lessons-learned-current    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | 契約ドリフト再発防止手順                     |

## 実行手順

### ステップ1: 参照資料を確認する

テストファイルと実装ファイルを読み込み、重複コードと改善点を特定する。

### ステップ2: ヘルパー関数を抽出する

`createMockContext` と `createWorkspaceEvent` ヘルパーを抽出し、各 TC から共通コードを除去する。ファクトリパターンの導入可否を判断し、テストデータ生成の一貫性を確保する。

### ステップ3: describe ブロックを再編成する

TC-WS-01〜06 を workspacePath の有無とコンテキスト配列の状態に基づいてグループ化し、テストの意図が明確に読み取れる構成にする。

### ステップ4: リファクタ後テスト実行で全 PASS を確認する

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

全 TC が PASS のままであることを確認し、リグレッションがないことを記録する。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携【必須】

リファクタリング後も TC-WS-01〜06 の全テストが PASS であることを確認する。特に以下の観点でリグレッションがないことを検証する。

- `isAllowedPath` のモック呼び出し回数アサーション（TC-WS-03、TC-WS-06）が正しく機能すること
- パストラバーサル攻撃テスト（TC-WS-04）がリファクタ後も PERMISSION_DENIED を返すこと

## 多角的チェック観点（AIが判断）

- ヘルパー関数の抽出によってテストの可読性が向上しているか
- ファクトリパターンが過剰な抽象化になっていないか（3ケース以下なら inline のほうが明確）
- describe ブロックのグループ分けがテスト意図を正確に反映しているか
- リファクタにより既存の mock assertion（`expect(mockIsAllowedPath).not.toHaveBeenCalled()`）が壊れていないか

## 成果物

| 成果物                     | パス                                                                                              | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| リファクタリング済みテスト | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`               | 重複排除・ファクトリパターン・describe 再構成済み |
| リファクタリング計画       | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-8/refactor-plan.md` | 変更内容と判断理由を記録する                      |

## 完了条件

- [ ] `createMockContext` または同等のヘルパー関数が抽出されている
- [ ] TC-WS-01〜06 の全テストがリファクタ後も PASS である
- [ ] describe ブロックが workspacePath の有無に基づいてグループ化されている
- [ ] テストの可読性が向上していることを確認した
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク                        | 担当  | ステータス  |
| --------------------------------- | ----- | ----------- |
| 重複コードの特定とヘルパー抽出    | agent | not_started |
| describe ブロック再編成           | agent | not_started |
| リファクタ後テスト実行・PASS 確認 | agent | not_started |
| refactor-plan.md 作成             | agent | not_started |

## タスク100%実行確認【必須】

Phase 8 完了前に以下を確認する。

- [ ] テスト実行コマンドで全 6 TC が PASS であることを確認した
- [ ] リファクタ前後でテスト件数が変化していないことを確認した（追加・削除なし）
- [ ] `refactor-plan.md` に変更内容と判断理由が記録されている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
