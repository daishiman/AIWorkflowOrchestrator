# Phase 8 リファクタリング計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 8                                            |
| 成果物種別 | リファクタリング計画                         |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 5 実装計画、Phase 7 カバレッジ計画     |
| 後続       | Phase 9 品質検証                             |

---

## 1. リファクタリング方針

本タスク（Task01）は要件・設計・テスト仕様の確定を対象とし、プロダクションコードの実装は行わない（制約 C7）。したがって本 Phase 8 のリファクタリング対象は「仕様書・設計成果物の構造品質」であり、後続タスク（Task02-10）での実装時に手戻りが発生しないよう、以下の 4 軸で仕様書間の整合性と責務境界を精査する。

### 1.1 責務集約: direct read と暫定 adapter 生成を resolver 経由へ集約

| 対象                 | 現状の仕様記述                                            | リファクタリング方針                                                                     |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| LLMAdapterFactory    | `SecureStorage.getApiKey(providerId)` で API key 直接取得 | `ICredentialProvider.get(providerId)` 経由に統一する仕様を Phase 5 Step 5 で確定済み     |
| SkillExecutor        | `AuthKeyService` DI + 環境変数フォールバック              | `AIRuntimeResolver` 経由に統一する仕様を Phase 5 Step 6 で確定済み                       |
| AgentExecutor        | Claude Agent SDK `query()` 直接呼び出し                   | `AIRuntimeResolver` 経由に統一する仕様を Phase 5 Step 6 で確定済み                       |
| aiHandlers (AI_CHAT) | `getSelectedLLMConfig()` で handler 内完結                | `AIRuntimeResolver.resolve()` 呼び出しに統一する仕様を Phase 5 Step 6 で確定済み         |
| SkillDocGenerator    | `LLMQueryFn` を Constructor Injection で受け取り          | DI の provider 接続を `AIRuntimeResolver` 経由に変更する仕様を Phase 5 Step 6 で確定済み |

**確認事項**: Phase 2 設計サマリーの resolver 設計と Phase 5 実装計画の Step 5-6 が矛盾なく対応していることを検証する。

### 1.2 AuthModeService の legacy migration layer 整理

| 観点               | 現状の仕様記述                                                          | リファクタリング方針                                                                 |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 変換テーブル定義   | Phase 5 Step 3 で 4 パターン定義（api-key/subscription x key存在/不在） | Phase 1 の legacy authMode 定義（2 値: `subscription`/`api-key`）との整合性を確認    |
| 互換性保証         | 制約 C6: legacy 値を即時削除しない                                      | Phase 2 の migration Step 1 と Phase 5 Step 3 で互換性保証が明示されていることを確認 |
| 不正値ハンドリング | Phase 6 ME-02/ME-03 でエッジケースを定義                                | Phase 4 のテストマトリクスに対応テストケースが存在することを確認                     |
| 二重変換防止       | Phase 6 ME-04 で定義                                                    | Phase 4/Phase 5 で二重変換防止ロジックの仕様が明示されていることを確認               |

### 1.3 LLMAdapterFactory の CredentialProvider 統合

| 観点                    | 現状の仕様記述                                                   | リファクタリング方針                                                     |
| ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| credential 取得経路     | Phase 5 Step 5: SecureStorage 直読み -> ICredentialProvider 経由 | 経路変更の仕様が Phase 2 CredentialProvider 設計と一致していることを確認 |
| cache invalidation 連動 | Phase 5 Step 5: capability 変更イベントで自動 clear              | Phase 2 Cache Clear 条件テーブルと Phase 6 CI-01~CI-06 の整合性を確認    |
| エラー形式統一          | Phase 5 Step 5: 汎用 throw -> FailFastError 形式                 | Phase 2 Fail-Fast ルールテーブルと Phase 4 C2-1 テストの整合性を確認     |
| シングルトンキャッシュ  | Phase 1 M2: provider 単位のシングルトン                          | Phase 5 Step 5 の変更後もシングルトン方針が維持されることを確認          |

### 1.4 SkillExecutor / AgentExecutor の AuthKeyService -> CredentialProvider 統合

| 観点                      | 現状の仕様記述                                            | リファクタリング方針                                                              |
| ------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| SkillExecutor DI パターン | Phase 5: Setter Injection（P34 準拠、BrowserWindow 依存） | DI パターンが P34 に準拠し、resolver 注入前の fallback が定義されていることを確認 |
| AgentExecutor DI パターン | Phase 5: Setter Injection（P34 準拠）                     | 同上                                                                              |
| provider 固定の解除       | Phase 1 M6/M7: Anthropic 限定 -> provider 抽象化          | Phase 5 Step 6 で provider 固定解除の仕様が明示されていることを確認               |
| terminal-handoff 導線     | Phase 1 M6/M7: terminal handoff 未定義                    | Phase 2 後続タスク契約で Task02 への handoff contract が定義されていることを確認  |
| `@ts-expect-error` 除去   | Phase 1 M7: AgentExecutor に `@ts-expect-error` あり      | Phase 5 Step 6 で SDK 型不整合の解消方針が含まれていることを確認                  |

---

## 2. 責務境界マトリクス（現在 -> 目標）

### 2.1 Main Process コンポーネント

| コンポーネント             | 現在の責務                                          | 目標の責務                                         | 変更内容                                             |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| AuthModeService            | `subscription`/`api-key` 排他的 toggle + 永続化     | legacy migration layer + capability 変換提供       | `migrateToCapability()` 追加、toggle 概念は互換維持  |
| AIAccessCapabilityResolver | 存在しない（新規）                                  | surface 別 capability 判定の最終 authority         | 新規作成。authMode + API key + terminal から判定     |
| AIRuntimeResolver          | 存在しない（新規）                                  | provider/model/adapter 解決 + fail-fast            | 新規作成。4 段階優先度解決                           |
| CredentialProvider         | 存在しない（新規）                                  | API key/token 取得の統一インターフェース           | 新規作成。SecureStorage をラップ                     |
| LLMAdapterFactory          | SecureStorage 直読み + シングルトンキャッシュ       | CredentialProvider 経由 + イベント駆動 cache clear | credential 取得経路変更 + cache invalidation 自動化  |
| aiHandlers (AI_CHAT)       | handler 内で selectedConfig 解決 + adapter 直接生成 | AIRuntimeResolver.resolve() 呼び出しに委譲         | resolver 経由に統一。handler は入出力変換のみ        |
| SkillExecutor              | AuthKeyService DI + 環境変数フォールバック          | AIRuntimeResolver 経由で credential 取得           | DI 対象を AuthKeyService -> AIRuntimeResolver に変更 |
| AgentExecutor              | Claude Agent SDK 直接呼び出し                       | AIRuntimeResolver 経由で runtime 取得              | SDK 呼び出しを resolver 経由に変更                   |
| chatEditHandlers           | runtime 入口不明確                                  | AIRuntimeResolver 経由で runtime 解決              | resolver 経由に統一                                  |
| SkillDocGenerator          | LLMQueryFn を Constructor Injection                 | AIRuntimeResolver 経由の provider 接続に変更       | DI の接続先を resolver 経由に変更                    |

### 2.2 Renderer コンポーネント

| コンポーネント              | 現在の責務                         | 目標の責務                                      | 変更内容                                     |
| --------------------------- | ---------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| skillExecutionAuthPreflight | authMode 直接参照 + 独自 mode 判定 | Main authority の capability 値参照のみ         | 独自判定ロジック除去、Main の reason 表示    |
| authModeSlice               | legacy authMode state 管理         | capability-based state への段階的移行           | aiAccessSlice 追加で capability state を分離 |
| aiAccessSlice               | 存在しない（新規）                 | accessCapability + terminalAvailable state 管理 | 新規作成。IPC 受信で更新                     |

---

## 3. 依存方向の整理

### 3.1 目標依存グラフ

```
[packages/shared]
  types.ts (AIAccessCapability, FailFastError, ResolvedRuntime)
  credential-provider.ts (ICredentialProvider)
    ^
    | import
    |
[apps/desktop - Main Process]
  SecureStorage (既存)
    ^
    | wrap
    |
  CredentialProvider (新規: ICredentialProvider 実装)
    ^               ^
    | inject         | inject
    |               |
  AIAccessCapabilityResolver (新規)    AIRuntimeResolver (新規)
    ^  ^                                  ^  ^
    |  | inject                           |  | inject
    |  |                                  |  |
    |  AuthModeService (既存 + migration) |  LLMAdapterFactory (既存 + 変更)
    |                                     |
    +-------------------------------------+
    |               inject
    |
  aiHandlers / SkillExecutor / AgentExecutor / chatEditHandlers / SkillDocGenerator
    |
    | IPC (ai:capability-changed, ai:get-capability)
    v
[apps/desktop - Renderer]
  aiAccessSlice (新規)
    ^
    | subscribe
    |
  skillExecutionAuthPreflight (既存 + 変更)
```

### 3.2 依存方向ルール確認

| ルール                                    | 確認結果 | 備考                                                      |
| ----------------------------------------- | -------- | --------------------------------------------------------- |
| Renderer -> Preload -> Main の一方向依存  | 準拠     | Renderer は IPC 経由でのみ Main の capability を参照する  |
| packages/shared は末端（外部依存なし）    | 準拠     | 型定義とインターフェースのみ                              |
| apps/ 間で直接 import しない              | 準拠     | 共有型は packages/shared 経由                             |
| credential は Main Process に閉じ込め     | 準拠     | CredentialProvider は Main 内、Renderer には boolean のみ |
| capability の最終判定は Main が authority | 準拠     | Renderer は独自判定を行わない                             |

---

## 4. 安全な移行順序（migration order）

Phase 5 の Step 1-8 を基に、仕様書間の整合性を確保した移行順序を再確認する。

| 順序 | 対象                                                                     | 前提条件       | 破壊的変更 | rollback 単位                |
| ---- | ------------------------------------------------------------------------ | -------------- | ---------- | ---------------------------- |
| 1    | 型定義（packages/shared）                                                | なし           | なし       | ファイル削除で原状復帰       |
| 2    | ICredentialProvider インターフェース                                     | 順序 1 完了    | なし       | ファイル削除で原状復帰       |
| 3    | AuthModeService migration 追加                                           | 順序 1 完了    | なし       | メソッド削除で原状復帰       |
| 4    | AIAccessCapabilityResolver + AIRuntimeResolver + CredentialProvider 新規 | 順序 1-3 完了  | なし       | ファイル削除で原状復帰       |
| 5    | LLMAdapterFactory 変更                                                   | 順序 2, 4 完了 | あり       | credential 取得経路を revert |
| 6    | aiHandlers / SkillExecutor / AgentExecutor 等の変更                      | 順序 4, 5 完了 | あり       | resolver 参照を revert       |
| 7    | skillExecutionAuthPreflight 変更                                         | 順序 6 完了    | あり       | authMode 参照に revert       |
| 8    | aiAccessSlice 追加 + store 合成                                          | 順序 1, 6 完了 | なし       | slice 削除で原状復帰         |

### 移行順序の安全性保証

- 順序 1-4 は新規追加のみであり、既存コードに影響しない（rollback はファイル/メソッド削除で完結）
- 順序 5-7 は既存コードの変更を伴うため、破壊的変更に該当する。各順序の完了後にテストを実行し、回帰がないことを確認してから次に進む
- 順序 8 は新規 slice の追加であり、既存 store には影響しない

---

## 5. リスク評価と rollback 戦略

### 5.1 リスク一覧

| ID   | リスク                                                        | 影響度 | 発生確率 | 対策                                                                               |
| ---- | ------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| R-01 | LLMAdapterFactory の credential 取得経路変更で既存テスト破壊  | 高     | 中       | Phase 6 CI-01~CI-06 で cache invalidation を網羅テスト。変更前に全テスト PASS 確認 |
| R-02 | SkillExecutor の DI 変更で既存テストファイル大規模修正（P35） | 中     | 高       | Phase 7 で影響テストファイル数を事前調査。mockResolver を標準化して再利用          |
| R-03 | authModeSlice と aiAccessSlice の state 競合                  | 中     | 低       | aiAccessSlice は独立した state を管理。authModeSlice の既存 state は変更しない     |
| R-04 | Phase 2 設計と Phase 5 実装計画の間で仕様ドリフトが発生       | 高     | 低       | 本 Phase 8 で cross-check を実施し、差分があれば Phase 5 を修正                    |
| R-05 | IPC チャンネル追加時の sender 検証漏れ                        | 高     | 中       | Phase 4 IPC セキュリティテスト観点で sender 検証を必須化                           |
| R-06 | legacy authMode migration の二重変換                          | 中     | 低       | Phase 6 ME-04 でテストケース定義済み。idempotency を保証する仕様を明示             |

### 5.2 rollback 戦略

| 順序段階                 | rollback 手順                                                                                             | 所要時間（見積） |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------- |
| 順序 1-4（新規追加）     | `git revert` で新規ファイルを削除。既存コードへの影響なし                                                 | 5 分以内         |
| 順序 5（Factory 変更）   | LLMAdapterFactory の credential 取得を SecureStorage 直読みに revert。`git diff` で変更箇所を特定して戻す | 15 分以内        |
| 順序 6（handler 変更）   | 各 handler の resolver 参照を元の直接呼び出しに revert。対象 5 ファイルを個別に `git checkout`            | 30 分以内        |
| 順序 7（preflight 変更） | authMode 直接参照に revert。1 ファイルのみ                                                                | 5 分以内         |
| 順序 8（slice 追加）     | aiAccessSlice ファイル削除 + store 合成の revert                                                          | 5 分以内         |

### 5.3 rollback 判定基準

| 判定          | 条件                                               | アクション                             |
| ------------- | -------------------------------------------------- | -------------------------------------- |
| 続行          | 該当順序のテストが全 PASS                          | 次の順序へ進む                         |
| 部分 rollback | 該当順序のテストで 1-3 件の失敗（原因が特定可能）  | 失敗原因を修正し、再テスト             |
| 全体 rollback | 該当順序のテストで 4 件以上の失敗、または原因不明  | 該当順序を revert し、Phase 5 を再検討 |
| 緊急 rollback | 順序 5-7 で既存テスト（変更対象外）が 1 件でも失敗 | 即座に revert し、影響範囲を再調査     |

---

## 6. 仕様書間 cross-check 結果

Phase 1-7 の成果物間で以下の整合性を確認した。

| チェック項目                                                     | Phase 間         | 結果 | 備考                                                  |
| ---------------------------------------------------------------- | ---------------- | ---- | ----------------------------------------------------- |
| Capability 5 区分の定義が Phase 1 と Phase 2 で一致              | Phase 1 <-> 2    | OK   | 5 区分の名称・定義が一致                              |
| Surface Inventory の Gap が Phase 5 の変更対象に反映されている   | Phase 1 <-> 5    | OK   | M1-M12, R1-R9 の Gap が Step 1-8 でカバーされている   |
| CredentialProvider の仕様が Phase 2 設計と Phase 5 実装で一致    | Phase 2 <-> 5    | OK   | get/exists メソッド、配置先、セキュリティ制約が一致   |
| Fail-Fast ルールが Phase 2 と Phase 4 テストで網羅されている     | Phase 2 <-> 4    | OK   | 5 段階の fail-fast が C2-1 テストでカバー             |
| Cache Clear 条件が Phase 2 と Phase 6 回帰テストで網羅されている | Phase 2 <-> 6    | OK   | 4 トリガーが CI-01~CI-06 でカバー                     |
| カバレッジ目標が Phase 7 とプロジェクト基準で一致                | Phase 7 <-> 基準 | OK   | Line 80%/Branch 60%/Function 80% が最低基準に合致     |
| DI パターンが P34 準拠                                           | Phase 5 <-> P34  | OK   | SkillExecutor/AgentExecutor は Setter Injection       |
| IPC セキュリティが Phase 4 で定義されている                      | Phase 4 <-> 基準 | OK   | sender 検証、P42 3段バリデーション、credential 非送信 |
| 制約 C7（本タスクで実装しない）が全 Phase で遵守されている       | 全 Phase <-> C7  | OK   | 全成果物が仕様・設計・テスト仕様の確定に限定          |
