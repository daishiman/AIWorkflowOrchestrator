# Phase 4: テスト仕様書 — TASK-UI-00-TOKENS

## メタ情報

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | TASK-UI-00-TOKENS                                                  |
| Phase        | 4（テスト作成）                                                    |
| 作成日       | 2026-02-22                                                         |
| テスト環境   | Vitest 2.1.9 + happy-dom                                           |
| 対象ファイル | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx` |

## テスト対象

### renderWithTheme テストヘルパー

- **ファイル**: `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`
- **責務**: テーマ付きコンポーネントレンダリングユーティリティ
- **依存**: `@testing-library/react`, `ResolvedTheme`型

## テスト戦略

### アプローチ: パラメータ化テスト（`describe.each`）

3テーマ（`kanagawa-dragon`, `light`, `dark`）の共通動作を `describe.each` で網羅し、テストコード重複を排除。

### テスト環境の注意事項

- **P39準拠**: `userEvent` は使用せず `fireEvent` を使用（happy-dom非互換）
- **P40準拠**: テスト実行は `cd apps/desktop` から実行

## テストカテゴリ

| カテゴリ         | テスト数 | 概要                           |
| ---------------- | -------- | ------------------------------ |
| テーマ適用       | 3        | 各テーマのdata-theme属性設定   |
| DOM レンダリング | 3        | 子要素が正しくDOMに挿入される  |
| デフォルト動作   | 1        | テーマ未指定時のフォールバック |
| API互換性        | 1        | RenderResult標準メソッドの存在 |
| クリーンアップ   | 1        | afterEachによる属性クリア      |
| **合計**         | **9**    |                                |

## 実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx
```

## 結果

- 全9テスト PASS
- 実行時間: 64ms（テスト部分のみ）
