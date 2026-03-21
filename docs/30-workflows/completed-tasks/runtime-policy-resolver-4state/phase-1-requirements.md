# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| Phase 名   | 要件定義                                      |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | なし                                          |
| 後続 Phase | Phase 2（設計）                               |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

RuntimePolicyResolver.ts の現状、影響範囲、語彙対応表、受入基準を明文化する。

## 実行タスク

- 現状棚卸し: RuntimePolicyResolver の位置・内容・全呼び出し元を特定する
- 語彙対応表作成: 旧2状態（api-key / subscription）から新4状態（integratedRuntime / terminalSurface / both / none）への対応表を作成する
- Guard位置決定: `assertNoSilentFallback()` の適用位置を決定する
- 受入基準定義: direct caller lane の受入基準を定義する

## 参照資料

| 参照資料                  | パス                                                                              | 内容                         |
| ------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| execution-capability.ts   | packages/shared/src/types/execution-capability.ts                                 | 4状態型定義・pure function   |
| RuntimePolicyResolver     | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                   | 現状の2状態リゾルバ（104行） |
| RuntimeSkillCreatorFacade | apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts               | 主要呼び出し元（175行）      |
| creatorHandlers.ts        | apps/desktop/src/main/ipc/creatorHandlers.ts                                      | direct caller の入口         |
| タスク指示書              | docs/30-workflows/unassigned-task/task-exec-runtime-policy-resolver-4state-001.md | 元タスク指示書               |

## 実行手順

### ステップ1: P50 チェック（既実装状態の調査）

```bash
# RuntimePolicyResolver の現在の状態を確認
git log --oneline -10 -- apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

# 4状態モデルへの部分移行がないか確認
grep -rn "resolveCapability\|AccessCapability\|assertNoSilentFallback" apps/desktop/src/main/services/runtime/
```

### ステップ2: 影響範囲の特定

```bash
# RuntimePolicyResolver の全使用箇所
grep -rn "RuntimePolicyResolver" apps/desktop/src/

# authMode 語彙の残存箇所（runtime ディレクトリ内）
grep -rn "authMode" apps/desktop/src/main/services/runtime/ --include="*.ts"

# RuntimePolicyResolver のテストファイル
find apps/desktop/src/main/services/runtime/__tests__ -name "*RuntimePolicyResolver*"
```

### ステップ3: 語彙対応表の作成

| 旧語彙                      | 新語彙                     | 備考                                     |
| --------------------------- | -------------------------- | ---------------------------------------- |
| `AuthMode`                  | `ExecutionCapabilityInput` | 入力型                                   |
| `"api-key"`                 | `apiKeyValid: true`        | 入力条件                                 |
| `"subscription"`            | `subscriptionValid: true`  | 入力条件                                 |
| `RuntimeDecision`           | `AccessCapability`         | 判定結果の型（4状態）                    |
| `"integrated_api"`          | `"integratedRuntime"`      | integrated API 実行可能                  |
| `"terminal_handoff"`        | `"terminalSurface"`        | terminal handoff のみ可能                |
| （対応なし）                | `"both"`                   | 両方利用可能（新規）                     |
| （対応なし）                | `"none"`                   | いずれも利用不可（新規）                 |
| `resolve(authMode, apiKey)` | `resolve(input)`           | 引数を `ExecutionCapabilityInput` に統一 |

### ステップ4: assertNoSilentFallback 組み込み箇所の決定

`resolveCapability()` の結果取得後、呼び出し元に返す前で `assertNoSilentFallback(capability)` を呼ぶ。capability が `"none"` のとき例外が throw され、DEFAULT_CONFIG への暗黙遷移が阻止される。

```typescript
// 組み込みイメージ
const capability = resolveCapability(input);
assertNoSilentFallback(capability); // "none" のとき例外
return capability;
```

### ステップ5: 受入基準の確認

index.md の AC-1〜AC-8 を確認し、全て検証可能であることを確認する。

## 統合テスト連携

- direct caller suite: `RuntimePolicyResolver.test.ts` と `RuntimeSkillCreatorFacade.test.ts`
- parent closure lane の broader consumer は本 phase では対象外とし、boundary drift だけを記録する
- `validate-phase-output` / `verify-all-specs --strict` を current workflow evidence として管理する

## 成果物

| 成果物       | 配置先                                |
| ------------ | ------------------------------------- |
| 要件定義書   | 本ファイル（phase-1-requirements.md） |
| 語彙対応表   | 本ファイル内 ステップ3                |
| 影響範囲一覧 | 本ファイル内 ステップ2 の実行結果     |

## 完了条件

- [ ] RuntimePolicyResolver の全使用箇所が特定されている
- [ ] 旧2状態→新4状態の語彙対応表が作成されている
- [ ] `assertNoSilentFallback()` の組み込み箇所が決定されている
- [ ] 受入基準（AC-1〜AC-8）が全て検証可能であることが確認されている
- [ ] P50 チェック（既実装状態の調査）が完了している

## 次 Phase

Phase 2（設計）へ進む。
