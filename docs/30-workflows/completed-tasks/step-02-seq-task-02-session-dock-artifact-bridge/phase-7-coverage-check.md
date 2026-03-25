# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| Phase名    | カバレッジ確認                            |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 4-6                                 |
| 後続Phase  | Phase 8（リファクタリング）               |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

AC-1〜AC-5 と session lifecycle 全体の coverage を確認する。

## 実行タスク

- AC coverage
- session lifecycle coverage
- share coverage
- artifact priority coverage

## 参照資料

| 参照資料       | パス                              | 内容                         |
| -------------- | --------------------------------- | ---------------------------- |
| Phase 5 成果物 | `phase-5-implementation.md`       | 実装計画（依存Phase）        |
| Phase 6 成果物 | `phase-6-test-expansion.md`       | 回帰テスト拡張（依存Phase）  |
| root pack      | `../../phase-7-coverage-check.md` | 親パックのカバレッジ確認仕様 |

## 実行手順

### ステップ1: AC-1〜AC-5 と session lifecycle 全体の coverage を計測する

```bash
pnpm --filter @repo/desktop exec vitest run --coverage
```

### ステップ2: カバレッジ基準の充足を判定する

Line Coverage 80%以上、Branch Coverage 60%以上を確認する。

## 統合テスト連携

session lifecycle 全体が統合テストの coverage 対象になっていることを確認する。

## 成果物

| 成果物           | パス                                  | 説明          |
| ---------------- | ------------------------------------- | ------------- |
| coverage targets | `outputs/phase-7/coverage-targets.md` | coverage 目標 |
| integration gate | `outputs/phase-7/integration-gate.md` | gate 判定     |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 完了条件

- [ ] session lifecycle 全体が coverage 対象になっている
- [ ] AC-1〜AC-5 の coverage が可視化されている
- [ ] share と artifact priority の coverage がある
- [ ] Line Coverage 80%以上（推奨90%以上）を達成している
- [ ] Branch Coverage 60%以上（推奨70%以上）を達成している
- [ ] 未達の場合は Phase 6 に戻ってテストを拡充する
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
