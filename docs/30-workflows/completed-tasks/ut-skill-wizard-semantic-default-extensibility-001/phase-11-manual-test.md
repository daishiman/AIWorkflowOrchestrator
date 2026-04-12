# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 11                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001     |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応  |
| 前提Phase  | Phase 10（最終レビューゲート）                         |
| 後続Phase  | Phase 12（ドキュメント更新）                           |
| 作成日     | 2026-04-11                                             |
| ステータス | pending                                                |
| タスク分類 | NON_VISUAL（リファクタリングタスクのため UI 変更なし） |

---

## 目的

自動テストで担保できない実環境での動作確認と証跡取得を行う。
本タスクは NON_VISUAL タスクであるため、スクリーンショットによる視覚確認は不要とし、
自動テスト結果を代替証跡として記録する。

### NON_VISUAL 判定理由

このタスクは `ConversationRoundStep.tsx` の内部ロジック（`resolveSemanticLabel()` 変換テーブル）の
リファクタリングであり、UI の見た目や操作感に一切変更はない。具体的には以下の理由により NON_VISUAL と判定する:

- 変更対象はコンポーネントの内部関数であり、レンダリング結果に影響しない
- `@repo/shared` への型・定数の移動はビルド成果物の外部インターフェースに影響しない
- ユーザーが操作するウィザードの表示内容・レイアウト・スタイルに変更はない

したがって**スクリーンショットによる視覚確認は不要（NON_VISUAL）**とする。

> **NOTE: Feedback BEFORE-QUIT-001 適用** — 実地操作不可を明記し、自動テスト結果を代替記録とする。
> 開発環境が利用できない場合でも、vitest 実行ログをもって証跡とする。

---

## 実行タスク

### Task 1: NON_VISUAL 代替証跡の準備

自動テスト結果を証跡の主ソースとして収集・記録する。

**記録項目:**

| 項目                             | 内容                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| 証跡の主ソース                   | vitest 実行ログ（件数・PASS/FAIL）                                                           |
| スクリーンショットを作らない理由 | NON_VISUAL リファクタリングタスクのため                                                      |
| 実行コマンド                     | `pnpm vitest run --reporter=verbose`                                                         |
| 対象テストファイル               | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |

**実行手順:**

```bash
# vitest を verbose モードで実行し、ログを証跡として保存する
pnpm vitest run --reporter=verbose 2>&1 | tee outputs/phase-11/vitest-verbose.log

# テスト件数と PASS/FAIL を確認する
grep -E "✓|✗|Tests" outputs/phase-11/vitest-verbose.log
```

**記録すべき情報:**

- 総テスト件数
- PASS 件数
- FAIL 件数（あれば）
- `applySmartDefaults` および `resolveSemanticLabel` に関するテスト項目一覧

> **NOTE: Feedback 4 適用** — `outputs/phase-11/manual-test-result.md` のメタ情報に
> 「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」を必ず明記する。

### Task 2: screenshot-plan.json の作成（NON_VISUAL 宣言）

NON_VISUAL であることを明示する `screenshot-plan.json` を作成する。

**ファイル配置:** `outputs/phase-11/screenshot-plan.json`

**内容フォーマット:**

```json
{
  "mode": "NON_VISUAL",
  "reason": "リファクタリングタスクのため UI 変更なし。ConversationRoundStep.tsx の内部ロジック（resolveSemanticLabel 変換テーブル）を @repo/shared に移動するのみ。",
  "taskId": "UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001",
  "phase": 11,
  "screenshots": [],
  "alternativeEvidence": "outputs/phase-11/vitest-verbose.log"
}
```

### Task 3: 既知制限リストの確認

本リファクタリングで意図的にスコープ外とした制限事項を記録する。

**既知制限の確認項目:**

| 制限事項                                            | 理由                                     | 将来対応方針                    |
| --------------------------------------------------- | ---------------------------------------- | ------------------------------- |
| 未定義の questionId（q7〜qN）は変換せずそのまま返す | `SEMANTIC_LABEL_MAP` のスコープは q1〜q6 | q7〜qN 追加時にマップを拡張する |
| `inferSmartDefaults()` 本体は変更しない             | このタスクのスコープ外                   | 別タスクで対応                  |
| 新しい semantic default プロバイダの実装は含まない  | このタスクのスコープ外                   | 別タスクで対応                  |

**記録先:** `outputs/phase-11/evidence-index.md` の「既知制限」セクション

将来の q7〜qN 対応が必要な場合は、その制限を `outputs/phase-10/corrective-action-plan.md` に
未タスク候補として記録していることを確認する。

### Task 4: スモークテスト（任意）

開発環境が利用できる場合のみ実施する。実施できない場合は「実地操作不可」として記録する。

**実施条件:** 開発環境が起動できること

**確認手順（実施できる場合）:**

1. `pnpm --filter @repo/desktop dev` でウィザードを起動する
2. スキル作成ウィザードを開く
3. 各質問（q1〜q6）に対して semantic default が UI ラベルに正しく表示されることを目視確認する
4. 「自分だけ」→「自分のみ」などの変換が正しく機能していることを確認する

**実施できない場合の記録:**

```
スモークテスト実施状況: 実地操作不可（開発環境なし）
代替証跡: vitest 実行ログ（outputs/phase-11/vitest-verbose.log）
```

**記録先:** `outputs/phase-11/manual-test-result.md` の「スモークテスト」セクション

---

## 参照資料

| 資料名                    | パス                                              | 用途                           |
| ------------------------- | ------------------------------------------------- | ------------------------------ |
| Phase 7 カバレッジ報告    | `outputs/phase-7/traceability-coverage-report.md` | テスト総数・カバレッジの確認   |
| Phase 9 品質レポート      | `outputs/phase-9/quality-report.md`               | 品質確認・AC 証跡の引き継ぎ    |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | ゲート PASS の確認             |
| Phase 10 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | MINOR 指摘・未タスク候補の確認 |
| 受け入れ基準              | `outputs/phase-1/acceptance-criteria.md`          | AC-1〜AC-5 の定義確認          |

---

## 統合テスト連携

- Task 1 で収集した vitest 実行ログは `outputs/phase-11/vitest-verbose.log` に保存し、
  Phase 12 のドキュメント更新で「テスト証跡」として参照できるようにする
- Task 3 で確認した既知制限は Phase 12 の「未タスク検出」セクションに引き継ぐ
- `screenshot-plan.json`（NON_VISUAL 宣言）は Phase 12 の証跡インデックスに登録する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 論点思考     | NON_VISUAL 判定が正当であり、自動テスト証跡が AC-1〜AC-5 の代替として十分かどうか                                                   |
| システム思考 | vitest ログで確認できるのが `applySmartDefaults`／`resolveSemanticLabel` のみで、他コンポーネントへの回帰影響が見落とされていないか |
| 整合性確認   | `screenshot-plan.json` の `mode: "NON_VISUAL"` 宣言が Phase 10 ゲート判定と整合しているか                                           |
| リスク思考   | スモークテスト未実施の場合に実地動作で問題が発覚するリスクをどう評価するか                                                          |
| 価値提案思考 | NON_VISUAL 代替証跡（vitest ログ）が Phase 12 のドキュメントで十分な根拠となるか                                                    |

---

## 成果物

| 成果物名                                 | パス                                     | 必須 |
| ---------------------------------------- | ---------------------------------------- | ---- |
| 手動テスト結果（NON_VISUAL証跡）         | `outputs/phase-11/manual-test-result.md` | ✅   |
| 証跡インデックス                         | `outputs/phase-11/evidence-index.md`     | ✅   |
| スクリーンショット計画（NON_VISUAL宣言） | `outputs/phase-11/screenshot-plan.json`  | ✅   |
| vitest 実行ログ                          | `outputs/phase-11/vitest-verbose.log`    | ✅   |

---

## 完了条件

- [ ] `outputs/phase-11/manual-test-result.md` のメタ情報に「証跡の主ソース（自動テスト名/件数）」が記載されている
- [ ] `outputs/phase-11/manual-test-result.md` のメタ情報に「スクリーンショットを作らない理由（NON_VISUAL）」が記載されている
- [ ] `outputs/phase-11/screenshot-plan.json` に `"mode": "NON_VISUAL"` が明示されている
- [ ] vitest 実行ログで自動テスト件数（10件以上）と PASS 件数が証跡として記録されている
- [ ] 既知制限リスト（未定義 questionId 等）が `evidence-index.md` に記録されている
- [ ] スモークテスト実施状況（実施した場合は結果、不可の場合は「実地操作不可」）が記録されている

## タスク100%実行確認【必須】

- [ ] Task 1: NON_VISUAL 代替証跡の準備（vitest ログ収集・件数記録）✅
- [ ] Task 2: screenshot-plan.json の作成（NON_VISUAL 宣言）✅
- [ ] Task 3: 既知制限リストの確認（未定義 questionId 等を evidence-index.md に記録）✅
- [ ] Task 4: スモークテスト（実施 or 「実地操作不可」として記録）✅
- [ ] 全成果物が `outputs/phase-11/` に保存されていること ✅

---

## 次Phase

完了後 → **Phase 12: ドキュメント更新**（`phase-12-documentation.md`）へ進む。
