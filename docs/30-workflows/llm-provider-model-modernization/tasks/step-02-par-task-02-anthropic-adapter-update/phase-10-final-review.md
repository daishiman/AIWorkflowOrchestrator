# Phase 10: 最終レビュー — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 10                       |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Phase 9 の品質保証を経た成果物を多角的にレビューし、Phase 11 への移行可否を判定する。

## 実行タスク

### Task 10-1: 受入基準（AC）の最終検証

Phase 1 で定義した受入基準の全項目を検証する。

| AC ID  | 基準                                                                | 検証コマンド / 方法                                                                                      | 判定 |
| ------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---- |
| AC-001 | `AnthropicAdapter.ts` L207 の model ID が `claude-haiku-4-5` である | `grep -n "claude-haiku-4-5" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                      | 確認 |
| AC-002 | `claude-3-haiku-20240307` という文字列がファイル内に残存しない      | `grep -n "claude-3-haiku-20240307" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` の出力が 0 件 | 確認 |
| AC-003 | `checkHealth` テストが `claude-haiku-4-5` を期待値として検証する    | `cd apps/desktop && pnpm vitest run` で HC-001 が PASS                                                   | 確認 |
| AC-004 | TypeScript コンパイルエラーが 0 件である                            | `pnpm --filter @repo/desktop typecheck` の出力がエラー 0                                                 | 確認 |
| AC-005 | 変更前後で `sendChat` / `streamChat` の動作に変化がない             | `ADP-008` / `ADP-009` / `ADP-010` / `streamChat` テスト全件 PASS                                         | 確認 |

### Task 10-2: コード品質最終確認

| 確認項目                                                      | 確認内容                                                                                                    | 判定                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 変更行数が設計（1行）と一致している                           | `git diff --stat apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` で変更行確認                       | 確認                               |
| `claude-3-haiku-20240307` が他の Adapter にも残存していないか | `grep -rn "claude-3-haiku-20240307" apps/desktop/src/main/adapters/` — 本タスクのスコープ外であることを認識 | 確認（スコープ外は別タスクで対応） |
| `anthropic-version: 2023-06-01` が変更されていないか          | `grep -n "anthropic-version" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                        | 確認                               |
| `baseUrl` が変更されていないか                                | `grep -n "api.anthropic.com" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                        | 確認                               |

### Task 10-3: IPC 契約整合性確認

`checkHealth` のシグネチャが変更されていないことを確認する。

```typescript
// 変更なし: checkHealth(): Promise<HealthCheckResult>
```

P65 チェック: namespace ドリフトなし。`checkHealth` は既存 IPC チャンネルから呼び出される既存メソッド。

### Task 10-4: Phase 10 レビュー判定

| 判定     | 条件                                   | 対応                          |
| -------- | -------------------------------------- | ----------------------------- |
| PASS     | AC-001〜AC-005 全合格 + 品質確認全通過 | Phase 11 へ                   |
| MINOR    | スコープ外の軽微な指摘あり             | 未タスク化後 Phase 11 へ      |
| MAJOR    | AC 未達または品質基準未達              | 影響範囲に応じて Phase 1-5 へ |
| CRITICAL | 要件誤解・セキュリティ問題             | Phase 1 へ                    |

**期待される判定: PASS**

MINOR 指摘が発生した場合の対象:

- `claude-3-haiku-20240307` が他の Adapter ファイルに残存する場合 → 別タスクとして未タスク化
- `max_tokens` / `messages` の固定値テスト未実装 → 未タスク化済み（Phase 8）

## 参照資料

| ドキュメント                                                            | 用途                            |
| ----------------------------------------------------------------------- | ------------------------------- |
| `phase-1-requirements.md`                                               | AC-001〜AC-005 の確認           |
| `phase-9-quality-assurance.md`                                          | 品質保証結果の参照              |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                | 最終成果物の確認                |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | テストコードの最終確認          |
| `.claude/rules/05-task-execution.md`                                    | Phase 10 レビューゲート判定基準 |

## 統合テスト連携

本 Phase では Adapter 単体の最終確認のみ実施。Task04 完了後に統合テストを含む最終確認が行われる。

## 成果物

| 成果物                | パス                                                                                                                             | 備考                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 10 最終レビュー | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/phase-10-final-review.md` | 本ファイル（判定結果を記入） |

## 完了条件

- [ ] AC-001〜AC-005 の全項目を実際にコマンドで検証し、結果を記録した
- [ ] コード品質最終確認 4 項目を全て確認した
- [ ] IPC 契約整合性が確認された
- [ ] MINOR 指摘がある場合は全て未タスク化した（省略不可）
- [ ] Phase 10 判定を記録した（PASS / MINOR / MAJOR / CRITICAL）

## 次のPhase

Phase 11: 手動テスト（`phase-11-manual-testing.md`）
