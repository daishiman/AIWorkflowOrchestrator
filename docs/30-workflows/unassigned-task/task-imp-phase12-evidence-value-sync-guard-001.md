# UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001: Phase 12 証跡値（実測値）同期ガード

## メタ情報

```yaml
issue_number: 936
task_id: UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001
task_name: Phase 12 証跡値（実測値）同期ガード
category: 改善
target_feature: Phase 12 成果物同期（spec-update-summary / unassigned-task-detection / documentation-changelog）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 追補監査（2026-03-01）
created_date: 2026-03-01
dependencies:
  [
    UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001,
    UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001,
    UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001,
  ]
```

| 項目         | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001                                                                    |
| タスク名     | Phase 12 証跡値（実測値）同期ガード                                                                             |
| 分類         | 改善                                                                                                            |
| 対象機能     | Phase 12 成果物同期（`spec-update-summary.md` / `unassigned-task-detection.md` / `documentation-changelog.md`） |
| 優先度       | 中                                                                                                              |
| 見積もり規模 | 中規模                                                                                                          |
| ステータス   | 未実施                                                                                                          |
| 発見元       | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 追補監査（2026-03-01）                                                 |
| 発見日       | 2026-03-01                                                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 の再監査で、成果物の実体は揃っていても、`spec-update-summary.md` の検証結果が「対象」のまま残るケースと、`documentation-changelog.md` の行数記録が実ファイルとずれるケースを確認した。  
また、`current/baseline` の数値が「参考値」表記に留まり、監査結果の再現性が低下する局面があった。

### 1.2 問題点・課題

- Phase 12 証跡値の記録が手入力主体で、プレースホルダ（`対象`）が残存しやすい。
- `wc -l` 実測値とドキュメント記載値の同期ガードがなく、行数ドリフトを検知しにくい。
- `verify-unassigned-links` / `audit --diff-from HEAD` の実行結果が統一フォーマットで残らず、再確認時に解釈差が出る。

### 1.3 放置した場合の影響

- Phase 12 完了判定の説明責任が弱くなり、再監査コストが増大する。
- `current=0` でも「記録不備」で差し戻しが発生し、同種タスクで再発する。
- `lessons-learned` に再利用可能な証跡記録パターンを残せず、ナレッジが断片化する。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 成果物に記載する検証証跡（件数・警告数・リンク数・行数）を実測値ベースで固定し、プレースホルダ記述を残さない運用ガードを導入する。

### 2.2 最終ゴール

1. `spec-update-summary.md` の検証結果が「PASS + 実測値」に統一される。
2. `unassigned-task-detection.md` に `current/baseline` とリンク検証結果が具体値で記録される。
3. `documentation-changelog.md` の主要ファイル行数が実ファイルと一致する。
4. これらを機械検証できるチェック手順が Phase 12 の標準手順に組み込まれる。

### 2.3 スコープ

#### 含むもの

- Phase 12 成果物 3 ファイルの証跡記録ルール明確化
- 実測値同期ガード（コマンドセットまたは検証スクリプト）の設計
- `aiworkflow-requirements` の台帳・教訓への反映

#### 含まないもの

- 既存 baseline 違反（全 71 件）の一括解消
- `quick_validate.js` 本体の大規模リライト
- Phase 1〜11 の工程定義変更

### 2.4 成果物

- 実測値同期ガード仕様（運用手順 or スクリプト仕様）
- 更新済み Phase 12 成果物テンプレート（または運用ガイド）
- 台帳反映（`task-workflow.md`, `lessons-learned.md`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の監査スクリプトを実行可能であること
- `aiworkflow-requirements` の正本仕様書を更新可能であること
- Phase 12 完了済みワークフローを対象に再監査できること

### 3.2 依存タスク

- UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001
- UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 3.4 推奨アプローチ

1. Phase 12 成果物からプレースホルダと数値記録箇所を抽出し、必須実測値項目を定義する。
2. コマンド実行結果（`verify-all-specs`, `validate-phase-output`, `verify-unassigned-links`, `audit`）を固定フォーマットへ変換する。
3. 行数・件数・警告数を検証する同期ガードを導入し、台帳へ同一ターンで反映する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                          | 解決策                                                                                | 教訓                                         |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `spec-update-summary.md` に「対象」プレースホルダが残る   | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 追補監査 | 検証結果欄を `PASS + 実測値` で必須化し、プレースホルダ検出ルールを追加               | 証跡欄は状態語ではなく数値で確定する         |
| `documentation-changelog.md` の行数記録が実ファイルと乖離 | `.claude/scripts` の実行後に `wc -l` 再確認で検出 | 行数記録前に `wc -l` を実行し、更新差分を同期する手順を固定                           | 実測値を転記する前に取得コマンドを固定する   |
| `current/baseline` が抽象記述に留まり再現しにくい         | `audit --diff-from HEAD` 再実行で値を再確認       | `current=0/baseline=N` の固定形式で記録し、合否軸を `current` に限定                  | 判定値と監視値を分離しないと誤判定が再発する |
| 新規ガード資産が正本台帳へ反映漏れしやすい                | `.claude/scripts` / template 追加後の再監査で検出 | `resource-map` と `directory-structure` を同一ターン更新、`generate-index` まで必須化 | 成果物作成と台帳更新は必ずセット運用にする   |

---

## 4. 実行手順

### Phase構成

- Phase A: 証跡項目定義
- Phase B: 実測値同期ガード実装
- Phase C: 台帳・教訓反映と検証

### Phase A: 証跡項目定義

#### 目的

Phase 12 成果物に記録する証跡値を固定化する。

#### 手順

1. `spec-update-summary.md` / `unassigned-task-detection.md` / `documentation-changelog.md` の証跡欄を抽出する。
2. 実測必須項目（件数・警告数・行数・リンク数）を定義する。
3. プレースホルダ禁止ルール（`対象`, `参考値` など）を決定する。

#### 成果物

- 証跡値必須項目一覧

#### 完了条件

- 3ファイルすべての必須記録項目が定義済み。

### Phase B: 実測値同期ガード実装

#### 目的

コマンド実行結果を成果物へ機械的に反映できる状態にする。

#### 手順

1. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の出力形式を統一する。
2. 行数取得コマンド（`wc -l`）を証跡記録フローへ組み込む。
3. プレースホルダ残存検出（`rg -n "| 対象 |"` など）を追加する。

#### 成果物

- 実測値同期ガード手順書（またはスクリプト仕様）

#### 完了条件

- 証跡値が再実行時に同じ形式で再現できる。

### Phase C: 台帳・教訓反映と検証

#### 目的

運用ルールを正本仕様へ同期し、再発防止を固定化する。

#### 手順

1. `task-workflow.md` 残課題へ本タスクを登録する。
2. `lessons-learned.md` に苦戦箇所と簡潔解決手順を追記する。
3. `verify-unassigned-links.js` と `audit-unassigned-tasks --target-file` で品質を確認する。

#### 成果物

- 未タスク指示書（本ファイル）
- 更新済み台帳・教訓

#### 完了条件

- 参照切れ0件、対象監査 `currentViolations.total=0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 12 成果物3ファイルの証跡値項目が固定化されている
- [ ] プレースホルダ検出ルールが定義されている
- [ ] `current/baseline` 分離記録の判定軸が明文化されている

### 品質要件

- [ ] 実測値の再取得コマンドが手順に含まれている
- [ ] 行数・件数・警告数の記録が実ファイルと一致する
- [ ] `audit --diff-from HEAD` の `current=0` を合否基準に維持できる

### ドキュメント要件

- [ ] `task-workflow.md` 残課題に登録されている
- [ ] `lessons-learned.md` に苦戦箇所と簡潔解決手順が追加されている
- [ ] 本指示書が `## メタ情報` + `## 1..9` 構成を満たしている

---

## 6. 検証方法

### テストケース

- Case 1: 成果物にプレースホルダ（`対象`）が残っている場合、検出できる
- Case 2: 行数記録が実測値と不一致の場合、差分を検出できる
- Case 3: `current=0` / `baseline>0` の判定を正しく分離記録できる
- Case 4: 未タスク指示書のフォーマット監査が PASS する

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-evidence-value-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
rg -n "\\| 対象 \\|" docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-12
wc -l .claude/scripts/na-log-validator.ts .claude/scripts/triple-check-validator.ts .claude/scripts/audit-output-parser.ts .claude/scripts/types.ts
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                     |
| -------------------------------------------- | ------ | -------- | -------------------------------------------------------- |
| 証跡値同期の手順が複雑化して運用負荷が増える | 中     | 中       | 必須値を最小セット（件数・警告・行数・リンク）に限定する |
| スクリプト導入時に既存運用と二重管理になる   | 中     | 中       | 既存テンプレートへ統合し、重複記載を禁止する             |
| baseline値を合否に誤適用する再発             | 高     | 中       | 判定軸を `current` 固定、baselineは監視欄に分離する      |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-12/documentation-changelog.md`

---

## 9. 備考

### 補足事項

- 本タスクは「既存 baseline 違反の解消」ではなく、「今回差分の証跡値同期ガード」を対象とする。
- 実装時は `task-specification-creator` の既存監査コマンドを優先利用し、重複スクリプト作成を避ける。
