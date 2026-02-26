# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 6                                                                      |
| Phase名    | テスト拡充                                                             |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 5                                                                |
| 後続Phase  | Phase 7                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

回帰を防ぐ追加テストを作成し、境界変換の破壊変更を検出可能にする。

## 背景

Branded Type 導入後は型アサーション回避コードの混入が回帰要因になる。否定条件とエッジケースを拡充する。

## 実行タスク

- SubAgent-A（型拡充）: Brand 型の誤用ケーステストを追加する
- SubAgent-B（UI拡充）: SkillImportDialog の選択/変換境界テストを追加する
- SubAgent-C（IPC拡充）: `skillName.trim()` バリデーション関連テストを追加する
- Lead（統合）: 回帰シナリオを統合し優先度を付与する

## 参照資料

| 参照資料       | パス                                        | 内容                 |
| -------------- | ------------------------------------------- | -------------------- |
| 依存Phase 5    | `phase-5-implementation.md`                 | 実装結果             |
| 依存Phase 4    | `phase-4-test-creation.md`                  | Red テストの初期設計 |
| テスト仕様     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物       |
| 型テスト一覧   | `outputs/phase-4/type-test-cases.md`        | Phase 4 成果物       |
| 統合テスト一覧 | `outputs/phase-4/integration-test-cases.md` | Phase 4 成果物       |
| Redログ        | `outputs/phase-4/red-test-log.txt`          | Phase 4 成果物       |
| 実装ログ       | `outputs/phase-5/implementation-log.md`     | Phase 5 成果物       |
| 変更ファイル表 | `outputs/phase-5/change-file-matrix.md`     | Phase 5 成果物       |
| Greenログ      | `outputs/phase-5/green-test-log.txt`        | Phase 5 成果物       |
| 型適用マップ   | `outputs/phase-5/type-application-map.md`   | Phase 5 成果物       |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容           |
| -------------------------- | --------------------------------------------------------------------------------- | -------------- |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト階層     |
| security-skill-ipc         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | 入力検証テスト |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI契約         |

## 実行手順

1. SubAgent-A/B/C がテスト追加を並列実行する（並列）。
2. Lead が失敗時ログを分類して回帰カテゴリを確定する（直列）。
3. 追加テストの優先順位を定義する（直列）。

## 統合テスト連携

| 観点        | 連携内容                     |
| ----------- | ---------------------------- |
| 型誤用防止  | 誤キャスト混入検出           |
| UI回帰防止  | `selectedIds` 変換の回帰検出 |
| IPC回帰防止 | 空文字・trim ケース検出      |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| 拡張テスト結果 | `outputs/phase-6/test-expansion-result.md` | 追加テスト実行結果 |
| 回帰ケース表   | `outputs/phase-6/regression-case-table.md` | 回帰観点一覧       |
| 失敗分析       | `outputs/phase-6/failure-analysis.md`      | 失敗原因分類       |

## 完了条件

- [ ] 型誤用の否定条件テストが追加されている
- [ ] UI 境界変換の回帰テストが追加されている
- [ ] IPC 入力検証の回帰テストが追加されている
- [ ] 失敗分析が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 5
- **後続**: Phase 7

## サブタスク管理

- [ ] SubAgent-A/B/C テスト拡充
- [ ] Lead 統合
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 7: [phase-7-coverage-check.md](phase-7-coverage-check.md)
