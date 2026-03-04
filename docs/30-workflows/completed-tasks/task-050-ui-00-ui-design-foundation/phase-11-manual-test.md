# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 11                                  |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 10（最終レビューゲート）      |
| 後続Phase | Phase 12（ドキュメント更新）        |

## 目的

UI共通基盤の実機挙動を検証し、机上検証で見えない課題を抽出する。テーマ表示、レスポンシブ、操作導線、アクセシビリティ、エラー表示を実運用視点で検証する。

## 実行タスク

- シナリオ実行: テーマ、コンポーネント、レスポンシブ、操作系の手動ケースを実行する
- 証跡収集: 画面キャプチャと判定ログを収集する
- 課題分類: 発見事項をスコープ内/スコープ外へ分類する

## 参照資料

| 資料名                 | パス                                                                                                      | 説明            |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 1成果物          | `outputs/phase-1/acceptance-criteria.md`                                                                  | 手動判定基準    |
| Phase 2成果物          | `outputs/phase-2/architecture-design.md`                                                                  | UI構成確認      |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`                                                               | 実装確認        |
| Phase 6成果物          | `outputs/phase-6/test-expansion-report.md`                                                                | 試験拡充確認    |
| Phase 7成果物          | `outputs/phase-7/coverage-report.md`                                                                      | カバレッジ確認  |
| Phase 8成果物          | `outputs/phase-8/refactoring-report.md`                                                                   | 変更履歴確認    |
| Phase 9成果物          | `outputs/phase-9/quality-verification.md`                                                                 | QA確認          |
| Phase 10成果物         | `outputs/phase-10/final-review-result.md`                                                                 | 手動試験対象    |
| タスク原本             | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md` | 期待仕様        |
| スクリーンショット手順 | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`               | 証跡取得手順    |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                            | 観点基準        |
| アクセシビリティ基準   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                              | 手動観点        |
| remediation-directives | `outputs/phase-10/remediation-directives.md`                                                              | Phase 10 成果物 |

## 実行手順

### ステップ1: 手動試験ケース準備

TC-IDごとに期待表示、期待操作、期待エラー表示を定義する。

### ステップ2: SubAgent分担で検証

- SubAgent A: テーマとデザイントークン検証
- SubAgent B: コンポーネント操作検証
- SubAgent C: レスポンシブ検証
- SubAgent D: キーボード操作とアクセシビリティ検証

### ステップ3: 統合結果作成

検証結果、証跡、発見課題を1つの結果表へ統合する。

## 統合テスト連携

- 自動試験では扱わない視覚差分を手動で検証する
- 手動で発見した課題を自動試験へ逆流させる候補を明記する

## 成果物

| 成果物                   | パス                                        | 説明       |
| ------------------------ | ------------------------------------------- | ---------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | ケース定義 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 判定結果   |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 課題分類   |

## 完了条件

- [ ] テーマ・レスポンシブ・A11yの手動ケースが実行されている
- [ ] 画面証跡と判定ログが紐付いている
- [ ] 発見課題が分類されている
- [ ] Phase 12へ反映入力が作成されている
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

Phase 12: ドキュメント更新
