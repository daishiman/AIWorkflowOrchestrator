# Phase 4: テスト作成（TDD レッドフェーズ）

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 4                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 3（設計レビューゲート）                         |
| 後続Phase  | Phase 5                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

TDD のレッドフェーズとして、実装前にテストを作成し全件 FAIL を確認する。
Phase 3 でゲート PASS した設計に基づき、`resolveSemanticLabel()` および
`applySmartDefaults()` の振る舞いを網羅するテストスイートを先行作成する。
実装（Phase 5）より前にテストを確定させることで、設計の誤りを早期検出し、
グリーンフェーズでの実装指針を明確にする。

---

## 実行タスク

### Step 0: 依存関係整合確認

Phase 4 に入る前に、依存関係とビルドが正常であることを確認する。

```bash
# モノレポ全体の依存関係インストール
pnpm install

# shared パッケージのビルド（型定義が未実装のためエラーが出ることを確認）
pnpm --filter @repo/shared build

# 型チェック（現時点での型エラーを把握する）
pnpm --filter @repo/desktop typecheck 2>&1 | head -40
```

**確認事項:**

- `pnpm install` が正常完了すること
- `@repo/shared` のビルド状態を把握すること（Phase 5 で修正対象になる）
- 現時点での型エラー一覧を `outputs/phase-4/pre-test-typecheck.log` に保存すること

---

### Task 1: テスト環境確認（既存ユーティリティ重複検出）

テスト作成前に既存の実装・テスト状況を正確に把握し、重複テスト定義を防止する。

```bash
# 対象関数の実装箇所を特定
grep -rn "resolveSemanticLabel\|applySmartDefaults" apps/desktop/src/

# 既存テストファイルの確認
grep -rn "resolveSemanticLabel\|applySmartDefaults" apps/desktop/src/__tests__/ 2>/dev/null
grep -rn "resolveSemanticLabel\|applySmartDefaults" apps/desktop/src/renderer/components/skill/wizard/__tests__/ 2>/dev/null

# テスト対象コンポーネントの確認
cat apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx | grep -A 30 "function resolveSemanticLabel"
cat apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx | grep -A 30 "function applySmartDefaults"
```

**確認事項:**

| 確認項目                                     | 期待結果                                       |
| -------------------------------------------- | ---------------------------------------------- |
| `resolveSemanticLabel` の実装箇所            | `ConversationRoundStep.tsx` に1箇所のみ存在    |
| `applySmartDefaults` の実装箇所              | `ConversationRoundStep.tsx` に1箇所のみ存在    |
| 既存テストファイルの有無                     | Phase 4 作成分以外に重複テストが存在しないこと |
| `@repo/shared` に `QuestionSemanticLabelMap` | まだ存在しない（未実装）ことを確認             |

---

### Task 2: テストマトリクス作成

以下のテストケースを `outputs/phase-4/test-specification.md` に記録する。

| TC番号 | テスト名                                                    | 対象関数             | 入力                                                                  | 期待値                              |
| ------ | ----------------------------------------------------------- | -------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| TC-01  | q5 "自分だけ" → "自分のみ" の変換                           | resolveSemanticLabel | value: `"自分だけ"`, questionId: `"q5"`                               | `"自分のみ"`                        |
| TC-02  | q6 "毎日" → "毎日" の変換（同一値）                         | resolveSemanticLabel | value: `"毎日"`, questionId: `"q6"`                                   | `"毎日"`                            |
| TC-03  | q6 "週次" → "週に1回" の変換                                | resolveSemanticLabel | value: `"週次"`, questionId: `"q6"`                                   | `"週に1回"`                         |
| TC-04  | undefined 入力 → undefined 返却                             | resolveSemanticLabel | value: `undefined`, questionId: `"q5"`                                | `undefined`                         |
| TC-05  | 未定義 questionId → フォールバック（値をそのまま返す）      | resolveSemanticLabel | value: `"任意の値"`, questionId: `"q99"` (未定義)                     | `"任意の値"`                        |
| TC-06  | マッピング未定義 rawValue → フォールバック（値そのまま）    | resolveSemanticLabel | value: `"存在しない値"`, questionId: `"q5"`                           | `"存在しない値"`                    |
| TC-07  | カスタム labelMap を DI した場合の変換確認                  | resolveSemanticLabel | value: `"foo"`, questionId: `"qX"`, labelMap: `{qX: {foo: "bar"}}`    | `"bar"`                             |
| TC-08  | q1〜q6 全 questionId での applySmartDefaults 正常変換       | applySmartDefaults   | inferSmartDefaults の全フィールドを含む SmartDefaults モック          | 各フィールドが正規化された値        |
| TC-09  | inferSmartDefaults から全フィールド applySmartDefaults      | applySmartDefaults   | `inferSmartDefaults()` の実際の返り値形式に準じた入力                 | answers 配列が期待値と一致          |
| TC-10  | 回帰テスト（既存変換が壊れていないことの確認）              | applySmartDefaults   | Phase 3 以前の変換テーブルと同等のマッピング入力                      | Phase 3 以前と同一の出力            |
| TC-11  | 空文字列入力のハンドリング                                  | resolveSemanticLabel | value: `""`, questionId: `"q5"`                                       | `""` または `undefined`（仕様確認） |
| TC-12  | SEMANTIC_LABEL_MAP が @repo/shared からインポートできること | import確認           | `import { SEMANTIC_LABEL_MAP } from "@repo/shared/types/skillWizard"` | コンパイルエラーなし                |

> **注意:** TC-11 の期待値は Phase 1 Task 1 で確認した仕様に合わせること。
> 空文字列を `undefined` として扱うか、そのまま返すかをコメントで明記する。

---

### Task 3: テストファイル作成指示

#### 配置先

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

#### import 方針

テストファイルの先頭に以下の import を含める。
Phase 5 実装完了後に解決される import エラーが発生することを確認し、
`outputs/phase-4/red-test-result.md` に記録する。

```typescript
// Phase 5 実装後に解決される（現時点では import error が発生する）
import {
  QuestionSemanticLabelMap,
  SEMANTIC_LABEL_MAP,
} from "@repo/shared/types/skillWizard";

// テスト対象（現在の実装から import）
// NOTE: resolveSemanticLabel は private 扱いのため applySmartDefaults 経由でテスト
import { applySmartDefaults } from "../ConversationRoundStep";
```

#### private method テスト方針

**採用方針: public API 経由（`applySmartDefaults()` 経由で `resolveSemanticLabel()` を間接検証）**

- `resolveSemanticLabel()` はモジュール内部の実装詳細として扱う
- テスト内でのキャスト経由（`(module as any).resolveSemanticLabel`）は使用しない
- `applySmartDefaults()` に渡す SmartDefaults を制御することで変換ロジックを検証する
- TC-07（カスタム labelMap DI）のみ、将来の公開シグネチャ確定後に直接テスト可能とする

#### テストファイルの骨格（作成指示）

```typescript
import { describe, it, expect } from "vitest";
// 上記 import 方針に従って import を記載

describe("applySmartDefaults / resolveSemanticLabel（public API 経由）", () => {
  describe("TC-01〜TC-06: 正規化ロジックの検証", () => {
    it("TC-01: q5 '自分だけ' が '自分のみ' に変換される", () => {
      // applySmartDefaults に q5 = "自分だけ" を渡した際の answers を検証
    });

    it("TC-02: q6 '毎日' は変換なし（同一値）で返る", () => {});
    it("TC-03: q6 '週次' が '週に1回' に変換される", () => {});
    it("TC-04: undefined 入力は undefined を返す", () => {});
    it("TC-05: 未定義 questionId はフォールバックして値をそのまま返す", () => {});
    it("TC-06: マッピング未定義の rawValue はそのまま返す", () => {});
  });

  describe("TC-07: DI（依存性注入）の検証", () => {
    it("TC-07: カスタム labelMap を渡した場合に正しく変換される", () => {
      // resolveSemanticLabel の新シグネチャに labelMap を渡して検証
    });
  });

  describe("TC-08〜TC-09: applySmartDefaults の全フィールド検証", () => {
    it("TC-08: q1〜q6 全 questionId が正常に変換される", () => {});
    it("TC-09: inferSmartDefaults 返り値形式での全フィールド変換", () => {});
  });

  describe("TC-10: 回帰テスト", () => {
    it("TC-10: 既存変換テーブルと同等の出力が得られる", () => {});
  });

  describe("TC-11: エッジケース", () => {
    it("TC-11: 空文字列入力のハンドリング", () => {});
  });

  describe("TC-12: @repo/shared からの import 確認", () => {
    it("TC-12: SEMANTIC_LABEL_MAP が正しく import できる", () => {
      // import が成功していれば型チェックで保証される
      expect(SEMANTIC_LABEL_MAP).toBeDefined();
    });
  });
});
```

---

### Task 4: Red 確認

テストファイル作成後に全件 FAIL（RED）であることを確認する。

```bash
# テスト実行（全件 FAIL を確認）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx 2>&1 | tee outputs/phase-4/red-test-result.log

# 失敗数の確認（12件以上が FAIL であること）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx 2>&1 | grep -E "Tests|FAIL|PASS|×|✓"
```

**Red 確認基準:**

| 確認項目                                             | 期待結果                            |
| ---------------------------------------------------- | ----------------------------------- |
| `@repo/shared/types/skillWizard` の import エラー    | import error または型エラーが発生   |
| TC-01〜TC-12 の全件                                  | 全件 FAIL（少なくとも12件）         |
| PASS しているテストが0件                             | 0件 PASS であることを確認           |
| エラーメッセージが実装未完了に起因するものであること | "Cannot find module" または型エラー |

> **[RED 確認の重要性]** 全件 FAIL を確認せずに Phase 5 に進むと、テストが常に PASS する誤検知テストが混入するリスクがある。
> Red 確認結果を `outputs/phase-4/red-test-result.md` に必ず記録すること。

---

## 参照資料

| 資料名                    | パス                                                                          | 用途                     |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Phase 1 インベントリ      | `outputs/phase-1/requirements-definition.md`                                  | 変換テーブル一覧の確認   |
| Phase 2 型設計書          | `outputs/phase-2/type-design.md`                                              | 型定義・シグネチャの確認 |
| Phase 2 テスト戦略        | `outputs/phase-2/test-strategy.md`                                            | テスト方針の確認         |
| Phase 3 ゲート判定        | `outputs/phase-3/gate-decision.md`                                            | 設計 PASS の確認         |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 実装の確認               |

---

## 統合テスト連携

- Phase 4 で作成したテストスイートは Phase 5 のグリーンフェーズで全件 PASS させる
- Phase 6（テスト拡充）で異常系・境界値テストを追加し、本 Phase のテストを基盤として活用する
- MINOR 指摘（テスト粒度・命名）は `outputs/phase-4/minor-issues.md` に記録し Phase 12 未タスク検出に引き継ぐ
- `ConversationRoundStep.test.tsx` は Phase 9 品質保証フェーズでのカバレッジ計測対象に含める

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| 論点思考     | テストが「何が壊れたか」ではなく「何を保証したいか」に基づいて設計されているか                  |
| システム思考 | TC-12（import確認）が他の TC の前提条件になっており、TC-12 失敗時の連鎖影響が考慮されているか   |
| 価値提案思考 | 12件のテストが AC-1〜AC-5 の受け入れ基準を網羅しているか（トレーサビリティ確認）                |
| 整合性確認   | private method テスト方針（public API 経由）が全 TC で一貫して適用されているか                  |
| リスク思考   | カスタム labelMap（TC-07）の DI テストが Phase 5 の実装シグネチャと齟齬を起こさないか           |
| 網羅性確認   | 正常系（TC-01〜03）・undefined（TC-04）・フォールバック（TC-05、06）・DI（TC-07）が揃っているか |

---

## 成果物

| 成果物名                | パス                                                                                         | 必須 |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---- |
| テスト仕様書            | `outputs/phase-4/test-specification.md`                                                      | ✅   |
| Red 確認結果            | `outputs/phase-4/red-test-result.md`                                                         | ✅   |
| 統合テスト計画書        | `outputs/phase-4/integration-test-plan.md`                                                   | ✅   |
| テストファイル本体      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | ✅   |
| pre-test 型チェックログ | `outputs/phase-4/pre-test-typecheck.log`                                                     | ✅   |

---

## 完了条件

- [ ] Step 0: `pnpm install` と `pnpm --filter @repo/shared build` が正常完了している
- [ ] Task 1: 既存実装の場所が特定されており、重複テストがないことが確認されている
- [ ] Task 2: テストマトリクス（TC-01〜TC-12 の12件以上）が `test-specification.md` に記録されている
- [ ] Task 3: テストファイル `ConversationRoundStep.test.tsx` が作成されている
- [ ] Task 3: import 方針（`@repo/shared/types/skillWizard`）が適用されている
- [ ] Task 3: private method テスト方針（public API 経由）が全 TC で適用されている
- [ ] Task 4: 全件 FAIL（RED）が確認されており、`red-test-result.md` に記録されている
- [ ] `outputs/phase-4/` 以下に全必須成果物が保存されている

## タスク100%実行確認【必須】

- [ ] Step 0: 依存関係整合確認 ✅
- [ ] Task 1: テスト環境確認（既存ユーティリティ重複検出）✅
- [ ] Task 2: テストマトリクス作成（12件以上） ✅
- [ ] Task 3: テストファイル作成（ConversationRoundStep.test.tsx） ✅
- [ ] Task 4: Red 確認（全件 FAIL を確認）✅
- [ ] 全成果物が `outputs/phase-4/` に保存されていること ✅

---

## 次Phase

**Phase 5: 実装（TDD グリーンフェーズ）**（`phase-5-implementation.md`）へ進む。

Phase 4 の Red 確認結果（`outputs/phase-4/red-test-result.md`）を Phase 5 の冒頭で参照し、
FAIL しているテストを全件 PASS にすることを目標として実装を進める。
