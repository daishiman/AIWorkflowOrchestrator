# Phase 12 検証コマンド標準化ガード（quick_validate / verify-all-specs） - タスク指示書

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001                  |
| タスク名     | Phase 12 検証コマンド標準化ガード（quick_validate / verify-all-specs） |
| 分類         | 改善                                                                   |
| 対象機能     | Phase 12 ドキュメント更新運用 / スキル検証運用                         |
| 優先度       | 中                                                                     |
| 見積もり規模 | 小規模                                                                 |
| ステータス   | 完了（2026-02-25, Phase 12完了移管）                                   |
| 発見元       | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12再確認（2026-02-25） |
| 発見日       | 2026-02-25                                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12再確認で、検証自体はPASSしても「コマンド表記ゆれ」と「必須引数漏れ」による再実行失敗が発生した。特に `quick_validate` 実行経路と `verify-all-specs --workflow` の扱いがドキュメントごとに揺れていた。

### 1.2 問題点・課題

- `quick_validate.py` / `quick_validate.js` の混在により、再利用時の手順が不安定
- `verify-all-specs.js` の `--workflow` 必須条件が抜け、strict検証が失敗しやすい
- 検証ログの命名規則（rerun/final）が文書ごとにばらつき、追跡コストが高い

### 1.3 放置した場合の影響

- Phase 12完了判定の再現性が下がる
- 監査時に「失敗理由が手順不備か実装不備か」を切り分けにくくなる
- 同種タスクで同じ作業ミスが再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 で使用する主要検証コマンドの正本を明文化し、実行条件とログ命名を統一する。

### 2.2 最終ゴール

1. `quick_validate` 表記が `quick_validate.js` に統一されている
2. `verify-all-specs` の実行例が `--workflow <path> --strict` 必須で統一されている
3. Phase 12 検証ログが `*-final.log` 形式で管理される

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` の Phase 11/12 ガイド・仕様更新フローのコマンド記述
- `aiworkflow-requirements` の運用台帳（task-workflow / lessons-learned）への反映
- 検証ログ命名の運用ルール化（finalログ）

#### 含まないもの

- `quick_validate.js` 本体ロジックの変更
- `verify-all-specs.js` の機能追加・仕様変更
- 他機能タスクの実装コード変更

### 2.4 成果物

- 未タスク仕様書（本ファイル）
- `task-workflow.md` 残課題テーブル登録
- 運用仕様更新（SKILL/LOGS/lessons-learned）
- 検証ログ統一手順（final命名）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` と `aiworkflow-requirements` の仕様書にアクセス可能
- `quick_validate.js`（ObsidianMemo側 skill-creator）が実行可能
- `verify-all-specs.js` / `verify-unassigned-links.js` が実行可能

### 3.2 依存タスク

- なし（単独実行可能）

### 3.3 必要な知識

- Phase 12 Task 2（仕様更新）運用
- unassigned-task 9セクションテンプレート
- current/baseline 分離監査の考え方

### 3.4 推奨アプローチ

- 仕様書記述を先に統一し、次に検証コマンドを実行して差分を固定する
- ログ命名は rerun を最終的に `final` へ収束させる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                            | 発見経緯                                          | 解決策                                                                                                | 教訓                         |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| full監査FAILを差分FAILと誤認    | `audit-unassigned --json` が baseline違反を返した | `--target-file` で current を先判定し、baselineは別記録                                               | 判定軸を混ぜない             |
| `quick_validate` 実行経路の混同 | repo側相対パスと外部スキル絶対パスが混在          | `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` を正本化 | 実行主体を固定する           |
| `verify-all-specs` 引数漏れ     | `--strict` 単独実行で失敗                         | `--workflow <path> --strict` を必須で明記                                                             | strict検証は対象指定とセット |
| 検証PASS後の台帳未同期          | rerunログ増加時に artifacts/index 反映漏れ        | `complete-phase` 後に index再生成 + artifacts同期を同一ターンで実施                                   | PASSだけで完了扱いにしない   |

---

## 4. 実行手順

### Phase構成

- Phase A: 対象仕様書のコマンド記述統一
- Phase B: システム仕様書への未タスク登録・教訓反映
- Phase C: 検証実行とログ整合
- Phase D: 台帳同期と最終確認

### Phase A: 記述統一

#### 目的

コマンド記述ゆれを除去する。

#### 手順

1. `quick_validate.py` 表記を `quick_validate.js` へ統一する
2. `verify-all-specs` 実行例を `--workflow <path> --strict` に統一する
3. 参照先は絶対パス実行例を正本として記述する

#### 成果物

- 更新済み仕様書（ガイド/チェックリスト）

#### 完了条件

- 対象仕様書に `quick_validate.py` が残っていない

### Phase B: 未タスク登録・教訓反映

#### 目的

再発防止を台帳へ組み込む。

#### 手順

1. 本未タスク指示書を `docs/30-workflows/unassigned-task/` に配置する
2. `task-workflow.md` 残課題テーブルへ行追加する
3. `lessons-learned.md` と `LOGS.md` に苦戦箇所と対処手順を追記する

#### 成果物

- 未タスク指示書
- 更新済み残課題テーブル
- 更新済み教訓ログ

#### 完了条件

- 未タスク行が `task-workflow.md` に追加済み

### Phase C: 検証とログ整合

#### 目的

更新内容を機械検証で固定する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `audit-unassigned-tasks.js --json --target-file <new-task-file>` を実行する
3. 必要に応じて `quick_validate.js` / `verify-all-specs.js --workflow ... --strict` を実行し、`*-final.log` を生成する

#### 成果物

- 検証ログ（final）

#### 完了条件

- リンク検証PASS
- 対象監査で current 違反 0

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未タスク仕様書が 9セクションで作成されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている

### 品質要件

- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST`
- [ ] `audit-unassigned-tasks.js --target-file` で `currentViolations = 0`
- [ ] `quick_validate` 記述が `quick_validate.js` に統一されている

### ドキュメント要件

- [ ] 苦戦箇所が Section 3.5 に記載されている
- [ ] `aiworkflow-requirements` 側の履歴（SKILL/LOGS/task-workflow）へ反映されている
- [ ] `task-specification-creator` 側の履歴（SKILL/LOGS）へ反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 未タスクリンクの整合性が維持される
- Case 2: 新規未タスクファイルがフォーマット違反0で監査PASS
- Case 3: コマンド統一後に再実行失敗（引数漏れ）が発生しない

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
2. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-validation-command-standardization-001.md`
3. `rg -n "quick_validate\\.py" .claude/skills/aiworkflow-requirements .claude/skills/task-specification-creator`
4. `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`
5. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict`

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                             |
| ------------------------------ | ------ | -------- | ------------------------------------------------ |
| 既存文書に旧表記が再混入       | 中     | 中       | CI/監査で `quick_validate.py` 残存スキャンを追加 |
| 手順書だけ更新してログが未同期 | 中     | 中       | SKILL/LOGS 更新を完了条件に含める                |
| baseline違反を新規違反と誤判定 | 中     | 高       | current/baseline 分離記録をテンプレート化        |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001/outputs/phase-12/phase12-task-spec-compliance-check.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`
- `/Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし

### 補足事項

この未タスクは機能追加ではなく「Phase 12運用の再発防止タスク」。同種課題の初動時間短縮を目的とする。
