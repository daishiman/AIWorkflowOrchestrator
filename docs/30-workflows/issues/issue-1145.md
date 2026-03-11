# [#1145] "[UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001] quick_validate 警告ベースライン管理の導入"

## メタ情報

```yaml
task_id: UT-IMP-TASK-SPEC-SKILL-MD-LINE-BUDGET-001
task_name: task-specification-creator SKILL.md 行数上限制約の恒久是正
category: 改善
target_feature: `.claude/skills/task-specification-creator/SKILL.md`
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-013 再監査の追補実行（quick_validate 実行時）
created_date: 2026-02-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-task-spec-skill-md-line-budget-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SPEC-SKILL-MD-LINE-BUDGET-001                  |
| タスク名     | task-specification-creator SKILL.md 行数上限制約の恒久是正 |
| 分類         | 改善                                                       |
| 対象機能     | `.claude/skills/task-specification-creator/SKILL.md`       |
| 優先度       | 高                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-013 再監査の追補実行（quick_validate 実行時）         |
| 発見日       | 2026-02-25                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`task-specification-creator` に対して `quick_validate.js` を実行したところ、`SKILL.md` が 500 行制約を超過しているため検証失敗となった。

### 1.2 問題点・課題

- スキル自体の品質ゲートが常時 FAIL となり、実差分の検証が困難
- 変更のたびに既知エラーがノイズとなり、重大な新規不整合を見落としやすい
- 変更履歴の肥大化により、SKILL本体の可読性が低下

### 1.3 放置した場合の影響

- Phase 12 の検証再現性が下がる
- 後続タスクで「どこから直すべきか」が不明瞭になる
- スキル改善の速度が落ち、品質保証コストが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`task-specification-creator` を `quick_validate` の行数制約に恒常的に適合させ、検証を信頼できる状態に戻す。

### 2.2 最終ゴール

1. `SKILL.md` を 500 行以内へ収める
2. 変更履歴/補助情報を適切に分割し、参照導線を維持する
3. `quick_validate.js .claude/skills/task-specification-creator` を PASS にする

### 2.3 スコープ

#### 含むもの

- `SKILL.md` の再構成（重複情報・冗長履歴の整理）
- 変更履歴アーカイブ先の整備（必要なら `LOGS.md` へ移管）
- 参照リンク更新と検証

#### 含まないもの

- `task-specification-creator` の機能仕様そのものの拡張
- 他スキル（aiworkflow/skill-creator）の大規模再編

### 2.4 成果物

- 500行制約に適合した `SKILL.md`
- アーカイブされた変更履歴（必要時）
- 検証ログ（quick_validate 実行結果）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の現行仕様（必須セクション）を把握している
- `quick_validate.js` の検証条件を確認済み

### 3.2 依存タスク

- なし（単独で着手可能）

### 3.3 必要な知識

- skill frontmatter と SKILL 構造要件
- `quick_validate.js` の判定基準
- Phase 12 の仕様更新同期ルール

### 3.4 推奨アプローチ

1. `SKILL.md` の必須情報と履歴情報を分離する
2. 履歴は要約 + アーカイブ参照に置換する
3. 参照切れ検証と `quick_validate` PASS を完了条件に固定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                             | 発見経緯                                                  | 解決策                                                   | 教訓                                             |
| -------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `quick_validate` が恒常的に FAIL | TASK-013 再監査の最終検証で `SKILL.md 550行` エラーを検出 | SKILL本体は運用ガイドに限定し、履歴は要約 + アーカイブ化 | 既知失敗を放置すると検証ゲートが機能しない       |
| 変更履歴が肥大化し可読性低下     | Phase12 追記を重ねて本文読解コストが増大                  | 直近履歴のみ SKILL に保持、過去履歴は LOGS 参照へ寄せる  | SKILL は「使い方の正本」、詳細履歴は別管理に分離 |
| 実差分の品質判定が埋もれる       | 既知エラーで毎回同じ失敗が先に出る                        | まずベースラインエラーを0化し、新規差分判定に集中        | ベースライン整備は改善効率の前提条件             |

---

## 4. 実行手順

### Phase構成

- Phase A: 現状計測と削減計画
- Phase B: SKILL再構成
- Phase C: 検証と仕様同期

### Phase A: 現状計測と削減計画

#### 目的

どのセクションが超過要因かを定量化する。

#### 手順

1. `wc -l SKILL.md` で現行行数を測定
2. 長大セクション（主に変更履歴）を抽出
3. 必須情報を維持した削減案を決定

#### 成果物

- 行数削減計画メモ

#### 完了条件

- 削減対象と移管先が確定している

### Phase B: SKILL再構成

#### 目的

500行制約に適合した構成へ変更する。

#### 手順

1. 直近履歴のみを残し、過去履歴を要約化
2. 詳細履歴参照を `LOGS.md` へ統一
3. リンク・章構成を確認

#### 成果物

- 更新済み `SKILL.md`

#### 完了条件

- `SKILL.md` が 500 行以内

### Phase C: 検証と仕様同期

#### 目的

検証 PASS とシステム仕様同期を完了する。

#### 手順

1. `quick_validate.js` を実行し PASS を確認
2. `aiworkflow-requirements` の残課題台帳へ登録
3. `lessons-learned.md` と `LOGS.md` を同期更新

#### 成果物

- 検証ログ
- 台帳更新差分

#### 完了条件

- 検証 PASS + 台帳同期完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SKILL.md` が 500 行以内
- [ ] 必須セクションが欠落していない
- [ ] 履歴参照導線が維持されている

### 品質要件

- [ ] `quick_validate.js` が PASS
- [ ] リンク切れがない
- [ ] 既存運用手順を壊していない

### ドキュメント要件

- [ ] 未タスク台帳（task-workflow）に登録済み
- [ ] 苦戦箇所と再発防止策が記録済み

---

## 6. 検証方法

### テストケース

- Case 1: 行数超過が解消される
- Case 2: 必須セクション不足がない
- Case 3: SKILL内リンクが有効

### 検証手順

1. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                    |
| -------------------- | ------ | -------- | --------------------------------------- |
| 履歴削減で文脈喪失   | 中     | 中       | 要約 + LOGS参照リンクで追跡可能性を維持 |
| 必須セクション誤削除 | 高     | 低       | quick_validate + レビューで二重確認     |
| 他スキル参照の不整合 | 中     | 低       | 変更後に関連SKILL/LOGSを同時チェック    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/skills/skill-creator/scripts/quick_validate.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
スキルを検証中: .claude/skills/task-specification-creator
✗ エラー: SKILL.md が 500 行を超えています (550行)
```

### 補足事項

- 本タスクは「検証ゲート復旧」が主目的であり、新機能追加は対象外。�）

```
aiworkflow-requirements: 150 warnings
skill-creator: 27 warnings
（いずれもエラー0だが、既知警告ノイズが多い）
```

### 補足事項

- 本タスクは「警告ゼロ化」ではなく「新規警告の即時検知」を第一目的とする。
