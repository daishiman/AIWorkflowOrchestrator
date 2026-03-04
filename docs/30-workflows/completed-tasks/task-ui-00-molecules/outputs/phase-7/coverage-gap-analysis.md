# Phase 7 ギャップ分析

- 作成日: 2026-03-04

## 未カバー箇所（抜粋）

| コンポーネント | 未カバー例                           | 備考                              |
| -------------- | ------------------------------------ | --------------------------------- |
| CodeViewer     | `index.tsx` 46-47, 53-54, 60-61      | Clipboard未対応環境のエラールート |
| ConfirmDialog  | `index.tsx` 48, 63-64, 75-76, 83-85  | 一部のキー分岐・空focusables分岐  |
| SearchBar      | `index.tsx` 42-43                    | debounced callback 無効ケース     |
| SlideInPanel   | `index.tsx` 42, 54-55, 62-64         | focusable要素ゼロ時の分岐         |
| TabSwitcher    | `index.tsx` 36-38, 71-72, 82-86, 110 | 空tabs/分岐境界                   |

## 根本原因

- 正常系・主要a11y経路を優先したため、異常系分岐に未到達が残る
