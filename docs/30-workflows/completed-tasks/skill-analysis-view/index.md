# TASK-10A-B - SkillAnalysisView タスク実行仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | TASK-10A-B                            |
| 機能名     | SkillAnalysisView（スキル分析ビュー） |
| 作成日     | 2026-03-02                            |
| ステータス | 仕様作成完了                          |
| 総Phase数  | 13                                    |

---

## タスク概要

スキルの品質を定量的に分析し、改善提案を確認・適用できるReact UIコンポーネント（SkillAnalysisView）を実装する。バックエンド（TASK-9C: SkillAnalyzer/SkillImprover）が提供するAPIをUIから利用可能にする。

### 依存関係マップ

| 依存先       | タスクID   | 状態   | 依存内容                                 |
| ------------ | ---------- | ------ | ---------------------------------------- |
| バックエンド | TASK-9C    | 完成済 | SkillAnalyzer/SkillImprover サービス実装 |
| 型定義       | TASK-9C    | 完成済 | skill-improver.ts の型定義               |
| IPCチャネル  | TASK-9C    | 完成済 | skill:analyze/improve/optimize 定義済み  |
| デザイン基盤 | TASK-UI-00 | 完成済 | デザイントークン（CSS変数）              |
| 並列         | TASK-10A-A | 進行中 | SkillManagementPanel（独立実装可能）     |
| ブロック先   | TASK-10A-D | 未着手 | 統合タスク（本タスク完了後に開始）       |

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | 仕様作成済 |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | 仕様作成済 |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | 仕様作成済 |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | 仕様作成済 |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | 仕様作成済 |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 仕様作成済 |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 仕様作成済 |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | 仕様作成済 |
| 9     | 品質検証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 仕様作成済 |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | 仕様作成済 |
| 11    | 手動テスト         | [phase-11-manual-test.md](phase-11-manual-test.md)           | 仕様作成済 |
| 12    | ドキュメント       | [phase-12-documentation.md](phase-12-documentation.md)       | 仕様作成済 |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 仕様作成済 |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

### 並列実行ガイド

| グループ | Phase      | 並列可否 | 備考                               |
| -------- | ---------- | -------- | ---------------------------------- |
| A        | Phase 1-3  | 逐次     | 要件→設計→レビューの依存あり       |
| B        | Phase 4-7  | 逐次     | テスト→実装→拡充→確認の依存あり    |
| C        | Phase 8-10 | 逐次     | リファクタ→品質→レビューの依存あり |
| D        | Phase 11   | 独立     | 手動テストはPhase 10完了後         |
| E        | Phase 12   | 独立     | ドキュメントはPhase 11完了後       |
| F        | Phase 13   | 独立     | PRはPhase 12完了後                 |

---

## 主要技術要素

| 要素               | 詳細                                                        |
| ------------------ | ----------------------------------------------------------- |
| コンポーネント構成 | SkillAnalysisView(organism) + 6 molecule サブコンポーネント |
| 状態管理           | useSkillAnalysis カスタムフック + useState ローカル状態     |
| IPC チャネル       | skill:analyze / skill:improve / skill:optimize（定義済み）  |
| デザイン           | CSS変数ベース、Apple HIG準拠、WCAG 2.1 AA                   |
| テスト環境         | happy-dom + fireEvent（P39準拠）                            |
| Pitfall対策        | P31/P39/P42/P44/P45/P46/P47                                 |

## aiworkflow-requirements 抽出カバレッジマップ

| 観点                 | 主仕様（正本）                                                                         | 補助仕様（必要時）                                                                 | 反映Phase     |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------- |
| UI/UX                | `ui-ux-components.md`, `ui-ux-design-system.md`, `ui-ux-design-principles.md`          | `ui-ux-feature-components.md`, `arch-ui-components.md`                             | 1,2,5,11      |
| IPC/API契約          | `api-core.md`, `api-endpoints.md`, `api-ipc-agent.md`                                  | `interfaces-agent-sdk-skill.md`, `security-api-electron.md`                        | 1,2,5,10      |
| セキュリティ         | `security-electron-ipc.md`, `security-skill-ipc.md`                                    | `security-principles.md`, `error-handling.md`                                      | 1,2,5,9,10    |
| 状態管理/設計        | `arch-state-management.md`, `architecture-overview.md`                                 | `architecture-patterns.md`, `architecture-implementation-patterns.md`              | 1,2,8         |
| テスト/品質          | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md` | `testing-fixtures.md`, `task-workflow.md`                                          | 1,4,6,7,11,13 |
| Phase 12仕様更新運用 | `task-specification-creator: spec-update-workflow.md`                                  | `aiworkflow-requirements: task-workflow.md`, `topic-map.md`, `LOGS.md`, `SKILL.md` | 12            |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: Phase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/skill-analysis-view --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```
