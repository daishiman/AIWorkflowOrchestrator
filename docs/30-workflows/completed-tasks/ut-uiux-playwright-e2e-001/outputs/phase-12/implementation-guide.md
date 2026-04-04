# UT-UIUX-PLAYWRIGHT-E2E-001 実装ガイド

## Part 1: 中学生レベルの説明

### なぜ必要か

画面チェックを人の記憶だけに頼ると、前に直した問題がまた戻っても気づきにくい。だから、同じ手順で毎回見直せる仕組みが必要になる。

### たとえば

たとえば、毎朝教室の机の並びを写真で見比べる当番がいるようなものです。昨日と同じ並びなら安心できるし、1つだけ机がずれていてもすぐ気づける。

### この実装でやること

| 役割     | 説明                                     | 例                                     |
| -------- | ---------------------------------------- | -------------------------------------- |
| Semantic | 画面の部品に正しい意味づけがあるかを見る | ボタンや入力欄が読み上げで分かるか     |
| Visual   | 画面の見た目が前回から崩れていないか見る | baseline 画像と current 画像の差分確認 |
| 設定駆動 | 新しい画面を1箇所で追加できるようにする  | `TEST_TARGETS` へ1エントリ追加         |

## Part 2: 技術詳細

### Current Contract

- Playwright project は `ui-ux-layer1` / `ui-ux-layer2`
- single source of truth は `apps/desktop/e2e/ui-ux/test-targets.config.ts`
- Layer 1 は implicit role と roving tabindex を許容しつつ、`SEM-006` を real issue として検出する
- Layer 2 baseline は `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`
- Phase 11 証跡は `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/`

### Target Delta

- false positive だった `SEM-001` / `SEM-005` を current rules に合わせて補正した
- Onboarding overlay に background inert 付与を追加したが、`SEM-006` はまだ 2 surface で fail する
- Phase 11/12 の screenshot / artifacts / unassigned tracking を current workflow 配下へ再同期した

### 型定義

```ts
export interface SemanticTarget {
  selector: string;
  expectedRole?: string;
  requiresAriaLabel?: boolean;
  focusable?: boolean;
}

export interface TestTarget {
  id: string;
  description: string;
  navigation: { type: "url"; value: string } | { type: "action"; name: string };
  layer1: boolean;
  layer2: boolean;
  semanticTargets?: SemanticTarget[];
  screenshotClip?: { x: number; y: number; width: number; height: number };
  maxDiffPixels?: number;
}
```

### API / ヘルパー

| 関数                        | シグネチャ                                              | 用途                 |
| --------------------------- | ------------------------------------------------------- | -------------------- |
| `navigateToTarget`          | `(page, navigation) => Promise<void>`                   | 画面遷移             |
| `collectTabOrder`           | `(page, maxTabs?) => Promise<string[]>`                 | Tab 移動収集         |
| `captureAccessibleElements` | `(page, selector?) => Promise<AccessibleElementInfo[]>` | アクセシブル要素取得 |

### 使用例

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
pnpm --filter @repo/desktop exec playwright test --update-snapshots --project=ui-ux-layer2
```

### 実測結果

| コマンド                           | 結果                              |
| ---------------------------------- | --------------------------------- |
| `ui-ux-layer1`                     | 23 passed / 10 skipped / 2 failed |
| `ui-ux-layer2`                     | 7 passed / 3 failed               |
| `vitest OnboardingWizard.test.tsx` | 21 passed                         |

### エラー / エッジケース

| 項目                     | 内容                                            | 対応                                    |
| ------------------------ | ----------------------------------------------- | --------------------------------------- |
| `SEM-006` fail           | dialog 外へフォーカス leak                      | `TASK-A11Y-FOCUS-TRAP-001` へ formalize |
| 113px snapshot diff      | `error-display` / `loading-state` / `dark-mode` | baseline refresh か UI 差分再判定       |
| `semanticTargets` 空配列 | 一部テストは skip/pass                          | 設計どおり                              |

### 設定一覧

| 項目                         | 値                                                                           | 説明                  |
| ---------------------------- | ---------------------------------------------------------------------------- | --------------------- |
| baseline path                | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`                    | Playwright 標準配置   |
| current workflow screenshots | `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/` | Phase 11 証跡         |
| diff threshold               | `maxDiffPixels`                                                              | target ごとに上書き可 |

### スクリーンショット参照

- `outputs/phase-11/screenshots/TC-11-01-chat-main.png`
- `outputs/phase-11/screenshots/TC-11-05-error-display-current.png`
- `outputs/phase-11/screenshots/TC-11-05-error-display-diff.png`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`
