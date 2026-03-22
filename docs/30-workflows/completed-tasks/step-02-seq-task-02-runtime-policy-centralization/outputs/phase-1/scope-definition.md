# Phase 1: 要件定義 - スコープ定義

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                 |
| タスク種別 | design（設計タスク。プロダクションコードの変更は伴わない） |
| 作成日     | 2026-03-21                                                 |
| ステータス | Phase 1 完了                                               |

---

## 対象スコープ

### 変更対象のファイル（設計成果物のみ。コード変更は Phase 5 以降）

| カテゴリ             | ファイルパス                                                                                           | 変更内容                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 型定義               | `packages/shared/src/types/runtime-policy.ts`（新規）                                                  | `RuntimeDecision` / `HandoffGuidance` / `HealthCheckResult` の正規型定義 |
| 型定義               | `packages/shared/src/types/index.ts`                                                                   | 上記型の re-export 追加                                                  |
| サービス（設計のみ） | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                                      | `RuntimeResolver` との責務統合設計                                       |
| サービス（設計のみ） | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`                                            | 非推奨化・移行計画の定義                                                 |
| 契約ドキュメント     | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/` | ownership table / responsibility diagram                                 |

### 変更対象のモジュール・契約

| モジュール                                | 変更の種別   | 詳細                                                                        |
| ----------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `IRuntimePolicyResolver` インターフェース | 拡張設計     | surface 識別子を受け取る引数追加の検討                                      |
| `RuntimeDecision` 型                      | 確定設計     | `integrated_api` / `terminal_handoff` の2値を正規型として確定               |
| `RuntimeResolution` 型                    | 非推奨設計   | `integrated` / `handoff` 型を deprecated とし移行パスを定義                 |
| health check route 選択ルール             | 新規定義     | `llm:check-health` primary / `AI_CHECK_CONNECTION` legacy の ownership 確定 |
| `TerminalHandoffBuilder` の surface 分岐  | 責務境界定義 | `buildForAgentExecution` / `buildForSkillExecution` の整理方針              |
| policy consumption contract               | 新規定義     | Step 03-09 が参照する IPC レスポンス型の共通化                              |

---

## 除外スコープ

### このタスク（Task02）に含まれないもの

| 除外項目                                             | 理由                                       | 担当タスク               |
| ---------------------------------------------------- | ------------------------------------------ | ------------------------ |
| プロダクションコードの変更                           | design タスクのため                        | Task03 以降              |
| UI コンポーネントの変更                              | surface-local 判定の削除は実装タスクで行う | Task03-09（各 surface）  |
| テストコードの新規作成・実行                         | 設計確定後に実施                           | Phase 4-7                |
| `RuntimeResolver` の実際の削除                       | 移行完了後に削除                           | Task05 以降（未定）      |
| `AI_CHECK_CONNECTION` ハンドラーの削除               | legacy 廃止は段階的に実施                  | 廃止条件成立後の別タスク |
| Renderer Store（authModeSlice / llmSlice）の内部変更 | スライスの状態型変更は実装タスク           | Task03-09（各 surface）  |
| E2E テスト・手動テスト                               | Phase 11 で実施                            | Phase 11                 |
| 性能ベンチマーク                                     | 実装後に計測                               | 実装タスク完了後         |

---

## 依存タスク（Task01 からの入力）

### Task01: Contract Foundation からの入力

| 入力成果物               | 内容                                         | 参照パス                                                         |
| ------------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| 実行責任契約の基盤型定義 | `ExecutionResponsibilityContract` 等の基盤型 | `packages/shared/src/types/execution-responsibility-contract.ts` |
| IPC チャンネル定義       | `llm:check-health` チャンネルの正規化        | `apps/desktop/src/preload/channels.ts`                           |
| surface 識別子の定義     | Agent / Skill / Chat の surface enum         | Task01 成果物参照                                                |

Task01 の成果物が確定していない型については、本タスクの Phase 2 設計内で仮定義を行い、Task01 完了時に整合確認を行う。

---

## 後続タスク（Task03-09 への出力契約）

### Task02 が提供する成果物と各後続タスクへの影響

| 後続タスク                    | 参照する成果物                                                         | 利用目的                                                       |
| ----------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Task03: AI Chat surface       | ownership table / `RuntimeDecision` 型 / health route 定義             | `aiHandlers.ts` での runtime 判定を policy resolver 経由に変更 |
| Task04: Agent surface         | ownership table / `HandoffGuidance` 型                                 | `buildForAgentExecution` の呼び出しパターン統一                |
| Task05: Skill surface         | ownership table / `RuntimeDecision` 型                                 | `buildForSkillExecution` の呼び出しパターン統一                |
| Task06: Skill Creator surface | ownership table / policy consumption contract                          | 新規実装時の参照型確定                                         |
| Task07-09: 共通インフラ       | `IRuntimePolicyResolver` インターフェース / `RuntimeResolver` 移行計画 | DI 設定の更新                                                  |

### policy consumption contract の定義内容

後続タスクが Task02 の成果物を参照する際の約束事:

1. **runtime 判定呼び出し**: 各 surface のハンドラーは `IRuntimePolicyResolver.resolve(authMode, apiKey)` を呼び出す（authMode・apiKey は Main Process 内部から取得する）
2. **health route**: 新規 surface の health check 実装は `llm:check-health` IPC チャンネルのみを使用する
3. **handoff bundle**: `TerminalHandoffBuilder.build()` の共通メソッドを経由して surface 固有の `HandoffGuidance` を構築する
4. **型の所在**: `RuntimeDecision` / `HandoffGuidance` / `HealthCheckResult` は `packages/shared` から import する

---

## スコープ境界の明示

```
+--------------------------------------------------+
|  Task02 スコープ（設計・契約定義のみ）            |
|                                                  |
|  ・ownership table の作成                        |
|  ・型定義ファイルの新規作成（コード変更なし）       |
|  ・responsibility diagram の作成                  |
|  ・health route の優先順位定義                   |
|  ・RuntimeResolver 移行計画の文書化               |
|  ・policy consumption contract の文書化           |
+--------------------------------------------------+
         |
         | 後続タスクが参照
         v
+--------------------------------------------------+
|  Task03-09 スコープ（実装）                       |
|                                                  |
|  ・プロダクションコードの変更                      |
|  ・surface-local 判定の削除                       |
|  ・policy resolver の呼び出し追加                  |
|  ・テストコードの作成・実行                        |
+--------------------------------------------------+
```

---

## 完了条件

- [ ] 対象スコープの全ファイル・モジュールが列挙されていること
- [ ] 除外スコープが「除外理由」と「担当タスク」とともに明記されていること
- [ ] Task01 からの入力依存が特定されていること
- [ ] Task03-09 への出力契約の概要が記載されていること
- [ ] スコープ境界図が作成されていること

## 次フェーズ

Phase 2: 設計（`phase-2-design.md`）にて、本ファイルで定義したスコープに基づき ownership table と責務境界図を作成する。
