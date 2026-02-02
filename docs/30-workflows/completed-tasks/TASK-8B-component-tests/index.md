# TASK-8B: コンポーネントテスト

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-8B                            |
| Tier         | 1                                  |
| Phase        | 8（テスト）                        |
| 機能名       | skill-import-agent-system          |
| 作成日       | 2026-02-01                         |
| 依存タスク   | TASK-7A, TASK-7B, TASK-7C, TASK-7D |
| 並列実行可能 | TASK-8A, TASK-8C                   |
| ブロック対象 | なし                               |
| ステータス   | pending                            |
| 優先度       | high                               |
| 推定複雑度   | medium                             |
| タグ         | test, component-test, frontend, ui |

## 概要

UIコンポーネントの Testing Library を使用したコンポーネントテストを実装する。対象は skill-import-agent-system の4つのフロントエンドコンポーネント。

## テスト対象コンポーネント

| コンポーネント     | ファイルパス                                                        | テストケース数 |
| ------------------ | ------------------------------------------------------------------- | -------------- |
| SkillSelector      | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`      | 15             |
| SkillImportDialog  | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`  | 12             |
| PermissionDialog   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`   | 12             |
| SkillStreamingView | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | 16             |
| **合計**           |                                                                     | **55**         |

## テストファイル出力先

| テストファイル              | パス                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| SkillSelector.test.tsx      | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`      |
| SkillImportDialog.test.tsx  | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`  |
| PermissionDialog.test.tsx   | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`   |
| SkillStreamingView.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |

## 技術スタック

| 技術                        | バージョン | 用途                             |
| --------------------------- | ---------- | -------------------------------- |
| Vitest                      | 既存       | テストフレームワーク             |
| @testing-library/react      | ^16.3.0    | Reactテストユーティリティ        |
| @testing-library/jest-dom   | ^6.9.1     | DOM アサーション                 |
| @testing-library/user-event | 既存       | ユーザーイベントシミュレーション |
| happy-dom                   | 既存       | テスト環境（JSDOM代替）          |

## Phase一覧

| Phase | 名称                 | 成果物                                      |
| ----- | -------------------- | ------------------------------------------- |
| 1     | 要件定義             | 要件定義書・受け入れ基準・スコープ定義      |
| 2     | 設計                 | テストアーキテクチャ設計・モック戦略        |
| 3     | 設計レビューゲート   | レビュー判定結果                            |
| 4     | テスト作成（Red）    | 4コンポーネントのテストファイル（55ケース） |
| 5     | 実装（Green）        | テスト通過のための調整・修正                |
| 6     | テスト拡充           | 追加テスト・カバレッジレポート              |
| 7     | テストカバレッジ確認 | カバレッジ再測定レポート                    |
| 8     | リファクタリング     | テストコード品質改善                        |
| 9     | 品質保証             | 品質レポート                                |
| 10    | 最終レビューゲート   | 最終レビュー判定結果                        |
| 11    | 手動テスト検証       | 手動テスト結果                              |
| 12    | ドキュメント更新     | 実装ガイド・更新履歴・未タスク検出レポート  |
| 13    | PR作成               | PR情報                                      |

## 完了条件

- [ ] SkillSelector テストが全て通過する
- [ ] SkillImportDialog テストが全て通過する
- [ ] PermissionDialog テストが全て通過する
- [ ] SkillStreamingView テストが全て通過する
- [ ] カバレッジ 80% 以上（Line/Function/Statement）
- [ ] カバレッジ 60% 以上（Branch）
- [ ] 全Phase（1-13）が完了している

## 依存関係図

```
TASK-7A (SkillSelector)      ─┐
TASK-7B (SkillImportDialog)   ├──→ TASK-8B (コンポーネントテスト)
TASK-7C (PermissionDialog)   ─┤
TASK-7D (ChatPanel統合)      ─┘
                                     ↕ 並列
                              TASK-8A (ユニットテスト)
                              TASK-8C (統合テスト)
```

## システム仕様参照（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| テスト戦略・品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テストピラミッド・カバレッジ目標         |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | コンポーネント実装パターン               |
| UI/UXデザイン原則          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | アクセシビリティ・WCAG基準               |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand・forwardRef・Compound Components |
| エージェント実行UI         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                | PermissionDialog・ストリーミングUI仕様   |
