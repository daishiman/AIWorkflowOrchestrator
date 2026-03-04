# Phase 2 状態設計（再監査版）

更新日: 2026-03-04

## 状態遷移

1. 初期化: `isLoadingSkills=true` → fetch
2. 成功: `availableSkillsMetadata/importedSkills` 反映
3. 欠損入力: Hook/Component 側で fail-soft
4. エラー: `skillError` に委譲（画面は error view）

## 不変条件（Invariant）

- `availableSkills` / `importedSkills` は Hook で `?? []` を適用。
- 検索・カテゴリ判定で string 正規化後に比較。
- featured 計算で配列長参照は必ず `safeLength` 経由。

## 依存タスク連携

- 01: imported state 復元契約に依存
- 02: import 冪等契約に依存
- 03: UI防御は上記依存を前提に成立
