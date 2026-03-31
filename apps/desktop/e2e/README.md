# E2E テスト実行ガイド

## テスト実行コマンド

```bash
# Layer 1 Semantic テスト（SEM-001〜007）
pnpm exec playwright test --project=ui-ux-layer1

# Layer 2 Visual Regression テスト（VIS-001〜007）
pnpm exec playwright test --project=ui-ux-layer2

# 既存 Chromium テスト（UI/UX テスト除外）
pnpm exec playwright test --project=chromium

# 全テスト
pnpm test:e2e
```

## Visual baseline 画像の初回生成手順

初回実行時（または baseline を再生成したい場合）:

```bash
# --update-snapshots フラグで baseline を生成・更新する
pnpm exec playwright test --update-snapshots --project=ui-ux-layer2
```

生成先: `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`

CI 環境では baseline 画像がリポジトリにコミットされている必要がある。
`*.png binary` として `.gitattributes` に登録済みなので通常の `git add` でコミット可能。

## 新しい対象画面の追加手順

`apps/desktop/e2e/ui-ux/test-targets.config.ts` の `TEST_TARGETS` 配列にエントリを追加するだけ。
テストコード本体は変更不要。

```typescript
// test-targets.config.ts に追加する例
{
  id: "new-feature",           // スナップショットファイル名のプレフィックスになる
  description: "新機能画面",
  navigation: { type: "url", value: "/new-feature" },
  layer1: true,                // Semantic テストを実行するか
  layer2: true,                // Visual テストを実行するか
  semanticTargets: [
    {
      selector: '[data-testid="new-feature-button"]',
      expectedRole: "button",
      focusable: true,
    },
  ],
  maxDiffPixels: 50,
},
```

追加後は baseline を生成する:

```bash
pnpm exec playwright test --update-snapshots --project=ui-ux-layer2 --grep "new-feature"
```

## ANTHROPIC_API_KEY について

テスト実行時に `ANTHROPIC_API_KEY` は不要。`global-setup.ts` でダミー値を自動設定する。
CI 環境でも環境変数未設定のまま実行可能。

## トラブルシューティング

### "No tests found" エラー

`--project` の値が `playwright.config.ts` の `name` と一致しているか確認。

```bash
# 正しい
pnpm exec playwright test --project=ui-ux-layer1
pnpm exec playwright test --project=ui-ux-layer2
```

### Visual テストが失敗する（スナップショット差分）

UIを変更した場合は baseline を再生成する:

```bash
pnpm exec playwright test --update-snapshots --project=ui-ux-layer2
```

### Semantic テストが失敗する（ARIA 属性なし）

アプリのコンポーネントにアクセシビリティ属性が不足している。
以下を対応コンポーネントに追加する:

- `role="button"` — ボタン要素
- `aria-label="..."` — アイコンのみのボタン
- `aria-live="polite"` — エラーメッセージエリア

### モーダル起動時のクリック失敗

アプリ起動時にモーダルダイアログが表示される場合、`helpers.ts` の `dismissOverlayIfPresent()` が自動的に `Escape` で閉じる。
引き続き失敗する場合は `test-targets.config.ts` の `navigation.type: "action"` でカスタムナビゲーションを定義する。

## ファイル構成

```
apps/desktop/e2e/ui-ux/
├── test-targets.config.ts          # テスト対象の設定（ここだけ変更すればよい）
├── helpers.ts                      # 共通ヘルパー関数
├── layer1-semantic.spec.ts         # Layer 1 Semantic テスト（SEM-001〜007）
├── layer2-visual.spec.ts           # Layer 2 Visual Regression テスト（VIS-001〜007）
└── layer2-visual.spec.ts-snapshots/ # Visual baseline 画像（Git 管理）
    ├── chat-main-baseline-*.png
    ├── skill-list-baseline-*.png
    └── ...
```
