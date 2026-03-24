# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 1                                       |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

`UiState` 型拡張のスコープ、受入基準、現行コードのインベントリを固定し、Phase 2 設計の前提を確立する。

## 実行タスク

- Task 1: 現行 UiState 利用箇所のインベントリ作成
- Task 2: 8 値の UiState 定義と各値のセマンティクス確定
- Task 3: 受入基準（AC-1〜AC-7）の検証方法定義
- Task 4: Contract Matrix 全セル定義（8 state × 4 capability）

## 参照資料

| 資料名                       | パス                                                                                                        | 説明                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 画面状態マトリクス           | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#画面状態マトリクス` | 8 値の表示ルール・CTA・禁止事項 |
| CTA 契約                     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#CTA契約`            | primary 1 + secondary 1 の制約  |
| 現行 execution-capability.ts | `packages/shared/src/types/execution-capability.ts`                                                         | 拡張対象                        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                                            | 内容                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 実行責任 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | 状態語彙定義の canonical     |
| interfaces-auth-core   | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`                                     | AuthModeStatus transport DTO |

## running 除外判断

ui-ux-realization.md の画面状態マトリクスは `running` を含む 9 値を定義しているが、本タスクでは `running` を除外し 8 値とする。

**判断根拠**:

- `running`（リクエスト送信〜最初のトークン受信）は `streaming`（トークン出力中）の前段階であり、ユーザー視点では同一の「実行中」状態
- 両状態の primary CTA は実行停止系（stop/abort）であり、UI 表示上の差異は loading indicator の形状のみ
- loading indicator の差異はコンポーネント内部のサブ状態で管理し、`UiState` 型レベルでは `streaming` に統合する

この判断は Phase 3 設計レビュー R-1 で妥当性を再確認する。

## 実行手順

### ステップ 0: P50 チェック（既実装状態の調査）

Phase 4 開始前に、対象ファイルの現在の実装状態を調査し、既に実装済みでないかを確認する。

| 判定     | 条件                                                  | 対応                                                  |
| -------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 未実装   | `execution-capability.ts` の `UiState` が 3 値のまま  | Phase 2 以降を通常実行                                |
| 部分実装 | 一部の新値が追加されているが Contract Matrix が未対応 | 既存実装を確認し Phase 4 を「検証・補完」モードに切替 |
| 実装済み | 8 値 + Contract Matrix が全て実装済み                 | Phase 4-5 を「検証・補完」モードに切替（P50 準拠）    |

```bash
# UiState の現在の値数を確認
grep -n "UiState" packages/shared/src/types/execution-capability.ts
# Contract Matrix テストの現状確認
grep -c "it\|test" packages/shared/src/types/__tests__/cta-contract.test.ts
```

### ステップ 1: 現行 UiState 利用箇所のインベントリ

以下のコマンドで全利用箇所を特定する:

```bash
grep -rn "UiState\|uiState\|UI_STATE_VALUES" packages/shared/src/ apps/desktop/src/ --include="*.ts" --include="*.tsx"
```

インベントリの記録先: `outputs/phase-1/uistate-inventory.md`

記録内容:

- ファイルパス
- 利用形態（型参照 / 値参照 / import / 分岐条件）
- 変更影響度（high / medium / low）

### ステップ 2: 8 値の UiState 定義確定

ui-ux-realization.md の画面状態マトリクスから 8 値を確定する:

| UiState 値      | セマンティクス                        | 遷移元                                            | CTA contract             |
| --------------- | ------------------------------------- | ------------------------------------------------- | ------------------------ |
| `ready`         | 実行可能。準備条件を 1 行で示す       | capability が none 以外                           | primary: 実行系 CTA      |
| `blocked`       | 設定が必要。回復アクションがある      | capability が none + hasResolutionAction          | primary: 設定を開く      |
| `unavailable`   | アクションを取れない                  | capability が none + !hasResolutionAction         | primary: null            |
| `streaming`     | 出力増加中。停止手段を見せる          | ready → execute → stream                          | primary: stop            |
| `handoff`       | terminal へ委譲。理由と引継内容を示す | capability が terminalSurface で handoff 条件成立 | primary: terminal を開く |
| `terminal-only` | terminal が primary lane              | capability が terminalSurface のみ                | primary: terminal を開く |
| `guidance-only` | 実行も handoff もない。設定誘導       | capability が none + 代替導線あり                 | primary: 設定を見る      |
| `degraded`      | legacy lane で品質低下                | apiKeyDegraded + legacy lane                      | primary: manual fallback |

### ステップ 3: Contract Matrix 定義

8 state × 4 capability の全 32 セルを定義する:

| capability \ uiState | ready                             | blocked             | unavailable         | streaming     | handoff                          | terminal-only                    | guidance-only       | degraded                 |
| -------------------- | --------------------------------- | ------------------- | ------------------- | ------------- | -------------------------------- | -------------------------------- | ------------------- | ------------------------ |
| integratedRuntime    | AI で実行 / 設定を開く            | 設定を開く / ヘルプ | null / セットアップ | stop / latest | -                                | -                                | -                   | manual fallback / ヘルプ |
| terminalSurface      | ターミナルで実行 / コマンドコピー | 設定を開く / ヘルプ | null / セットアップ | -             | terminal を開く / コマンドコピー | terminal を開く / コマンドコピー | -                   | -                        |
| both                 | AI で実行 / ターミナルで実行      | 設定を開く / ヘルプ | null / セットアップ | stop / latest | terminal を開く / コマンドコピー | -                                | -                   | manual fallback / ヘルプ |
| none                 | -                                 | 設定を開く / ヘルプ | null / セットアップ | -             | -                                | -                                | 設定を見る / ヘルプ | -                        |

注: `-` は到達不能な組み合わせを示す（全 13 セル）。到達不能の判定は Phase 2 D-3 `resolveUiState()` の評価優先順位チェーンから導出される。`degraded` は `isDegraded && capability !== "none"` で評価されるため、`integratedRuntime` / `both` で到達可能、`none` / `terminalSurface`（P3 で先に処理される）では到達不能。

### ステップ 4: CapabilityContext 拡張フィールド定義

```typescript
export interface CapabilityContext {
  capability: AccessCapability;
  isConnectionAvailable: boolean;
  isTerminalAvailable: boolean;
  hasResolutionAction: boolean;
  // 新規追加
  isStreaming?: boolean; // streaming 状態判定（optional, デフォルト false）
  isHandoffRequired?: boolean; // handoff 条件成立判定（optional, デフォルト false）
  isDegraded?: boolean; // degraded（legacy lane 品質低下）判定（optional, デフォルト false）
  hasAlternativeGuidance?: boolean; // guidance-only 条件判定（optional, デフォルト false）
}
```

## 成果物

| 成果物               | パス                                         | 内容                                   |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| UiState インベントリ | `outputs/phase-1/uistate-inventory.md`       | 全利用箇所の一覧と影響度               |
| Contract Matrix 定義 | `outputs/phase-1/contract-matrix.md`         | 8 × 4 = 32 セルの CTA 定義             |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | AC-1〜AC-7 の検証方法                  |
| spec-extraction-map  | `outputs/phase-1/spec-extraction-map.md`     | system spec と code anchor の 1:1 対応 |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] UiState の 8 値と各値のセマンティクスが確定している
- [ ] Contract Matrix 32 セル全ての primary / secondary CTA が定義されている
- [ ] 到達不能セルが明示的にマークされている
- [ ] AC-1〜AC-7 の各検証方法（自動テスト / 手動確認）が定義されている
- [ ] 現行コードのインベントリが作成され、変更影響度が付与されている
- [ ] `CapabilityContext` の拡張フィールドが定義されている

## 次Phase

Phase 2: [phase-2-design.md](./phase-2-design.md)
