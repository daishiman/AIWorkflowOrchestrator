# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| Phase 名   | 設計レビュー                                  |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 2（設計）                               |
| 後続 Phase | Phase 4（テスト作成）                         |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

Phase 2 の設計成果物に対して、語彙ドリフト、4状態網羅性、enforcement 位置の妥当性を検証し、Phase 4 へ進めるかを判定する。

## 実行タスク

- 語彙監査: capability 契約と設計書の語彙ドリフトを点検する
- 網羅性監査: 4状態分岐が direct caller で閉じていることを確認する
- enforcement 監査: `assertNoSilentFallback()` の適用位置を確認する
- ゲート判定: Phase 4 に進める設計品質を確定する

## 参照資料

| 参照資料                | パス                                                                     | 内容                         |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 成果物          | docs/30-workflows/runtime-policy-resolver-4state/phase-1-requirements.md | 境界・受入基準               |
| Phase 2 成果物          | docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md       | インターフェース設計         |
| execution-capability.ts | packages/shared/src/types/execution-capability.ts                        | 基準語彙（型名・関数名）     |
| P62 教訓                | .claude/rules/06-known-pitfalls.md                                       | DEFAULT_CONFIG 暗黙 fallback |

## 実行手順

### ステップ1: 語彙ドリフトの3方向チェック

以下の3箇所で語彙が統一されているか検証する。

#### チェック A: execution-capability.ts の型名・関数名（基準）

```
型名: AccessCapability, ExecutionCapabilityInput, CapabilityContext, UiStateResult, CtaInput, CtaContract
関数名: resolveCapability, resolveUiState, resolveCtaContract, assertNoSilentFallback
定数: CAPABILITY_VALUES, UI_STATE_VALUES
```

#### チェック B: Phase 2 設計の RuntimePolicyResolver 語彙

Phase 2 設計書のインターフェース定義で使用されている型名・関数名が、チェック A の基準リストと一致しているか確認する。

#### チェック C: 呼び出し元の旧語彙残存確認

```bash
# RuntimePolicyResolver スコープ内で旧語彙が残存していないか
grep -rn "authMode\|auth-mode\|AuthMode" apps/desktop/src/main/services/runtime/ --include="*.ts"
# 期待: RuntimePolicyResolver.ts / RuntimeSkillCreatorFacade.ts に旧語彙が残っていないこと
# 注意: TerminalHandoffBuilder.ts や RuntimeResolver.ts はスコープ外（別タスク）
```

### ステップ2: 4状態の網羅性確認

Phase 2 設計書の switch 文が以下の4状態を全て網羅しているか確認する。

| capability        | 期待される処理                                                |
| ----------------- | ------------------------------------------------------------- |
| integratedRuntime | integrated API で実行                                         |
| terminalSurface   | terminal handoff bundle を返す                                |
| both              | デフォルトで integrated、secondary で terminal も利用可能     |
| none              | assertNoSilentFallback で例外（到達しないが型安全のため記述） |

確認方法: `Record<AccessCapability, ...>` パターンで網羅性を TypeScript コンパイラに検証させる設計になっているか。

### ステップ3: assertNoSilentFallback 組み込み位置の妥当性確認

以下を確認する:

1. `resolveCapability()` の直後に `assertNoSilentFallback()` が呼ばれる設計になっているか
2. `resolveFromServices()` で `silent: true` オプションを使う場面が適切か（UI 表示目的で capability 取得する際は例外を throw しない）
3. P62（DEFAULT_CONFIG への暗黙 fallback）が enforcement されているか

### ステップ4: 影響テストファイルの事前確認（P35 対策）

```bash
# RuntimePolicyResolver のモックを使用しているテストファイルを特定
grep -rn "RuntimePolicyResolver" apps/desktop/src/main/services/runtime/__tests__/ --include="*.ts"

# RuntimeSkillCreatorFacade のテストファイルでのモック使用箇所
grep -rn "resolve\|authMode" apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

### ステップ5: レビューゲート判定

| 判定              | 条件                                                     | 対応                  |
| ----------------- | -------------------------------------------------------- | --------------------- |
| PASS              | 3方向チェック全クリア + 4状態網羅 + enforcement 位置適切 | Phase 4 へ            |
| MINOR             | 語彙の軽微な不一致（コメント内の旧語彙残存）             | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | 4状態モデルの要件不足                                    | Phase 1 へ戻る        |
| MAJOR（設計問題） | switch 文の網羅性不足 / enforcement 位置の誤り           | Phase 2 へ戻る        |

## 統合テスト連携

- direct caller suite: `RuntimePolicyResolver.test.ts` と `RuntimeSkillCreatorFacade.test.ts` の RED 化条件を設計レビューの出口にする
- grep gate: `apps/desktop/src/main/services/runtime/` 配下で旧語彙の検索条件を固定し、review drift を減らす
- parent boundary: `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` は親タスクで追跡し、この phase では direct caller への波及有無だけを記録する

## 成果物

| 成果物           | 配置先                                               |
| ---------------- | ---------------------------------------------------- |
| 設計レビュー結果 | 本ファイル（phase-3-design-review.md）実行結果欄追記 |
| ゲート判定       | 本ファイル ステップ5 の結果                          |

## 完了条件

- [ ] 語彙ドリフトの3方向チェックが完了している
- [ ] 4状態の網羅性が確認されている
- [ ] `assertNoSilentFallback()` の組み込み位置が妥当と判定されている
- [ ] 影響テストファイルがリストアップされている（P35 対策）
- [ ] レビューゲート判定が PASS または MINOR で Phase 4 に進行可能

## 次 Phase

レビューゲート判定結果に基づき:

- PASS / MINOR: Phase 4（テスト作成）へ進む
- MAJOR: Phase 1 または Phase 2 へ戻る
