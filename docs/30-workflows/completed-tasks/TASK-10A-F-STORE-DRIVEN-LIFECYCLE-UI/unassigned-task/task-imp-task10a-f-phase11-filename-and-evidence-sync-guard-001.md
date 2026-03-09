# UT-IMP-TASK10A-F-PHASE11-FILENAME-AND-EVIDENCE-SYNC-GUARD-001 - タスク指示書

## メタ情報

```yaml
issue_number: 1084
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-F-PHASE11-FILENAME-AND-EVIDENCE-SYNC-GUARD-001 |
| タスク名     | Phase 11 ファイル名/証跡同期ガード                            |
| 分類         | 改善                                                          |
| 対象機能     | Phase 11/12 ドキュメント運用                                  |
| 優先度       | 中                                                            |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | Phase 12                                                      |
| 発見日       | 2026-03-08                                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`task-workflow.md` の未タスク参照先に実体欠落があり、リンク監査が失敗した。

### 1.2 問題点・課題

ファイル名・配置・証跡参照が同時同期されず、`verify-unassigned-links` が不安定化する。

### 1.3 放置した場合の影響

Phase 12 完了判定の再現性が下がり、再監査コストが増える。

## 2. 何を達成するか（What）

### 2.1 目的

未タスク参照の実体整合を常時 PASS にする。

### 2.2 最終ゴール

`verify-unassigned-links` が `ALL_LINKS_EXIST` を安定返却する。

### 2.3 スコープ

#### 含むもの

- 未タスク実体の作成
- 参照先の命名整合確認

#### 含まないもの

- 過去 legacy タスクの全面再整備

### 2.4 成果物

- 参照先実体ファイル
- 監査 PASS 記録

## 3. どのように実行するか（How）

### 3.1 前提条件

`task-workflow.md` の参照パスを正本とする。

### 3.2 依存タスク

なし。

### 3.3 必要な知識

未タスク配置ルール、link verification script。

### 3.4 推奨アプローチ

参照パス先に実体を作成し、同ターンで監査スクリプトを再実行する。

## 4. 実行手順

### Phase構成

Phase 1: 参照欠損特定 → Phase 2: 実体作成 → Phase 3: 検証

### Phase 1: 欠損特定

#### 目的

欠損IDと参照行を特定する。

#### 手順

1. `verify-unassigned-links` を実行する。
2. missing path を抽出する。
3. 対象IDを特定する。

#### 成果物

欠損リスト。

#### 完了条件

欠損1件以上が特定済み。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 参照先に実体ファイルが存在する

### 品質要件

- [ ] `verify-unassigned-links` が PASS

### ドキュメント要件

- [ ] 必要に応じて `task-workflow.md` の参照も同期

## 6. 検証方法

### テストケース

- link verification 1ケース

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` 実行
2. `ALL_LINKS_EXIST` を確認

## 7. リスクと対策

| リスク         | 影響度 | 発生確率 | 対策                                  |
| -------------- | ------ | -------- | ------------------------------------- |
| 同種欠損の再発 | 中     | 中       | Phase 12 完了条件に link check を固定 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
task-workflow 内リンクが実体欠落で fail。
```

### 補足事項

completed/unassigned の配置境界は運用ルールに従って維持する。
