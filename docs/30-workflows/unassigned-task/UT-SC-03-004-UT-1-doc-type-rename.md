# UT-SC-03-004-UT-1: Phase 12 ドキュメントの SkillCategory → SkillTemplateCategory リネーム

| 項目         | 値                              |
| ------------ | ------------------------------- |
| タスクID     | UT-SC-03-004-UT-1               |
| 優先度       | low                             |
| 種別         | docs                            |
| 親タスク     | UT-SC-03-004                    |
| 発見フェーズ | Phase 12 レビュー（2026-03-24） |
| 見積もり     | 15分                            |

---

## 背景

UT-SC-03-004 のレビューフェーズで、`skillCreator.ts` の `SkillCategory` 型を `SkillTemplateCategory` にリネームした。これは `skill.ts` の既存 `SkillCategory`（UI カテゴリ: testing, design, development 等）との名前衝突を解消するためである。

コード側のリネームは完了したが、Phase 12 出力ドキュメント（開発者向けリファレンス）が旧名 `SkillCategory` を参照したままである。

## 問題

以下のドキュメントが旧型名 `SkillCategory` を参照しており、実装と乖離している:

| ファイル                                        | 旧名参照数 |
| ----------------------------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`      | 約5箇所    |
| `outputs/phase-12/api-documentation.md`         | 約12箇所   |
| `outputs/phase-12/documentation-changelog.md`   | 1箇所      |
| `outputs/phase-12/unassigned-task-detection.md` | 1箇所      |

Phase 1-13 仕様書（historical records）は歴史的記録として旧名のまま保持する。

## 完了条件

- [ ] `implementation-guide.md` 内の `SkillCategory` を `SkillTemplateCategory` に更新
- [ ] `api-documentation.md` 内の `SkillCategory` を `SkillTemplateCategory` に更新
- [ ] `documentation-changelog.md` L72 の `SkillCategory` を `SkillTemplateCategory` に更新
- [ ] `unassigned-task-detection.md` L35 の `SkillCategory` を `SkillTemplateCategory` に更新
- [ ] TypeCheck PASS を確認（ドキュメントのみの変更のため影響なし）

## 実施手順

```bash
# 対象ファイルの旧名を一括置換
cd docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-12/
sed -i '' 's/SkillCategory/SkillTemplateCategory/g' implementation-guide.md api-documentation.md
# documentation-changelog.md と unassigned-task-detection.md は手動確認後に置換
```

## 発見経緯

barrel export (`packages/shared/src/types/index.ts`) で `export *` と明示的 `export type {}` が共存すると、明示的な方がサイレントにオーバーライドする。`skill.ts` の `SkillCategory`（UI用）と `skillCreator.ts` の `SkillCategory`（テンプレート用）が衝突し、`SkillTemplateCategory` へのリネームが必要になった。

関連: P23（API二重定義の型管理複雑性）の派生パターン
