# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 3                                                      |
| 機能名     | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001             |
| タスク名   | auth-key IPCハンドラ登録漏れとライフサイクル整合の修正 |
| 前提Phase  | Phase 2                                                |
| 後続Phase  | Phase 4                                                |
| 作成日     | 2026-03-05                                             |
| ステータス | pending                                                |

## 目的

設計の矛盾・漏れ・整合・依存をゲートで判定する。

## 背景

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 矛盾レビュー: 20思考法の観点で設計矛盾を検査する
- 漏れレビュー: 要件から設計への未反映項目を検査する
- ゲート判定: Go/No-Goと是正タスクを判定する

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`                     | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-N/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- auth-key:set / auth-key:exists / auth-key:validate / auth-key:delete を統合対象に固定する。
- Main登録完了時刻とRenderer呼び出し時刻をログで突合する。
- 再登録シナリオで `No handler registered` を再発させない。
- 統合ログは `outputs/phase-3/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物           | パス                                         | 説明         |
| ---------------- | -------------------------------------------- | ------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー記録 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | Go/No-Go判定 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

## 次のPhase

Phase 4: テスト作成
