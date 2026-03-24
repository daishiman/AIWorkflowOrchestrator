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

### 段階的実装戦略

本タスク（UT-SC-05-IPC-DI-WIRING）は TASK-SC-05-IMPROVE-LLM Phase 12 の未タスク検出で生成された。これは意図的な設計判断である。

TASK-SC-05-IMPROVE-LLM では `RuntimeSkillCreatorFacade` の `plan()` / `improve()` メソッドへの LLM プロンプト統合（Facade 内ロジック）を先行実装した。DI 配線（`index.ts` の1箇所）は依存の取得戦略（非同期 LLM アダプター取得の race condition リスク）の検討が必要であったため、分離タスクとして切り出した。

この分離により:

1. Facade クラス側の LLM 統合ロジックを安定させてからインフラ層（IPC 配線）を修正できる
2. DI 配線の race condition 対策（IIFE パターン）を独立して設計・テストできる
3. 既存の Graceful Degradation が本タスク完了まで安全に維持される

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

## 統合テスト連携

Phase 1-3 は設計フェーズであり、テストコードはこの段階では作成しない。Phase 4 以降で作成するテストの要件を以下に事前整理する。

| テスト対象                            | 検証内容                                                                               | 作成予定 Phase |
| ------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| `index.ts` DI 配線（IIFE パターン）   | `LLMAdapterFactory.getAdapter()` が呼び出され、返した adapter が Facade に渡ること     | Phase 4        |
| `index.ts` DI 配線（API キー未設定）  | `getAdapter()` が失敗した場合、`llmAdapter: undefined` で Facade が生成されること      | Phase 4        |
| `RuntimeSkillCreatorFacade.plan()`    | `llmAdapter` と `resourceLoader` が注入済みの場合、LLM 呼び出しパスを実行すること      | Phase 4        |
| `RuntimeSkillCreatorFacade.improve()` | `skillFileManager` が注入済みの場合、エラー応答ではなく LLM 呼び出しパスを実行すること | Phase 4        |

## 多角的チェック観点（AIが判断）

本タスクは Electron Main Process の IPC 配線（DI 注入）変更であるため、以下のドメインを参照してレビューを実施する。

| ドメイン                      | 参照資料                                                       | 確認内容                                                              |
| ----------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| IPC 通信（Main-Renderer連携） | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` | `skill-creator:*` ハンドラの引数契約が変更されないこと                |
| セキュリティ                  | `aiworkflow-requirements: security-api-electron.md`            | API キーが IPC 経由で Renderer に露出しないこと、ログに含まれないこと |
| アーキテクチャ                | `aiworkflow-requirements: architecture-overview.md`            | Main Process 内の DI 依存方向が正しいこと（Facade は Port に依存）    |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md` P34, P65                  | 遅延初期化 DI パターンと dead-end namespace 回避の準拠確認            |

## サブタスク管理

| サブタスクID | タスク名                     | 完了条件                                                    | ステータス |
| ------------ | ---------------------------- | ----------------------------------------------------------- | ---------- |
| P1-T1        | 依存注入の欠損箇所を特定     | 3依存（skillFileManager, llmAdapter, resourceLoader）を列挙 | 完了       |
| P1-T2        | LLM アダプター取得戦略の決定 | 案A/B/C を評価し推奨案を決定                                | 完了       |
| P1-T3        | 受入基準の定義               | 5つの受入基準を明文化                                       | 完了       |

## タスク100%実行確認【必須】

- [x] Task 1: 未注入の3依存（skillFileManager、llmAdapter、resourceLoader）を特定した
- [x] Task 2: 各依存のインスタンス化方法（コンストラクタ引数、非同期/同期）を調査した
- [x] Task 3: LLM アダプター取得戦略（案A/B/C）を評価し、推奨案を明記した
- [x] Task 3: 受入基準 5 件を定義した
- [x] 参照資料のファイルパスが全て有効であることを確認した

## 成果物

- 本仕様書（Phase 1 要件定義）

## 完了条件

- [ ] 未注入の依存が `skillFileManager`、`llmAdapter`、`resourceLoader` の3つであることを確認した
- [ ] 各依存のインスタンス化方法（コンストラクタ引数、非同期/同期）を調査完了した
- [ ] LLM アダプター取得戦略（案A/B/C）を評価し、推奨案を決定した
- [ ] 受入基準を明確に定義した

## 次のPhase

Phase 2: 設計
