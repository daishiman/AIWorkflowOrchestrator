# Implementation Guide: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## メタ情報

| 項目                   | 内容                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| タスクID               | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001                                                                                   |
| Phase                  | 12                                                                                                                         |
| タスク分類             | NON_VISUAL                                                                                                                 |
| スクリーンショット参照 | `outputs/phase-11/screenshots/q5-single-select-no-badge.png` / `outputs/phase-11/screenshots/q5-multi-select-no-badge.png` |

## Part 1: 中学生向けのたとえ話

### なぜ必要だったか

たとえば、文化祭で「Slack 係」「GitHub 係」「Notion 係」に同時に準備をお願いしたいのに、
先生が最初に呼ばれた 1 グループの話しか聞いてくれなかったら困ります。
せっかく何人かにお願いしても、実際には 1 人分の情報しか集まらないからです。

今回の修正前の `resolveExternalIntegration` は、それに近い状態でした。
Q5 で複数の外部ツールを選べても、最初の 1 件だけを見てしまう流れが残っていました。

### 何をするようになったか

この修正では、選ばれたツールを 1 個ずつではなく、まとめて受け取って、
それぞれの情報を同時に集めてから最後に 1 つへまとめるようにしました。

たとえば Slack と GitHub を選んだら、

1. Slack の情報を取りに行く
2. GitHub の情報を取りに行く
3. 集まった情報を 1 つの結果にまとめる

という流れになります。

### Step 0 直後の補足

ここで 1 つ注意があります。
Step 0 を終えた直後は、Q5 の答え欄がまだ空のままのことがあります。
でもアプリ側は「この人は Slack を使いそう」のような予想結果を持っていることがあります。

そのため close-out 上のルールとして、
Q5 が空でも `smartDefaults.tool` に候補があれば、それを代わりに使って外部連携の情報を保つ、
という fallback を維持する前提にしています。

## Part 2: 技術者向け詳細

### 変更対象

| ファイル                                                                                     | 役割                          |
| -------------------------------------------------------------------------------------------- | ----------------------------- |
| `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts`                     | ツールごとの統合情報取得      |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | 統合ロジック本体と state 反映 |
| `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts`    | 統合ロジック検証              |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 暫定バッジ削除後の Step 1 UI  |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | バッジ削除後の回帰テスト      |

### 型定義

```ts
export interface ExternalToolIntegration {
  toolName: string;
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}

export interface MergedExternalIntegration {
  tools: ExternalToolIntegration[];
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}
```

### 実装の current facts

- `fetchToolIntegrationInfo()` は Slack / GitHub / Notion を map から返す renderer-local helper
- 未対応ツールは `throw new Error("Unsupported tool: ...")` とし、呼び出し側で吸収する
- `resolveExternalIntegration(toolNames: string[])` は trim + 空文字除去 + `Set` で重複除去する
- 各ツール取得は `Promise.all()` で並列実行し、個別失敗は `null` に落とす
- `mergeIntegrations()` は `flatMap()` + `Set` で endpoint / auth / operation を重複排除して統合する
- 補助スクリーンショットとして Q5 single / multi の no-badge 状態を保存済み

### 主要シグネチャ

```ts
export async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration>;
```

### close-out で固定した fallback ルール

実コードの helper は renderer 内に閉じており shared contract ではないため、
Phase 12 では次の判定ルールを current workflow rule として固定する。

```ts
function resolveToolNamesForIntegration(
  selectedOptions: string[],
  smartDefaultTool: string | null,
): string[] {
  if (selectedOptions.length > 0) return selectedOptions;
  return smartDefaultTool ? [smartDefaultTool] : [];
}
```

この補足が必要な理由:

- Step 0 直後は `answers.q5.selectedOptions` が空になり得る
- 一方で `inferSmartDefaults(formData)` から `smartDefaults.tool` が得られる場合がある
- 外部連携 state の説明や close-out 文書がこのケースを落とすと、Q5 空時の解釈がぶれる

### 補助スクリーンショット

Phase 11 の visual regression 確認として、以下の画像を current workflow に保存した。

- `outputs/phase-11/screenshots/q5-single-select-no-badge.png`
- `outputs/phase-11/screenshots/q5-multi-select-no-badge.png`

### エラーハンドリングとエッジケース

| ケース                | 挙動                                            |
| --------------------- | ----------------------------------------------- |
| `toolNames` が空配列  | 空の `MergedExternalIntegration` を返す         |
| 未対応ツールのみ      | 例外を外に投げず空結果へフォールバック          |
| 複数中 1 件だけ失敗   | 成功分だけを統合して返す                        |
| 同名ツール重複        | 正規化段階で 1 回にまとめる                     |
| Step 0 直後に Q5 が空 | `smartDefaults.tool` を fallback 候補として扱う |

### badge removal の整理

`ConversationRoundStep.tsx` から以下を削除対象として閉じた。

- `MAIN_TOOL_BADGE_ENABLED`
- `shouldShowMainToolBadge`
- `aria-describedby` を伴う主ツールバッジ JSX
- `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメント

### shared interface 昇格が N/A の理由

今回の変更は `apps/desktop/src/renderer/components/skill/` 内で完結する。

- `packages/shared/` の型や export 面は未変更
- `apps/backend/` の API / service / DB 契約は未変更
- IPC channel や preload surface も未変更

そのため system spec の Step 2 は `N/A` と判定した。
