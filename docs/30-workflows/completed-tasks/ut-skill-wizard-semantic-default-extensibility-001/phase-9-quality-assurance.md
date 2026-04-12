# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 9                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 8（リファクタリング）                           |
| 後続Phase  | Phase 10                                              |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

TypeScript 型チェック、ESLint、Prettier、全テスト PASS を一括確認し、出荷品質を担保する。
Phase 8 リファクタリング後のコードが、チーム標準品質基準を満たすことを証跡として記録する。

---

## 実行タスク

### Task 1: 型チェック

**目的:** `@repo/shared` および `@repo/desktop` で型エラーが0件であることを確認する。

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

| 確認項目                 | 期待結果 | 実績 |
| ------------------------ | -------- | ---- |
| @repo/shared 型エラー数  | 0件      |      |
| @repo/desktop 型エラー数 | 0件      |      |

> エラーが発生した場合は、Phase 8 に戻り修正してから再実行する。

### Task 2: Lint チェック

**目的:** ESLint 警告・エラーが0件（または許容リストとの照合で問題なし）であることを確認する。

```bash
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

| 確認項目                | 期待結果                          | 実績 |
| ----------------------- | --------------------------------- | ---- |
| @repo/shared lint 結果  | 0件（エラー・警告ともに）         |      |
| @repo/desktop lint 結果 | 0件（または許容リストと照合済み） |      |

> 許容リストに載っている既知の警告は除外可。新規警告が0件であることを確認する。

### Task 3: フォーマット確認

**目的:** Prettier によるフォーマット差分が0件であることを確認する。

```bash
pnpm --filter @repo/shared format --check
```

または:

```bash
pnpm prettier --check "packages/shared/src/**/*.ts"
```

| 確認項目                       | 期待結果 | 実績 |
| ------------------------------ | -------- | ---- |
| @repo/shared フォーマット差分  | 0件      |      |
| @repo/desktop フォーマット差分 | 0件      |      |

### Task 4: 全テスト実行

**目的:** 全テストが PASS し、テスト件数・PASS 件数を記録する。

```bash
pnpm vitest run
```

| 確認項目     | 期待結果 | 実績 |
| ------------ | -------- | ---- |
| 総テスト件数 | 記録     |      |
| PASS 件数    | 全件     |      |
| FAIL 件数    | 0件      |      |
| SKIP 件数    | 記録     |      |

> FAIL が発生した場合は、Phase 8 に戻り修正してから再実行する。

### Task 5: AC 最終チェック

**目的:** 受け入れ条件（AC）を全て満たすことを確認する。

| AC-ID | 基準                                                                                 | 確認方法                                  | 判定 |
| ----- | ------------------------------------------------------------------------------------ | ----------------------------------------- | ---- |
| AC-1  | `QuestionSemanticLabelMap` 型が `@repo/shared` からインポートできる                  | TypeScript コンパイル成功 + 型チェック0件 |      |
| AC-2  | `resolveSemanticLabel()` が SEMANTIC_LABEL_MAP を参照している                        | コードレビュー + grep 確認                |      |
| AC-3  | テストケースが10件以上存在し全件 PASS                                                | `pnpm vitest run` 結果確認                |      |
| AC-4  | `outputs/phase-3/design-decisions.md` に正準形マッピング表（q1〜q6）が追記されている | ファイル内容確認                          |      |
| AC-5  | 既存の動作が壊れていない（リグレッションなし）                                       | 全テスト PASS + 手動動作確認              |      |

> 全 AC が PASS 判定になった場合のみ Phase 10 へ進む。

### Task 6: リスク台帳作成

**目的:** 残存リスクを記録し、将来の保守担当者へ引き継ぐ。

| リスクID | リスク内容                                               | 発生確率 | 影響度 | 対応方針                                                                               |
| -------- | -------------------------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------------- |
| RISK-01  | 想定外の入力パターン（q1〜q6 以外のラベル）が来た場合    | 中       | 低     | `resolveSemanticLabel()` はラベルをそのまま返す実装で対応済み                          |
| RISK-02  | 将来の q7〜qN 追加時に SEMANTIC_LABEL_MAP の更新が漏れる | 低       | 中     | `outputs/phase-3/design-decisions.md` に更新手順を明記し、レビューチェックリストに追加 |
| RISK-03  | `@repo/shared` の変更が全パッケージの再ビルドを要求する  | 高       | 低     | CI でのビルドキャッシュ活用を推奨                                                      |

### Task 7: 因果ループ監査

**目的:** 設計判断の因果ループを記録し、意図した強化・バランスが機能しているか確認する。

**強化ループ（意図した正のフィードバック）:**

```
shared に型を置く
  → 変換テーブルの管理が一元化される
  → 変換漏れが減る
  → テストの信頼性が上がる
  → 変換テーブルへの追記が安全になる
  → shared に型を置く（ループ強化）
```

**バランスループ（意図した抑制・注意点）:**

```
shared に型を置く
  → shared の変更範囲が広がる
  → 全パッケージの再ビルドが必要になる
  → ビルド時間が増加する
  → shared への軽率な変更が抑制される（バランス）
```

> **確認:** 強化ループが正常に機能し、バランスループが過剰に抑制していないことを記録する。

---

## 参照資料

| 資料名               | パス                                         | 用途                       |
| -------------------- | -------------------------------------------- | -------------------------- |
| Phase 8 成果物       | `outputs/phase-8/refactoring-plan.md`        | リファクタリング内容の確認 |
| Phase 8 再テスト結果 | `outputs/phase-8/post-refactor-test-plan.md` | テスト結果の引き継ぎ       |
| AC 定義              | `outputs/phase-1/requirements-definition.md` | 受け入れ条件の確認         |
| design-decisions.md  | `outputs/phase-3/design-decisions.md`        | AC-4 対応確認              |

---

## 統合テスト連携

- Phase 9 の品質証跡（型チェック結果・Lint 結果・テスト結果・AC 判定）を `outputs/phase-9/` に保存する
- Phase 10（最終レビュー）へ以下を引き継ぐ:
  - `quality-report.md`（型・Lint・フォーマット・テスト結果の一覧）
  - `risk-register.md`（残存リスク台帳）
  - `causal-loop-check.md`（因果ループ監査記録）
  - AC-1〜AC-5 全 PASS の証跡

---

## 多角的チェック観点（AIが判断）

| 思考法         | 確認内容                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------ |
| 論点思考       | 品質保証の本質的な論点（出荷品質の担保）が全タスクで網羅されているか                             |
| システム思考   | 型チェック・Lint・テストの順序が依存関係と整合しているか（型エラーがあれば Lint 前に修正が必要） |
| 価値提案思考   | この品質保証フェーズにより、Phase 10 レビュアーが安心してレビューできる状態になっているか        |
| 整合性確認     | AC-1〜AC-5 の判定基準が Phase 1 要件定義と一致しているか                                         |
| リスク確認     | Task 6 の残存リスクが Phase 10 レビュアーに適切に伝達されるか                                    |
| 因果ループ確認 | Task 7 の強化・バランスループが設計意図を正確に反映しているか                                    |

---

## 成果物

| 成果物名             | パス                                   | 必須 |
| -------------------- | -------------------------------------- | ---- |
| quality-report.md    | `outputs/phase-9/quality-report.md`    | ✅   |
| risk-register.md     | `outputs/phase-9/risk-register.md`     | ✅   |
| causal-loop-check.md | `outputs/phase-9/causal-loop-check.md` | ✅   |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` が型エラー0件
- [ ] `pnpm --filter @repo/desktop typecheck` が型エラー0件
- [ ] `pnpm --filter @repo/shared lint` が0件（エラー・新規警告ともに）
- [ ] `pnpm --filter @repo/desktop lint` が0件（または許容リストとの照合済み）
- [ ] フォーマット差分が0件
- [ ] `pnpm vitest run` で全テストが PASS
- [ ] 総テスト件数と PASS 件数が `quality-report.md` に記録されている
- [ ] AC-1〜AC-5 が全て PASS 判定
- [ ] 残存リスクが `risk-register.md` に記録されている
- [ ] 因果ループが `causal-loop-check.md` に記録されている

## タスク100%実行確認【必須】

- [ ] Task 1: 型チェック ✅
- [ ] Task 2: Lint チェック ✅
- [ ] Task 3: フォーマット確認 ✅
- [ ] Task 4: 全テスト実行 ✅
- [ ] Task 5: AC 最終チェック ✅
- [ ] Task 6: リスク台帳作成 ✅
- [ ] Task 7: 因果ループ監査 ✅
- [ ] 全成果物が `outputs/phase-9/` に保存されていること ✅

---

## 次Phase

**Phase 10: 最終レビュー**（`phase-10-final-review.md`）へ進む。
