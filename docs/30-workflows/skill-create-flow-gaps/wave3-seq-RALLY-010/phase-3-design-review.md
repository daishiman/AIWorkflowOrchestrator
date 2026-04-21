# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 3                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 2                  |
| 後続Phase  | Phase 4                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

Phase 2 の設計に矛盾・漏れ・整合不備がないかをゲートで判定し、Go/No-Go を確定する。

## 直列/並列情報

- Phase 3 は Phase 2 の成果物を入力とするため**直列実行**
- Go 判定の場合のみ Phase 4 に進む

## 実行タスク

- 矛盾レビュー: `isRallyCompleted` 判定ロジックと3分岐レンダリングに矛盾がないか確認する
- 漏れレビュー: AC-1〜AC-6 がすべて設計に反映されているか確認する
- ゲート判定: Go/No-Go と是正タスクを判定する

## 参照資料

| 資料名                 | パス                                         | 説明           |
| ---------------------- | -------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| workflowSnapshot型調査 | `outputs/phase-1/snapshot-type-analysis.md`  | Phase 1 成果物 |
| UI設計書               | `outputs/phase-2/ui-design.md`               | Phase 2 成果物 |
| 変更差分設計           | `outputs/phase-2/change-diff-design.md`      | Phase 2 成果物 |

## チェック観点

| 観点     | 確認内容                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | `isRallyCompleted` の判定条件と `pendingRequest` 優先ルールに矛盾がないか |
| 漏れ     | AC-1〜AC-6 すべてが設計に反映されているか                                 |
| 整合性   | `data-testid` 命名が仕様・テスト設計と一致しているか                      |
| 依存関係 | RALLY-002 完了後の前提が設計に組み込まれているか                          |

## 成果物

| 成果物           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー記録  |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | Go/No-Go 判定 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果  |

## 完了条件

- [ ] 設計レビュー結果が作成されていること
- [ ] Go/No-Go 判定が明記されていること
- [ ] MAJOR 指摘がある場合は Phase 2 への戻りタスクが定義されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 4: テスト作成
