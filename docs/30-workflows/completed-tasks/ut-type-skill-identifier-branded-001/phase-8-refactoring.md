# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 8                                                                      |
| Phase名    | リファクタリング                                                       |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 7                                                                |
| 後続Phase  | Phase 9                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

重複変換や過剰アサーションを削減し、型境界を単純化する。

## 背景

Branded Type 導入直後は `as` キャストが散在しやすい。再発防止の観点から変換点を集約する。

## 実行タスク

- SubAgent-A（shared整理）: 変換関数の責務を整理する
- SubAgent-B（renderer整理）: UI 側の重複変換を削減する
- SubAgent-C（main/preload整理）: IPC 境界の変換責務を整理する
- Lead（統合）: リファクタ後の回帰確認を統合する

## 参照資料

| 参照資料           | パス                                           | 内容           |
| ------------------ | ---------------------------------------------- | -------------- |
| 依存Phase 1        | `phase-1-requirements.md`                      | 元要件         |
| 依存Phase 2        | `phase-2-design.md`                            | 設計           |
| 依存Phase 5        | `phase-5-implementation.md`                    | 実装           |
| 依存Phase 6        | `phase-6-test-expansion.md`                    | 拡張テスト     |
| 依存Phase 7        | `phase-7-coverage-check.md`                    | 未達項目       |
| 実装ログ           | `outputs/phase-5/implementation-log.md`        | Phase 5 成果物 |
| 変更ファイル表     | `outputs/phase-5/change-file-matrix.md`        | Phase 5 成果物 |
| Greenログ          | `outputs/phase-5/green-test-log.txt`           | Phase 5 成果物 |
| 型適用マップ       | `outputs/phase-5/type-application-map.md`      | Phase 5 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`           | Phase 7 成果物 |
| 未網羅一覧         | `outputs/phase-7/uncovered-items.md`           | Phase 7 成果物 |
| 要件追跡表         | `outputs/phase-7/requirements-traceability.md` | Phase 7 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容         |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------ |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | パターン準拠 |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 契約維持     |
| patterns                             | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | 再発防止観点 |

## 実行手順

1. SubAgent-A/B/C が候補抽出を並列実行する（並列）。
2. Lead が優先度順にリファクタ対象を決定する（直列）。
3. 回帰テストで差分を確認する（直列）。

## 統合テスト連携

| 観点     | 連携内容                   |
| -------- | -------------------------- |
| 変換集約 | 変換点の単一化確認         |
| 型維持   | Branded Type 契約維持確認  |
| 回帰     | Phase 6 テスト群で回帰確認 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物         | パス                                       | 説明       |
| -------------- | ------------------------------------------ | ---------- |
| リファクタログ | `outputs/phase-8/refactoring-log.md`       | 変更理由   |
| 回帰確認       | `outputs/phase-8/regression-check.md`      | テスト結果 |
| 技術負債更新   | `outputs/phase-8/technical-debt-update.md` | 残課題整理 |

## 完了条件

- [ ] 重複変換の削減内容が記録されている
- [ ] リファクタ後の回帰確認が完了している
- [ ] 残課題が整理されている
- [ ] Phase 9 の品質監査に必要な情報が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
pnpm typecheck
pnpm --filter @repo/desktop test:run
```

- [ ] Refactor 後 Green を確認

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 7
- **後続**: Phase 9

## サブタスク管理

- [ ] SubAgent-A/B/C 実施
- [ ] Lead 統合
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 9: [phase-9-quality-assurance.md](phase-9-quality-assurance.md)
