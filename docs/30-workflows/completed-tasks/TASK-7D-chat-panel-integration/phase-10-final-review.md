# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 10                             |
| Phase名   | 最終レビューゲート             |
| カテゴリ  | ゲート                         |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 9                        |
| 後続Phase | Phase 11                       |

## 目的

Phase 9 までの全成果物（実装、テスト、品質チェック結果）を総合的にレビューし、手動テストと本番リリースに進むための最終ゲート判定を行う。

## 実行タスク

### タスク1: 実装成果物レビュー

**目的**: 全実装ファイルが設計通りに実装されているか最終確認する。

**手順**:

1. 以下のファイルを読み込みレビューする:
   - `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`
   - `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`
   - `apps/desktop/src/renderer/components/skill/index.ts`

2. 以下の観点でレビューする:

   **設計整合性**:
   - Phase 2 の設計通りにコンポーネントが構成されているか
   - SkillStreamingView の Props が設計通り（skillName, messages, status）か
   - ChatPanel のレイアウト構成（ヘッダー/メッセージ/入力/ダイアログ）が設計通りか

   **仕様準拠**:
   - specification.md 4.1 のレイアウト仕様に準拠しているか
   - specification.md 4.4.1 のストリーミング表示仕様に準拠しているか
   - specification.md 4.7 のツール実行UI仕様に準拠しているか

   **コード品質**:
   - TypeScript 型安全性が確保されているか
   - ESLint/Prettier が通るか
   - 不要なコード（console.log、コメントアウト等）がないか

**期待される成果物**:

- 実装レビューレポート（`outputs/phase-10/implementation-review-report.md`）

### タスク2: テスト成果物レビュー

**目的**: テストの網羅性と品質を最終確認する。

**手順**:

1. 以下のテストファイルを確認する:
   - `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`

2. 以下の観点でレビューする:
   - 受け入れ基準（AC-1〜AC-10）が全てテストでカバーされているか
   - エッジケーステストが十分か
   - アクセシビリティテストが含まれているか
   - テストの可読性・保守性が高いか

3. カバレッジレポート（Phase 7 成果物）を確認する:
   - Line Coverage 80% 以上
   - Branch Coverage 60% 以上
   - Function Coverage 80% 以上

**期待される成果物**:

- テストレビューレポート（`outputs/phase-10/test-review-report.md`）

### タスク3: 品質チェック結果の統合確認

**目的**: Phase 9 の全品質チェック結果を統合確認する。

**手順**:

1. Phase 9 の全成果物を確認する:
   - `outputs/phase-9/code-quality-report.md`
   - `outputs/phase-9/security-check-report.md`
   - `outputs/phase-9/accessibility-check-report.md`

2. 指摘事項が全て解決されていることを確認する

**期待される成果物**:

- 品質統合レポート（`outputs/phase-10/quality-summary-report.md`）

### タスク4: 最終ゲート判定

**目的**: 全レビュー結果を統合し、最終ゲート判定を行う。

**手順**:

1. 以下の判定基準に従い判定する:

| 判定     | 条件                         | 次のアクション     |
| -------- | ---------------------------- | ------------------ |
| PASS     | 問題なし                     | Phase 11 へ進む    |
| MINOR    | 軽微な修正（コメント追加等） | 修正後 Phase 11 へ |
| MAJOR    | 実装上の問題（ロジック不備） | Phase 5 に戻る     |
| MAJOR    | テスト不足                   | Phase 4 に戻る     |
| CRITICAL | 根本的な設計問題             | Phase 1 に戻る     |

2. 判定結果を記録する

**期待される成果物**:

- 最終ゲート判定結果（`outputs/phase-10/final-gate-decision.md`）

## 参照資料

| 参照資料                 | パス                                                           |
| ------------------------ | -------------------------------------------------------------- |
| Phase 2 設計成果物       | `outputs/phase-2/` ディレクトリ全体                            |
| Phase 7 カバレッジ結果   | `outputs/phase-7/coverage-report.md`                           |
| Phase 9 品質チェック結果 | `outputs/phase-9/` ディレクトリ全体                            |
| 機能仕様書               | `docs/30-workflows/skill-import-agent-system/specification.md` |
| 受け入れ基準             | `index.md` の受け入れ基準セクション                            |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ     | 確認項目                                                          |
| ------------ | ----------------------------------------------------------------- |
| 受け入れ基準 | AC-1〜AC-10 が全て検証可能な状態であること                        |
| テスト網羅性 | コンポーネント間連携の全パスがテストされていること                |
| 既存機能影響 | 既存テスト（StreamingMessage 162 テスト等）が全て PASS であること |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点         | 確認項目                                                  |
| ------------ | --------------------------------------------------------- |
| 設計整合性   | Phase 2 設計通りにコンポーネントが実装されているか        |
| 仕様準拠     | specification.md 4.1/4.4.1/4.7 の仕様に準拠しているか     |
| テスト網羅性 | 受け入れ基準 AC-1〜AC-10 が全てテストでカバーされているか |

## 成果物

| 成果物                 | パス                                               | 種別     |
| ---------------------- | -------------------------------------------------- | -------- |
| 実装レビューレポート   | `outputs/phase-10/implementation-review-report.md` | document |
| テストレビューレポート | `outputs/phase-10/test-review-report.md`           | document |
| 品質統合レポート       | `outputs/phase-10/quality-summary-report.md`       | document |
| 最終ゲート判定結果     | `outputs/phase-10/final-gate-decision.md`          | document |

## 完了条件

- [ ] 全実装ファイルが設計通りに実装されていることが確認されている
- [ ] 仕様書（specification.md）への準拠が確認されている
- [ ] テストの網羅性が確認されている（受け入れ基準 AC-1〜AC-10 カバー）
- [ ] カバレッジ基準が満たされている
- [ ] Phase 9 の品質チェック指摘事項が全て解決されている
- [ ] 最終ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が下されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 実装成果物レビュー
3. タスク2: テスト成果物レビュー
4. タスク3: 品質チェック結果の統合確認
5. タスク4: 最終ゲート判定
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証 → [phase-11-manual-test.md](phase-11-manual-test.md)
