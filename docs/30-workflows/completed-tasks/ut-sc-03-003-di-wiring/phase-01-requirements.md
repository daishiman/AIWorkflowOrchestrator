# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                  |
| ---------- | ------------------------------------------------------------------- |
| Phase      | 1                                                                   |
| タスクID   | UT-SC-03-003                                                        |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT                                          |
| 作成日     | 2026-03-23                                                          |
| Issue      | #1496                                                               |
| 影響範囲   | apps/desktop/src/main/ipc/index.ts                                  |
|            | apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts |

## 目的

Main Process の起動シーケンスで `RuntimeSkillCreatorFacade` に `llmAdapter` と `resourceLoader` を実際に注入する DI 配線を実装する。現在は DI 未注入時の graceful degradation（スタブ返却）で動作しているため、plan() が常にスタブ応答を返す状態を解消する。

## 背景

- TASK-SC-03 Phase 10 で検出された未タスク
- `ipc/index.ts:900-906` で `RuntimeSkillCreatorFacade` を生成する際、`llmAdapter` と `resourceLoader` が未注入
- Facade 内部（`RuntimeSkillCreatorFacade.ts:111-123`）で graceful degradation によりスタブ応答を返している
- `LLMAdapterFactory.getAdapter()` は **非同期**（SecureStorage からAPIキー取得が必要）であるため、同期的な DI 配線フローとの整合が設計課題

## 現状分析

### 現在の DI 配線（ipc/index.ts:890-912）

```typescript
track("registerSkillCreatorHandlers", () => {
  const skillCreatorService = new SkillCreatorService();
  const skillExecutor = getSkillExecutorInstance();
  // ... 省略 ...
  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        skillFileWriter,
        // llmAdapter: 未注入
        // resourceLoader: 未注入
      })
    : undefined;
  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

### 注入が必要な依存

| 依存             | 生成方式                                                | 同期/非同期 |
| ---------------- | ------------------------------------------------------- | ----------- |
| `resourceLoader` | `new ResourceLoader(skillCreatorPath)` — コンストラクタ | 同期        |
| `llmAdapter`     | `LLMAdapterFactory.getAdapter("anthropic")` — Promise   | 非同期      |

### RuntimeSkillCreatorFacadeDeps インターフェース

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter; // ← 注入対象
  resourceLoader?: ResourceLoader; // ← 注入対象
  skillFileWriter?: SkillFileWriter;
}
```

## 機能要件

| ID    | 要件                                                                                    |
| ----- | --------------------------------------------------------------------------------------- |
| FR-01 | `ResourceLoader` を `.claude/skills/skill-creator/` パスで生成し Facade に注入する      |
| FR-02 | `LLMAdapterFactory.getAdapter("anthropic")` で取得した adapter を Facade に注入する     |
| FR-03 | `llmAdapter` 取得失敗時は graceful degradation を維持する（スタブ応答にフォールバック） |
| FR-04 | 既存の IPC ハンドラ登録フロー（同期 `track()` パターン）を壊さない                      |
| FR-05 | `ResourceLoader` のパスは既存定数 `DEFAULT_SKILL_CREATOR_PATH` を使用する               |

## 非機能要件

| ID     | 要件                                                                   |
| ------ | ---------------------------------------------------------------------- |
| NFR-01 | 起動時間への影響を最小化する（非同期取得は fire-and-forget で実行）    |
| NFR-02 | API キー未設定時にエラーログを出さない（warn レベルで記録）            |
| NFR-03 | P5 準拠: リスナー二重登録を防止する                                    |
| NFR-04 | P34 準拠: 遅延初期化が必要な依存は Setter Injection パターンを使用する |

## 設計上の制約

1. `LLMAdapterFactory.getAdapter()` は非同期であり、`track()` クロージャは同期実行される
2. `RuntimeSkillCreatorFacade` のフィールドは現在 `private readonly` — Setter Injection を採用する場合は `readonly` を外す変更が必要
3. `ResourceLoader` のコンストラクタ引数 `skillCreatorPath` は `.claude/skills/skill-creator/` の絶対パスが必要

## 受入基準

- [ ] `ResourceLoader` が `.claude/skills/skill-creator/` パスで生成され、Facade に注入されている
- [ ] `LLMAdapterFactory.getAdapter("anthropic")` の結果が Facade に注入されている
- [ ] API キー未設定時は graceful degradation で動作する（スタブ応答）
- [ ] 既存の IPC ハンドラ登録が壊れていない
- [ ] 起動シーケンスがブロックされない（非同期取得は fire-and-forget）

## 実行タスク

- 要件抽出: DI配線に必要な機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/ipc/index.ts
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# DI配線が既に実装されているか確認
grep -n "llmAdapter\|resourceLoader" apps/desktop/src/main/ipc/index.ts
```

| 判定   | 条件                                     | 対応                                       |
| ------ | ---------------------------------------- | ------------------------------------------ |
| 既実装 | llmAdapter/resourceLoader が既に注入済み | Phase 4-5 を「検証・補完」モードに切り替え |
| 未実装 | graceful degradation のまま              | 通常の Phase 1-13 フローで実行             |

## 参照資料

| 資料           | パス                                                                  | 概要                                |
| -------------- | --------------------------------------------------------------------- | ----------------------------------- |
| 現在の DI 配線 | `apps/desktop/src/main/ipc/index.ts:890-912`                          | DI 配線の現状                       |
| Facade 全体    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | RuntimeSkillCreatorFacade 実装      |
| getAdapter API | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`             | LLMAdapterFactory.getAdapter()      |
| ResourceLoader | `apps/desktop/src/main/services/skill/ResourceLoader.ts`              | ResourceLoader コンストラクタ       |
| 定数定義       | `apps/desktop/src/main/services/skill/constants.ts`                   | `DEFAULT_SKILL_CREATOR_PATH` 定義元 |
| P34            | `.claude/rules/06-known-pitfalls.md` P34                              | Setter Injection パターン           |
| P5             | `.claude/rules/06-known-pitfalls.md` P5                               | リスナー二重登録                    |

## 成果物

- 要件定義書（本ファイル）

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

Phase 2: 設計
