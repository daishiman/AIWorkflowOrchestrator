# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 3                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 2            |
| 後続Phase  | Phase 4            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

Phase 2 の設計に矛盾・漏れ・整合不備がないかをゲートで判定し、Go/No-Go を確定する。

## チェック観点

| 観点   | 確認内容                                                                                    |
| ------ | ------------------------------------------------------------------------------------------- |
| 矛盾   | `localError` 表示中に通常の入力エリアが隠れる制御と既存4分岐（RALLY-010/011）が矛盾しないか |
| 漏れ   | AC-1〜AC-9 がすべて設計に反映されているか                                                   |
| 整合性 | RALLY-011 の `activeSnapshot` 参照と `submitAnswer` の変更が整合しているか                  |
| 副作用 | `onReset` が未定義のとき「最初からやり直す」ボタンが表示されないことが設計されているか      |

## 参照資料

| 資料名         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`  | Phase 1 成果物 |
| 回復導線設計書 | `outputs/phase-2/recovery-flow-design.md` | Phase 2 成果物 |
| 変更差分設計   | `outputs/phase-2/change-diff-design.md`   | Phase 2 成果物 |

## 成果物

| 成果物           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー記録  |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | Go/No-Go 判定 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果  |

## 完了条件

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
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase 4: テスト作成
