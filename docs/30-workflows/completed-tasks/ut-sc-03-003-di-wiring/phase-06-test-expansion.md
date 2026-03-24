# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 6                          |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |
| 前提Phase  | Phase 5（実装完了・Green） |

## 目的

Phase 5 の実装完了後、カバレッジ不足箇所や境界条件を特定し、防御的テストを追加する。setLLMAdapter() の異常系、ResourceLoader のエッジケース、および DI 配線の堅牢性を検証する追加テストケースを作成する。

## 実行タスク

### Task 1: RuntimeSkillCreatorFacade.test.ts への防御的テスト追加

既存テストファイル `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` に以下のテストケースを追加する。

#### TC-7: setLLMAdapter() に undefined を渡した場合の動作

- **前提**: Facade を llmAdapter あり・resourceLoader ありで生成済み（LLM が使える状態）
- **操作**: `setLLMAdapter(undefined as unknown as ILLMAdapter)` を呼び出し後、`plan()` を実行
- **期待**: `this.llmAdapter` が undefined になり、graceful degradation（スタブレスポンス）に戻ること
- **目的**: TypeScript の型チェックでは防げない実行時異常値への防御。DI コンテナのミスや SDK の API 変更で undefined が渡される可能性を検証する
- **補足**: 型的には `ILLMAdapter` が要求されるため通常発生しないが、JavaScript 実行時の安全性確認として有効

#### TC-8: plan() 実行中に setLLMAdapter() が呼ばれた場合の挙動

- **前提**: Facade を llmAdapter なし・resourceLoader ありで生成。setLLMAdapter(adapterA) 済み
- **操作**:
  1. plan() を開始する（sendChat を遅延 resolve にする）
  2. plan() 解決前に setLLMAdapter(adapterB) を呼ぶ
  3. plan() を解決する
- **期待**: plan() は adapterA で開始した sendChat の結果を返す。setLLMAdapter(adapterB) は次回の plan() 呼び出しから有効
- **目的**: plan() 内で `this.llmAdapter` は `await` の前にローカル変数としてキャプチャされないが、`const response = await this.llmAdapter.sendChat(...)` の呼び出し時点で `this.llmAdapter` の参照は解決済みであるため、await 中に setLLMAdapter() が呼ばれても当該リクエストには影響しない。次回の plan() 呼び出しから新しい adapter が使用される
- **実装方針**: sendChat の mock を `new Promise(resolve => { ... })` で制御し、resolve 前に setLLMAdapter を呼ぶ

#### TC-9: ResourceLoader のパスが不正な場合のエラーハンドリング

- **前提**: 存在しないディレクトリパスで ResourceLoader を生成し、Facade に注入
- **操作**: `plan()` を実行（integrated_api 判定）
- **期待**: ResourceLoader.loadAgent() が ENOENT エラーをスローし、plan() がそのエラーを伝播すること
- **目的**: ipc/index.ts で `skillCreatorPath` が不正な場合（HOME 環境変数未設定など）の動作を検証する
- **検証ポイント**: plan() のエラーメッセージに ENOENT が含まれること。graceful degradation はこのケースでは適用されない（llmAdapter と resourceLoader の両方が注入済みの場合、ResourceLoader のファイル読み込み失敗は業務エラーとして扱う）

### Task 2: テスト追加後のバリデーション

追加テスト作成後、以下を実行して全テストが PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
```

### Task 3: 既存テストとの重複排除

TC-7, TC-8, TC-9 が既存の RuntimeSkillCreatorFacade.plan.test.ts のテストケースと重複しないことを確認する。特に以下の既存テストとの差分を明確にする:

- 既存「Graceful degradation」セクション: llmAdapter 未注入時のスタブ応答テスト（TC-2 と類似だが、TC-7 は「注入後に undefined で上書き」するシナリオ）
- 既存「ResourceLoader 失敗」セクション: loadAgent 失敗時のエラー伝播テスト（TC-9 と類似だが、TC-9 は「パス自体が不正」なシナリオ）

## 参照資料

| 資料                                       | パス                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Phase 5 実装                               | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-05-implementation.md`                     |
| Phase 4 テスト設計                         | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-04-test-creation.md`                      |
| RuntimeSkillCreatorFacade 実装             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     |
| 既存テスト（Facade）                       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      |
| 既存テスト（plan LLM統合）                 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` |
| ResourceLoader 実装                        | `apps/desktop/src/main/services/skill/ResourceLoader.ts`                                  |
| P9: モジュールスコープ変数のテスト間リーク | `.claude/rules/06-known-pitfalls.md`                                                      |
| P13: タイマーテストの無限ループ            | `.claude/rules/06-known-pitfalls.md`                                                      |

## 成果物

| 成果物                            | パス                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| 追加テストコード（Facade 防御的） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |

## 完了条件

- [ ] TC-7: setLLMAdapter(undefined) のテストが記述され PASS すること
- [ ] TC-8: plan() 実行中の setLLMAdapter() 呼び出しテストが記述され PASS すること
- [ ] TC-9: ResourceLoader 不正パスのテストが記述され PASS すること
- [ ] 追加テストが既存テスト（.plan.test.ts の「Graceful degradation」「ResourceLoader 失敗」）と重複していないこと
- [ ] 追加テストが P9 準拠でテスト間の状態リークがないこと（beforeEach でリセット）
- [ ] 全既存テストが引き続き PASS すること

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

Phase 7: カバレッジ確認 (`phase-07-coverage.md`)
