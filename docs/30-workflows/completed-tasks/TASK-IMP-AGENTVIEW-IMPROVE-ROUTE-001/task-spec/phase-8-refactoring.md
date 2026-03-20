# Phase 8: リファクタリング

## メタ情報

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001         |
| フェーズ | Phase 8                                      |
| 機能名   | agentview-improve-route                      |
| 作成日   | 2026-03-17                                   |
| 依存     | Phase 7 成果物（outputs/phase-7/、PASS済み） |

## 目的

機能を維持したままコード品質を改善する。可読性・保守性・型安全性を向上させ、既知の落とし穴パターンを排除する。

## 実行タスク

- Task 1: Phase 5 の変更コードを checklist ベースで自己レビューする
- Task 2: P31 対策の selector 構成を整理する
- Task 3: 型安全の逸脱を除去する
- Task 4: コンポーネント分割要否を判定する
- Task 5: 再レンダーと handler 安定性を確認する
- Task 6: style と token 使用を整理する

### Task 1: コードレビュー（自己レビュー）

- [ ] Phase 5 で実装したコードを全行レビュー
- [ ] 以下のチェックリストに沿って問題箇所を特定する

#### チェックリスト

| 観点          | 確認内容                                               |
| ------------- | ------------------------------------------------------ |
| P31 対策      | 合成 Store Hook を使用していないか。個別セレクタのみか |
| P48 対策      | 派生セレクタに `useShallow` が適用されているか         |
| P42 対策      | 文字列引数に `.trim() === ""` バリデーションがあるか   |
| P19 対策      | `as` キャストでバリデーションを回避していないか        |
| 型安全        | `any` 型・`@ts-ignore` の使用がないか                  |
| 未使用 import | 使われていない `import` が残っていないか               |
| コメント品質  | validator の禁止曖昧語が残っていないか                 |
| boolean 命名  | `is` / `has` / `can` / `should` プレフィックスか       |

### Task 2: P31 対策リファクタリング

- [ ] `useAgentStore()` のような合成 Hook 呼び出しがあれば個別セレクタに置き換える
- [ ] `useEffect` 依存配列に合成 Hook の戻り値を含めていないことを確認
- [ ] 個別セレクタの参照安定性を確認（Zustand アクションは安定）

### Task 3: 型安全リファクタリング

- [ ] `any` 型を具体型に置き換える
- [ ] non-null assertion（`!`）を optional chaining または実行時検証に置き換える（P48 対策）
- [ ] type predicate 内の `as` キャストを `in` 演算子ベースに修正（P49 対策）

### Task 4: コンポーネント分割の検討

- [ ] CTA バナーが 50 行を超える場合は独立コンポーネントとして抽出を検討
- [ ] SkillAnalysisView のナビゲーション Props が増えた場合は専用型定義（`SkillAnalysisViewNavigationProps`）への整理を検討
- [ ] Atomic Design 原則に照らして atoms / molecules / organisms の配置が適切か確認

### Task 5: パフォーマンス最適化

- [ ] `React.memo` の適用が必要なコンポーネントを特定
- [ ] `useCallback` の適用箇所を確認（CTA バナーのクリックハンドラ等）
- [ ] 不要な再レンダーが発生していないことをテストで検証

### Task 6: スタイルリファクタリング

- [ ] Tailwind クラスが冗長な場合は `cn()` ユーティリティで整理
- [ ] Apple HIG カラー（CSS 変数）を使用しているか確認
- [ ] ハードコードのカラー値（`#RRGGBB`）がないか確認

## 参照資料

- Phase 1（要件定義）: `phase-1-requirements.md`
- Phase 2（設計）: `phase-2-design.md`
- Phase 5（実装）: `phase-5-implementation.md`
- Phase 5 実装サマリー: `outputs/phase-5/implementation-summary.md`
- Phase 6 追加テスト: `outputs/phase-6/test-additions.md`
- Phase 7 coverage 結果: `outputs/phase-7/coverage-summary.md`
- known-pitfalls: `.claude/rules/06-known-pitfalls.md`（P19, P31, P42, P48, P49）
- コード品質ルール: `.claude/rules/02-code-quality.md`
- アーキテクチャルール: `.claude/rules/01-architecture.md`（Apple HIG）

## 実行手順

1. コードレビューチェックリストを実行して問題箇所を記録
2. 問題箇所を修正（機能は維持）
3. テストが全 PASS のままであることを確認
4. `outputs/phase-8/refactoring-log.md` に変更内容を記録

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-8/
  refactoring-log.md    # 実施したリファクタリングの一覧と理由
  review-checklist.md   # チェックリストの実施結果
```

## 完了条件

- [ ] コードレビューチェックリストが全項目 OK
- [ ] `any` 型・`@ts-ignore` の使用がゼロ
- [ ] P31 / P48 / P42 対策が全て適用済み
- [ ] リファクタリング後も全テストが PASS
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 9: 品質検証
