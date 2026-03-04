# Phase 4 テストケース一覧（再監査版）

更新日: 2026-03-04

## Hook

1. `description` 欠損時の検索クラッシュ防止
2. `allSkills/importedSkillNames` 欠損時の featured 算出防止
3. カテゴリ推論の欠損入力耐性

## Component

4. `SkillCard` 描画時の欠損説明文耐性
5. `SkillCard` ファイル件数計算の欠損耐性
6. `SkillDetailPanel` 欠損サブリソース耐性
7. `SkillDetailPanel` モーダル開閉導線維持

## View統合

8. SkillCenter初期表示の導線維持
9. 検索時のフィルタ挙動維持
10. カテゴリ切り替え挙動維持

## 回帰

11. 既存追加導線（AddButton）破壊なし
12. アクセシビリティ導線（キー操作）維持
