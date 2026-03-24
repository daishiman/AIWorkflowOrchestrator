# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 7                          |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |
| 前提Phase  | Phase 6（テスト拡充完了）  |

## 目的

Phase 5 の実装と Phase 6 のテスト拡充により追加されたコードのカバレッジを測定し、プロジェクトのカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を充足していることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

### Task 1: カバレッジ測定の実行

#### 1-1: RuntimeSkillCreatorFacade.ts のカバレッジ測定

setLLMAdapter() メソッド追加分を含むカバレッジを測定する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade --coverage
```

対象ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

#### 1-2: plan.test.ts を含めた統合カバレッジ測定

LLM 統合テスト（.plan.test.ts）も含めたカバレッジを測定する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts --coverage
```

### Task 2: カバレッジ基準の確認

以下の基準を満たしているか確認する:

| 指標              | 最低基準 | 推奨基準 | 確認対象                                               |
| ----------------- | -------- | -------- | ------------------------------------------------------ |
| Line Coverage     | 80%      | 90%      | RuntimeSkillCreatorFacade.ts 全行                      |
| Branch Coverage   | 60%      | 70%      | setLLMAdapter 有無、llmAdapter/resourceLoader の分岐   |
| Function Coverage | 80%      | 90%      | setLLMAdapter(), plan(), execute(), improve(), helpers |

### Task 3: カバレッジ詳細分析

以下の追加コード部分が確実にカバーされていることを確認する:

#### 3-1: setLLMAdapter() メソッド

- `setLLMAdapter(adapter)` の正常呼び出し: TC-1, TC-3 でカバー
- `setLLMAdapter(undefined)` の異常系: TC-7 でカバー

#### 3-2: llmAdapter readonly 解除による分岐

- `!this.llmAdapter || !this.resourceLoader` の分岐（L111）:
  - 両方 undefined: TC-2 でカバー
  - llmAdapter のみ注入済み: 既存の graceful degradation テストでカバー
  - 両方注入済み: TC-1, TC-4 でカバー

#### 3-3: plan() の LLM 呼び出し経路

- agentSpecs ループ（L127-130）: TC-4 + 既存 plan.test.ts でカバー
- sendChat 呼び出し（L134-140）: 既存 plan.test.ts でカバー
- parsePlanResponse（L143）: 既存 plan.test.ts でカバー

### Task 4: 未達時の対処

カバレッジが基準未達の場合、以下の手順で Phase 6 に戻る:

1. カバレッジレポートで未カバー行/分岐を特定する
2. 未カバー箇所に対応するテストケースを設計する
3. Phase 6 のテストファイルにテストを追加する
4. Task 1 を再実行してカバレッジを再測定する

特に注意すべき未カバーの可能性がある箇所:

- `stripMarkdownCodeBlock()` 内の正規表現マッチ失敗パス（trimmed のみ返却）
- `isValidPlanResponse()` 内の各フィールドバリデーション分岐
- `extractGeneratedContent()` 内の planResult フィールドが空の場合

### Task 5: P41 準拠のインライン関数カバレッジ確認

Vitest の v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする（P41）。以下のインライン関数がカバーされているか確認する:

- `isValidAgentEntry()` のコールバック
- `isValidScriptEntry()` のコールバック
- `isValidArrayOfStrings()` のコールバック

これらが Function Coverage の低下原因になっていないか確認し、必要に応じて明示的な呼び出しテストを追加する。

## 参照資料

| 資料                                         | パス                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充                           | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-06-test-expansion.md`                     |
| Phase 5 実装                                 | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-05-implementation.md`                     |
| カバレッジ基準                               | `.claude/rules/02-code-quality.md`（カバレッジ基準テーブル）                              |
| P41: v8 カバレッジプロバイダのインライン関数 | `.claude/rules/06-known-pitfalls.md`                                                      |
| RuntimeSkillCreatorFacade 実装               | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     |
| テストファイル（Facade）                     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      |
| テストファイル（plan LLM統合）               | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` |

## 成果物

| 成果物                   | 形式                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| カバレッジレポート       | `pnpm vitest run --coverage` の出力結果（コンソール出力 + coverage/ ディレクトリ） |
| カバレッジ充足判定       | Line 80%+, Branch 60%+, Function 80%+ の達成確認                                   |
| 追加テスト（未達時のみ） | Phase 6 へ戻り追加                                                                 |

## 完了条件

- [ ] RuntimeSkillCreatorFacade.ts の Line Coverage が 80% 以上であること
- [ ] RuntimeSkillCreatorFacade.ts の Branch Coverage が 60% 以上であること
- [ ] RuntimeSkillCreatorFacade.ts の Function Coverage が 80% 以上であること
- [ ] setLLMAdapter() メソッドが Line/Function Coverage でカバーされていること
- [ ] llmAdapter/resourceLoader の有無による分岐（L111）が Branch Coverage でカバーされていること
- [ ] P41 準拠: インライン関数（isValidAgentEntry, isValidScriptEntry 等）のカバレッジ影響を確認済みであること
- [ ] カバレッジ未達の場合は Phase 6 に戻りテストを追加し、再測定で基準を達成していること

## 統合テスト連携

統合テストの再実行とゲート判定:

| 判定項目               | 基準 | 結果         |
| ---------------------- | ---- | ------------ |
| ユニットテストLine     | 80%+ | (実行時記録) |
| ユニットテストBranch   | 60%+ | (実行時記録) |
| ユニットテストFunction | 80%+ | (実行時記録) |

- [ ] DI配線関連のカバレッジがプロジェクト基準を満たしていることを確認

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| セキュリティ       | No   | 認証・認可の変更なし                                                                 |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 8: リファクタリング (`phase-08-refactoring.md`)
