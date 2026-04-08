# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 1                                                   |
| Phase 名   | 要件定義                                            |
| 前提 Phase | -（このタスクの起点）                               |
| 後続 Phase | Phase 2（設計）                                     |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

`RuntimeSkillCreatorExecuteResponse` union 型の現状を把握し、exhaustive check 導入のスコープ・受入条件・命名規則 inventory を確定する。

## 背景

`executeAsync()` の結果処理は current facts では `classifyExecuteResult()` + `switch` + `extractExecuteErrorMessage()` に集約されている。  
本 Phase では、3 outcome の契約・エラー伝搬・関連 skill の準拠状況を確認し、旧 4 分類の表現が仕様書内に残っていないかを洗う。

本タスクは `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` Phase 3 設計レビューの未タスク候補から formalize されたものである。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` または `outputs/phase-1/` へ記録する。

### タスク 1: union 型現状確認

**目的**: `RuntimeSkillCreatorExecuteResponse` の全 union メンバーと discriminant を確認する。

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` を開き、`RuntimeSkillCreatorExecuteResponse` の型定義を確認する
2. 各 union メンバー（`RuntimeSkillCreatorExecuteResult` / `{ type: "terminal_handoff" }` / `RuntimeSkillCreatorExecuteErrorResponse`）の discriminant フィールドを列挙する
3. 各メンバーの `success` フィールドの有無・型を記録する

**期待される成果物**:

- union メンバー一覧と discriminant フィールドの記録（Phase 実行記録）

---

### タスク 2: 現行実装の分析

**目的**: `executeAsync()` の現行 outcome switch と影響範囲を把握する。

**実行手順**:

1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を開き、`executeAsync()` メソッドの `classifyExecuteResult()` + `switch` + `extractExecuteErrorMessage()` の連携を確認する
2. 旧 4 分類表現に相当する legacy 記述が同ファイル内に残っていないか確認する
3. Grep で `RuntimeSkillCreatorExecuteResponse` を参照している他のメソッド（`verifyAndImproveLoop()` 等）を洗い出す
4. 影響範囲（今回のスコープ内/外）を分類する

**期待される成果物**:

- 現行ロジックの記録と影響範囲分類（Phase 実行記録）

---

### タスク 3: 命名規則確認

**目的**: 既存コードの命名規則（camelCase / snake_case 等）を確認し、新規関数・変数の命名方針を確定する。

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` の module-local helper 命名パターン（camelCase）を確認する
2. 既存のヘルパー関数が同ファイル内に存在するか確認する
3. `assertNever` / `classifyExecuteResult` / `extractExecuteErrorMessage` という命名が current facts と整合するか確認する
4. `packages/shared/src/types/` に `assertNever` 相当のユーティリティが既存するか確認する

**期待される成果物**:

- 命名規則 inventory（Phase 実行記録）

---

### タスク 4: タスク分類と受入条件確定

**目的**: タスク分類（UI task / docs-only task / 実装 task）と受入条件（AC）を確定する。

**実行手順**:

1. 本タスクが UI 変更を含まない実装タスクであることを確認し、`NON_VISUAL` として記録する
2. 以下の受入条件（AC）を確定する：

| AC   | 内容                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- |
| AC-1 | `executeAsync()` の結果分岐が `classifyExecuteResult()` + exhaustive switch で表現されている    |
| AC-2 | `RuntimeSkillCreatorExecuteResponse` の全 union メンバー（3種）が 3 outcome に対応している      |
| AC-3 | `assertNever` による exhaustive check が `default` ブランチに組み込まれている                   |
| AC-4 | `extractExecuteErrorMessage()` により error message が `onWorkflowStateSnapshot` に伝搬している |
| AC-5 | 追加テストが 3 outcome と error message 正規化をカバーしている                                  |
| AC-6 | `pnpm --filter @repo/desktop typecheck` がエラーなしで通る                                      |
| AC-7 | `pnpm --filter @repo/desktop lint` がエラーなしで通る                                           |
| AC-8 | `pnpm --filter @repo/desktop test` が全て PASS する                                             |

3. スコープ外事項を明記する：
   - `verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定の exhaustive check 化
   - `RuntimeSkillCreatorExecuteResponse` 型定義自体の変更
   - Renderer 側の consumer コードの変更
   - 新しい union メンバーの追加

**期待される成果物**:

- タスク分類記録（NON_VISUAL）
- 受入条件 AC-1〜AC-8

---

## 参照資料

| 参照資料                           | パス                                                                                                                                     | 内容                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| RuntimeSkillCreatorFacade.ts       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                    | 対象実装ファイル              |
| skillCreator.ts（型定義）          | `packages/shared/src/types/skillCreator.ts`                                                                                              | ExecuteResponse union 型定義  |
| 親タスク仕様書                     | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/index.md`                                      | 背景と知見                    |
| 未タスク検出レポート（発見ソース） | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-12/unassigned-task-detection.md` | 発見元証跡                    |
| TypeScript Narrowing ガイド        | TypeScript Handbook: Narrowing - Exhaustiveness checking                                                                                 | exhaustive check パターン説明 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                          |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | Runtime 層の current contract |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Facade current facts          |
| 完了タスク記録       | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | 既存実装の正本                |

---

## 成果物

| 成果物         | パス                     | 内容                            |
| -------------- | ------------------------ | ------------------------------- |
| Phase 実行記録 | （本ファイル末尾に追記） | union 型確認・影響範囲・AC 一覧 |

---

## 統合テスト連携

- `executeAsync()` の IPC/Renderer 側への影響範囲（今回のスコープ外であること）を確認し、Phase 実行記録に明記する。

---

## 完了条件

- [ ] `RuntimeSkillCreatorExecuteResponse` の全 union メンバーと discriminant が列挙されている
- [ ] `executeAsync()` の現行 `classifyExecuteResult()` + `extractExecuteErrorMessage()` 連携が把握されている
- [ ] 影響範囲（スコープ内/外）が分類されている
- [ ] 命名規則（assertNever / classifyExecuteResult の配置方針）が確定している
- [ ] タスク分類が `NON_VISUAL` として記録されている
- [ ] 受入条件 AC-1〜AC-8 が確定されている

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（タスクの起点）
- **後続**: Phase 2（設計）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク 1 union 型現状確認: [結果]
- タスク 2 現行実装分析: [結果]
- タスク 3 命名規則確認: [結果]
- タスク 4 タスク分類・受入条件確定: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-2-design.md`
