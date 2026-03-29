# Phase 9: 品質保証

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 9                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

型安全性、XSS 防止、アクセシビリティ、既存コンポーネントとの整合性、SkillLifecyclePanel 責務侵食がないことを確認する。

## 実行タスク

- 型安全性の再点検
- セキュリティ（XSS 防止）の再点検
- アクセシビリティの再点検
- 既存コンポーネントとの整合性の再点検
- SkillLifecyclePanel 責務境界の再点検

## 参照資料

| 資料名                 | パス                                                                      | 説明               |
| ---------------------- | ------------------------------------------------------------------------- | ------------------ |
| Phase 5 実装           | `phase-5-implementation.md`                                               | 実装対象           |
| Phase 6 test expansion | `phase-6-test-expansion.md`                                               | edge case          |
| Phase 7 coverage       | `phase-7-coverage-check.md`                                               | coverage 結果      |
| Phase 8 refactoring    | `phase-8-refactoring.md`                                                  | 共通ユーティリティ |
| 型定義                 | `packages/shared/src/types/skillCreator.ts`                               | 現行型定義         |
| ImprovementPanel       | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | 整合性参考         |

## 品質観点

- props 型が `RuntimeSkillCreatorPlanResult` / `RuntimeSkillCreatorExecuteResult` と一致する
- HTML タグを含むデータが XSS を引き起こさない（React のデフォルトエスケープ）
- スクリーンリーダーで各セクションが読み上げ可能
- ダークモードでコントラスト比が十分
- SkillLifecyclePanel に表示ロジックが漏れていない
- 再試行ボタンの連打防止（loading 中の disabled）

## 実行手順

### ステップ1: 型安全性を監査する

- `PlanResultDetailPanelProps.planResult` が `RuntimeSkillCreatorPlanResult | null` であること
- `ExecuteResultDetailPanelProps.executeResult` が `RuntimeSkillCreatorExecuteResult | null` であること
- `error` prop の型が TASK-RT-02 の error types と互換であること
- optional prop（`isLoading`, `onRetry`）が undefined 安全であること
- shared types への import パスが正しいこと

### ステップ2: セキュリティを監査する

- `skillName`, `description`, `error` 等のユーザー由来データが React の JSX 内でテキストノードとして表示されること（`dangerouslySetInnerHTML` を使用しない）
- `skillSpec` の折りたたみ表示が `<pre>` / `<code>` タグ内でエスケープされること
- agents[].role, scripts[].purpose 等がテキストとして表示されること

### ステップ3: アクセシビリティを監査する

- セクションヘッダーに適切な heading レベル（`<h3>`, `<h4>`）が使用されていること
- リスト表示に `<ul>` / `<li>` が使用されていること
- 再試行ボタンに `aria-label` が設定されていること
- 成功/失敗バッジに `aria-label` が設定されていること
- 折りたたみセクションに `aria-expanded` が設定されていること
- エラーバナーに `role="alert"` が設定されていること

### ステップ4: 既存コンポーネントとの整合性を監査する

- ImprovementProposalPanel と同一の Tailwind CSS パターンが使用されていること
- カードコンテナ、ヘッダー、リスト、バッジの class が統一されていること
- ダークモード対応（`dark:` prefix）が一貫していること
- import 文が既存のコンベンションに従っていること

### ステップ5: SkillLifecyclePanel 責務を監査する

- SkillLifecyclePanel が `currentPhase` に応じたパネル切り替えのみを行うこと
- 表示ロジック（データの整形、条件分岐）が各パネルコンポーネント内に閉じていること
- store からのデータ取得が既存パターンに従っていること
- 既存の SkillLifecyclePanel のレンダリングに breaking change がないこと

## 統合テスト連携

- Phase 10 で AC-1〜AC-6 の pass/fail matrix を確認する
- Phase 12 に型安全性とセキュリティの根拠を記録する

## 成果物

| 成果物  | パス                           | 説明         |
| ------- | ------------------------------ | ------------ |
| QA 本文 | `phase-9-quality-assurance.md` | QA gate 本文 |

## 完了条件

- [ ] 型安全性が shared types と一致している
- [ ] XSS 防止が React デフォルトエスケープで確保されている
- [ ] アクセシビリティ属性が設定されている
- [ ] 既存コンポーネントとの Tailwind CSS パターンが整合している
- [ ] SkillLifecyclePanel に表示ロジックが漏れていない
- [ ] **本Phase内の全タスクを100%実行完了**
