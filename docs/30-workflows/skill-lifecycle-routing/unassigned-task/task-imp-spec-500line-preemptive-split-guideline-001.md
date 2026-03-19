# UT-IMP-SPEC-500LINE-PREEMPTIVE-SPLIT-GUIDELINE-001: 仕様書 500行制限 先制分割ガイドライン整備

## メタ情報

```yaml
issue_number: N/A
task_id: UT-IMP-SPEC-500LINE-PREEMPTIVE-SPLIT-GUIDELINE-001
task_name: 仕様書 500行制限 先制分割ガイドライン整備
category: 改善（仕様書品質）
target_feature: aiworkflow-requirements 仕様書の行数管理と先制分割
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 12 500行超チェック
created_date: 2026-03-17
dependencies: []
```

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-IMP-SPEC-500LINE-PREEMPTIVE-SPLIT-GUIDELINE-001                   |
| タスク名     | 仕様書 500行制限 先制分割ガイドライン整備                            |
| 分類         | 改善（仕様書品質）                                                   |
| 対象機能     | aiworkflow-requirements 仕様書の行数管理と先制分割                   |
| 優先度       | 低                                                                   |
| 見積もり規模 | 小規模（2-4時間）                                                    |
| ステータス   | 未実施                                                               |
| 発見元       | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 12 500行超チェック |
| 発見日       | 2026-03-17                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` の Phase 12 で実施した 500行超チェックにより、
10ファイルが 450-495行の閾値近傍にあることが判明した。
これらは次回のタスク追加（完了タスクセクション追記、型定義追加など）で 500行を超過するリスクが高い。

また、`lessons-learned-current.md` が 651行に達するまで超過に気付かなかった実績がある。
事後対応として4分割 + インデックス化で解決したが、この分割手順は標準化されておらず、
同種の超過が他ファイルで再発した場合に同じ手戻りが発生する。

### 1.2 問題点・課題

1. **後追い検出**: 500行超過はタスク完了後の Phase 12 チェックで初めて発見される。`generate-index.js` や `validate-structure.js` に行数チェック機構がなく、超過が蓄積されてから一括対応になる
2. **先制分割の判断基準が不明確**: `spec-splitting-guidelines.md` に分割パターンは定義されているが、「いつ分割を開始すべきか」の閾値（例: 450行で警告）が未定義
3. **閾値近傍ファイルの管理不在**: 450-495行のファイルが10件存在するが、これらを監視・優先分割する仕組みがない

### 1.3 放置した場合の影響

- 次のタスク追加で10ファイルが順次 500行を超過し、Phase 12 で都度分割作業が発生する
- 分割作業が Phase 12 に集中し、本来の仕様書更新・未タスク検出に割く時間が圧迫される
- `lessons-learned-current.md` の分割実績（4分割 + インデックス化）が属人知識のまま消失する

---

## 2. 何を達成するか（What）

### 2.1 目的

500行超過を事前に検出・警告し、先制的に分割判断できるガイドラインとツール支援を整備する。

### 2.2 最終ゴール

1. `validate-structure.js` または専用スクリプトが 450行以上のファイルを警告として報告する
2. `spec-splitting-guidelines.md` に先制分割セクション（閾値・手順・インデックス設計）が追加されている
3. `lessons-learned-current.md` の4分割実績が標準パターンとして文書化されている
4. 閾値近傍10ファイルの分割優先度リストが作成されている

### 2.3 スコープ

#### 含むもの

- `spec-splitting-guidelines.md` への先制分割セクション追加
- `validate-structure.js` または `generate-index.js` への行数チェック機能追加
- 閾値近傍10ファイルの分割優先度評価と計画表作成
- `legacy-ordinal-family-register.md` 更新手順の明文化

#### 含まないもの

- 閾値近傍10ファイルの実際の分割作業（本タスクはガイドライン整備のみ）
- `generate-index.js` の大規模リファクタリング
- CI/CD パイプラインへの組み込み

### 2.4 成果物

- 更新済み `spec-splitting-guidelines.md`（先制分割セクション）
- 行数チェックスクリプト（新規 or 既存スクリプトへの機能追加）
- 閾値近傍ファイルの分割優先度リスト
- task-workflow / lessons-learned への導線追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `spec-splitting-guidelines.md` が既存で分割パターンが定義済み
- `lessons-learned-current.md` の4分割実績（インデックス + 4分割ファイル）が参照可能
- `validate-structure.js` / `generate-index.js` が実行可能

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- `spec-splitting-guidelines.md` の既存分割パターン
- `generate-index.js` / `validate-structure.js` のスクリプト構造
- `legacy-ordinal-family-register.md` の旧→新マッピング形式

### 3.4 推奨アプローチ

1. `spec-splitting-guidelines.md` に先制分割セクションを追加する（閾値定義: 450行で警告、500行で要分割）
2. `validate-structure.js` に `--check-line-count` オプションを追加し、450行以上のファイルを WARNING、500行超のファイルを ERROR として報告する
3. `lessons-learned-current.md` の分割実績を標準パターンとして `spec-splitting-guidelines.md` に転記する
4. 閾値近傍10ファイルを行数降順でリスト化し、分割優先度を付与する
5. 分割時の `legacy-ordinal-family-register.md` 更新手順をチェックリスト化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                           | 発見経緯                                                           | 解決策                                                                                  | 教訓                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 500行超過の後追い検出                          | `lessons-learned-current.md` が651行になるまで超過に気付かなかった | `validate-structure.js` に行数チェックを組み込み、Phase 12 の冒頭で自動実行する         | 閾値チェックは手動確認ではなくスクリプトで自動化すべき                    |
| 分割後のインデックス設計判断                   | インデックスファイルを残すか完全分割するかの基準が不明確だった     | 76行インデックス + 4分割ファイルの実績パターンをガイドラインに標準化する                | インデックスは100行以下を目安に、分割ファイルへのナビゲーション専用とする |
| `legacy-ordinal-family-register.md` の更新忘れ | 分割時に旧→新のマッピングを登録しないと旧名参照が壊れる            | 分割チェックリストに `legacy-ordinal-family-register.md` 更新を必須ステップとして含める | 分割は「ファイル作成」だけでなく「参照の付け替え」まで含めて完了とする    |

---

## 4. 実行手順

### Phase構成

- Phase A: 先制分割ガイドライン定義
- Phase B: 行数チェックスクリプト実装
- Phase C: 検証と台帳同期

### Phase A: 先制分割ガイドライン定義

#### 目的

先制分割の閾値・手順・判断基準を `spec-splitting-guidelines.md` に追加する。

#### 手順

1. `spec-splitting-guidelines.md` の既存「分割判断基準」テーブルに 450行閾値を追加する
2. 「先制分割フロー」セクションを新設し、以下を定義する:
   - 450行到達時の WARNING ルール
   - 分割候補の優先度評価基準（行数 x 更新頻度）
   - インデックスファイルの設計基準（100行以下、ナビゲーション専用）
3. `lessons-learned-current.md` の4分割実績を標準パターンとして転記する
4. 分割チェックリストに `legacy-ordinal-family-register.md` 更新を追加する
5. 閾値近傍10ファイルの分割優先度リストを作成する

#### 成果物

- 更新済み `spec-splitting-guidelines.md`
- 閾値近傍ファイル分割優先度リスト

#### 完了条件

- 先制分割セクションが追加され、閾値・手順・判断基準が明文化されている

### Phase B: 行数チェックスクリプト実装

#### 目的

行数超過を自動検出するスクリプトを実装する。

#### 手順

1. `validate-structure.js` の既存構造を確認する
2. `--check-line-count` オプション（または既存チェックへの組み込み）を実装する
3. 450行以上を WARNING、500行超を ERROR として出力する
4. 出力にファイル名・行数・推奨アクションを含める
5. テストを追加する

#### 成果物

- 行数チェック機能付きスクリプト
- テスト

#### 完了条件

- スクリプト実行で閾値近傍10ファイルが WARNING として検出される

### Phase C: 検証と台帳同期

#### 目的

ガイドラインとスクリプトが実運用に効くことを確認し、台帳に記録する。

#### 手順

1. 行数チェックスクリプトを実行し、10ファイルの検出を確認する
2. `task-workflow-backlog.md` に本タスクの行を追加する
3. `lessons-learned-current.md` に先制分割ガイドラインへの導線を追記する
4. `documentation-changelog.md` に変更内容を記録する

#### 成果物

- スクリプト実行ログ
- 更新済み task-workflow / lessons-learned

#### 完了条件

- 閾値近傍ファイルが自動検出され、ガイドラインが参照可能な状態になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `spec-splitting-guidelines.md` に先制分割セクション（閾値450行警告 / 500行要分割）が追加されている
- [ ] インデックスファイル設計基準（100行以下、ナビゲーション専用）が明文化されている
- [ ] 分割チェックリストに `legacy-ordinal-family-register.md` 更新が含まれている
- [ ] 閾値近傍10ファイルの分割優先度リストが作成されている
- [ ] 行数チェックスクリプトが 450行以上を WARNING、500行超を ERROR として報告する

### 品質要件

- [ ] 行数チェックスクリプトのテストが PASS
- [ ] `validate-structure.js` の既存テストが回帰していない
- [ ] スクリプト実行で閾値近傍10ファイルが全件検出される

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に登録されている
- [ ] `lessons-learned-current.md` に導線が追記されている

---

## 6. 検証方法

### テストケース

- Case 1: 行数チェックスクリプトが 450行以上のファイルを WARNING で報告する
- Case 2: 行数チェックスクリプトが 500行超のファイルを ERROR で報告する
- Case 3: 閾値近傍10ファイルが全件検出される
- Case 4: `spec-splitting-guidelines.md` の先制分割セクションが存在する
- Case 5: 分割チェックリストに `legacy-ordinal-family-register.md` 更新ステップが含まれる

### 検証コマンド

```bash
# 行数チェックスクリプト実行（実装後）
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js --check-line-count

# 閾値近傍ファイルの手動確認
wc -l .claude/skills/aiworkflow-requirements/references/*.md | sort -rn | head -20

# 先制分割セクションの存在確認
grep -n "先制分割" .claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md

# 未タスク台帳リンク確認
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-spec-500line-preemptive-split-guideline-001.md
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                               |
| -------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| 450行閾値が厳しすぎてガイドライン違反が頻発する          | 中     | 中       | 初期は WARNING のみとし、実運用データを見て閾値を調整する          |
| 行数チェックが Phase 12 の実行時間を延長する             | 低     | 低       | `wc -l` ベースの軽量実装とし、1秒以内で完了する設計にする          |
| 分割優先度リストが形骸化する                             | 中     | 中       | Phase 12 の500行チェック時にリストを参照・更新するルールを明記する |
| `legacy-ordinal-family-register.md` の更新忘れが再発する | 高     | 中       | 分割スクリプトに register 更新リマインドを出力に含める             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` - 既存の分割基準
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` - 4分割 + インデックス化の実績
- `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md` - 旧→新ファイルマッピング

### 閾値近傍ファイル一覧（発見時点）

| ファイル名                                      | 行数  | 超過リスク     |
| ----------------------------------------------- | ----- | -------------- |
| database-schema.md                              | 495行 | 高（残り5行）  |
| technology-backend.md                           | 492行 | 高（残り8行）  |
| interfaces-agent-sdk-ui.md                      | 491行 | 高（残り9行）  |
| api-internal-conversion.md                      | 479行 | 中（残り21行） |
| task-workflow-backlog.md                        | 471行 | 中（残り29行） |
| api-ipc-agent-core.md                           | 469行 | 中（残り31行） |
| architecture-implementation-patterns-details.md | 466行 | 中（残り34行） |
| spec-splitting-guidelines.md                    | 464行 | 中（残り36行） |
| ui-ux-feature-skill-stream.md                   | 459行 | 中（残り41行） |
| task-workflow-completed-skill-lifecycle.md      | 457行 | 中（残り43行） |

### 参考資料

- `.claude/skills/aiworkflow-requirements/scripts/validate-structure.js`
- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`

---

## 9. 備考

### 発見経緯

Phase 12 の500行超チェックで `lessons-learned-current.md`（651行）の超過が発見され、
4分割 + インデックス化で対応した。その際、閾値近傍の10ファイルも同時に検出されたが、
分割作業は本タスクのスコープ外とし、先制分割の仕組みづくりを未タスク化した。

### 補足事項

- 本タスクはガイドライン整備とスクリプト実装のみを対象とする。閾値近傍10ファイルの実際の分割作業は、本タスク完了後に個別タスクとして計画する
- `spec-splitting-guidelines.md` 自体が464行であるため、先制分割セクション追加により自身が500行に近づく可能性がある。追加量が多い場合はガイドライン自体の分割も検討する
