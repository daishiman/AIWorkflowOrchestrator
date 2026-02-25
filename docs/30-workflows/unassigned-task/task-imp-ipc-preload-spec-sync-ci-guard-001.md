# task-9D〜9J 仕様契約ドリフト自動検証CIガード - タスク指示書

## メタ情報

```yaml
issue_number: 901
task_id: UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001
task_name: task-9D〜9J 仕様契約ドリフト自動検証CIガード
category: 改善
target_feature: task-00-unified-implementation-sequence task-9D〜9J 仕様書群
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 実装苦戦箇所
created_date: 2026-02-25
```

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001                                            |
| タスク名     | task-9D〜9J 仕様契約ドリフト自動検証CIガード                                         |
| 分類         | 改善                                                                                 |
| 対象機能     | `task-00-unified-implementation-sequence` 配下の task-9D〜9J 仕様書群                |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 中規模                                                                               |
| ステータス   | 未実施                                                                               |
| 発見元       | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 実装苦戦箇所（2026-02-25）           |
| 発見日       | 2026-02-25                                                                           |
| 関連タスク   | UT-SKILL-IPC-PRELOAD-EXTENSION-001 / UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 では、task-9D〜9J の仕様書7ファイルに散在した契約差分（旧参照パス、artifacts欠落、Date方針ドリフト）を手動監査で是正した。

### 1.2 問題点・課題

- 監査が人手中心で、同じ観点の再確認に時間がかかる
- taskごとに `artifacts` 記述が揺れやすく、必須項目漏れを再発しやすい
- IPC境界での `Date`/`string` 方針ドリフトが仕様書単位で再発しうる
- 「修正後にどこまで担保できたか」の機械的証跡が不足する

### 1.3 放置した場合の影響

- 次回 task-9系拡張時に再度同種の差分是正が必要になり、開発速度が低下する
- 仕様書と実装契約のドリフトが後段（実装・テスト）で顕在化し、修正コストが増加する
- Phase 12 の未タスク検出が後追い運用になり、漏れが増える

---

## 2. 何を達成するか（What）

### 2.1 目的

task-9D〜9J 仕様書の契約整合を自動検証し、差分を早期検出できる CI ガードを確立する。

### 2.2 最終ゴール

1. task-9D〜9J を対象にした監査スクリプトを標準運用化する
2. 旧参照パス・必須 `artifacts`・Date方針を機械検証で fail 判定できる
3. Phase 9/10 で監査結果を必須証跡として出力できる

### 2.3 スコープ

#### 含むもの

- task-9D〜9J 仕様書向け監査スクリプトの CI/ローカル実行フロー整備
- 監査観点の標準化（旧パス0件、必須artifacts、Date方針）
- `task-specification-creator` と `aiworkflow-requirements` への運用手順反映

#### 含まないもの

- task-9D〜9J の機能実装コード追加
- 既存全ワークフローへの一括横展開（task-9系以外）
- UI/IPC の新機能要件追加

### 2.4 成果物

- `task-9D〜9J` 監査用コマンド定義と運用手順
- 監査実行ログ（ローカル/CI）
- 更新済み運用ドキュメント（Phase 9/10/12 連携手順）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 の完了記録が存在する
- task-9D〜9J 仕様書が `task-00-unified-implementation-sequence` に集約されている
- Node.js 実行環境が利用可能

### 3.2 依存タスク

- UT-SKILL-IPC-PRELOAD-EXTENSION-001（`spec_created`）
- UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001（完了）

### 3.3 必要な知識

- Phase 12 の未タスク検出と台帳同期手順
- task-9D〜9J の IPC/Preload 契約ポイント
- `artifacts` セクション運用ルール

### 3.4 推奨アプローチ

1. 監査対象を task-9D〜9J のみに固定し、ノイズを排除する
2. 監査観点を3軸（旧パス/必須artifacts/Date方針）に固定する
3. 監査を Phase 9（品質検証）と Phase 10（最終レビュー）の両方で実行する
4. Phase 12 で「検出結果0件」または「未タスク化済み」を必ず記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                     | 発見経緯                                    | 解決策                                                  | 教訓                                               |
| -------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| 旧参照パス混在（`skillAPI.ts` / `main/ipc/channels.ts`） | task-9D〜9J 横断監査で旧パスが混在          | 旧パス検出を監査条件へ固定し、0件を合格条件に設定       | 参照正本は「定義」ではなく「機械検証」で固定する   |
| `artifacts` 必須項目の task間ばらつき                    | 7仕様書で `modifies/creates` の粒度が不一致 | 共通必須セット（4項目 + domain型）をテンプレ化          | 複数仕様書更新は必須項目を先に固定してから編集する |
| Date方針ドリフト（task-9Iのみ `Date` 残存）              | IPC境界でのシリアライズ方針確認時に発見     | `generatedAt` を ISO 8601 `string` に統一、方針を明文化 | IPC境界の日時型は仕様書ごとに個別判断しない        |

---

## 4. 実行手順

### Phase構成

- Phase A: 監査条件の固定化
- Phase B: 監査実行フローの組み込み
- Phase C: 仕様書運用ルール更新
- Phase D: 検証と台帳反映

### Phase A: 監査条件の固定化

#### 目的

判定のブレをなくし、監査観点を固定する。

#### 手順

1. task-9D〜9J の対象ファイル一覧を確定する
2. 旧参照パス禁止ルールを明文化する
3. 必須 `artifacts` セットと Date方針ルールを定義する

#### 成果物

- 監査条件定義メモ

#### 完了条件

- 監査観点3軸が全て定義済み

### Phase B: 監査実行フローの組み込み

#### 目的

監査を毎回同じ手順で実行できる状態にする。

#### 手順

1. task-9D〜9J 監査コマンドを `scripts`/運用手順に登録する
2. Phase 9/10 で監査実行を必須化する
3. 監査失敗時の対応手順（修正→再監査）を定義する

#### 成果物

- 実行可能な監査手順

#### 完了条件

- 監査コマンド1回で合否が判定できる

### Phase C: 仕様書運用ルール更新

#### 目的

更新漏れ・再発防止をドキュメントで固定する。

#### 手順

1. `task-specification-creator` 側に task-9系監査ルールを追加する
2. `aiworkflow-requirements` 側に運用方針を追記する
3. 未タスク化基準（監査違反の扱い）を明記する

#### 成果物

- 更新済み運用ドキュメント

#### 完了条件

- 新規担当者が同一条件で監査実行できる

### Phase D: 検証と台帳反映

#### 目的

監査運用の有効性を確認し、残課題台帳へ反映する。

#### 手順

1. 監査を実行し、違反0件または違反の未タスク化を確認する
2. `verify-unassigned-links.js` で参照整合を確認する
3. task-workflow 残課題テーブルと変更履歴を更新する

#### 成果物

- 監査ログ
- 更新済み task-workflow 台帳

#### 完了条件

- 監査結果と台帳が整合している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] task-9D〜9J を対象とした自動監査が実行できる
- [ ] 旧参照パス検出が fail 条件になっている
- [ ] `artifacts` 必須項目不足が fail 条件になっている
- [ ] IPC境界 Date方針違反が fail 条件になっている

### 品質要件

- [ ] 監査コマンドが再現可能（同一入力で同一結果）
- [ ] 対象外ファイルを誤検出しない
- [ ] 修正後の再監査で結果が収束する

### ドキュメント要件

- [ ] 本未タスク指示書が Why/What/How を満たしている
- [ ] `task-workflow.md` の残課題テーブルへ登録済み
- [ ] 変更履歴に登録済み

---

## 6. 検証方法

### テストケース

- Case 1: 旧参照パスが1件でも存在すると fail になる
- Case 2: 必須 `artifacts` 欠落があると fail になる
- Case 3: Date方針違反（`Date` 残存）があると fail になる
- Case 4: 全修正後に全観点 pass になる

### 検証手順

```bash
# task-9D〜9J 仕様監査
node .claude/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js

# スキル全体の補助検証
node .claude/skills/ipc-preload-spec-sync-guardian/scripts/validate_all.js

# 未タスクリンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --target .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                   |
| -------------------------------- | ------ | -------- | ------------------------------------------------------ |
| 監査対象の取りこぼし             | 中     | 中       | 対象ファイル一覧を固定し、追加時は一覧更新を必須化する |
| 監査ルールの過検知               | 中     | 低       | 旧パス/必須項目/Date方針の3軸以外は段階導入とする      |
| 運用手順だけ更新され実行されない | 高     | 中       | Phase 9/10 の完了条件に監査実行ログを必須化する        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-preload-extension-spec-alignment-001.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考スクリプト

- `.claude/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js`
- `.claude/skills/ipc-preload-spec-sync-guardian/scripts/validate_all.js`

---

## 9. 備考

- 本タスクは「実装コード追加」ではなく、「仕様契約の再発防止運用」を対象とする。
- 並列実行時は、監査（A/B）とドキュメント更新（C/D）を担当分割して進める。
