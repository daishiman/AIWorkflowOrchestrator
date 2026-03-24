# Phase 4: テスト作成

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| タスクID   | UT-SC-03-003                 |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT   |
| 作成日     | 2026-03-23                   |
| 前提Phase  | Phase 3（設計レビュー PASS） |

## 目的

RuntimeSkillCreatorFacade への llmAdapter / resourceLoader の DI 配線に関するテストを TDD Red フェーズとして作成する。Setter Injection パターンによる llmAdapter 遅延注入と、コンストラクタ注入による ResourceLoader の配線が正しく動作することを検証するテストケースを設計・実装する。

## 実行タスク

### Task 1: RuntimeSkillCreatorFacade.test.ts へのテストケース追加

既存テストファイル `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` に以下の describe ブロックを追加する。

#### TC-1: setLLMAdapter() で adapter を注入後、plan() が LLM を使用すること

- **前提**: Facade を llmAdapter なし・resourceLoader ありで生成
- **操作**: `setLLMAdapter(mockLLMAdapter)` を呼び出し後、`plan()` を実行
- **期待**: `mockLLMAdapter.sendChat` が1回呼ばれ、スタブレスポンスではなく LLM パース結果が返る
- **検証ポイント**: setLLMAdapter() 後に `this.llmAdapter` が差し替わり、graceful degradation を脱出すること

#### TC-2: setLLMAdapter() 未呼び出し時、plan() が graceful degradation を返すこと

- **前提**: Facade を llmAdapter なし・resourceLoader なしで生成（setLLMAdapter 未呼び出し）
- **操作**: `plan()` を実行
- **期待**: スタブレスポンス（`skillName: ""`, `agents: []` 等）が返る
- **検証ポイント**: 既存の graceful degradation 動作が setLLMAdapter() 導入後も維持されること

#### TC-3: setLLMAdapter() の冪等性（複数回呼び出し）

- **前提**: Facade を llmAdapter なし・resourceLoader ありで生成
- **操作**: `setLLMAdapter(adapterA)` → `setLLMAdapter(adapterB)` → `plan()` 実行
- **期待**: `adapterB.sendChat` のみが呼ばれ、`adapterA.sendChat` は呼ばれない
- **検証ポイント**: 最後に設定した adapter が使用されること

#### TC-4: ResourceLoader がコンストラクタで正しく注入されること

- **前提**: `ResourceLoader` インスタンスをコンストラクタの `deps.resourceLoader` に渡す
- **操作**: `plan()` を実行（integrated_api 判定）
- **期待**: `resourceLoader.loadAgent` が PLAN_PROMPT_CONSTANTS.AGENT_NAMES の各名前で呼ばれる
- **検証ポイント**: コンストラクタで渡した resourceLoader が plan() 内で使用されること

### Task 2: skillCreatorHandlers.runtime.test.ts へのテストケース追加

既存テストファイル `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` に以下の統合テストを追加する。

#### TC-5: ipc/index.ts の DI 配線で ResourceLoader が生成されること（統合テスト）

- **前提**: `registerAllIpcHandlers` の「10. Skill Creator handlers」セクションの動作確認
- **操作**: registerSkillCreatorHandlers が RuntimeSkillCreatorFacade を生成する際に resourceLoader が渡されていることを検証
- **期待**: RuntimeSkillCreatorFacade のコンストラクタ引数に `resourceLoader` が含まれること
- **検証ポイント**: ipc/index.ts での ResourceLoader 生成 + Facade への注入が正しく行われること
- **注意**: ipc/index.ts 自体のテストは重量級のため、skillCreatorHandlers.runtime.test.ts 内で Facade の挙動を通じて間接検証する

#### TC-6: LLMAdapterFactory.getAdapter() 失敗時に graceful degradation が維持されること

- **前提**: LLMAdapterFactory.getAdapter() が reject するケース（APIキー未設定など）
- **操作**: getAdapter() 失敗後に plan() を呼び出す
- **期待**: plan() がスタブレスポンスを返す（graceful degradation）
- **検証ポイント**: fire-and-forget async の失敗が Facade の動作に影響しないこと

### テストの Red 状態確認

全テストケース作成後、以下のコマンドで Red 状態（テスト失敗）を確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts
```

TC-1, TC-3, TC-4 は `setLLMAdapter()` メソッドが未実装のためコンパイルエラーまたはテスト失敗となる。TC-2 は既存動作のため PASS する可能性がある（回帰テストとして有効）。

## 参照資料

| 資料                                          | パス                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 2 設計書                                | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-02-design.md`                             |
| 既存テスト（Facade）                          | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      |
| 既存テスト（plan LLM統合）                    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` |
| 既存テスト（runtime IPC）                     | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`                |
| RuntimeSkillCreatorFacade 実装                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     |
| ILLMAdapter 型定義                            | `apps/desktop/src/main/adapters/llm/types.ts`                                             |
| ResourceLoader 実装                           | `apps/desktop/src/main/services/skill/ResourceLoader.ts`                                  |
| ipc/index.ts                                  | `apps/desktop/src/main/ipc/index.ts`                                                      |
| P34: Setter Injection パターン                | `.claude/rules/06-known-pitfalls.md`                                                      |
| P63: サブエージェントのインポートパス誤り防止 | `.claude/rules/06-known-pitfalls.md`                                                      |

## 成果物

| 成果物                               | パス                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| テストコード（Facade 追加分）        | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |
| テストコード（IPC 統合テスト追加分） | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`           |

## 完了条件

- [ ] TC-1: setLLMAdapter() 注入後の plan() LLM 使用テストが記述されている
- [ ] TC-2: setLLMAdapter() 未呼び出し時の graceful degradation テストが記述されている
- [ ] TC-3: setLLMAdapter() 冪等性テストが記述されている
- [ ] TC-4: ResourceLoader コンストラクタ注入テストが記述されている
- [ ] TC-5: DI 配線統合テストが記述されている
- [ ] TC-6: LLMAdapterFactory.getAdapter() 失敗時の graceful degradation テストが記述されている
- [ ] 全テストが Red 状態（TC-2 を除き、setLLMAdapter 未実装によるコンパイルエラーまたはアサーション失敗）であること
- [ ] P63 準拠: インポートパスが既存テストファイルのパス規則と一致していること

## 統合テスト連携

本Phaseで実施する統合テスト関連の作業:

- [ ] DI配線に関連する既存テストが引き続きPASSすることを確認
- [ ] 新規追加テストが既存テストと干渉しないことを確認

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

Phase 5: 実装 (`phase-05-implementation.md`)
