# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001         |
| 機能名     | cronExpression 意味論的バリデーション改善 |
| 前提Phase  | Phase 3                                   |
| 後続Phase  | Phase 5                                   |
| ステータス | completed                                 |
| 作成日     | 2026-04-12                                |

---

## 目的

TDD（テスト駆動開発）の原則に従い、実装前にテストを作成する。Phase 2 の設計で定義した受け入れ基準（AC-1〜AC-5）に対応するテストケースを記述し、2月31日・2月30日の失敗ケースを Red、2月29日と既存の正常系を Green で確認する。

---

## 実行タスク

1. **テストファイルの拡張**: `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts` を拡張する
2. **テストケーステーブルの実装**: TC-SV-01〜TC-SV-07 を実装する
3. **private method テスト方針の適用**: public API（`validateCronExpression`）経由でテストする
4. **TDD Red 確認**: 実装前にテストが失敗（Red）することを確認する
5. **統合テスト計画の作成**: ScheduleDialog / ConversationRoundStep との回帰確認を定義する

---

## 参照資料

| 参照資料                 | パス                                                         | 説明                |
| ------------------------ | ------------------------------------------------------------ | ------------------- |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                     | AC-1〜AC-5          |
| バリデーションフロー設計 | `outputs/phase-2/validation-flow-design.md`                  | 3段階バリデーション |
| 型定義設計               | `outputs/phase-2/type-definition-design.md`                  | 型定義              |
| ゲート判定               | `outputs/phase-3/gate-decision.md`                           | Phase 3 通過確認    |
| 現行バリデーション       | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` | テスト対象          |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物      |
| P50チェック結果          | `outputs/phase-1/p50-check-result.md`                        | Phase 1 成果物      |
| トレーサビリティ行列     | `outputs/phase-1/traceability-matrix.md`                     | Phase 1 成果物      |
| 実装方式設計             | `outputs/phase-2/library-selection-design.md`                | Phase 2 成果物      |
| UI統合設計               | `outputs/phase-2/ui-integration-design.md`                   | Phase 2 成果物      |
| 設計レビュー結果         | `outputs/phase-3/design-review-result.md`                    | Phase 3 成果物      |
| 矛盾チェック表           | `outputs/phase-3/contradiction-checklist.md`                 | Phase 3 成果物      |

---

## 実行手順

### 1. テストファイルの配置

**テストファイルパス**: `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`

### 2. テストケーステーブル

| TC番号   | cron式        | 期待結果              | 備考                             |
| -------- | ------------- | --------------------- | -------------------------------- |
| TC-SV-01 | `0 9 31 2 *`  | エラー（null でない） | 2月31日は存在しない（AC-1）      |
| TC-SV-02 | `0 9 30 2 *`  | エラー（null でない） | 2月30日は存在しない（AC-2）      |
| TC-SV-03 | `0 9 29 2 *`  | null（正常通過）      | 2月29日は cron 上は有効（AC-3）  |
| TC-SV-04 | `0 9 1 2 *`   | null（正常通過）      | 2月1日は有効（AC-4）             |
| TC-SV-05 | `0 9 * * *`   | null（正常通過）      | 毎日9時は有効（AC-4）            |
| TC-SV-06 | `0 9 * * 1-5` | null（正常通過）      | 平日毎日は有効（AC-4）           |
| TC-SV-07 | `invalid`     | エラー（null でない） | 不正な構文（構文チェックで検出） |

### 3. テストコード仕様

```typescript
// apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts

import { describe, it, expect } from "vitest";
import { validateCronExpression } from "../scheduleConfigValidator";

describe("validateCronExpression - 意味論的バリデーション", () => {
  describe("存在しない日付の検出（AC-1〜AC-2）", () => {
    it("TC-SV-01: 2月31日はエラーを返す", () => {
      const result = validateCronExpression("0 9 31 2 *");
      expect(result).not.toBeNull();
      expect(result).toContain("2月");
    });

    it("TC-SV-02: 2月30日はエラーを返す", () => {
      const result = validateCronExpression("0 9 30 2 *");
      expect(result).not.toBeNull();
    });
  });

  describe("有効なcron式は正常通過（AC-3〜AC-4）", () => {
    it("TC-SV-03: 2月29日は正常通過する", () => {
      expect(validateCronExpression("0 9 29 2 *")).toBeNull();
    });

    it("TC-SV-04: 2月1日は正常通過する", () => {
      expect(validateCronExpression("0 9 1 2 *")).toBeNull();
    });

    it("TC-SV-05: 毎日9時は正常通過する", () => {
      expect(validateCronExpression("0 9 * * *")).toBeNull();
    });

    it("TC-SV-06: 平日毎日は正常通過する", () => {
      expect(validateCronExpression("0 9 * * 1-5")).toBeNull();
    });
  });

  describe("既存の構文チェック（回帰確認）", () => {
    it("TC-SV-07: 不正な構文はエラーを返す", () => {
      expect(validateCronExpression("invalid")).not.toBeNull();
    });

    it("空文字はエラーを返す", () => {
      expect(validateCronExpression("")).not.toBeNull();
    });

    it("フィールド数が5未満はエラーを返す", () => {
      expect(validateCronExpression("0 9 * *")).not.toBeNull();
    });
  });

  describe("エラーメッセージの確認（AC-5）", () => {
    it("存在しない日付のエラーメッセージは日本語を含む", () => {
      const result = validateCronExpression("0 9 31 2 *");
      expect(result).not.toBeNull();
      expect(result).toMatch(/[\u3040-\u9FFF]/);
    });
  });
});

describe("validateSkillWizardScheduleConfig - 意味論的バリデーション統合", () => {
  it("cronExpressionフィールドに意味論エラーが反映される", () => {
    // 既存の validator 経路で検証するための統合テストを Phase 6 で拡充する
  });
});
```

### 4. private method テスト方針

`validateCronSemantics` が private または内部関数として実装される場合でも、以下の方針でテストする:

- **方針**: public API（`validateCronExpression`）経由でのみテストする
- **理由**: 実装の詳細（private method）ではなく、振る舞い（public contract）をテストするべきである
- **例外なし**: `validateCronSemantics` を直接 export してテストすることは避ける

### 5. TDD Red / Green 確認手順

```bash
# テストを実行して Red（失敗）を確認する
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts

# 期待される結果: TC-SV-01〜TC-SV-02 が FAIL、TC-SV-03〜TC-SV-07 が PASS になること
# （意味論チェックが未実装のため、2月29日は既存ロジックで通過する）
```

期待される Red 状態:

- TC-SV-01, TC-SV-02: `expect(result).not.toBeNull()` が失敗する（現行では null が返る）
- TC-SV-03: PASS（2月29日は有効入力）
- TC-SV-04, TC-SV-05, TC-SV-06: PASS（既存チェックで通過）
- TC-SV-07: PASS（既存の構文チェックで検出済み）

---

## 統合テスト連携【必須】

- TC-SV-01〜TC-SV-02 が Red（失敗）であることを確認してから Phase 5 に進む
- TC-SV-03〜TC-SV-07 が Phase 4 時点で Green（通過）であることを確認する（回帰テストの基準線）
- UIコンポーネント（ScheduleDialog / ConversationRoundStep）のエラー表示テストは Phase 6 で拡充する
- 統合ログは `outputs/phase-4/` に保存する

---

## 成果物

| 成果物               | パス                                    | 説明                          |
| -------------------- | --------------------------------------- | ----------------------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | TC-SV-01〜TC-SV-07 の詳細仕様 |
| テストケーステーブル | `outputs/phase-4/test-case-table.md`    | 入力・期待結果・備考の一覧表  |
| Red確認結果          | `outputs/phase-4/red-test-result.md`    | TDD Red 状態のテスト実行結果  |

---

## 完了条件

- [ ] `scheduleConfigValidator.test.ts` を既存実装に合わせて拡張した
- [ ] TC-SV-01〜TC-SV-07 を全て実装した
- [ ] public API 経由テストの方針に従っている
- [ ] TC-SV-01〜TC-SV-02 が Red（失敗）であることを確認した
- [ ] TC-SV-03〜TC-SV-07 が Green（通過）であることを確認した
- [ ] エラーメッセージの日本語確認テスト（AC-5）を実装した
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. Phase 3 成果物（ゲート判定）の確認
2. テストファイルの作成
3. TC-SV-01〜TC-SV-03（意味論エラーケース）の実装
4. TC-SV-04〜TC-SV-06（正常ケース）の実装
5. TC-SV-07（既存構文チェック回帰）の実装
6. エラーメッセージ（日本語）テストの実装
7. TDD Red 確認の実施
8. 成果物の出力

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] TC-SV-01〜TC-SV-02 の Red 確認完了
- [ ] TC-SV-03〜TC-SV-07 の Green 確認完了
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001
```

---

## 次のPhase

Phase 5: 実装
