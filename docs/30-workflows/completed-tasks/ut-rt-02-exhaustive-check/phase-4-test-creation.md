# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 4                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

TDD の Red フェーズとして、exhaustive switch パターンの検証テストを作成する。Phase 1-3 で確認した命名規則・型定義に整合したテストを設計し、Phase 5 実装前に失敗するテストを確立する。

> **[FB-SDK-04-U1-F1] 先行実装確認**: Phase 1 の P50チェックで既に switch 化されている場合、「テスト整合モード」に切り替える。既存テストを TC-MOD で整合し、新規検証は TC-NEW / TC-ADD で追加する（赤→青を強要しない）。

## 実行タスク

- 命名規則整合確認: Phase 1-3 で確認したプロジェクト命名規則とテストパターンの整合確認
- 回帰テスト確認: 既存 T-01〜T-06 が現状で PASS することを確認
- 新規テスト作成: TC-07（switch網羅性）・TC-08（unknown variant の smoke test）を追加
- 未完了テストの記録: `it.todo()` で記録し、未タスク番号を付与

## 参照資料

| 資料名           | パス                                                                                              | 説明                   |
| ---------------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書   | `outputs/phase-2/design.md`                                                                       | テスト対象のswitch設計 |
| Phase 3 レビュー | `outputs/phase-3/design-review.md`                                                                | レビュー通過確認       |
| 既存テスト       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-06の現状確認   |

## 実行手順

### ステップ0: 命名規則整合確認【TDD Red 前に必須】

```bash
# プロジェクトの命名規則確認
grep -n "describe\|it(\|test(" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts | head -30

# ファイル命名規則の確認（camelCase or kebab-case）
ls apps/desktop/src/main/services/runtime/__tests__/
```

| 確認項目             | 現状                    | テストに適用するか |
| -------------------- | ----------------------- | ------------------ |
| describeブロック命名 | （Phase 1で確認した値） | ✅ 従う            |
| it/test 命名規則     | （Phase 1で確認した値） | ✅ 従う            |
| ファイル命名パターン | （Phase 1で確認した値） | ✅ 従う            |

### ステップ1: 既存テストの現状確認

```bash
# 既存テストがPASSすることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

既存テスト一覧（Phase 1 で確認済み）：

| TC ID | テスト内容       | 期待状態 |
| ----- | ---------------- | -------- |
| T-01  | （実装後に記載） | PASS     |
| T-02  | （実装後に記載） | PASS     |
| T-03  | （実装後に記載） | PASS     |
| T-04  | （実装後に記載） | PASS     |
| T-05  | （実装後に記載） | PASS     |
| T-06  | （実装後に記載） | PASS     |

### ステップ2: 新規テスト TC-07 の作成

**TC-07: exhaustive check の型レベル検証**

目的: `classifyExecuteResult()` と outer `switch` の両方が、将来の union 拡張に対して型チェックで漏れを起こさないことを確認する。

```typescript
// TC-07: 型レベルテスト（TypeScript型検査による静的検証）
// 実装方法: 仮バリアントを追加したときに
// 1) classifyExecuteResult() の default
// 2) outer switch の default
// のいずれかでコンパイルエラーが発生することを確認する。

// 仮バリアント追加テスト（手動検証手順）
// 1. RuntimeSkillCreatorExecuteResult に仮バリアントを追加
//    type TestVariant = { type: 'pending'; ... };
//    type RuntimeSkillCreatorExecuteResult = ... | TestVariant;
// 2. pnpm typecheck でコンパイルエラーが assertNever の行で発生することを確認
// 3. classifyExecuteResult() と outer switch に case 'pending' 相当を追加して
//    エラーが解消することを確認
```

### ステップ3: 新規テスト TC-08 の作成

**TC-08: unknown variant が public seam 経由で拒否されることの実行時スモーク検証**

```typescript
// TC-08: unknown variant の smoke test
// public seam 経由で未対応バリアントが流れた場合に失敗することを確認
it("should reject an unknown variant via executeAsync", async () => {
  // module-local assertNever は直接 import せず、executeAsync の戻り値経路で検証する
});
```

### ステップ4: 未完了テストの it.todo() 記録

必要時のみ `it.todo()` で未来の union 追加メモを残す。通常は追加不要：

```typescript
it.todo("TC-09: union型に新バリアント追加時のエンドツーエンド検証"); // UT-RT-02-TYPE-EXPANSION-TEST-001
```

### ステップ5: テスト実行（Red確認）

```bash
# 新規テストが RED（失敗）であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## 統合テスト連携

| 連携項目     | 内容                                          |
| ------------ | --------------------------------------------- |
| 統合シナリオ | executeAsync の全バリアント経路をテストで網羅 |
| 回帰確認     | 既存 T-01〜T-06 が引き続き PASS               |

## 多角的チェック観点

| 観点     | 確認内容                                     |
| -------- | -------------------------------------------- |
| 型安全性 | テストがバリアントの型を正しく参照しているか |
| 回帰防止 | 既存テストの振る舞いをアサートしているか     |

## 成果物

| 成果物         | パス                                                                                              | 説明                        |
| -------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 既存修正 + TC-07/TC-08 追加 |
| テスト設計書   | `outputs/phase-4/test-design.md`                                                                  | TC一覧・設計根拠            |

## 完了条件

- [ ] Phase 1-3 で確認した命名規則とテストが整合している
- [ ] 既存テスト T-01〜T-06 が現状で PASS することを確認済み
- [ ] TC-07（switch網羅性）が追加されている
- [ ] TC-08（unknown variant の smoke test）が追加されている
- [ ] 未実装の TC は `it.todo()` で記録し、未タスク番号を付与済み
- [ ] 新規テストが RED 状態（Phase 5 実装待ち）であることを確認
- [ ] テスト設計書（`outputs/phase-4/test-design.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（TDD: Green）

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 4
```
