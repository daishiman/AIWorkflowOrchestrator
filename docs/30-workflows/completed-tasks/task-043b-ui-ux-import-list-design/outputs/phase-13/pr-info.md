# Phase 13 PR情報

## メタ情報

| 項目           | 内容                                            |
| -------------- | ----------------------------------------------- |
| Phase          | 13                                              |
| タスクID       | TASK-043B                                       |
| ブランチ       | `task/task-043b-ui-ux-import-list-design-specs` |
| ベースブランチ | `main`                                          |
| ステータス     | PR作成実行対象                                  |

## PRタイトル

```text
feat(skill-import): インポート一覧 UX 改善と Phase 12/13 仕様同期
```

## PR概要

- `SkillManagementPanel` を imported / available の 2 セクション構成へ再編し、検索・件数・状態表示を整理した。
- `SkillImportDialog` に `importSkill()` の non-throw failure 契約を踏まえた post-condition 成功判定を入れ、擬似成功と alert 重複を防いだ。
- targeted test 52 件、Phase 11 screenshot coverage 9/9、Phase 12 の system spec / skill / unassigned-task 同期まで揃えた。
- completed workflow / phase-13 成果物 / system spec 更新を PR 導線へ接続し、reviewer が差分と根拠をたどれる状態にした。

## PR本文に必ず入れる要点

1. `outputs/phase-12/implementation-guide.md` を反映元として `## その他` に明記する。
2. `SkillManagementPanel` / `SkillImportDialog` の責務分離と、`importSkill()` の post-condition 成功判定を概要と変更内容へ入れる。
3. テスト欄にはユーザー実行済みの `pnpm typecheck`, `pnpm lint`, `pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`, `pnpm test --testTimeout=900000` を反映する。
4. UI/UX 変更があるため `## スクリーンショット` を削除せず、Phase 11 の png を raw URL で掲載する。
5. `implementation-guide.md` 全文コメントは省略せず Part 1 / Part 2 を両方投稿する。

## PR本文の構成案

- 概要: UI 再編と import 成功判定の安定化、Phase 12/13 同期
- 変更内容: UI 実装、テスト、Phase 11/12/13 成果物、system spec 更新、unassigned-task 運用
- テスト: user 実行済み command + spec verify + manual screenshot coverage
- スクリーンショット: mixed state / dialog / success / dark / mobile
- その他: implementation-guide 反映元と 3 要点

## レビューポイント

1. imported / available の 2 セクション構成が empty / error / no-result を壊していないか。
2. `SkillImportDialog` の post-condition 成功判定が stale error と idempotent import を適切に扱っているか。
3. panel alert を dialog open 中に抑止する制御が二重通知を防げているか。
4. system spec / skill / workflow / unassigned-task の同期が Phase 12/13 の手順に沿っているか。
