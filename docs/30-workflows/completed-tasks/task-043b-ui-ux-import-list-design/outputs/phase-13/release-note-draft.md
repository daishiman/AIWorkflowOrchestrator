# Release Note Draft

## タイトル案

Skill import list UX refinement

## 変更点

- Skill 管理画面を imported / available の 2 セクション構成へ整理し、empty / error / no-result を判別しやすくした
- import dialog の成功判定を store 実状態ベースへ変更し、擬似成功と stale error の取りこぼしを防いだ
- dialog open 中の parent alert 抑止、focus 復帰、nullish metadata 防御を追加した
- Phase 11 screenshot coverage、Phase 12 system spec 同期、Phase 13 PR handoff を completed workflow に反映した

## 既知の制約

- `importSkill()` の non-throw 契約は既存 store に依存しているため、同系統導線を増やす場合は post-condition 判定を再利用する
- repository 全体の legacy unassigned-task backlog は別タスクで継続管理する
