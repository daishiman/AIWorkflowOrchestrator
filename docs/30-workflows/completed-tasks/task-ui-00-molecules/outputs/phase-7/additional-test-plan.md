# Phase 7 追加テスト計画

- 作成日: 2026-03-04

## 追加候補

1. CodeViewer: `navigator.clipboard` 非対応時のフォールバック検証
2. Dialog系: フォーカス対象がゼロ要素のとき Tab 抑止を検証
3. TabSwitcher: `tabs=[]` の耐性テスト
4. SearchBar: `onDebouncedChange` 未指定時の副作用なし検証

## 優先度

- P1: 異常系（クラッシュ防止）
- P2: 境界値（空配列・空文字）
