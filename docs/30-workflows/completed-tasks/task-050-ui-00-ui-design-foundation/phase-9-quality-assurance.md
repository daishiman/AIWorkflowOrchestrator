# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 9                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 8（リファクタリング）         |
| 後続Phase | Phase 10（最終レビューゲート）      |

## 目的

実装・テスト・設計の整合性を横断検証し、最終レビューゲートへ出せる品質状態を作る。仕様漏れ、品質劣化、依存欠落を排除する。

## 実行タスク

- 仕様整合検証: Task 1〜6 と実装差分を突合する
- 品質指標検証: テスト結果とカバレッジ基準を確認する
- UX/A11y検証: HIG/WCAG準拠観点を確認する
- リスク整理: 残課題を MINOR/MAJOR に分類する

## 参照資料

| 資料名                 | パス                                                                           | 説明           |
| ---------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`                                    | 仕様突合の基準 |
| Phase 8成果物          | `outputs/phase-8/refactoring-report.md`                                        | 最終実装状態   |
| Phase 7成果物          | `outputs/phase-7/coverage-report.md`                                           | 品質指標       |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | UX判定         |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | QA判定         |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラー契約     |
| green-test-report      | `outputs/phase-5/green-test-report.md`                                         | Phase 5 成果物 |
| implementation-mapping | `outputs/phase-5/implementation-mapping.md`                                    | Phase 5 成果物 |
| regression-report      | `outputs/phase-8/regression-report.md`                                         | Phase 8 成果物 |

## 実行手順

### ステップ1: 仕様突合

タスク原本の要件表と実装結果を1件ずつ突合する。

### ステップ2: 品質評価

試験結果、カバレッジ、静的検証、アクセシビリティ検証を統合評価する。

### ステップ3: リスク分類

残課題を `MAJOR` と `MINOR` に分け、Phase 10判定入力を作成する。

## 統合テスト連携

- 実使用フロー単位で統合試験を再実行する
- 主要導線（検索、カード操作、パネル操作、オフライン復帰）を含める

## 成果物

| 成果物           | パス                                      | 説明       |
| ---------------- | ----------------------------------------- | ---------- |
| 品質検証レポート | `outputs/phase-9/quality-verification.md` | QA結果     |
| リスク台帳       | `outputs/phase-9/qa-risk-register.md`     | 残課題分類 |

## 完了条件

- [ ] Task 1〜6との突合結果が記録されている
- [ ] 品質基準の達成状況が明記されている
- [ ] 残課題が MAJOR/MINOR で分類されている
- [ ] Phase 10へ渡す判定入力が作成済みである
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

Phase 10: 最終レビューゲート
