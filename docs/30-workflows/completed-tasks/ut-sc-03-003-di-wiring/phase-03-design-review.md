# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 3                          |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |

## 目的

Phase 2 で設計した Setter Injection + Fire-and-Forget Async パターンの妥当性を検証する。特に非同期注入のタイミング問題、既存テストへの影響、P34/P5 準拠を重点的にレビューする。

## 実行タスク

### 1. 設計方式の妥当性確認

- [ ] Setter Injection（案 A）が他の代替案（B-D）より適切であることを確認
- [ ] `readonly` 解除による型安全性への影響を評価
- [ ] `setLLMAdapter()` が外部から不正に呼ばれるリスクを評価

### 2. 非同期注入のタイミング問題

- [ ] fire-and-forget IIFE が resolve する前に plan() が呼ばれた場合の動作確認
  - 期待: graceful degradation でスタブ応答を返す（既存動作と同じ）
- [ ] IIFE が reject した場合の動作確認
  - 期待: catch で warn ログ → graceful degradation 継続
- [ ] Node.js イベントループ上でのタイミング保証を確認

### 3. 既存テストへの影響

- [ ] `RuntimeSkillCreatorFacade.test.ts` への影響確認
  - `setLLMAdapter()` テスト追加が必要
  - 既存テストの readonly 前提が壊れないか確認
- [ ] `RuntimeSkillCreatorFacade.plan.test.ts` への影響確認
  - llmAdapter 注入パスのテストが必要
- [ ] `skillCreatorHandlers.runtime.test.ts` への影響確認
  - モック構成の変更が必要か確認

### 4. P34/P5 準拠確認

- [ ] P34: Setter Injection パターンの使い分け基準に合致
  - `llmAdapter` は「外部リソース（SecureStorage）が必要」→ Constructor Injection 不可
- [ ] P5: リスナー二重登録防止
  - `setLLMAdapter()` は冪等（同じ adapter を再設定しても問題なし）
  - `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の再登録フローで
    fire-and-forget が重複実行される可能性 → 既存の facade は GC で回収されるため問題なし

### 5. DEFAULT_SKILL_CREATOR_PATH の安全性

- [ ] 設計で新規定義する定数・パスが、既存コードベース（`constants.ts` 等）と重複していないことを確認
- [ ] `DEFAULT_SKILL_CREATOR_PATH` が `apps/desktop/src/main/services/skill/constants.ts` からインポートされていること（独自パス構築をしていないこと）
- [ ] パストラバーサルリスクの確認
  - 定数は内部定義であり外部入力由来ではない → 問題なし

## レビュー判定

### 判定: PASS

**理由**:

1. **設計方式**: Setter Injection は P34 パターンに準拠しており、既存の `track()` 同期フローを壊さない最小変更で目的を達成できる
2. **タイミング問題**: fire-and-forget 完了前の plan() 呼び出しは既存の graceful degradation でカバーされるため、ユーザー体験に悪影響なし
3. **readonly 解除**: `llmAdapter` のみの限定的な変更であり、型安全性への影響は最小。`setLLMAdapter()` は public だが、呼び出し元は ipc/index.ts のみ
4. **テスト影響**: 既存テストは llmAdapter なしのパスをテストしているため破壊されない。新規テストの追加のみ必要
5. **P5 準拠**: 再登録フローでも問題なし（facade インスタンスは再生成される）

### 指摘事項: なし

MINOR/MAJOR 指摘なし。設計は要件に対して十分に簡潔かつ安全。

## 参照資料

- Phase 1 成果物（要件定義書）
- Phase 2 成果物（設計書）
- `.claude/rules/06-known-pitfalls.md` P34, P5
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`

## 成果物

- 設計レビュー報告書（本ファイル）
  - 判定: PASS
  - 指摘事項: なし

## 完了条件

- [ ] 設計方式の妥当性を確認した
- [ ] 非同期注入のタイミング問題を検証した
- [ ] 既存テストへの影響を確認した
- [ ] P34/P5 準拠を確認した
- [ ] DEFAULT_SKILL_CREATOR_PATH の安全性を確認した
- [ ] レビュー判定を PASS / MINOR / MAJOR で明記した

## 統合テスト連携

本Phaseで実施する統合テスト関連の作業:

- [ ] 既存テストの実行確認（`pnpm --filter @repo/desktop test`）
- [ ] DI配線に関連する既存テストの影響確認

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

Phase 4: テスト作成
