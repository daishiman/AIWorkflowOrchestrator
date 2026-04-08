# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| Phase名    | 手動テスト（NON_VISUAL）                       |
| 前提Phase  | Phase 10                                       |
| 後続Phase  | Phase 12                                       |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## Phase 11 手動テスト方針

> **NON_VISUAL タスク**: UI の視覚差分はない。
> console ログ / mock / automation evidence を主証跡とする。
> Phase 12 での `phase12-task-spec-compliance-check.md` に証跡を集約する。

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない（NON_VISUAL のため）
- primary evidence は `vitest` / `typecheck` / `lint` / テンプレート仮生成確認
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

---

## 目的

NON_VISUAL タスクとして、コンポーネントの動作を automation evidence で検証する。

---

## 証跡取得方針

| 証跡種別           | 内容                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| テスト実行ログ     | `pnpm vitest run` の全テスト PASS ログ（TC-01〜TC-19）                       |
| カバレッジレポート | `pnpm vitest run --coverage` の出力（line/branch 数値）                      |
| typecheck ログ     | `pnpm --filter @repo/desktop typecheck` の PASS ログ                         |
| コンポーネント動作 | `buildInitialAnswers` null フォールバック動作のスナップショット証跡（TC-19） |

---

## 実行タスク

### タスク1: NON_VISUAL 証跡の取得

**実行手順**:

1. `pnpm vitest run` を実行し、TC-01〜TC-19 の全テスト PASS ログを記録する
2. `pnpm --filter @repo/desktop vitest run --coverage` を実行し、カバレッジ数値を記録する
3. `pnpm --filter @repo/desktop typecheck` を実行し、PASS ログを記録する
4. `inferSmartDefaults()` の結果を `buildInitialAnswers()` に渡した際の変換結果を
   スナップショットテスト（TC-19）で記録する

```bash
# テスト実行ログを保存
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx \
  --reporter=verbose 2>&1 | tee outputs/phase-11/test-run.log

# カバレッジ
pnpm --filter @repo/desktop vitest run --coverage \
  --coverage.include="**/wizard/ConversationRoundStep.tsx"

# typecheck
pnpm --filter @repo/desktop typecheck
```

---

### タスク2: 手動テスト結果の記録

**manual-test-result.md の必須記載事項**:

- 各 TC-ID と PASS / FAIL / SKIP の記録
- NON_VISUAL である理由の明記（「Renderer 内部実装のみ / 視覚差分なし」）
- 証跡の主ソース（テスト名/件数 = TC-01〜TC-19、19件）
- スクリーンショットを作らない理由（NON_VISUAL タスクのため）

---

### タスク3: 発見事項の記録

**discovered-issues.md の必須記載事項**:

- Phase 11 で発見したスコープ外の問題
- 未タスク候補（Wave 2 整合確認で発見した問題 等）

---

## 参照資料

| 資料名                | パス                                                                                         | 説明         |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| テストファイル        | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 証跡取得対象 |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                                    | 進行前提     |

---

## 成果物

| 成果物           | 配置先                                      | 形式     |
| ---------------- | ------------------------------------------- | -------- |
| 手動テスト手順書 | `outputs/phase-11/manual-test-checklist.md` | Markdown |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`    | Markdown |
| 発見事項         | `outputs/phase-11/discovered-issues.md`     | Markdown |

---

## 完了条件

- [ ] TC-01〜TC-19 の全 PASS が確認されている（`manual-test-result.md` に記録）
- [ ] NON_VISUAL として automation evidence が記録されている
- [ ] NON_VISUAL 理由と証跡の主ソースが明記されている（空メタ不可）
- [ ] `discovered-issues.md` が作成されている（発見なしの場合も「なし」と明記）
- [ ] `outputs/phase-11/` に全成果物が生成されていること

---

## 次Phase

**Phase 12: ドキュメント更新** — 実装ガイド（Part 1/2）・仕様書更新・未タスク検出・フィードバックレポートを完成させる。
