# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 8                                                          |
| Phase名    | リファクタリング                                           |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 7（カバレッジ確認）                                  |
| 後続Phase  | Phase 9（品質検証）                                        |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 5 で実装したコードの動作を変えずに、コード品質を改善する。RuntimeResolver の旧パス削除、重複コード排除、命名整合性の確保、型安全性強化を行う。

## 実行タスク

- **RuntimeResolver 旧パス削除**: chat-edit ドメインの旧 `RuntimeResolver` への参照が残存している場合、共通パス（`apps/desktop/src/main/services/runtime/RuntimeResolver.ts`）への参照に統一する
- **重複コード排除**: SkillExecutor / AgentExecutor / SkillCreatorService 間の runtime routing 重複パターンを共通ユーティリティに抽出する（1箇所以上で同一パターンが存在する場合）
- **命名改善**: P45 準拠で全ハンドラ・サービス・マネージャー間の引数名とセマンティクスの一致を検証し、乖離がある場合は修正する
- **型安全性強化**: `as` キャスト（P19/P49 違反）を排除し、type predicate には `in` 演算子を使用する。`Result<T, E>` パターンが適用されていない箇所を特定し適用する
- **import 整理**: 未使用 import を削除し、import パスを正規化する（相対パスの深いネストを排除する）

## 参照資料

| 参照資料                   | パス                                                                           | 内容                                 |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`                                   | 非機能要件・不変条件の確認           |
| Phase 2 設計サマリー       | `outputs/phase-2/design-summary.md`                                            | 設計契約の再確認                     |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                    | Phase 5 で実装した変更点の一覧       |
| Phase 6 テスト拡充サマリー | `outputs/phase-6/test-expansion-summary.md`                                    | 異常系と境界値テストの補強結果       |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                           | カバレッジ基準達成確認済みの証跡     |
| RuntimeResolver（共通）    | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`                    | 移動後の共通 RuntimeResolver         |
| SkillExecutor              | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                        | RuntimeResolver 適用後の実装         |
| AgentExecutor              | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                        | RuntimeResolver 適用後の実装         |
| SkillCreatorService        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                  | RuntimeResolver 適用後の実装         |
| useSkillExecution          | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                         | authMode 分岐追加後の実装            |
| useAgent                   | `apps/desktop/src/renderer/hooks/useAgent.ts`                                  | authMode 分岐追加後の実装            |
| TerminalHandoffCard        | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | Phase 5 で実装した UI コンポーネント |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |

## 実行手順

### ステップ1: RuntimeResolver 旧パス参照の洗い出し

```bash
# chat-edit ドメインの旧 RuntimeResolver への参照が残っていないか確認
grep -rn "chat-edit/RuntimeResolver" apps/desktop/src/

# 共通パスへの参照が正しく行われているか確認
grep -rn "services/runtime/RuntimeResolver" apps/desktop/src/
```

残存する旧パス参照がある場合、`services/runtime/RuntimeResolver` への import に修正する。

### ステップ2: 重複パターンの特定と抽出

3実行パス間で同一の runtime routing パターンが繰り返されている箇所を特定する。

```bash
# resolve() 呼び出しパターンの重複を確認
grep -n "runtimeResolver.resolve\|RuntimeResolution" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts \
  apps/desktop/src/main/services/agent/AgentExecutor.ts \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

3箇所以上で同一パターンが発見された場合、共通ユーティリティ関数（例: `handleRuntimeResolution`）として抽出し、各実行パスから参照する。

### ステップ3: 命名整合性の検証（P45 対策）

```bash
# 引数名 skillId / skillName の混在確認
grep -n "skillId\|skillName" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts

# agentId / agentName の混在確認
grep -n "agentId\|agentName" \
  apps/desktop/src/main/services/agent/AgentExecutor.ts \
  apps/desktop/src/main/ipc/agentHandlers.ts
```

引数名が実際の値のセマンティクス（ID vs 名前）と乖離している場合、ハンドラ・サービス・Preload API の全レイヤーで統一する（P45 準拠）。

### ステップ4: 型安全性の強化（P19 / P49 対策）

```bash
# as キャスト（type predicate 以外）の検出
grep -n " as " \
  apps/desktop/src/main/services/runtime/RuntimeResolver.ts \
  apps/desktop/src/main/services/skill/SkillExecutor.ts \
  apps/desktop/src/main/services/agent/AgentExecutor.ts

# non-null assertion の検出（P48 対策）
grep -n "!" \
  apps/desktop/src/renderer/hooks/useSkillExecution.ts \
  apps/desktop/src/renderer/hooks/useAgent.ts
```

発見した `as` キャストについて、以下の判断を行う:

- type predicate 内の `as Record<string, unknown>` → `in` 演算子 + `typeof` チェックに置換（P49 準拠）
- non-null assertion `!` → optional chaining `?.` または `Array.isArray()` チェックに置換（P48 準拠）

### ステップ5: import の整理

```bash
# 未使用 import の確認（ESLint の no-unused-vars で検出）
pnpm --filter @repo/desktop exec eslint --rule '{"@typescript-eslint/no-unused-vars": "error"}' \
  apps/desktop/src/main/services/runtime/ \
  apps/desktop/src/main/services/skill/SkillExecutor.ts \
  apps/desktop/src/main/services/agent/AgentExecutor.ts
```

未使用 import を削除し、3階層以上の相対パス（`../../../`）は絶対パスエイリアス（`@/`）に変更する。

### ステップ6: リファクタリング後の全テスト確認

```bash
pnpm --filter @repo/desktop test
```

全テストが PASS することを確認する。テストが失敗した場合は、リファクタリングで動作が変わっていないか確認し、修正する。

## 統合テスト連携

リファクタリング後の全テスト継続成功を確認する。以下の統合テストが引き続き PASS することを確認する:

- RuntimeResolver → SkillExecutor / AgentExecutor / SkillCreatorService の DI 接続テスト
- IPC ハンドラ → Preload → Renderer Hook の handoff 応答経路テスト
- TerminalHandoffCard と Store（`handoffGuidance`）のデータバインディングテスト

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                      | 仕様参照先                                                  |
| -------------- | --------------------------------------------- | ----------------------------------------------------------- |
| アーキテクチャ | 該当（RuntimeResolver 共通パス統一）          | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（命名整合性・P45 対策）                  | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| 状態管理       | 該当（import 整理・P31/P48 対策確認）         | `aiworkflow-requirements: arch-state-management.md`         |
| セキュリティ   | 該当（P19/P49: 型キャストによる検証バイパス） | `aiworkflow-requirements: security-skill-execution.md`      |

## 成果物

| 成果物                   | パス                                     | 内容                                                     |
| ------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| リファクタリングサマリー | `outputs/phase-8/refactoring-summary.md` | 変更内容（旧パス削除・重複排除・命名修正・型強化）の一覧 |

## 完了条件

- [ ] chat-edit ドメインの旧 `RuntimeResolver` への参照が0件である（`grep -rn "chat-edit/RuntimeResolver"` で確認）
- [ ] 3実行パス間の重複パターンが共通ユーティリティに抽出されているか、重複が存在しないことが確認されている
- [ ] 全ハンドラ・サービス・Preload API で引数名とセマンティクスが一致している（P45 準拠）
- [ ] `as` キャストが type predicate 以外で使用されていない。type predicate 内では `in` 演算子を使用している（P49 準拠）
- [ ] non-null assertion `!` が新規実装コードに含まれていない（P48 準拠）
- [ ] 未使用 import が0件である
- [ ] `pnpm test` で全テストが PASS している（リファクタリング前後で動作が変わっていない）
- [ ] `refactoring-summary.md` に変更内容が具体的に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
