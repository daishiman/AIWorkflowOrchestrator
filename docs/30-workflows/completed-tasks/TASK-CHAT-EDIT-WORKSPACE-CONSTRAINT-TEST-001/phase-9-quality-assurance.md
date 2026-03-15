# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 9                                            |
| Phase名    | 品質検証                                     |
| タスクID   | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001   |
| 前提Phase  | Phase 8（リファクタリング）                  |
| 後続Phase  | Phase 10（最終レビュー）                     |
| ステータス | not_started                                  |
| 作成日     | 2026-03-14                                   |
| 機能名     | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |

## 目的

`chatEditHandlers` の workspacePath セキュリティ検証テストの品質を横断観点で確認する。Lint・型チェック・全テスト実行・セキュリティ観点の確認を経て、Phase 10 最終レビューに向けた品質ゲートをクリアする。

## 実行タスク

- **Lint チェック**: テストファイルを含む変更ファイルに ESLint 違反がないことを確認する
- **型チェック**: TypeScript 型エラーがないことを確認する
- **全テスト実行**: `@repo/desktop` の全テストスイートを実行し、既存テストへのリグレッションがないことを確認する
- **セキュリティチェック**: TC-WS-04（パストラバーサル攻撃）のテストが PERMISSION_DENIED を正しく返すことを個別確認する
- **品質ゲート基準確認**: Branch Coverage 70% 以上を達成していることを確認する

## 参照資料

依存Phase: Phase 5

| 参照資料                    | パス                                                                                    | 内容                                       |
| --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 8（リファクタリング） | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-8-refactoring.md` | リファクタリング済みテストコードを確認する |
| テストファイル              | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`     | 品質検証対象のテストコード                 |
| 実装ファイル                | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                         | workspacePath 制約ガードの実装             |

### システム仕様（aiworkflow-requirements）

> 品質検証前に以下の正本仕様を確認し、実装との整合性を確保する。

| 参照資料                   | パス                                                                              | 内容                                              |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| security-electron-ipc-core | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | パストラバーサル防止・sender 検証・workspace 境界 |
| api-ipc-agent-core         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:*` 契約・`PERMISSION_DENIED` 定義      |
| interfaces-llm             | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | request/response 型契約                           |

## 実行手順

### ステップ1: Lint チェックを実行する

```bash
pnpm lint
```

ESLint 違反が 0 件であることを確認する。未使用 import、`any` 型の不正使用が残っていないことを確認する。

### ステップ2: 型チェックを実行する

```bash
pnpm typecheck
```

TypeScript 型エラーが 0 件であることを確認する。テストファイル内の mock 型定義が正しいことを確認する。

### ステップ3: 全テストスイートを実行する

```bash
pnpm --filter @repo/desktop test
```

既存テストへのリグレッションが 0 件であることを確認する。新規テストファイルが既存のテストスイートに干渉していないことを確認する。

### ステップ4: パストラバーサルセキュリティチェックを個別確認する

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

TC-WS-04（パストラバーサル攻撃: `../../../etc/passwd`）が PERMISSION_DENIED を返すことを確認する。
TC-WS-05（複数コンテキストのうち1つが workspace 外）が PERMISSION_DENIED を返すことを確認する。

### ステップ5: 品質ゲート基準を確認する

| 指標              | 基準値   | 確認方法                                |
| ----------------- | -------- | --------------------------------------- |
| Line Coverage     | 80% 以上 | vitest --coverage で確認                |
| Branch Coverage   | 70% 以上 | vitest --coverage で確認                |
| Function Coverage | 80% 以上 | vitest --coverage で確認                |
| Lint 違反         | 0 件     | pnpm lint の出力で確認                  |
| 型エラー          | 0 件     | pnpm typecheck の出力で確認             |
| リグレッション    | 0 件     | pnpm --filter @repo/desktop test で確認 |

### ステップ6: 成果物と完了条件を確認する

品質チェックリストに各ステップの結果を記録し、品質 blocker が 0 件であることを確認する。

## 統合テスト連携【必須】

全テストスイート実行において、以下の点を確認する。

- workspacePath 制約テスト（TC-WS-01〜06）が全 PASS であること
- 既存の `chatEditHandlers.test.ts`（存在する場合）に干渉していないこと
- `isAllowedPath` のモック実装が他のテストスイートに漏れていないこと（`beforeEach`/`afterEach` で確実にリセットされていること）

## 多角的チェック観点（AIが判断）

- Lint チェックで `any` 型の不正使用が検出されていないか
- テストファイル内の import が全て使用されているか（未使用 import 禁止）
- `vi.mock` のスコープが適切で、テスト間でモック状態が汚染されていないか（P9: モジュールスコープ変数のテスト間リーク）
- パストラバーサル攻撃テストが OWASP Top 10 の Path Traversal 要件を満たしているか
- `.trim() === ""` バリデーション（P42）がハンドラ実装に適用されているか

## 成果物

| 成果物             | パス                                                                                                            | 内容                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 品質チェックリスト | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-9/quality-assurance-checklist.md` | Lint・型・テスト・セキュリティの確認結果を記録する |

## 完了条件

- [ ] `pnpm lint` が 0 エラー・0 警告で完了している
- [ ] `pnpm typecheck` が 0 エラーで完了している
- [ ] `pnpm --filter @repo/desktop test` で既存テストへのリグレッションが 0 件である
- [ ] TC-WS-04（パストラバーサル）が PERMISSION_DENIED を正しく返すことを確認した
- [ ] Branch Coverage 70% 以上を達成している
- [ ] 品質 blocker が 0 件である
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク                               | 担当  | ステータス  |
| ---------------------------------------- | ----- | ----------- |
| Lint チェック実行・結果記録              | agent | not_started |
| 型チェック実行・結果記録                 | agent | not_started |
| 全テストスイート実行・リグレッション確認 | agent | not_started |
| パストラバーサルセキュリティ個別確認     | agent | not_started |
| 品質ゲート基準達成確認                   | agent | not_started |
| quality-assurance-checklist.md 作成      | agent | not_started |

## タスク100%実行確認【必須】

Phase 9 完了前に以下を確認する。

- [ ] Lint・型チェック・全テスト実行の3コマンドが全て成功した
- [ ] TC-WS-04 のセキュリティテストが PERMISSION_DENIED を正しく返すことを確認した
- [ ] `quality-assurance-checklist.md` に各ステップの実行結果が記録されている
- [ ] 品質 blocker が残っていないことを確認した

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
