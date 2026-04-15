# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 3（PASS または MINOR）                      |
| 後続Phase  | Phase 5                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

TDD の Red 段階として、`resolveLabelEntry()` の追加挙動と
`resolveSemanticLabel()` の既存契約維持を先にテスト化する。
実装前にテストが失敗することを確認し、期待値を明確化する。

## 実行タスク

- 事前確認: 既存ユーティリティ重複検出・テスト対象ファイルの現状確認
- private method テスト方針の明記
- テストマトリクス定義: TC-01〜TC-12 のテストケース定義
- テストファイルの作成: `skill-wizard-label-map.test.ts`（新規）
- 既存テストとの共存確認: `ConversationRoundStep.test.tsx` への影響確認
- Red 確認: 実装前にテストが FAIL することを確認

## 参照資料

| 資料名                    | パス                                                                                         | 用途                     |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計書            | `outputs/phase-2/design.md`                                                                  | インターフェース参照     |
| Phase 3 レビュー結果      | `outputs/phase-3/gate-decision.md`                                                           | MINOR 指摘確認           |
| skill-wizard-label-map.ts | `packages/shared/src/types/skill-wizard-label-map.ts`                                        | 現行実装確認             |
| 既存テスト                | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 既存回帰テスト確認       |
| aiworkflow-requirements   | `.claude/skills/aiworkflow-requirements/references/`                                         | プロジェクト共通仕様参照 |

- 依存Phase参照: Phase 1 の要件定義書と受け入れ基準（`outputs/phase-1/requirements-definition.md` / `outputs/phase-1/acceptance-criteria.md`）を前提にする

## 実行手順

### 0. 事前確認: 既存ユーティリティ重複検出【必須】

```bash
# SemanticLabelResult / SemanticLabelEntry の重複実装確認
grep -rn "SemanticLabelResult\|SemanticLabelEntry" packages/ apps/

# skill-wizard-label-map.test.ts の存在確認
ls packages/shared/src/types/__tests__/ | grep label-map

# 既存テストでの resolveSemanticLabel / applySmartDefaults 使用箇所確認
grep -rn "resolveSemanticLabel\|applySmartDefaults" apps/desktop/src/renderer/components/skill/wizard/__tests__/

# 現行の resolveSemanticLabel 戻り値型の確認（変更前は string | undefined）
grep -n -A 5 "resolveSemanticLabel" packages/shared/src/types/skill-wizard-label-map.ts
```

### 1. private method テスト方針の明記【必須】

本タスクの対象（`resolveSemanticLabel()` 関数・`SEMANTIC_LABEL_MAP` 定数・型定義）は全て
public export であるため、private method テストは対象外。
**public API 直接呼び出し**によるテストを採用する。

### 2. テストマトリクス定義

**テストファイルパス**: `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`（新規作成）

| TC番号 | テスト名（describe / it）                                                            | 対象                                          | 期待値                                    |
| ------ | ------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------- |
| TC-01  | `resolveLabelEntry / notion を "その他" ラベルと "Notion" freeText に変換する`       | `resolveLabelEntry("notion", "q5")`           | `{ label: "その他", freeText: "Notion" }` |
| TC-02  | `resolveLabelEntry / slack を "Slack" ラベルに変換する（freeText なし）`             | `resolveLabelEntry("slack", "q5")`            | `{ label: "Slack" }`                      |
| TC-03  | `resolveLabelEntry / github を "GitHub" ラベルに変換する（freeText なし）`           | `resolveLabelEntry("github", "q5")`           | `{ label: "GitHub" }`                     |
| TC-04  | `resolveLabelEntry / 未登録の値はラベルとしてそのまま返す`                           | `resolveLabelEntry("zapier", "q5")`           | `{ label: "zapier" }`                     |
| TC-05  | `resolveLabelEntry / undefined を渡した場合は undefined を返す`                      | `resolveLabelEntry(undefined, "q5")`          | `undefined`                               |
| TC-06  | `resolveLabelEntry / 未登録の questionId の場合はラベルとしてそのまま返す`           | `resolveLabelEntry("some-value", "q99")`      | `{ label: "some-value" }`                 |
| TC-07  | `resolveSemanticLabel / q1 の "自分だけ" を "自分のみ" ラベルに変換する`             | `resolveSemanticLabel("自分だけ", "q1")`      | `"自分のみ"`                              |
| TC-08  | `resolveSemanticLabel / q3 の "scheduled" を "定期実行" ラベルに変換する`            | `resolveSemanticLabel("scheduled", "q3")`     | `"定期実行"`                              |
| TC-09  | `resolveSemanticLabel / q6 の "週次" を "週に1回" ラベルに変換する`                  | `resolveSemanticLabel("週次", "q6")`          | `"週に1回"`                               |
| TC-10  | `SEMANTIC_LABEL_MAP / q5.notion が { label, freeText } オブジェクト型エントリを持つ` | `SEMANTIC_LABEL_MAP.q5.notion`                | `{ label: "その他", freeText: "Notion" }` |
| TC-11  | `SEMANTIC_LABEL_MAP / q5.slack が string エントリを持つ`                             | `SEMANTIC_LABEL_MAP.q5.slack`                 | `"Slack"`                                 |
| TC-12  | `resolveLabelEntry / カスタム labelMap を受け取り変換する`                           | カスタムマップで `resolveLabelEntry` 呼び出し | カスタムマップの変換結果                  |

> **文字列長確認（誤字防止）**:
>
> - `"その他".length === 3`
> - `"Notion".length === 6`
> - `"Slack".length === 5`
> - `"GitHub".length === 6`
> - `"自分のみ".length === 4`
> - `"定期実行".length === 4`
> - `"週に1回".length === 5`

### 3. テストコードスケルトン

作成先: `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`（新規ファイル）

```typescript
import { describe, expect, it } from "vitest";
import {
  SEMANTIC_LABEL_MAP,
  resolveLabelEntry,
  resolveSemanticLabel,
} from "../skill-wizard-label-map";

describe("resolveLabelEntry", () => {
  describe("q5（外部ツール連携）の変換", () => {
    it("notion を 'その他' ラベルと 'Notion' freeText に変換する", () => {
      // AC-1: notion 変換が SEMANTIC_LABEL_MAP 経由で動作すること
      expect(resolveLabelEntry("notion", "q5")).toEqual({
        label: "その他",
        freeText: "Notion",
      });
    });

    it("slack を 'Slack' ラベルに変換する（freeText なし）", () => {
      expect(resolveLabelEntry("slack", "q5")).toEqual({
        label: "Slack",
      });
    });

    it("github を 'GitHub' ラベルに変換する（freeText なし）", () => {
      expect(resolveLabelEntry("github", "q5")).toEqual({
        label: "GitHub",
      });
    });

    it("未登録の値はラベルとしてそのまま返す", () => {
      expect(resolveLabelEntry("zapier", "q5")).toEqual({
        label: "zapier",
      });
    });
  });

  describe("undefined / 未登録ケース", () => {
    it("undefined を渡した場合は undefined を返す", () => {
      expect(resolveLabelEntry(undefined, "q5")).toBeUndefined();
    });

    it("未登録の questionId の場合はラベルとしてそのまま返す", () => {
      expect(resolveLabelEntry("some-value", "q99")).toEqual({
        label: "some-value",
      });
    });
  });

  describe("カスタム labelMap", () => {
    it("カスタム labelMap を受け取り変換する", () => {
      const customMap = {
        q99: { "test-value": { label: "テスト", freeText: "TestFree" } },
      };
      expect(resolveLabelEntry("test-value", "q99", customMap)).toEqual({
        label: "テスト",
        freeText: "TestFree",
      });
    });
  });
});

describe("resolveSemanticLabel", () => {
  describe("既存変換の後方互換性", () => {
    it("q1 の '自分だけ' を '自分のみ' ラベルに変換する", () => {
      expect(resolveSemanticLabel("自分だけ", "q1")).toBe("自分のみ");
    });

    it("q3 の 'scheduled' を '定期実行' ラベルに変換する", () => {
      expect(resolveSemanticLabel("scheduled", "q3")).toBe("定期実行");
    });

    it("q6 の '週次' を '週に1回' ラベルに変換する", () => {
      expect(resolveSemanticLabel("週次", "q6")).toBe("週に1回");
    });

    it("notion を 'その他' ラベルに変換する", () => {
      expect(resolveSemanticLabel("notion", "q5")).toBe("その他");
    });
  });
});

describe("SEMANTIC_LABEL_MAP", () => {
  it("q5.notion が { label, freeText } オブジェクト型エントリを持つ", () => {
    expect(SEMANTIC_LABEL_MAP.q5.notion).toEqual({
      label: "その他",
      freeText: "Notion",
    });
  });

  it("q5.slack が string エントリを持つ", () => {
    expect(SEMANTIC_LABEL_MAP.q5.slack).toBe("Slack");
  });
});
```

### 4. 既存テストとの共存確認

```bash
# 既存の ConversationRoundStep.test.tsx に resolveSemanticLabel / applySmartDefaults のテストがあるか確認
grep -n "resolveSemanticLabel\|applySmartDefaults" apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 既存テストが全て PASS することを確認（変更前の状態で）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

既存テストに `resolveSemanticLabel` のテストが含まれている場合:

- `resolveSemanticLabel()` は string 契約を維持するため、既存期待値の修正は不要
- 追加で `resolveLabelEntry()` の期待値を shared の新規テストへ追加する

### 5. Red 確認コマンド（実装前にテストが失敗することを確認）

```bash
# 新規テストファイルを実行（実装前なので FAIL が期待される）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts
# 期待: FAIL（resolveLabelEntry / q5.notion オブジェクト返却が未実装）
```

**Red 確認のポイント**:

- `resolveLabelEntry("notion", "q5")` が現状 `"その他"` (string) もしくは未実装のため、
  `{ label: "その他", freeText: "Notion" }` を期待する TC-01 が FAIL する
- `resolveLabelEntry("slack", "q5")` が現状 `"Slack"` (string) もしくは未実装のため、
  `{ label: "Slack" }` を期待する TC-02 が FAIL する

## 統合テスト連携【必須】

| 判定項目       | 基準                              | 結果      |
| -------------- | --------------------------------- | --------- |
| Red 確認       | テストが FAIL すること（TDD Red） | completed |
| 既存テスト影響 | 既存テストへの悪影響がないこと    | completed |

## 多角的チェック観点

| 観点           | チェック内容                                                                          |
| -------------- | ------------------------------------------------------------------------------------- |
| テスト網羅性   | notion・slack・github・未登録値・undefined の各ケースをカバーしているか               |
| 後方互換テスト | q1・q3・q6 の既存変換が引き続き正しく動作することをテストしているか                   |
| エラーケース   | undefined・未登録 questionId・未登録値のフォールバックをテストしているか              |
| テストの独立性 | 各テストケースが独立して実行可能か（共有状態に依存していないか）                      |
| 期待値の明確さ | `resolveLabelEntry` は `toEqual`、`resolveSemanticLabel` は `toBe` を使い分けているか |

## 成果物

| 成果物         | パス                                                                 | 説明                        |
| -------------- | -------------------------------------------------------------------- | --------------------------- |
| テストファイル | `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts` | TC-01〜TC-12 のテストケース |

## 完了条件

- [ ] 既存ユーティリティ重複検出（`SemanticLabelResult` 等の重複実装なし確認）
- [ ] private method テスト方針（public API 直接テスト）を明記済み
- [ ] テストマトリクス（TC-01〜TC-12）が定義済み
- [ ] 日本語文字列の実文字数確認済み（誤字防止）
- [ ] テストファイル `skill-wizard-label-map.test.ts` が新規作成されている
- [ ] TC-01 の `notion` → `{ label: "その他", freeText: "Notion" }` テストが含まれている
- [ ] 既存変換（q1・q3・q6）の後方互換テストが含まれている
- [ ] Red 確認（実装前にテストが FAIL すること）が確認済み
- [ ] 既存テスト（`ConversationRoundStep.test.tsx`）への悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（重複・既存テスト構造確認）
2. private method テスト方針の明記
3. テストマトリクス定義（TC-01〜TC-12）
4. 文字列長確認（誤字防止）
5. テストファイル作成（`skill-wizard-label-map.test.ts`）
6. 既存テストとの共存確認
7. Red 確認
8. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 5: 実装
