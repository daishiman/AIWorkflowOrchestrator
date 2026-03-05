# Phase 7 未達分析

## 1. 未到達分岐（抜粋）

### CardGrid

- line 50-51: `window.matchMedia` 不在環境の早期return分岐
- line 64-65: `addListener/removeListener` フォールバック分岐
- line 112-114: ArrowUp 分岐
- line 116: default key 分岐

### MasterDetailLayout

- line 20-21: SSR/`matchMedia`不在フォールバック
- line 39-41: `addListener/removeListener` フォールバック
- line 54-55: effect早期return分岐

### SearchFilterList

- line 81: filter解除分岐
- line 102-105: list modeでrenderCardフォールバック
- line 115: grid modeで両render未指定時null分岐

## 2. 原因分類

| 分類               | 内容                          | 対応方針                 |
| ------------------ | ----------------------------- | ------------------------ |
| 環境依存分岐       | `matchMedia` API有無分岐      | テストで明示モックを追加 |
| キーボード分岐     | ArrowUp / default分岐         | キー操作テストを追加     |
| フォールバック分岐 | renderItem/renderCard優先順位 | 優先順位ケースを追加     |

## 3. リスク

- 実害リスクは低いが、フォールバック分岐の未検証は将来の回帰起点となる可能性あり。
