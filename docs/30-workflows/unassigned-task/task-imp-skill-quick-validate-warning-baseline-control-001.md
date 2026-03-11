# UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001: quick_validate 警告ベースライン管理の導入

## メタ情報

```yaml
issue_number: 1145
task_name: quick_validate 警告ベースライン管理の導入
category: 改善
target_feature: `quick_validate.js` 運用（aiworkflow-requirements / skill-creator）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-013 再監査の最終検証（警告ノイズ調査）
created_date: 2026-02-25
```

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001            |
| タスク名     | quick_validate 警告ベースライン管理の導入                           |
| 分類         | 改善                                                                |
| 対象機能     | `quick_validate.js` 運用（aiworkflow-requirements / skill-creator） |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-013 再監査の最終検証（警告ノイズ調査）                         |
| 発見日       | 2026-02-25                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`quick_validate.js` 実行時に、`aiworkflow-requirements` で 150 件、`skill-creator` で 27 件の警告が常時出力される状態を確認した。

### 1.2 問題点・課題

- 既知警告が大量出力され、新規異常の判別が難しい
- 検証結果がノイズ化し、レビュー効率が低下する
- 「警告はあるが実害なし」の運用が固定化し、品質ゲートが形骸化しやすい

### 1.3 放置した場合の影響

- 新規の重大警告を見逃すリスクが増える
- 監査結果の説明コストが毎回増加する
- スキル横断の品質基準が揃わない

---

## 2. 何を達成するか（What）

### 2.1 目的

既知警告をベースライン化し、新規警告だけを差分検知できる運用を確立する。

### 2.2 最終ゴール

1. スキルごとの警告ベースライン（許容警告）を明文化する
2. 新規警告を CI/ローカルで差分検知できる
3. 警告削減の優先順位（高/中/低）を台帳化する

### 2.3 スコープ

#### 含むもの

- `quick_validate` 警告の分類（既知/新規/要対応）
- ベースライン管理ルール（ファイル化）
- 運用ドキュメント更新（task-workflow / lessons-learned）

#### 含まないもの

- 既存警告の全件即時解消
- `quick_validate.js` 本体の大規模リライト

### 2.4 成果物

- 警告ベースライン定義ファイル
- 差分検知運用手順
- 優先度付き改善バックログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `quick_validate` の現行出力を取得可能であること
- スキルごとの警告件数が再現できること

### 3.2 依存タスク

- UT-IMP-TASK-SPEC-SKILL-MD-LINE-BUDGET-001（高優先で先行推奨）

### 3.3 必要な知識

- スキル検証運用（quick_validate）
- baseline/current 分離レポート
- Phase 12 の未タスク管理ルール

### 3.4 推奨アプローチ

1. まず既知警告をカテゴリ分けして固定する
2. 次に新規警告のみ FAIL 扱いする差分検知を導入する
3. 最後に既知警告を段階的に削減するロードマップを作る

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                                      | 解決策                                                     | 教訓                                     |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| 警告が多すぎて実差分が見えない | TASK-013 再監査で quick_validate を実行し、常時大量警告を確認 | baseline と current を分離し、新規警告のみを追跡対象にする | 全量警告表示だけでは品質ゲートにならない |
| 説明コストが高い               | 毎回「既知警告」を口頭補足する必要が発生                      | 警告ベースラインを文書化して参照一本化                     | 既知ノイズは台帳化して説明を省力化する   |
| 改善優先度が曖昧               | 警告削減の着手順が定まらない                                  | 影響度で高/中/低の改善キューを作成                         | 先に優先順位を固定すると段階改善しやすい |

---

## 4. 実行手順

### Phase構成

- Phase A: 現状警告の棚卸し
- Phase B: ベースライン定義
- Phase C: 差分検知運用化

### Phase A: 現状警告の棚卸し

#### 目的

警告の全体像を定量化し、分類可能な状態にする。

#### 手順

1. 各スキルで `quick_validate` を実行
2. 警告をカテゴリ（リンク/description/その他）に分類
3. 既知警告リストを作成

#### 成果物

- 警告分類一覧

#### 完了条件

- スキルごとに既知警告が一覧化されている

### Phase B: ベースライン定義

#### 目的

既知警告を管理対象として固定する。

#### 手順

1. ベースライン定義ファイルを作成
2. 許容警告の条件・期限・責任者を設定
3. 運用ルールを文書化

#### 成果物

- ベースライン定義ファイル
- 運用ルール文書

#### 完了条件

- 「何が既知で何が新規か」を機械判定できる

### Phase C: 差分検知運用化

#### 目的

新規警告を即時検知し、既知警告はノイズとして分離する。

#### 手順

1. 差分検知コマンドを整備する
2. 新規警告検出時の対応フローを定義する
3. 未タスク台帳へ改善キューを登録する

#### 成果物

- 差分検知手順
- 台帳更新

#### 完了条件

- 新規警告のみを明確に検出できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 既知警告ベースラインが定義されている
- [ ] 新規警告の差分検知が可能
- [ ] 警告削減の優先順位が定義されている

### 品質要件

- [ ] baseline/current 分離結果を再現できる
- [ ] 検証ログが保存される
- [ ] 新規警告を見逃さない運用になっている

### ドキュメント要件

- [ ] task-workflow 残課題に登録済み
- [ ] lessons-learned に運用教訓を追記済み

---

## 6. 検証方法

### テストケース

- Case 1: 既知警告のみの場合、差分0件
- Case 2: 新規警告1件追加時、差分1件検出
- Case 3: 既知警告1件削減時、ベースライン更新が必要と判定

### 検証手順

1. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`
2. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                         |
| ---------------------------- | ------ | -------- | -------------------------------------------- |
| ベースラインが放置される     | 中     | 中       | 期限・担当者付きで管理し、定期見直しを必須化 |
| 既知警告を過剰許容する       | 高     | 低       | 高影響カテゴリは許容禁止ルールを設定         |
| 差分検知ロジックが複雑化する | 低     | 中       | 最小ルール（文字列一致）から段階拡張する     |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/SKILL.md`

### 参考資料

- `.claude/skills/skill-creator/scripts/quick_validate.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
aiworkflow-requirements: 150 warnings
skill-creator: 27 warnings
（いずれもエラー0だが、既知警告ノイズが多い）
```

### 補足事項

- 本タスクは「警告ゼロ化」ではなく「新規警告の即時検知」を第一目的とする。
