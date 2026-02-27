# [#926] "[UT-IMP-PHASE12-UNASSIGNED-BASELINE-REMEDIATION-002] Phase 12 未タスク baseline 違反の段階是正（フォーマット/命名/台帳整合）"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-UNASSIGNED-BASELINE-REMEDIATION-002
task_name: Phase 12 未タスク baseline 違反の段階是正（フォーマット/命名/台帳整合）
category: 改善
target_feature: docs/30-workflows/unassigned-task 運用
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-9G Phase 12 再確認（2026-02-27）
created_date: 2026-02-27
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9G Phase 12 再確認で、今回差分（current）は `0` を達成した一方、未タスク台帳全体（baseline）にはフォーマット/命名の違反が継続して存在することを確認した。

### 1.2 問題点・課題

- `docs/30-workflows/unassigned-task/` に 9セクション未準拠ファイルが残っている
- 命名規則違反（ワイルドカード・大文字混在）が運用ノイズになる
- 既存ファイルの一部で `## メタ情報` 重複など、テンプレート逸脱が再発している

### 1.3 放置した場合の影響

- Phase 12 の監査出力が毎回ノイズ過多になり、今回差分の判定が難しくなる
- 未タスク指示書の品質が揃わず、実装者の再解釈コストが増える
- `task-workflow.md` の残課題管理と物理ファイル品質の乖離が固定化する

---

## 2. 何を達成するか（What）

### 2.1 目的

未タスク指示書の baseline 違反を段階的に縮小し、Phase 12 監査を「current判定 + baseline改善」の二軸で安定運用できる状態にする。

### 2.2 最終ゴール

1. 9セクション未準拠の対象を優先度順で是正できる分割実行計画を確定する
2. 命名規則違反ファイルを修正し、リンク追従を完了する
3. `audit-unassigned-tasks` の baseline 改善推移を継続記録できる

### 2.3 スコープ

#### 含むもの

- `unassigned-task/` 配下のフォーマット違反・命名違反の段階是正
- `task-workflow.md` 参照と物理ファイルの整合確認
- Phase 12 検証コマンドの標準順序化（実体探索含む）

#### 含まないもの

- 完了済みタスクの機能実装変更
- `apps/` / `packages/` 配下のプロダクトコード改修

### 2.4 成果物

- 是正対象リスト（バッチ単位）
- 修正済み未タスク指示書
- 監査結果比較ログ（before/after）
- `task-workflow.md` 残課題テーブル反映

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクテンプレート/ガイドを参照可能
- `audit-unassigned-tasks.js` / `verify-unassigned-links.js` を実行可能
- Phase 12 の current/baseline 判定ルールを理解している

### 3.2 依存タスク

- `UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001`（既存、継続改善タスク）
- `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001`（運用ガード関連）

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 3.4 推奨アプローチ

1. 監査対象スクリプトは実行前に `rg --files .claude/skills | rg 'audit-unassigned-tasks|verify-unassigned-links|verify-all-specs|validate-phase-output'` で実体確認する
2. `missingHeadings` 件数の多い順に 10件単位でバッチ修正する
3. 各バッチで `verify-unassigned-links` と `audit --diff-from HEAD` を回し、`currentViolations=0` を維持する

### 3.5 実装課題と解決策（今回実装からの教訓）

| 課題                             | 発見経緯                                               | 解決策                                                    | 教訓                                                          |
| -------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------- |
| 検証スクリプト実行パスの誤認     | `scripts/...` を直実行して `MODULE_NOT_FOUND` になった | 実行前に `rg --files` でスクリプト実体を解決              | Phase 12 検証は「実体探索→実行」を固定手順にする              |
| `current` と `baseline` の誤読   | baseline件数が多く、今回差分判定が不明瞭になった       | 合否を `currentViolations` 固定で判定し、baselineは別管理 | 監査結果は二軸で読む（current=合否、baseline=改善バックログ） |
| 未タスク指示書フォーマットの揺れ | `## メタ情報` 重複などテンプレート逸脱が残存           | 1セクション原則（YAML+表を同一見出し配下）で正規化        | テンプレート準拠は内容より先に構造を固める                    |

### 3.6 SubAgent 分担（関心ごとの分離）

| SubAgent   | 担当関心         | 主担当作業                                         | 依存               |
| ---------- | ---------------- | -------------------------------------------------- | ------------------ |
| SubAgent-A | フォーマット是正 | 9セクション欠落の修正                              | 監査対象一覧確定後 |
| SubAgent-B | 命名是正         | 命名規則違反ファイルの改名と参照追従               | Aと並列可          |
| SubAgent-C | 台帳同期         | `task-workflow.md` 残課題リンク整合                | A/B の修正後       |
| SubAgent-D | 検証             | `verify-unassigned-links` / `audit` 実行と結果記録 | C 後               |

---

## 4. 実行手順

### Phase構成

- Phase A: 対象抽出とバッチ設計
- Phase B: フォーマット是正（10件単位）
- Phase C: 命名・参照同期
- Phase D: 検証と台帳更新

### Phase A: 対象抽出とバッチ設計

#### 目的

是正対象を優先度付きで確定する。

#### 手順

1. `audit-unassigned-tasks.js --json` を実行して違反一覧を取得
2. `formatViolations` を `missingHeadings` 件数順に並べる
3. 10件単位の実行バッチを作成する

#### 成果物

- バッチ別対象一覧

#### 完了条件

- 全対象がいずれかのバッチに割り当て済み

### Phase B: フォーマット是正（10件単位）

#### 目的

9セクション構造へ統一する。

#### 手順

1. `unassigned-task-template.md` に沿って見出し不足を補完
2. `## メタ情報` を1セクションへ統一
3. 1バッチごとに自己レビューを実施

#### 成果物

- 修正済み未タスク指示書（バッチ単位）

#### 完了条件

- バッチ対象ファイルが全件テンプレート準拠

### Phase C: 命名・参照同期

#### 目的

命名規則とリンク整合を維持する。

#### 手順

1. 命名規則違反ファイルを改名
2. `task-workflow.md` および関連仕様書の参照を追従修正
3. `rg` で旧ファイル名参照の残存を確認

#### 成果物

- 改名済みファイル
- 追従修正済み参照

#### 完了条件

- 命名違反0件、旧参照0件

### Phase D: 検証と台帳更新

#### 目的

運用上の合否を確定する。

#### 手順

1. `verify-unassigned-links.js` を実行
2. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行
3. `audit-unassigned-tasks.js --json --target-file <対象>` で個別確認
4. 結果を `task-workflow.md` と成果物へ記録

#### 成果物

- 検証ログ
- 台帳更新差分

#### 完了条件

- `missing=0`
- `currentViolations=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] baseline 違反を段階的に是正する実行計画がある
- [ ] フォーマット違反・命名違反の修正手順が定義されている
- [ ] SubAgent分担で並列実行可能な設計になっている

### 品質要件

- [ ] 新規/更新した未タスク指示書は9セクション準拠
- [ ] `## メタ情報` 重複がない
- [ ] `current` と `baseline` の判定軸を分離して記録している

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] 関連するシステム仕様書（task-workflow/lessons）へ反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 対象ファイルの見出し構造がテンプレート準拠
- Case 2: 未タスクリンクに欠損がない
- Case 3: 差分監査で `currentViolations=0` を維持

### 検証手順

```bash
rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                              |
| -------------------------------------------- | ------ | -------- | ------------------------------------------------- |
| 大量修正でリンク更新漏れが発生する           | 中     | 中       | 10件バッチごとに `verify-unassigned-links` を実行 |
| 命名変更の影響範囲を見落とす                 | 中     | 中       | 旧ファイル名で `rg` 検索し残存参照をゼロ化        |
| baseline 改善途中で current 違反を混入させる | 高     | 低       | 各バッチ完了時に `--diff-from HEAD` 監査を必須化  |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-9G Phase 12 再確認で、current は 0 だが baseline 違反が残存。
未タスク運用を段階是正し、同種課題で監査ノイズを減らすこと。
```

### 補足事項

本タスクは「今回差分の合格維持（current=0）」を前提に、既存負債（baseline）を段階的に削減する改善タスクである。
