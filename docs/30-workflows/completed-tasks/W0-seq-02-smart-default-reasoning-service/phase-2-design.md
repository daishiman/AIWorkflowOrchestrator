# Phase 2: 設計

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 1                                        |
| 後続Phase  | Phase 3                                        |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

`smartDefaultReasoningService.ts` の API 設計・推論フローチャート・ファイル構造を確定する。

## 実行タスク

1. `inferSmartDefaults` の API シグネチャを確定する。
2. 推論フローとフォールバック分岐を図示する。
3. `packages/shared` 内の配置と barrel を確定する。

## 統合テスト連携

- Phase 4 の Red テストが各分岐を 1 つずつ検証できるようにする。
- Phase 7 の coverage 対象が設計した分岐と一致するようにする。

## APIシグネチャ設計

```typescript
/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルトを推論する
 * @param input スキル情報入力フォームの値
 * @returns SmartDefaultResult 推論結果（推論不能フィールドは null）
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

## ファイル構造設計

```
packages/shared/src/services/skillCreator/
  smartDefaultReasoningService.ts       # 推論サービス本体
  index.ts                              # barrel（既存 or 新規）
  __tests__/
    smartDefaultReasoningService.test.ts # ユニットテスト
packages/shared/index.ts                 # root barrel（@repo/shared からの公開）
```

## 推論フローチャート

```
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
│
├─ result 初期化: { who: null, input: null, timing: null,
│                   output: null, tool: null, format: null }
├─ inferenceLog: string[] = []
│
├─ [ツール推論] input.purpose（目的テキスト）
│   ├─ "Slack" を含む  → result.tool = "slack"
│   │                     inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'")
│   ├─ "GitHub" を含む → result.tool = "github"
│   │                     inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'")
│   ├─ "Notion" を含む → result.tool = "notion"
│   │                     inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'")
│   └─ その他           → result.tool = null（フォールバック）
│
├─ [タイミング推論] input.purpose（目的テキスト）
│   ├─ /毎日|毎週|定期|スケジュール/.test(purpose)
│   │                     → result.timing = "scheduled"
│   │                     inferenceLog.push("定期実行キーワードを検出 → timing = 'scheduled'")
│   ├─ /リアルタイム|即座|すぐに/.test(purpose)
│   │                     → result.timing = "realtime"
│   │                     inferenceLog.push("リアルタイムキーワードを検出 → timing = 'realtime'")
│   └─ その他              → result.timing = null（フォールバック）
│
├─ [フォーマット推論] input.category（カテゴリ）
│   ├─ "code-support"   → result.format = "code"
│   │                     inferenceLog.push("category = 'code-support' → format = 'code'")
│   ├─ "data-analysis"  → result.format = "structured"
│   │                     inferenceLog.push("category = 'data-analysis' → format = 'structured'")
│   └─ その他              → result.format = null（フォールバック）
│
└─ 返却: { ...result, inferenceLog }
         ※ inferenceLog が空配列 [] でもエラーにしない（フォールバック動作）
         ※ format 推論は purpose と独立して評価する。purpose が空でも category が有効なら継続する
```

## フォールバック設計

| フォールバックケース                         | 挙動                                           |
| -------------------------------------------- | ---------------------------------------------- |
| `input.purpose` が undefined / null          | `tool`・`timing` = null（category 推論は継続） |
| `input.purpose` が空文字 ""                  | `tool`・`timing` = null（category 推論は継続） |
| `input.category` が undefined / null         | `result.format = null`                         |
| `purpose`・`category` のいずれも推論できない | `inferenceLog = []`                            |
| `input.purpose` に複数ツール名が含む         | 先に一致したツールのみ採用（先勝ちルール）     |

## インターフェース整合確認

| 型名                 | 定義場所                                    | 本サービスでの利用方法 |
| -------------------- | ------------------------------------------- | ---------------------- |
| `SkillInfoFormData`  | `packages/shared/src/types/skillCreator.ts` | 関数引数               |
| `SmartDefaultResult` | `packages/shared/src/types/skillCreator.ts` | 関数返り値             |

## 実装コードスケッチ

```typescript
import type {
  SkillInfoFormData,
  SmartDefaultResult,
} from "../../types/skillCreator";

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
  const purpose = input.purpose ?? "";

  // ツール推論
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

  // タイミング推論
  if (/毎日|毎週|定期|スケジュール/.test(purpose)) {
    result.timing = "scheduled";
    inferenceLog.push("定期実行キーワードを検出 → timing = 'scheduled'");
  } else if (/リアルタイム|即座|すぐに/.test(purpose)) {
    result.timing = "realtime";
    inferenceLog.push("リアルタイムキーワードを検出 → timing = 'realtime'");
  }

  // フォーマット推論
  if (input.category === "code-support") {
    result.format = "code";
    inferenceLog.push("category = 'code-support' → format = 'code'");
  } else if (input.category === "data-analysis") {
    result.format = "structured";
    inferenceLog.push("category = 'data-analysis' → format = 'structured'");
  }

  return { ...result, inferenceLog };
}
```

## 参照資料

| 資料名              | パス                                         | 用途           |
| ------------------- | -------------------------------------------- | -------------- |
| 要件定義書          | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| 影響範囲マップ      | `outputs/phase-1/impact-scope-map.md`        | Phase 1 成果物 |
| 型定義（W0-seq-01） | `packages/shared/src/types/skillCreator.ts`  | 型の確認       |

## 実行手順

1. Phase 1 成果物を確認し、設計の前提を固める。
2. `SkillInfoFormData` / `SmartDefaultResult` 型定義を再確認する。
3. API シグネチャを確定する。
4. 推論フローチャートを詳細化する。
5. フォールバック設計テーブルを完成させる。
6. 実装コードスケッチを記述する。

## 成果物

| 成果物             | パス                                     | 説明                             |
| ------------------ | ---------------------------------------- | -------------------------------- |
| APIシグネチャ設計  | `outputs/phase-2/api-design.md`          | 関数シグネチャ・インターフェース |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md` | 推論ロジック詳細                 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`       | テスト方針と対象ケース           |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] API シグネチャが確定していること
- [ ] 推論フローチャートが全ルール（ツール/タイミング/フォーマット）を網羅していること
- [ ] フォールバック挙動が全パターン定義されていること
- [ ] 実装コードスケッチが記述されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 型定義の再確認
3. API シグネチャ確定
4. 推論フローチャートの詳細化
5. フォールバック設計の完成
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
