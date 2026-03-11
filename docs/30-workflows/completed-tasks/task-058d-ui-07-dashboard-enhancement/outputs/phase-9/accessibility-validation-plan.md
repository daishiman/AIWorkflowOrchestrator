# Phase 9 成果物: アクセシビリティ検証計画

## 自動検証

- `DashboardView.test.tsx` で `button` 操作と heading 構造を検証する。
- invalid timestamp を `RelativeTime` の fallback へ渡す。

## 手動検証

| 観点          | 内容                                                    |
| ------------- | ------------------------------------------------------- |
| Focus order   | hero から suggestion cards、`もっと見る` へ自然に流れる |
| Keyboard      | Tab / Enter で主要CTAが操作できる                       |
| Screen reader | `h1`, `h2`, `button`, `<time>` が意味を保つ             |
| Contrast      | light / dark / kanagawa-dragon で可読性を確認           |
| Mobile        | 390px 幅でも CTA と timeline が切れない                 |
