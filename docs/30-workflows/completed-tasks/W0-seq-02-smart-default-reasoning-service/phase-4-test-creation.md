# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

実装前に Red（失敗）状態のテストを定義し、TDD サイクルの起点を固める。

## 実行タスク

1. ツール推論の Red テストを定義する。
2. タイミング推論の Red テストを定義する。
3. フォーマット推論と inferenceLog の Red テストを定義する。

## 統合テスト連携

- Phase 5 はここで定義した Red テストを Green にする最小実装に限定する。
- Phase 6 で edge case / regression を追加できるよう、ケース名を安定化する。

## テスト対象

| テスト対象                            | テスト種別     | 目的                                    |
| ------------------------------------- | -------------- | --------------------------------------- |
| `inferSmartDefaults` ツール推論       | ユニットテスト | slack/github/notion の推論正確性検証    |
| `inferSmartDefaults` タイミング推論   | ユニットテスト | scheduled/realtime の推論正確性検証     |
| `inferSmartDefaults` フォーマット推論 | ユニットテスト | code/structured の推論正確性検証        |
| `inferSmartDefaults` フォールバック   | ユニットテスト | null フィールド・空 inferenceLog の確認 |
| `inferSmartDefaults` inferenceLog     | ユニットテスト | 推論根拠の記録が正しいことの確認        |

## テストケース定義

> 補足: `purpose` が空でも `category` は独立して評価されるため、format 推論のテストは `purpose: ""` のまま実施する。

```typescript
import { inferSmartDefaults } from "../smartDefaultReasoningService";
import type { SkillInfoFormData } from "../../../types/skillCreator";

const base: SkillInfoFormData = {
  skillName: "テストスキル",
  purpose: "",
  category: null,
};

describe("inferSmartDefaults", () => {
  // --- ツール推論 ---
  describe("ツール推論", () => {
    it("purpose に 'Slack' を含む場合、tool = 'slack' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Slack通知を送る",
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose に 'GitHub' を含む場合、tool = 'github' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "GitHubのPRをレビューする",
      });
      expect(result.tool).toBe("github");
    });

    it("purpose に 'Notion' を含む場合、tool = 'notion' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Notionにページを作成する",
      });
      expect(result.tool).toBe("notion");
    });

    it("ツール名が含まれない場合、tool = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "汎用的なタスクを実行する",
      });
      expect(result.tool).toBeNull();
    });
  });

  // --- タイミング推論 ---
  describe("タイミング推論", () => {
    it("purpose に '毎日' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日レポートを生成する",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に '定期' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "定期的に実行する",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に 'リアルタイム' を含む場合、timing = 'realtime' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "リアルタイムで通知する",
      });
      expect(result.timing).toBe("realtime");
    });

    it("タイミングキーワードが含まれない場合、timing = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "コードを解析する",
      });
      expect(result.timing).toBeNull();
    });
  });

  // --- フォーマット推論 ---
  describe("フォーマット推論", () => {
    it("category = 'code-support' の場合、format = 'code' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "code-support",
      });
      expect(result.format).toBe("code");
    });

    it("category = 'data-analysis' の場合、format = 'structured' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "data-analysis",
      });
      expect(result.format).toBe("structured");
    });

    it("category が null の場合、format = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({ ...base, category: null });
      expect(result.format).toBeNull();
    });
  });

  // --- inferenceLog ---
  describe("inferenceLog", () => {
    it("推論が1件の場合、inferenceLog に1件の記録が含まれること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Slack通知を送る",
      });
      expect(result.inferenceLog).toHaveLength(1);
      expect(result.inferenceLog[0]).toContain("slack");
    });

    it("推論が0件の場合、inferenceLog は空配列 [] を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({ ...base, purpose: "" });
      expect(result.inferenceLog).toEqual([]);
    });
  });

  // --- フォールバック（AC-4） ---
  describe("フォールバック（AC-4）", () => {
    it("purpose が空文字の場合、tool/timing は null を返すこと（category 推論は継続する）", () => {
      const result = inferSmartDefaults({ ...base, purpose: "" });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBeNull();
    });

    it("purpose が undefined の場合、tool/timing は null を返すこと（category 推論は継続する）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: undefined as unknown as string,
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBeNull();
    });
  });
});
```

## 参照資料

| 資料名             | パス                                      | 用途           |
| ------------------ | ----------------------------------------- | -------------- |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`  | Phase 1 成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`        | Phase 3 成果物 |
| API シグネチャ設計 | `outputs/phase-2/api-design.md`           | Phase 2 成果物 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md`  | Phase 2 成果物 |

## 実行手順

1. Phase 3 成果物を確認し、ゲート判定が PASS であることを確認する。
2. テストファイルを `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` に作成する。
3. 全テストケースが Red（失敗）状態であることを確認する。
4. テスト仕様書として成果物を出力する。

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧     |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 実装前の失敗確認記録 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テストシナリオ   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ツール推論（slack/github/notion）の全テストが定義されていること
- [ ] タイミング推論（scheduled/realtime）の全テストが定義されていること
- [ ] フォーマット推論（code/structured）の全テストが定義されていること
- [ ] フォールバックテスト（AC-4）が定義されていること
- [ ] inferenceLog のテストが定義されていること
- [ ] 全テストが Red（失敗）状態であることが確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. テストケース設計
3. テストファイル作成（Red段階）
4. Red状態確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
