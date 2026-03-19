# UT-TASK06-002 apiKey.validate() デバウンス完全実装

## メタ情報

```yaml
issue_number: 1352
```

## メタ情報

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | UT-TASK06-002                                                                   |
| タイトル       | apiKey.validate() デバウンス完全実装                                            |
| ステータス     | 未実施                                                                          |
| 優先度         | 低                                                                              |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-02 / Phase 11 DI-0003 |
| 発見日         | 2026-03-17                                                                      |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`    |
| 担当想定       | Renderer / UX                                                                   |

## 1. なぜこのタスクが必要か（Why）

API キー検証が入力ごとに過剰発火すると、UX 劣化と不要な検証負荷を招く。デバウンスを完全実装し、入力体験を安定させる必要がある。

## 2. 何を達成するか（What）

apiKey.validate() が適切な待機時間とキャンセル制御を持ち、不要な多重検証を起こさない状態を作る。

## 3. どのように実行するか（How）

- 入力イベントと検証発火タイミングを整理する
- debounce と in-flight request cancel を両立させる
- UI 状態表示とエラーハンドリングを整える

## 4. 実行手順

1. 現行の validate 呼び出し箇所を確認する。
2. debounce 条件と待機時間を決める。
3. 中断可能な検証フローを実装する。
4. 連続入力時の UI 表示を調整する。

## 5. 完了条件チェックリスト

- 連続入力で検証が過剰発火しない
- 最新入力のみが有効になる
- UX 上の loading / success / error 表示が破綻しない

## 6. 検証方法

- 連続入力シナリオで validate 呼び出し回数を確認する
- 旧入力の検証結果が UI を上書きしないことを確認する

## 7. リスクと対策

- debounce で反応が遅く感じる: 待機時間を最小限にする
- race condition が残る: 最新リクエストのみ反映するガードを入れる

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

機能追加ではなく入力体験と無駄な検証呼び出しの最適化タスクである。
