# Phase 2 アーキテクチャ設計（再監査版）

更新日: 2026-03-04

## 設計方針

1. 防御処理は Renderer 境界（Hook/Component）へ閉じ込める。
2. Main/IPC 契約は変更しない。
3. 型の「理想値」と実データの「欠損値」のギャップは `normalize` + `safeLength` で吸収する。

## 層別責務

| 層        | 責務                        | 本タスクの扱い              |
| --------- | --------------------------- | --------------------------- |
| Main/IPC  | データ供給                  | 既存契約維持                |
| Store     | 状態保持                    | 既存セレクタの nullish 許容 |
| Hook      | 検索/カテゴリ/featured 算出 | 欠損入力防御の主責務        |
| Component | 描画/詳細表示               | 欠損入力でも描画継続        |

## 設計判断

- `normalizeSearchText(value: unknown) => String(value ?? "").toLowerCase()`
- `safeLength(value: unknown) => Array.isArray(value) ? value.length : 0`
- `safeSubResources/safeOtherFiles` で詳細パネル描画防御

## トレードオフ

- 欠損情報は空表示になるが、クラッシュ回避を優先する。
