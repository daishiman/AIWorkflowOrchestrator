# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 10                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

多角的な品質・整合性の最終検証を行う。AC-1, AC-3, AC-4, AC-7 の全達成条件を検証し、レビュー判定を行う。

## 実行タスク

1. 受入基準の全検証
   - AC-1: SkillLifecyclePanel から「LLM で生成」を選択し planSkill が呼ばれることを確認
   - AC-3: executePlan 実行中に TerminalHandoff 状態が表示されることを確認
   - AC-4: executePlan 完了後にスキルリストに新スキルが追加されることを確認
   - AC-7: 「テンプレートから作成」フローが既存と同じ動作をすることを確認
2. Zustand 無限ループ問題の最終確認
   - `useIsSkillGenerating()` 等の個別セレクタが useEffect 依存配列で安全に使われているか（P31対策）
   - 派生セレクタに `useShallow` が適用されているか（P48対策）
3. UI アクセシビリティの最終確認（WCAG 2.1 AA）
   - コントラスト比 4.5:1 以上
   - ARIA ラベルの適切な付与
   - キーボード操作での全機能アクセス可能
4. non-null assertion の最終確認（P52対策）
   - `grep -n '!' apps/desktop/src/renderer/components/skill/` で残存確認
5. IPC 契約の最終確認（P44/P45対策）
   - planSkill/executePlan の引数名と実際の値のセマンティクスが一致するか
6. レビュー判定（PASS / MINOR / MAJOR / CRITICAL）
7. MINOR 以上の指摘を未タスク仕様書に変換

## 参照資料

- Phase 9 品質検証結果
- `.claude/rules/05-task-execution.md`（Phase 10 最終レビューゲート）
- `.claude/rules/06-known-pitfalls.md`（P31, P44, P45, P48, P52）
- `.claude/rules/01-architecture.md`（Apple HIG、WCAG 2.1 AA）

## 成果物

- 最終レビュー報告書
  - 判定: PASS / MINOR / MAJOR / CRITICAL
  - AC-1, AC-3, AC-4, AC-7 達成確認記録
  - 指摘事項リスト

## 完了条件

- [ ] AC-1（LLM 生成フロー開始）を検証した
- [ ] AC-3（TerminalHandoff 状態表示）を検証した
- [ ] AC-4（実行完了後スキル利用可能）を検証した
- [ ] AC-7（既存フロー非破壊）を検証した
- [ ] Zustand 無限ループ問題を最終確認した（P31/P48対策）
- [ ] UI アクセシビリティを確認した（WCAG 2.1 AA）
- [ ] non-null assertion の残存がないことを確認した（P52対策）
- [ ] IPC 契約の整合性を確認した（P44/P45対策）
- [ ] レビュー判定を PASS / MINOR / MAJOR / CRITICAL で明記した
- [ ] MINOR 以上の指摘は全て未タスク仕様書に変換した

## 次のPhase

Phase 11: 手動テスト
