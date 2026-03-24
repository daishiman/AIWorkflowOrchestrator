# Phase 1: 要件定義

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 1                               |
| タスクID | UT-SC-05-IPC-DI-WIRING          |
| 作成日   | 2026-03-23                      |
| 検出元   | TASK-SC-05-IMPROVE-LLM Phase 12 |

## 目的

`RuntimeSkillCreatorFacade` のコンストラクタに `skillFileManager`、`llmAdapter`、`resourceLoader` の3依存が未注入であることを明確化し、修正要件と受入基準を定義する。

## 背景

`apps/desktop/src/main/ipc/index.ts` L898-902 において、`RuntimeSkillCreatorFacade` は `skillExecutor` と `authKeyService` のみが注入されている。`RuntimeSkillCreatorFacadeDeps` インターフェースでは `llmAdapter`、`resourceLoader`、`skillFileManager` がオプショナルフィールドとして定義されているが、これらが未注入のため、`plan()` と `improve()` の LLM 統合パスが常に Graceful Degradation（スタブ応答）にフォールバックする。

### 現状のコード（L898-902）

```typescript
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
    })
  : undefined;
```

### 問題点

1. `llmAdapter` 未注入 → `plan()` L111 で `!this.llmAdapter` が true → スタブ応答を返却
2. `resourceLoader` 未注入 → `plan()` L111 で `!this.resourceLoader` が true → スタブ応答を返却
3. `skillFileManager` 未注入 → `improve()` L252 で `!this.skillFileManager` → エラー応答を返却
4. LLM を呼び出す integrated_api パスが実行されない

## 実行タスク

### Task 1: 依存注入の欠損箇所を特定

1. `apps/desktop/src/main/ipc/index.ts` L898-902 を確認し、未注入の依存を列挙する
2. `RuntimeSkillCreatorFacadeDeps` インターフェース（L46-53）で必要なフィールドを確認する
3. 各依存のインスタンス化方法を調査する
   - `skillFileManager`: L701 で既に `new SkillFileManager()` として生成済み（同ファイル内で利用可能）
   - `llmAdapter`: `LLMAdapterFactory.getAdapter(providerId)` で取得可能（非同期、プロバイダーID が必要）
   - `resourceLoader`: `new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)` で生成可能

### Task 2: LLM アダプター取得戦略の決定

1. `LLMAdapterFactory` はシングルトンであり、`getAdapter(providerId)` は非同期（API キー取得を含む）
2. `RuntimeSkillCreatorFacade` のコンストラクタは同期実行 → コンストラクタ内で `await` は使えない
3. 取得戦略の選択肢を明確にする:
   - **案A**: デフォルトプロバイダー（anthropic）で事前取得して注入
   - **案B**: `LLMAdapterFactory` 自体を注入し、Facade 内で遅延取得
   - **案C**: IPC ハンドラ登録時点で非同期取得してから注入

### Task 3: 受入基準の定義

1. `RuntimeSkillCreatorFacade` のコンストラクタ呼び出しに `skillFileManager`、`llmAdapter`、`resourceLoader` が含まれる
2. `improve()` が Graceful Degradation ではなく LLM 呼び出しパスを実行する
3. `plan()` が Graceful Degradation ではなく LLM 呼び出しパスを実行する
4. 既存テスト 92 件が全て PASS する
5. `pnpm typecheck` がエラーなしで完了する

## 参照資料

- `apps/desktop/src/main/ipc/index.ts` L698-909（Skill Creator ハンドラ登録セクション）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L46-53（Deps インターフェース）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L110-123（plan の Graceful Degradation）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L242-248（improve の Graceful Degradation）
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`（シングルトンファクトリ）
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`（コンストラクタ: skillCreatorPath）
- `apps/desktop/src/main/services/skill/SkillFileManager.ts`（引数なしコンストラクタ）
- `apps/desktop/src/main/services/skill/constants.ts` L64（DEFAULT_SKILL_CREATOR_PATH）
- `.claude/rules/06-known-pitfalls.md` P34（遅延初期化 DI パターン）
- `.claude/rules/06-known-pitfalls.md` P65（dead-end namespace）

## 成果物

- 本仕様書（Phase 1 要件定義）

## 完了条件

- [ ] 未注入の依存が `skillFileManager`、`llmAdapter`、`resourceLoader` の3つであることを確認した
- [ ] 各依存のインスタンス化方法（コンストラクタ引数、非同期/同期）を調査完了した
- [ ] LLM アダプター取得戦略（案A/B/C）を評価し、推奨案を決定した
- [ ] 受入基準を明確に定義した

## 次のPhase

Phase 2: 設計
