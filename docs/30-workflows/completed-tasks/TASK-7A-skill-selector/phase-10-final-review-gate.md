# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 10                     |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

実装完了後、全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## レビュー観点

| #   | レビュー観点       | 確認内容                                           |
| --- | ------------------ | -------------------------------------------------- |
| 1   | 機能完全性         | FR-01〜FR-08 の全要件が実装されているか            |
| 2   | コード品質         | ESLint/Prettier/TypeScript エラーなし              |
| 3   | テスト品質         | カバレッジ基準達成、テストケースの網羅性           |
| 4   | アクセシビリティ   | ARIA属性、キーボードナビゲーション、コントラスト比 |
| 5   | パフォーマンス     | 不要な再レンダリングがないか                       |
| 6   | UI/UX              | ModelSelectorとの一貫性、ダークモード対応          |
| 7   | セキュリティ       | Renderer Process のみで完結、XSS脆弱性なし         |
| 8   | エラーハンドリング | rescanSkills エラー時の表示、空リスト対応          |
| 9   | ドキュメント整合性 | JSDoc、コンポーネント説明の正確性                  |
| 10  | 統合準備           | barrel export、TASK-7D統合の準備状況               |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                       |
| ------------ | ------------------------------ |
| 全テスト結果 | ユニットテスト全て成功         |
| カバレッジ   | 基準達成                       |
| Store連携    | useAppStore 経由のアクセス確認 |

## 参照資料

| 資料名       | パス                                | 説明          |
| ------------ | ----------------------------------- | ------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | Phase 9成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全10レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] MINOR指摘がある場合は未完了タスクとして記録されている
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 機能完全性レビュー
2. コード品質レビュー
3. テスト品質レビュー
4. アクセシビリティレビュー
5. UI/UXレビュー
6. セキュリティ・エラーハンドリングレビュー
7. 統合準備レビュー
8. 判定結果の記録
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
