# PR要約ドラフト

## 概要

- Skill Center を一次導線の正面入口に据え、`create` / `use` / `improve` の journey 契約をコードへ集約した。
- `skill-center` legacy alias を `skillCenter` へ正規化し、shell 側で互換値を吸収するようにした。
- Skill Center へ journey panel と surface ownership panel を追加し、各画面の責務境界を可視化した。
- Phase 11 screenshot と Phase 12 正本仕様同期を完了し、`.claude` 正本と `.agents` mirror の差分をそろえた。

## 主な変更点

- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` を追加し、journey / responsibility / advanced route policy / downstream contract を正本化。
- `apps/desktop/src/renderer/App.tsx` で view 正規化を導入し、legacy alias 依存を局所化。
- `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` に journey panel と surface ownership panel を追加。
- renderer テスト 18 件と Phase 11 screenshot 6 件を成果物へ反映。
- `task-specification-creator` / `skill-creator` / `aiworkflow-requirements` の Phase 12 仕様同期と issue frontmatter 是正を実施。

## レビュー観点

- `skill-center` alias 正規化後も既存遷移が壊れていないか。
- Skill Center 上の journey panel / surface ownership panel が仕様書の責務分離と一致しているか。
- Phase 11 / 12 成果物が `docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation` に集約されているか。
- `.claude` と `.agents` の lifecycle 仕様差分が解消されているか。

## 補足

- Phase 11 キャプチャスクリプトの workflow 参照先は `completed-tasks` 側へ補正済み。
- 親 workflow `docs/30-workflows/skill-lifecycle-unification/` も今回差分に含めて PR 化する。
