# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 3                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 2 の設計が、最小の複雑性で acceptance criteria を満たせるかを gate 判定する。

## 実行タスク

- P0-07 の source of truth が 1 つに収束しているかをレビューする
- U2 の snapshot semantics が live draft から独立しているかをレビューする
- Phase 5 以降に並列実装してよいかを判定する

## 参照資料

| 資料名         | パス                                                                                               | 参照理由            |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 2 設計   | `phase-2-design.md`                                                                                | レビュー対象        |
| runtime facade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                              | current code anchor |
| renderer panel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current code anchor |
| runtime test   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`          | テスト実現性の確認  |
| renderer test  | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト実現性の確認  |

## 設計レビュー観点

### 観点1: source of truth の単純さ

- `PLAN_RESOURCE_REQUESTS` から agent 名を導出するだけで目的を達成できるか
- 新しい manifest layer や shared type を増やしていないか
- `RuntimeSkillCreatorFacade.plan()` が 1 箇所の変更で閉じているか

### 観点2: snapshot semantics の明確さ

- `approvedSkillSpec` が request snapshot だと一目で分かるか
- textarea の live draft と execute payload が分離されているか
- cancel / regenerate で state を戻せるか

### 観点3: テスト可能性

- runtime 側と renderer 側のテスト責務が重複していないか
- generate → edit → execute の drift を再現できるか
- 既存テストを壊さずに追加できるか

### 観点4: 破棄判断

- 追加レイヤーや shared type を増やす案は破棄する
- canonical JSON へ変換する案は破棄する
- source of truth を増やす案は破棄する

## 判定基準

| 判定     | 基準                                          |
| -------- | --------------------------------------------- |
| PASS     | 追加レイヤーなしで実装できる                  |
| MINOR    | コメントや補助関数の追加のみ必要              |
| MAJOR    | 追加レイヤーが必要になっている                |
| CRITICAL | design の前提が current code と一致していない |

## 成果物

| 成果物           | パス                                      | 説明                        |
| ---------------- | ----------------------------------------- | --------------------------- |
| 設計レビュー結果 | `phase-3-design-review.md`                | gate 判定と理由             |
| レビュー記録     | `outputs/phase-3/design-review-result.md` | PASS / MINOR / MAJOR の記録 |

## 完了条件

- [ ] source of truth の設計が 1 本化されている
- [ ] snapshot semantics が current code と一致している
- [ ] Phase 5 へ進むか、再設計へ戻るかが判定されている

## サブタスク管理

1. P0-07 の単純性レビュー
2. U2 の snapshot semantics レビュー
3. テスト実現性レビュー
4. gate 判定の確定

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] PASS / MINOR / MAJOR / CRITICAL の理由が書ける
- [ ] Phase 4 へ進む条件が明文化されている
