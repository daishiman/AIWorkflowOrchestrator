# Phase 5: 実装 - タスク仕様書

## 目的

Task03 の設計に従い、Skill Creator を表導線として実装し、作成/実行/改善の一連フローを接続する。

## 実装対象

- skill lifecycle mode UI
- `skillCreatorAPI` または統合 facade
- wizard の役割縮退
- 実行/改善への会話遷移
- 内部 SubAgent / Codex 委譲

## SubAgent 分担

- Planner Agent: 要件整理・作成計画
- Executor Agent: スキル実行
- Improver Agent: 改善提案と差分整理

## 完了条件

- [ ] 会話 1 セッションで作成/実行/改善に到達できる
- [ ] 内部委譲がログと権限境界で管理される
