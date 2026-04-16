# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 6                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 5                                           |
| 後続Phase  | Phase 7                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

Phase 4 のテストに加えて、型安全性・エッジケース・回帰ガードのテストを追加し、
`resolveLabelEntry()` の堅牢性と `resolveSemanticLabel()` の後方互換を高める。

## 実行タスク

- Phase 4 テストのレビュー: 既存 TC の充足性確認
- エッジケーステスト追加: `freeText` が `undefined` の場合
- 回帰テスト追加: `resolveSemanticLabel()` の string 契約と desktop の `createQuestionAnswer()` が正常動作することの確認
- 型安全性テスト追加: `resolveLabelEntry()` の型ガード動作確認
- 全テスト実行確認

## 参照資料

| 資料名         | パス                                                                                         | 用途               |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト | `outputs/phase-4/`                                                                           | 既存テスト確認     |
| Phase 5 実装   | `packages/shared/src/types/skill-wizard-label-map.ts`                                        | 実装確認           |
| Phase 5 実装   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 特別ケース削除確認 |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 回帰テスト確認     |

## 実行手順

### 1. Phase 4 テスト充足性確認

| TC 番号 | テスト内容                                                           | Phase 4 での充足 |
| ------- | -------------------------------------------------------------------- | ---------------- |
| TC-01   | resolveLabelEntry notion → `{ label: "その他", freeText: "Notion" }` | 確認             |
| TC-02   | resolveLabelEntry slack → `{ label: "Slack" }`                       | 確認             |
| TC-03   | resolveLabelEntry github → `{ label: "GitHub" }`                     | 確認             |
| TC-04   | resolveLabelEntry unknown → `{ label: value }`                       | 確認             |
| TC-05   | resolveSemanticLabel notion → `"その他"`                             | 確認             |

### 2. 追加テストケース定義

| TC 番号 | テスト名                                                                   | 対象                  | 追加理由                     |
| ------- | -------------------------------------------------------------------------- | --------------------- | ---------------------------- |
| TC-13   | `resolveLabelEntry returns value itself when no entry found`               | 未定義キー            | フォールバック動作確認       |
| TC-14   | `resolveLabelEntry returns undefined when value is undefined`              | undefined 入力        | undefined ガード確認         |
| TC-15   | `object entry without freeText should have undefined freeText`             | freeText 省略エントリ | freeText?: string の省略確認 |
| TC-16   | `createQuestionAnswer notion returns correct selectedOptions and freeText` | createQuestionAnswer  | 特別ケース削除後の動作確認   |
| TC-17   | `createQuestionAnswer slack does not set freeText`                         | createQuestionAnswer  | slack の freeText が空確認   |
| TC-18   | `resolveSemanticLabel remains string-returning wrapper`                    | backward compat       | 既存契約維持確認             |

### 3. 追加テストコード

```typescript
// packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts への追加

import {
  resolveLabelEntry,
  SEMANTIC_LABEL_MAP,
  resolveSemanticLabel,
} from "../skill-wizard-label-map";

describe("resolveLabelEntry - edge cases", () => {
  it("TC-13: unknown key should fall back to value itself", () => {
    const entry = resolveLabelEntry("unknown-tool", "q5");
    expect(entry).toEqual({ label: "unknown-tool" });
  });

  it("TC-14: undefined value should return undefined", () => {
    const entry = resolveLabelEntry(undefined, "q5");
    expect(entry).toBeUndefined();
  });

  it("TC-15: object entry without freeText should have undefined freeText", () => {
    const customMap = {
      q5: { testkey: { label: "テストラベル" } },
    };
    const entry = resolveLabelEntry("testkey", "q5", customMap);
    expect(entry).toEqual({ label: "テストラベル" });
  });
});

describe("resolveSemanticLabel - backward compatibility", () => {
  it("TC-18: resolveSemanticLabel remains string-returning wrapper", () => {
    expect(resolveSemanticLabel("notion", "q5")).toBe("その他");
    expect(resolveSemanticLabel("slack", "q5")).toBe("Slack");
  });
});
```

> TC-16・TC-17（`createQuestionAnswer` の動作確認）は
> `ConversationRoundStep.tsx` のテストファイル（`apps/desktop` 側）に追加する。
> テストパスは Phase 4 成果物を参照すること。

### 4. 全テスト実行確認

```bash
# shared パッケージ全テスト実行（Phase 4 + Phase 6 追加分）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts

# desktop パッケージ targeted test 実行
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 型チェック（追加テストで型エラーがないことを確認）
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携【必須】

| 判定項目                       | 基準   | 結果      |
| ------------------------------ | ------ | --------- |
| TC-13〜TC-18 全 PASS           | PASS   | completed |
| 既存 TC（Phase 4）回帰なし     | 全PASS | completed |
| slack/github 正常動作確認      | PASS   | completed |
| 型チェック（shared + desktop） | PASS   | completed |

## 多角的チェック観点

| 観点     | 確認内容                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| 矛盾     | 追加テストが Phase 5 実装の動作仕様と矛盾していないか                               |
| 漏れ     | freeText が undefined の場合が網羅されているか                                      |
| 整合性   | slack/github（string エントリ）と notion（object エントリ）の両方をカバーしているか |
| 依存関係 | Phase 4 テストとの重複がなく、補完関係になっているか                                |

## 成果物

| 成果物           | パス                                                                                         | 説明                |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------- |
| テストコード拡充 | `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`                         | TC-13〜TC-18 を追加 |
| 回帰テスト拡充   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | TC-16〜TC-17 を追加 |

## 完了条件

- [ ] Phase 4 テストの充足性確認済み
- [ ] TC-13〜TC-18 が追加済み
- [ ] 全テスト（Phase 4 + Phase 6 追加分）が PASS
- [ ] slack/github の回帰テストが PASS
- [ ] freeText エッジケーステストが PASS
- [ ] 型ガードテストが PASS
- [ ] 型チェックが PASS
- [ ] 既存テストへの悪影響なし
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. Phase 4 テスト充足性確認
2. エッジケーステスト設計（TC-10〜TC-15）
3. 回帰テスト設計（TC-16〜TC-17）
4. 型安全性テスト設計（TC-18）
5. テストコード追加
6. 全テスト実行確認

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
