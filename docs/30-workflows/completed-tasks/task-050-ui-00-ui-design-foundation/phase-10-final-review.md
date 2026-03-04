# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 10                                  |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 9（品質保証）                 |
| 後続Phase | Phase 11（手動テスト検証）          |

## 目的

Phase 9の品質結果を最終審査し、手動テスト実施可否を決定する。重大な仕様不整合が残る場合は前Phaseへ戻す。

## 実行タスク

- 審査実行: 品質レポートとリスク台帳をレビューする
- 判定実行: `PASS` / `MINOR` / `MAJOR` を決定する
- 是正指示: 戻し先Phaseと修正対象を明示する

## 参照資料

| 資料名                   | パス                                                                           | 説明           |
| ------------------------ | ------------------------------------------------------------------------------ | -------------- |
| Phase 1成果物            | `outputs/phase-1/acceptance-criteria.md`                                       | 要件判定の基準 |
| Phase 2成果物            | `outputs/phase-2/architecture-design.md`                                       | 設計判定の基準 |
| Phase 5成果物            | `outputs/phase-5/implementation-summary.md`                                    | 実装判定の基準 |
| Phase 9成果物            | `outputs/phase-9/quality-verification.md`                                      | 品質判定入力   |
| Phase 9成果物            | `outputs/phase-9/qa-risk-register.md`                                          | リスク判定入力 |
| レビューゲート基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定ルール     |
| 品質標準                 | `.claude/skills/task-specification-creator/references/quality-standards.md`    | 完了品質の定義 |
| requirements-definition  | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物 |
| scope-definition         | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物 |
| integration-design-notes | `outputs/phase-2/integration-design-notes.md`                                  | Phase 2 成果物 |
| subagent-assignment      | `outputs/phase-2/subagent-assignment.md`                                       | Phase 2 成果物 |
| green-test-report        | `outputs/phase-5/green-test-report.md`                                         | Phase 5 成果物 |
| implementation-mapping   | `outputs/phase-5/implementation-mapping.md`                                    | Phase 5 成果物 |
| coverage-gap-analysis    | `outputs/phase-7/coverage-gap-analysis.md`                                     | Phase 7 成果物 |
| coverage-report          | `outputs/phase-7/coverage-report.md`                                           | Phase 7 成果物 |
| refactoring-report       | `outputs/phase-8/refactoring-report.md`                                        | Phase 8 成果物 |
| regression-report        | `outputs/phase-8/regression-report.md`                                         | Phase 8 成果物 |

## 実行手順

### ステップ1: 判定前チェック

MAJOR候補、MINOR候補、保留項目を分類する。

### ステップ2: ゲート判定

判定理由と戻し条件を文書化する。

### ステップ3: 次Phase入力作成

Phase 11手動テストの対象範囲と除外範囲を固定する。

## 統合テスト連携

- 直近統合テストの結果を判定根拠に含める
- 失敗再現手順をレビュー成果物へ記録する

## 成果物

| 成果物           | パス                                         | 説明       |
| ---------------- | -------------------------------------------- | ---------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`    | ゲート判定 |
| 是正指示書       | `outputs/phase-10/remediation-directives.md` | 戻し条件   |

## 完了条件

- [ ] ゲート判定が PASS/MINOR/MAJOR で記録されている
- [ ] 判定根拠が追跡可能である
- [ ] 戻し条件が明文化されている
- [ ] Phase 11対象範囲が固定されている
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

Phase 11: 手動テスト検証
