# Phase 1 要件定義書（再監査版）

更新日: 2026-03-04

## タスク

- TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
- SkillCenter UI の欠損メタデータ耐性強化

## 機能要件（FR）

1. `description` が `undefined/null` でも検索・カテゴリ判定でクラッシュしない。
2. `agents/references/indexes/scripts/otherFiles` が `undefined/null` でもカード/詳細パネルが描画継続する。
3. `Featured` 算出時に欠損配列が混在しても件数計算が壊れない。
4. 欠損データ混在時でも SkillCenter 画面全体が維持される。

## 非機能要件（NFR）

1. 既存 IPC 契約を変更しない（後方互換維持）。
2. Renderer 側で防御し、Main/IPC の責務境界を維持する。
3. 再発防止として自動テストと画面証跡を必須化する。

## 再現条件（既知不具合）

- `toLowerCase()` 呼び出し対象が `undefined`。
- `length` 参照対象が配列でない値（`undefined/null`）。

## 完了判定

- 132テスト（SkillCenterView配下）PASS。
- 対象カバレッジが Line/Branch/Function 目標を満たす。
- Phase 11 で TC-01〜TC-04 の画面証跡を取得し、視覚レビューで PASS。
