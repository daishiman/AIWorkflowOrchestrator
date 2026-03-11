# Downstream Impact

## Task02: Chat platform unification

- 入力: 一次導線シーケンス
- この PR から参照するもの: `skillLifecycleJourney.ts` の job guide と advanced route policy
- 追従条件: advanced ルートを主入口へ昇格しない

## Task03: Skill Creator execute / improve integration

- 入力: 画面責務マトリクス
- この PR から参照するもの: surface ownership panel と `getSkillLifecycleSurfaceResponsibility()`
- 追従条件: alias と shell 状態を二重管理しない

## Task04: Evaluation and scoring gate

- 入力: Agent / Workspace 境界
- この PR から参照するもの: responsibility contract と `skillCenter -> workspace -> agent` の一次導線
- 追従条件: Chat を一次導線へ昇格しない

## Task05: Created skill usage journey

- 入力: Phase 11 / 12 証跡要件
- この PR から参照するもの: screenshot 6 件、implementation guide、spec update summary
- 追従条件: `settings` 公開 shell 例外を一般化しない

## 共通注意点

- `.claude` を正本、`.agents` を mirror として扱う同期方針は維持する。
- `skill-center` は互換 alias として残すが、canonical view は `skillCenter` とする。
- screenshot 取得は representative surface を selector capture で固定し、shell 全景依存を避ける。
