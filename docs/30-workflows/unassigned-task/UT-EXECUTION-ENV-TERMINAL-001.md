# 未タスク指示書: UT-EXECUTION-ENV-TERMINAL-001

## メタ情報

```yaml
issue_number: 1456
```

## メタ情報

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | UT-EXECUTION-ENV-TERMINAL-001                                          |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計 GAP（P62 対策） |
| ステータス | unassigned                                                             |
| 優先度     | high（P62 対策）                                                       |
| 作成日     | 2026-03-22                                                             |
| 関連仕様書 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md          |

## 目的

`ExecutionEnvironment.terminal` の placeholder 実装を本実装に移行し、`assertNoSilentFallback` により `DEFAULT_CONFIG` への暗黙 fallback が発生しないことを保証する。

## 背景

Phase 2 設計で P62（DEFAULT_CONFIG への暗黙 fallback）を防ぐための `assertNoSilentFallback()` ガードを定義した。しかし `ExecutionEnvironment.terminal` は現状 placeholder（または未実装）のため、未選択時に暗黙的に `DEFAULT_CONFIG` を使って実行されるリスクがある。これは P62 対策の設計意図を実装で実現するタスク。

## 実行タスク

1. `ExecutionEnvironment.terminal` の現在の実装を調査する（placeholder か本実装か）
2. Provider/Model が未選択時に `DEFAULT_CONFIG` fallback が発生しないことを確認する
3. `assertNoSilentFallback()` ガードを `ExecutionEnvironment.terminal` に適用する
4. 未選択時のエラー処理を実装する（エラー表示またはセレクター画面へのリダイレクト）
5. `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に terminal の `assertNoSilentFallback` 仕様を追記する
6. unit test でガードの動作を検証する

## 参照資料

| 参照資料                                                   | パス                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| design-summary.md                                          | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md        |
| implementation-guide.md                                    | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md |
| interfaces-agent-sdk-skill-reference-share-debug-analytics | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md     |

## 受入基準

- [ ] `ExecutionEnvironment.terminal` が本実装になっている（placeholder でない）
- [ ] Provider/Model 未選択時に `DEFAULT_CONFIG` へ fallback しない（エラーまたは画面遷移）
- [ ] `assertNoSilentFallback()` ガードが実装されている
- [ ] unit test でガード動作（fallback が発生しないこと）が検証されている

## 注意事項

- P62 対策（最重要）: Provider/Model が未選択の場合はエラー表示またはセレクター画面リダイレクト。fallback は一切行わない
- P50 対策: Phase 4 開始前に既存実装の調査を行い、既実装ガードがある場合は「検証・補完」モードに切り替える
- `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/` で fallback 箇所を特定してから実装する
