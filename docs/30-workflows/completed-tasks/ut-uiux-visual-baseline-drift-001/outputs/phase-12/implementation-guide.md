# Phase 12 実装ガイド

## Part 1: 中学生レベルの説明

### なぜ必要か

baseline drift は、写真の見本が昔のままで、今の作品と少しズレてしまう状態です。  
たとえば、クラス写真の見本が去年のままなのに、今年は髪型や制服が少し変わっていたら、見本と合わなくなります。

Visual Regression でも同じで、画面の見本が古いと、正しい変更まで「壊れた」と見えてしまいます。  
逆に、見本を古いままにすると、本当に壊れたときの異常も見逃します。

### 何をするか

まず、差分が「わざと変えた UI」なのか「直すべき不具合」なのかを見分けます。  
そのうえで、次のどちらかを選びます。

- わざと変えた UI なら、見本を新しい状態に更新する
- 予想外の壊れなら、画面の実装を直して見本に合わせる

`dark-mode` では、OS の気分に左右されないように `colorScheme: "dark"` を固定します。  
そうすると、同じ画面を何度見ても結果がぶれにくくなります。

## Part 2: 開発者向け

### 主要ファイル

- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`
- `apps/desktop/playwright.config.ts`
- `apps/desktop/e2e/ui-ux/test-targets.config.ts`

### 型と設定

```ts
export interface TestTarget {
  id: string;
  description: string;
  navigation: { type: "url"; value: string } | { type: "action"; name: string };
  layer1: boolean;
  layer2: boolean;
  maxDiffPixels?: number;
}
```

- `colorScheme: "dark"` は `ui-ux-layer2` に対して明示する
- `maxDiffPixels` は 200px 以下を維持する
- 今回の値は `20 / 30 / 50` で、上限超過はない

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --update-snapshots
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=html
pnpm --filter @repo/desktop typecheck
pnpm lint
```

### baseline 更新

1. `--update-snapshots` を付けて `ui-ux-layer2` を実行する。
2. `git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` で対象を確認する。
3. 3 surface 以外が更新されたら、`git restore --source=HEAD -- <path>` で戻す。
4. 更新後は通常実行で PASS を確認する。

### UI 修正

1. `OnboardingWizard` や関連コンポーネントを直す。
2. 変更後に `ui-ux-layer2` を再実行する。
3. HTML レポートと baseline を視認確認する。

### 安全な差し戻し

```bash
git restore --source=HEAD -- apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/<対象外ファイル>
```

### 想定エラーと対処

- 対象外 snapshot が更新された: `git restore` で戻す
- `colorScheme` が環境依存になった: `playwright.config.ts` と `layer2-visual.spec.ts` の両方で明示する
- `maxDiffPixels` が過大になった: 200px 以下へ戻す

### 今回の結論

- diff は意図した UI 変更起因
- baseline は既に同期済み
- 追加の UI 修正は不要
- dark-mode の安定化だけを設定で補強した
