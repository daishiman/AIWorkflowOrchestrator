# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 4                                                                      |
| Phase名    | テスト作成                                                             |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 3                                                                |
| 後続Phase  | Phase 5                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

実装前に失敗するテストを定義し、`SkillId` と `SkillName` の取り違えが検出される状態を作る。

## 背景

Branded Type 導入では型テストが中核。Red テストが不足すると Green 実装後に回帰が検出されない。

## 実行タスク

- SubAgent-A（型テスト）: `SkillId` と `SkillName` の相互代入失敗テストを作成する
- SubAgent-B（UIテスト）: SkillImportDialog の `onImport` 引数型テストを作成する
- SubAgent-C（IPCテスト）: `skill:import` 引数境界テストを作成する
- Lead（統合）: Red 状態を固定し実装順序を確定する

## 参照資料

| 参照資料             | パス                                                                         | 内容           |
| -------------------- | ---------------------------------------------------------------------------- | -------------- |
| 依存Phase 1          | `phase-1-requirements.md`                                                    | 受け入れ基準   |
| 依存Phase 2          | `phase-2-design.md`                                                          | 設計仕様       |
| 依存Phase 3          | `phase-3-design-review.md`                                                   | 修正指摘反映   |
| coverage standards   | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ基準 |
| 要件定義             | `outputs/phase-1/requirements-definition.md`                                 | Phase 1 成果物 |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                        | Phase 1 成果物 |
| 変換境界定義         | `outputs/phase-1/boundary-definition.md`                                     | Phase 1 成果物 |
| SubAgent責務表       | `outputs/phase-1/subagent-team-plan.md`                                      | Phase 1 成果物 |
| 型設計書             | `outputs/phase-2/branded-type-design.md`                                     | Phase 2 成果物 |
| 境界変換設計         | `outputs/phase-2/boundary-conversion-design.md`                              | Phase 2 成果物 |
| IPC整合設計          | `outputs/phase-2/ipc-contract-alignment.md`                                  | Phase 2 成果物 |
| テスト設計マトリクス | `outputs/phase-2/test-matrix.md`                                             | Phase 2 成果物 |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`                                    | Phase 3 成果物 |
| 指摘一覧             | `outputs/phase-3/review-findings.md`                                         | Phase 3 成果物 |
| 是正計画             | `outputs/phase-3/remediation-plan.md`                                        | Phase 3 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容               |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------ |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD 基準           |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | コンポーネント契約 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S14 テスト観点     |

## 実行手順

1. SubAgent-A/B/C がテストケースを並列で追加する（並列）。
2. Lead が重複と漏れを統合し、Red 失敗ログを保存する（直列）。
3. Phase 5 実装対象ファイルをテスト失敗結果から確定する（直列）。

## 統合テスト連携

| 観点    | 連携内容                           |
| ------- | ---------------------------------- |
| 型契約  | 型テストで不一致を強制失敗         |
| UI契約  | SkillImportDialog の呼び出し型確認 |
| IPC契約 | `skill:import` の引数整合確認      |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物         | パス                                        | 説明               |
| -------------- | ------------------------------------------- | ------------------ |
| テスト仕様     | `outputs/phase-4/test-specification.md`     | テスト方針         |
| 型テスト一覧   | `outputs/phase-4/type-test-cases.md`        | 型エラー期待ケース |
| 統合テスト一覧 | `outputs/phase-4/integration-test-cases.md` | UI+IPC 観点        |
| Redログ        | `outputs/phase-4/red-test-log.txt`          | 失敗証跡           |

## 完了条件

- [ ] 型取り違えテストが失敗する状態で存在する
- [ ] UI/IPC 統合観点テストが存在する
- [ ] Redログが保存されている
- [ ] Phase 5 実装対象がテストから逆引き可能である
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
pnpm typecheck
pnpm --filter @repo/desktop test:run
```

- [ ] Red 状態を確認

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 3
- **後続**: Phase 5

## サブタスク管理

- [ ] SubAgent-A/B/C テスト作成
- [ ] Lead Red統合
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 5: [phase-5-implementation.md](phase-5-implementation.md)
