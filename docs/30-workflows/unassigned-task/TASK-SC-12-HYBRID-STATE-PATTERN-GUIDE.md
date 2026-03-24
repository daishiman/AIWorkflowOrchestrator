# TASK-SC-12: Hybrid State Pattern ガイド追加

## メタ情報

- 検出元: TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー
- 優先度: Low
- 関連ファイル:
  - `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 目的

TASK-SC-06 で導入された `localPlanResult ?? storePlanResult` の Hybrid State Pattern を architecture-implementation-patterns.md に正式なパターンとして文書化し、エラーパスでの非対称クリアリスクを防止するガイドラインを提供する。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では、IPC 呼出しの即時レスポンス（localPlanResult）と Store 経由の非同期レスポンス（storePlanResult）を `localPlanResult ?? storePlanResult` の Null Coalescing で統合する Hybrid State Pattern を導入した。このパターンは以下のリスクを内包する:

1. **非対称クリア**: エラーパスで localPlanResult がクリアされず、古い成功結果が残存して UI に表示される
2. **優先順位の暗黙性**: `??` 演算子による優先順位が明示的にドキュメント化されておらず、後続開発者が意図を誤解する
3. **テスタビリティ**: local と store の両方の状態を制御する必要があり、テストが複雑化する

architecture-implementation-patterns.md には類似パターン（S1: API 二重定義、S18: useShallow 等）が既に記録されているが、Hybrid State Pattern は未記載である。

## 実行タスク

- [ ] architecture-implementation-patterns.md に Hybrid State Pattern セクション（S-XX）を追加する
- [ ] パターンの適用条件（いつ使うべきか / 使うべきでないか）を明記する
- [ ] 非対称クリアのリスクと防止策（resetGeneration でローカル state も同時クリアする等）を記述する
- [ ] 正しい実装例と誤った実装例をコードスニペットで示す
- [ ] SkillLifecyclePanel の既存実装がガイドラインに準拠しているか検証する
- [ ] 非対称クリアが発生するケースのユニットテストを追加する（防御テスト）
- [ ] topic-map.md を再生成する

## 完了条件

- [ ] architecture-implementation-patterns.md に Hybrid State Pattern が記載されていること
- [ ] 適用条件、リスク、防止策が明記されていること
- [ ] 正誤のコード例が含まれていること
- [ ] SkillLifecyclePanel のエラーパスで非対称クリアが発生しないことがテストで保証されていること
- [ ] topic-map.md が再生成されていること

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-4）
- architecture-implementation-patterns.md（パターン集の正本）
- P31: Zustand Store Hooks 無限ループ（関連する状態管理パターン）
- 03-state-management.md: 状態の配置原則
