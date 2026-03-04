# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 7                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 6（テスト拡充）               |
| 後続Phase | Phase 8（リファクタリング）         |

## 目的

拡充後テストのカバレッジを計測し、基準値に達していない対象を特定する。改善対象をPhase 8へ渡し、品質ゲート通過率を高める。

## 実行タスク

- カバレッジ計測: line/branch/function を計測する
- 低カバレッジ解析: 未到達分岐と未試験コンポーネントを抽出する
- 改善計画作成: Phase 8で処理する対象を優先順に並べる

## 参照資料

| 資料名                | パス                                                                              | 説明               |
| --------------------- | --------------------------------------------------------------------------------- | ------------------ |
| Phase 5成果物         | `outputs/phase-5/green-test-report.md`                                            | 計測対象の確定情報 |
| Phase 6成果物         | `outputs/phase-6/test-expansion-report.md`                                        | 試験対象           |
| 品質基準              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 閾値定義           |
| テストパターン        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 追加試験方式       |
| Phase実行ガイド       | `.claude/skills/task-specification-creator/references/coverage-standards.md`      | カバレッジ判定方式 |
| additional-test-cases | `outputs/phase-6/additional-test-cases.md`                                        | Phase 6 成果物     |
| test-execution-log    | `outputs/phase-6/test-execution-log.md`                                           | Phase 6 成果物     |

## 実行手順

### ステップ1: 計測実行

対象パッケージ単位でカバレッジを取得し、メトリクスを保存する。

### ステップ2: ギャップ抽出

閾値未達ファイルを抽出し、原因を分類する。

### ステップ3: 改善計画化

未達項目を Phase 8 のリファクタリング計画へ接続する。

## 統合テスト連携

- 統合試験ケースがカバレッジへ寄与しているか確認する
- UI基盤の主要導線（テーマ、検索、カード、パネル）が計測対象に含まれることを確認する

## 成果物

| 成果物             | パス                                       | 説明     |
| ------------------ | ------------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | 計測結果 |
| 未達分析           | `outputs/phase-7/coverage-gap-analysis.md` | 改善対象 |

## 完了条件

- [ ] line/branch/function の値が記録されている
- [ ] 閾値未達箇所が一覧化されている
- [ ] Phase 8へ渡す改善計画が作成されている
- [ ] 統合試験との対応関係が確認されている
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

Phase 8: リファクタリング
