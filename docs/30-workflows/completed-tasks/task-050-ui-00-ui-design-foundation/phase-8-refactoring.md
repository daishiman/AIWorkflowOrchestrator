# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 8                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 7（テストカバレッジ確認）     |
| 後続Phase | Phase 9（品質保証）                 |

## 目的

動作を変えずに保守性と可読性を高める。共通コンポーネントの責務を整理し、再利用時の理解コストを下げる。

## 実行タスク

- 構造整理: コンポーネント責務を再確認し、分割単位を是正する
- 命名整理: トークン名・Props名・テスト名の命名を統一する
- パフォーマンス整理: 冗長レンダリングを削減し、軽量化する
- 回帰確認: Phase 7時点のテスト群を再実行して同一結果を確認する

## 参照資料

| 資料名                 | パス                                                                                        | 説明                 |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1成果物          | `outputs/phase-1/scope-definition.md`                                                       | スコープ維持の確認元 |
| Phase 2成果物          | `outputs/phase-2/architecture-design.md`                                                    | 設計整合の確認元     |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`                                                 | 実装ベースライン     |
| Phase 6成果物          | `outputs/phase-6/test-expansion-report.md`                                                  | テスト拡充の入力     |
| Phase 7成果物          | `outputs/phase-7/coverage-gap-analysis.md`                                                  | 改善対象             |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | 構造指針             |
| 状態管理指針           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 再レンダリング対策   |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタ方針       |
| green-test-report      | `outputs/phase-5/green-test-report.md`                                                      | Phase 5 成果物       |
| implementation-mapping | `outputs/phase-5/implementation-mapping.md`                                                 | Phase 5 成果物       |
| coverage-report        | `outputs/phase-7/coverage-report.md`                                                        | Phase 7 成果物       |

## 実行手順

### ステップ1: リファクタ対象確定

高頻度変更領域と複雑度が高い領域を対象化する。

### ステップ2: 小単位の改修

1変更ごとにテストを再実行し、回帰を閉じる。

### ステップ3: 反映記録

変更理由、影響範囲、残課題を成果物へ記録する。

## 統合テスト連携

- リファクタ前後で統合テスト結果が一致することを確認する
- パフォーマンス低下が発生していないことを確認する

## 成果物

| 成果物                   | パス                                    | 説明     |
| ------------------------ | --------------------------------------- | -------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 改修内容 |
| 回帰確認ログ             | `outputs/phase-8/regression-report.md`  | 回帰検証 |

## 完了条件

- [ ] 対象領域ごとに改修理由が記録されている
- [ ] 命名と責務境界が統一されている
- [ ] 回帰テストが通過している
- [ ] 品質保証Phaseへ渡す状態が明文化されている
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

Phase 9: 品質保証
