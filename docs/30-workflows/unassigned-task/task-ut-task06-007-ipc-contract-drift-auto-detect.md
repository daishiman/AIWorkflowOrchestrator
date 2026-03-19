# UT-TASK06-007 IPC 契約ドリフト自動検出スクリプト

## メタ情報

```yaml
issue_number: 1357
```

## メタ情報

| 項目           | 内容                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| タスクID       | UT-TASK06-007                                                                |
| タイトル       | IPC 契約ドリフト自動検出スクリプト（Phase 9 統合）                           |
| ステータス     | 未実施                                                                       |
| 優先度         | 高                                                                           |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback T-02      |
| 発見日         | 2026-03-17                                                                   |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                   |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` |
| 担当想定       | Tooling / IPC                                                                |

## 1. なぜこのタスクが必要か（Why）

IPC 契約は実装、preload、shared types、仕様書の複数箇所に分散しやすく、ドリフトが起きると回帰の検出が遅れる。自動検出が必要である。

## 2. 何を達成するか（What）

IPC 契約の命名、型、存在有無の差分を Phase 9 で自動検出できるようにする。

## 3. どのように実行するか（How）

- 契約の正本を定義する
- 比較対象ファイル群を固定する
- 差分検出スクリプトを作成し、品質ゲートへ組み込む

## 4. 実行手順

1. IPC 契約の比較対象を洗い出す。
2. 検出したい drift パターンを定義する。
3. スクリプトを実装する。
4. Phase 9 の品質検証へ統合する。

## 5. 完了条件チェックリスト

- 契約差分を自動検出できる
- 命名ドリフトと型ドリフトを判定できる
- Phase 9 で継続実行できる

## 6. 検証方法

- 意図的な drift を入れて検出できることを確認する
- 実案件の既知 drift パターンで再現確認する

## 7. リスクと対策

- 比較対象が増えて保守困難になる: 対象レイヤーを限定する
- false positive が多い: 検出ルールを段階導入する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `docs/30-workflows/unassigned-task/task-ut-task06-001-rag-ipc-spec.md`

## 9. 備考

高優先度の横断品質タスクである。
