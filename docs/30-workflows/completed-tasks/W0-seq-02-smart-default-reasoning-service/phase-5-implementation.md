# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装を行う。

## 実行タスク

1. サービス本体を `packages/shared/src/services/skillCreator/` に実装する。
2. barrel export を追加して外部利用を可能にする。
3. 最小実装で全テストを Green にする。

## 統合テスト連携

- Phase 6 / 7 へ引き継ぐため、推論ルールとフォールバックの境界を崩さない。
- Phase 9 の lint / typecheck に通る形で実装する。

## 実装手順

### Step 1: ディレクトリ確認・作成

```bash
# ディレクトリを冪等に作成
mkdir -p packages/shared/src/services/skillCreator/__tests__
```

### Step 2: 推論サービス本体の実装

ファイル: `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`

```typescript
import type {
  SkillInfoFormData,
  SmartDefaultResult,
} from "../../types/skillCreator";

/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルト推論結果を生成する
 *
 * 推論できなかったフィールドは null を返す（フォールバック）。
 * 推論件数が0件でも inferenceLog は空配列 [] として返す。
 *
 * @param input スキル情報入力フォームの値
 * @returns SmartDefaultResult 推論結果
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult {
  const result: Omit<SmartDefaultResult, "inferenceLog"> = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  const inferenceLog: string[] = [];
  const purpose = input?.purpose ?? "";

  // ツール推論（先勝ちルール）
  if (purpose.includes("Slack")) {
    result.tool = "slack";
    inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'");
  } else if (purpose.includes("GitHub")) {
    result.tool = "github";
    inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'");
  } else if (purpose.includes("Notion")) {
    result.tool = "notion";
    inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'");
  }

  // タイミング推論（先勝ちルール）
  if (/毎日|毎週|定期|スケジュール/.test(purpose)) {
    result.timing = "scheduled";
    inferenceLog.push("定期実行キーワードを検出 → timing = 'scheduled'");
  } else if (/リアルタイム|即座|すぐに/.test(purpose)) {
    result.timing = "realtime";
    inferenceLog.push("リアルタイムキーワードを検出 → timing = 'realtime'");
  }

  // フォーマット推論
  if (input?.category === "code-support") {
    result.format = "code";
    inferenceLog.push("category = 'code-support' → format = 'code'");
  } else if (input?.category === "data-analysis") {
    result.format = "structured";
    inferenceLog.push("category = 'data-analysis' → format = 'structured'");
  }

  return { ...result, inferenceLog };
}
```

### Step 3: barrel へのエクスポート追加

ファイル: `packages/shared/src/services/skillCreator/index.ts`（既存 or 新規）

```typescript
export { inferSmartDefaults } from "./smartDefaultReasoningService";
```

### Step 4: shared パッケージ root barrel への追加

ファイル: `packages/shared/index.ts`

`inferSmartDefaults` を `@repo/shared` から解決できるよう、root barrel に
`export { inferSmartDefaults } from "./src/services/skillCreator";` を追加する。
これにより W2-seq-03a と最終レビューで想定する import 経路を一致させる。

### Step 5: テスト実行で Green を確認

```bash
pnpm --filter @repo/shared test -- smartDefaultReasoningService
```

## 参照資料

| 資料名         | パス                                     | 用途           |
| -------------- | ---------------------------------------- | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`  | Phase 4 成果物 |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`     | Phase 4 成果物 |
| API シグネチャ | `outputs/phase-2/api-design.md`          | Phase 2 成果物 |
| 推論フロー     | `outputs/phase-2/inference-flowchart.md` | Phase 2 成果物 |

## 実行手順

1. Phase 4 成果物を確認する。
2. `smartDefaultReasoningService.ts` を新規作成する。
3. barrel（`index.ts`）にエクスポートを追加する。
4. `pnpm --filter @repo/shared test` を実行し、全 Red テストが Green になることを確認する。
5. 変更ファイル一覧と契約差分を記録する。

## 成果物

| 成果物           | パス                                        | 説明             |
| ---------------- | ------------------------------------------- | ---------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | API 差分記録     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `smartDefaultReasoningService.ts` が新規作成されていること
- [ ] `inferSmartDefaults` 関数が実装されていること
- [ ] barrel（`index.ts`）にエクスポートが追加されていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. ディレクトリ確認・作成（Step 1）
3. 推論サービス本体の実装（Step 2）
4. barrel へのエクスポート追加（Step 3〜4）
5. テスト Green 確認
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
