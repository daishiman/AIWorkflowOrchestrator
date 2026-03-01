# IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| タスク名     | IPCハンドラ単位カバレッジ測定基盤構築    |
| 分類         | 改善                                     |
| 対象機能     | テスト基盤 / カバレッジ計測              |
| 優先度       | 中                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | Phase 1〜12 完了（Phase 13 は未実施）    |
| 発見元       | Phase 7（カバレッジ確認）/ Phase 12      |
| 発見日       | 2026-02-21                               |
| Issue        | #854                                     |

## 目的

`skillHandlers.ts` のような複数ハンドラを含むファイルに対して、ハンドラ単位でカバレッジを計測・レポートする基盤を構築し、Phase 7 の判定基準を明確化する。

## 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001 タスクの Phase 7 で、`skillHandlers.ts` のカバレッジ数値に大きな乖離が判明した。ファイル全体のカバレッジ（Lines 45.14%）は基準未達だが、修正対象の `skill:remove` ハンドラは事実上100%カバーされていた。この判定プロセスは属人的であり、標準化されたルールが存在しない。

## スコープ

### 含むもの

- ハンドラ単位カバレッジ集計スクリプトの設計・実装・テスト
- `skillHandlers.ts` を対象とした集計スクリプトの動作検証
- Phase 7 カバレッジ判定ルールの策定・文書化
- Phase 7 テンプレートへの「ハンドラ単位カバレッジレポート」セクション追加

### 含まないもの

- `skillHandlers.ts` のファイル分割（UT-FIX-7-1-002 のスコープ）
- `skillHandlers.ts` 内の skill:remove 以外のハンドラへのテスト追加
- Vitest 本体のカスタムレポータープラグイン作成
- 他の IPC ハンドラファイル（`authHandlers.ts` 等）へのスクリプト適用

## Phase構成

| Phase | 名称                 | 仕様書                       |
| ----- | -------------------- | ---------------------------- |
| 1     | 要件定義             | phase-1-requirements.md      |
| 2     | 設計                 | phase-2-design.md            |
| 3     | 設計レビューゲート   | phase-3-design-review.md     |
| 4     | テスト作成           | phase-4-test-creation.md     |
| 5     | 実装                 | phase-5-implementation.md    |
| 6     | テスト拡充           | phase-6-test-expansion.md    |
| 7     | テストカバレッジ確認 | phase-7-coverage-check.md    |
| 8     | リファクタリング     | phase-8-refactoring.md       |
| 9     | 品質保証             | phase-9-quality-assurance.md |
| 10    | 最終レビューゲート   | phase-10-final-review.md     |
| 11    | 手動テスト検証       | phase-11-manual-test.md      |
| 12    | ドキュメント更新     | phase-12-documentation.md    |
| 13    | PR作成               | phase-13-pr-creation.md      |

## 成果物一覧

| 成果物                                | 説明                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `scripts/coverage-by-handler.ts`      | v8 カバレッジ JSON を解析してハンドラ単位のカバレッジを算出するスクリプト         |
| `scripts/coverage-by-handler.test.ts` | 集計スクリプトのユニットテスト                                                    |
| Phase 7 判定ルール文書                | `references/quality-requirements.md` に追記                                       |
| Phase 7 テンプレート更新              | ハンドラ単位カバレッジレポートセクションの追加                                    |
| Phase 12 成果物                       | implementation-guide.md, documentation-changelog.md, unassigned-task-detection.md |

## 依存タスク

| タスクID                          | 関係   | 状況   | 説明                                                 |
| --------------------------------- | ------ | ------ | ---------------------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 先行   | 完了   | 本タスクの発見元。Phase 7 でカバレッジ乖離を確認     |
| UT-FIX-7-1-002                    | 並行可 | 未着手 | ファイル分割アプローチ。本タスクとは独立して実施可能 |

## 参照資料

| ドキュメント     | パス                                                                              | 参照理由                         |
| ---------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| タスク指示書     | `docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md` | 元のタスク指示書（完了移管済み） |
| skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | 集計スクリプトの対象ファイル     |
| カバレッジ基準   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ閾値の定義             |
| P41 記録         | `.claude/rules/06-known-pitfalls.md#P41`                                          | v8 インライン関数カウントの教訓  |
| P40 記録         | `.claude/rules/06-known-pitfalls.md#P40`                                          | テスト実行ディレクトリ依存の教訓 |

## aiworkflow-requirements 抽出マトリクス

| 関心ごと        | 必須仕様書                      | 主な用途                                    |
| --------------- | ------------------------------- | ------------------------------------------- |
| 品質ゲート      | `quality-requirements.md`       | Rule-1〜4 とカバレッジ閾値の正本参照        |
| IPC契約         | `api-ipc-agent.md`              | `skill:*` チャンネル契約確認                |
| Skill型契約     | `interfaces-agent-sdk-skill.md` | 型/戻り値/APIシグネチャ整合                 |
| IPCセキュリティ | `security-electron-ipc.md`      | sender検証・登録ライフサイクル要件          |
| 異常系仕様      | `error-handling.md`             | エラーメッセージと終了コード要件            |
| Main責務分離    | `arch-electron-services.md`     | Main Process責務境界の確認                  |
| IPC登録パターン | `arch-ipc-persistence.md`       | `register*Handlers` 配線漏れ防止            |
| IPC契約監査     | `ipc-contract-checklist.md`     | チャンネル/引数/戻り値/エラー契約の監査観点 |
| Phase運用ルール | `task-workflow-rules.md`        | Rule-3未タスク運用とPhaseゲート要件の確認   |

### SubAgentチーム編成

- SubAgent-A（品質/判定）: quality + implementation patterns を担当
- SubAgent-B（IPC契約）: api-ipc-agent + interfaces-agent-sdk-skill + ipc-contract-checklist を担当
- SubAgent-C（セキュリティ/異常系）: security-electron-ipc + error-handling を担当
- SubAgent-D（配線/アーキテクチャ）: arch-electron-services + arch-ipc-persistence を担当
- SubAgent-E（運用ルール）: task-workflow + task-workflow-rules を担当
