# Phase 13: PR作成

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 13                                  |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 12（ドキュメント更新）        |
| 後続Phase | 完了                                |

## 目的

提出手順を標準化し、レビュー観点を明確化する。自動コミットや自動PRは実行せず、手動手順のみを定義する。

## 実行タスク

- 変更要約作成: Phase 1〜12の成果を1ページで要約する
- レビュー観点整理: Tokens/Components/A11y/Responsive/Docs同期の確認観点を整理する
- 提出手順明文化: 手動でコミットとPRを行う手順を明記する

## 参照資料

| 資料名                    | パス                                                                                                                 | 説明            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 1成果物             | `outputs/phase-1/acceptance-criteria.md`                                                                             | 要件達成確認    |
| Phase 2成果物             | `outputs/phase-2/architecture-design.md`                                                                             | 設計達成確認    |
| Phase 5成果物             | `outputs/phase-5/implementation-summary.md`                                                                          | 実装達成確認    |
| Phase 6成果物             | `outputs/phase-6/test-expansion-report.md`                                                                           | 試験拡充確認    |
| Phase 7成果物             | `outputs/phase-7/coverage-report.md`                                                                                 | 品質指標確認    |
| Phase 8成果物             | `outputs/phase-8/refactoring-report.md`                                                                              | 改善反映確認    |
| Phase 9成果物             | `outputs/phase-9/quality-verification.md`                                                                            | QA結果確認      |
| Phase 10成果物            | `outputs/phase-10/final-review-result.md`                                                                            | ゲート判定確認  |
| Phase 11成果物            | `outputs/phase-11/manual-test-result.md`                                                                             | 手動検証確認    |
| Phase 12成果物            | `outputs/phase-12/spec-update-summary.md`                                                                            | 最終要約        |
| Phase 12成果物            | `outputs/phase-12/documentation-changelog.md`                                                                        | 変更履歴        |
| PRテンプレート規約        | `.claude/skills/task-specification-creator/references/execute-workflow.md`                                           | 終了手順        |
| 既存タスクインデックス    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md` | 依存確認        |
| remediation-directives    | `outputs/phase-10/remediation-directives.md`                                                                         | Phase 10 成果物 |
| discovered-issues         | `outputs/phase-11/discovered-issues.md`                                                                              | Phase 11 成果物 |
| manual-test-checklist     | `outputs/phase-11/manual-test-checklist.md`                                                                          | Phase 11 成果物 |
| implementation-guide      | `outputs/phase-12/implementation-guide.md`                                                                           | Phase 12 成果物 |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`                                                                      | Phase 12 成果物 |
| skill-feedback-report     | `outputs/phase-12/skill-feedback-report.md`                                                                          | Phase 12 成果物 |

## 実行手順

### ステップ1: 提出前チェック

成果物リンク切れ、Phase漏れ、依存漏れがないことを確認する。

### ステップ2: 手動提出準備

コミットメッセージ案とPR本文案を作成し、レビュー観点を添付する。

### ステップ3: 実行制約の明記

この仕様書作成タスクではコミットとPRを自動実行しない。

## 成果物

| 成果物             | パス                                    | 説明                   |
| ------------------ | --------------------------------------- | ---------------------- |
| PR下書き           | `outputs/phase-13/pr-draft.md`          | 手動提出用テンプレート |
| 提出チェックリスト | `outputs/phase-13/release-checklist.md` | 最終確認項目           |

## 完了条件

- [ ] 手動提出手順が文書化されている
- [ ] レビュー観点が整理されている
- [ ] 自動コミット/自動PRを行わない制約が明記されている
- [ ] Phase 1〜12成果物へのリンクが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                                                   |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| セキュリティ       | 入力検証や権限境界を含む場合         | `.claude/skills/aiworkflow-requirements/references/security-*.md`            |
| UI/UX              | フロントエンド仕様を扱う場合         | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| アーキテクチャ     | 構造や責務分離を扱う場合             | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| API設計            | IPC/API契約に影響する場合            | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| データ整合性       | 永続化や台帳更新を含む場合           | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |
| エラーハンドリング | 失敗時UI/処理を含む場合              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| パフォーマンス     | レンダリングや処理時間要件がある場合 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| アクセシビリティ   | キーボード操作やARIAを扱う場合       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |

| 層                         | 適用判断                    | 仕様参照先                                                                   |
| -------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | UI実装時                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| バックエンド（Main）       | サービス連携がある場合      | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| IPC通信                    | Main-Renderer連携がある場合 | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| Preload/セキュリティ       | API公開面がある場合         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| ローカルストレージ         | 永続化がある場合            | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成し、完了ごとに更新する。

1. 参照資料確認
2. 実行タスク実施
3. 統合テスト連携（Phase 1〜11）
4. 成果物作成・配置
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で完了状態を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js   docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation
```

## 次のPhase

完了（次Phaseなし）
