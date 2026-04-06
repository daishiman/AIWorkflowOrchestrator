# Implementation Guide - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## Part 1: 中学生レベル解説

### なぜこのタスクが必要だったか

アプリが完成したとき、「完成写真」を撮り忘れることがあります。

たとえば、家の工事が終わったのに完成写真を撮らずに工事報告書を閉じてしまった状態を想像してください。後から「本当に完成したの？」と聞かれても、写真がないと証明できません。

このタスクは、まさにその「撮り忘れた完成写真」を後から撮り直すためのものです。

### API キーがある場合とない場合

このアプリは、「AIの頭脳（API）」を借りてスキルを実行します。

- **APIキーがある場合**（`integrated_api` モード）: AIが直接アプリの中で動く → 「社内で作業する」イメージ
- **APIキーがない場合**（`terminal_handoff` モード）: AIが使えないので、ユーザーに「自分でやってね」と案内を出す → 「外部委託する」イメージ

`HandoffGuidance`（ハンドオフガイダンス）は、「APIキーがないので、ターミナルで自分で実行してください」という案内文のことです。

### 取得した証拠写真（スクリーンショット）

今回、3枚の写真（スクリーンショット）を取得しました:

1. **HandoffGuidance の表示**（APIキーなし状態）: ユーザーへの案内が正しく表示されることの証拠
2. **disclosure summary の表示**: 実行計画の開示（ディスクロージャー）が表示されることの証拠
3. **integrated_api 成功後**（APIキーあり状態）: 「案内なし」状態との対比のため

---

## Part 2: 技術者向け解説

### HandoffGuidance コンポーネントの表示条件

`SkillLifecyclePanel.tsx` では、`isTerminalHandoff()` 関数で分岐を判定する:

```typescript
function isTerminalHandoff(
  response: unknown,
): response is { type: "terminal_handoff" } {
  return "type" in response && response.type === "terminal_handoff";
}
```

`terminal_handoff` 状態では `TerminalHandoffCard`（`HandoffGuidance` 実装）が表示される。

### `data-testid="skill-lifecycle-disclosure-summary"` の役割

disclosure summary セクションは、スキル実行前に実行計画を開示する UI 要素。
`SkillLifecyclePanel` の `disclosureInfo` state（`useState<{...} | null>(null)`）が設定された際に表示される。

DevTools での確認:

```javascript
document.querySelector('[data-testid="skill-lifecycle-disclosure-summary"]');
```

### integrated_api / terminal_handoff 分岐ロジック

`SkillLifecyclePanel.tsx` 内:

```typescript
// terminal_handoff 分岐
if ("type" in response && response.type === "terminal_handoff") {
  const bundle: TerminalHandoffBundle = { type: "terminal_handoff", ... };
  setHandoffGuidance(toHandoffGuidance(bundle));
}
// integrated_api は上記に該当しないパス（通常の execute 成功）
```

### Screenshot 取得手順と capture ID 対応表

| capture ID                      | 状態               | ファイル名                            | 操作                                          |
| ------------------------------- | ------------------ | ------------------------------------- | --------------------------------------------- |
| SCREENSHOT-TASK07-HANDOFF-01    | terminal_handoff   | terminal_handoff-handoff-guidance.png | API key 未設定で Plan 実行                    |
| SCREENSHOT-TASK07-DISCLOSURE-01 | disclosure_summary | disclosure-summary-display.png        | terminal_handoff 後に disclosure summary 展開 |
| SCREENSHOT-TASK07-INTEGRATED-01 | integrated_api     | integrated-api-success-comparison.png | 有効 API key で Plan 実行成功                 |

### Evidence 保存先ディレクトリ構造

```
docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/
└── outputs/
    └── phase-11/
        ├── screenshot-plan.json
        ├── manual-test-checklist.md
        ├── manual-test-result.md
        ├── manual-test-report.md
        ├── discovered-issues.md
        ├── ui-sanity-visual-review.md
        ├── screenshot-coverage.md
        └── screenshots/
            ├── terminal_handoff-handoff-guidance.png
            ├── disclosure-summary-display.png
            ├── integrated-api-success-comparison.png
            └── phase11-capture-metadata.json
```

### TypeScript 型定義

```typescript
interface ScreenshotEvidenceEntry {
  captureId:
    | "SCREENSHOT-TASK07-HANDOFF-01"
    | "SCREENSHOT-TASK07-DISCLOSURE-01"
    | "SCREENSHOT-TASK07-INTEGRATED-01";
  fileName: string;
  state: "terminal_handoff" | "disclosure_summary" | "integrated_api";
  capturedAt: string;
  method: "manual";
}

declare function recordScreenshotEvidence(
  entries: ScreenshotEvidenceEntry[],
): void;
```

### 使用例

```typescript
const evidence: ScreenshotEvidenceEntry[] = [
  {
    captureId: "SCREENSHOT-TASK07-HANDOFF-01",
    fileName: "terminal_handoff-handoff-guidance.png",
    state: "terminal_handoff",
    capturedAt: "2026-04-06T09:00:00+09:00",
    method: "manual",
  },
  {
    captureId: "SCREENSHOT-TASK07-DISCLOSURE-01",
    fileName: "disclosure-summary-display.png",
    state: "disclosure_summary",
    capturedAt: "2026-04-06T09:05:00+09:00",
    method: "manual",
  },
  {
    captureId: "SCREENSHOT-TASK07-INTEGRATED-01",
    fileName: "integrated-api-success-comparison.png",
    state: "integrated_api",
    capturedAt: "2026-04-06T09:10:00+09:00",
    method: "manual",
  },
];

recordScreenshotEvidence(evidence);
```

### エラーハンドリングとエッジケース

| ケース                              | 対応                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------- |
| terminal_handoff 状態が再現できない | API key を環境変数から削除、または degraded 状態を強制する                  |
| disclosure summary が表示されない   | `fetchDisclosureInfo()` の呼び出しを確認（terminal_handoff 時のみ呼ばれる） |
| screenshot-plan.json が存在しない   | 本タスクの capture ID 定義（`SCREENSHOT-TASK07-*`）を使用する               |

### 設定可能パラメータ・定数

| 定数              | 値                              | 用途                               |
| ----------------- | ------------------------------- | ---------------------------------- |
| `SCREENSHOT_DIR`  | `outputs/phase-11/screenshots/` | screenshot 保存先                  |
| capture ID prefix | `SCREENSHOT-TASK07-`            | TASK-SDK-07 の capture ID 命名規則 |

### Phase 11 スクリーンショット参照

| ファイル                              | 参照先                                                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| terminal_handoff-handoff-guidance.png | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/terminal_handoff-handoff-guidance.png` |
| disclosure-summary-display.png        | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/disclosure-summary-display.png`        |
| integrated-api-success-comparison.png | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/integrated-api-success-comparison.png` |
