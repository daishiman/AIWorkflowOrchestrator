# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| Phase名    | リファクタリング                               |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

実装後の重複除去・命名整理・設計改善を行い、`対象/Before/After/理由` テーブル形式で記録する。
全テストが引き続き PASS することを確認する。

---

## 実行タスク

### タスク1: コードレビューと改善点の抽出

**確認項目**:

1. `ConversationRoundStep.tsx` 内の重複ロジックを確認する
2. 不要な `console.log` 等のデバッグコードを除去する
3. 命名揺れ（camelCase / PascalCase）を確認し、プロジェクト規則に統一する
4. `QUESTIONS` 定数の選択肢ラベルが `ConversationalInterview.tsx` の既存ラベルと整合しているか確認する
5. import 文の整理（不要 import の除去）

---

### タスク2: リファクタリング実施と記録

**リファクタリング記録テーブル**（実施後に記入）:

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実施後に記入） | -      | -     | -    |

**実行手順**:

1. 改善箇所をリストアップし、上記テーブルに記録する
2. リファクタリングを実施する
3. `pnpm vitest run` で TC-01〜TC-19 が引き続き PASS することを確認する
4. `pnpm --filter @repo/desktop typecheck` が引き続き PASS することを確認する

```bash
# リファクタリング後の確認
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
pnpm --filter @repo/desktop typecheck
```

---

## 参照資料

| 資料名               | パス                                                                          | 説明                     |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| リファクタリング対象 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | コードレビュー対象       |
| 既存命名規則         | `apps/desktop/src/renderer/components/skill/`                                 | プロジェクト規則の参照先 |

---

## 成果物

| 成果物               | 配置先                                  | 形式     |
| -------------------- | --------------------------------------- | -------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] リファクタリング記録が `対象/Before/After/理由` テーブル形式で残っている（改善なしの場合も「変更なし」と明記）
- [ ] TC-01〜TC-19 が全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `outputs/phase-8/` に全成果物が生成されていること

---

## 次Phase

**Phase 9: 品質保証** — typecheck / lint / test の全通過を確認する。
