# SkillEditor Phase 12仕様同期ガード自動化 - タスク指示書

## メタ情報

```yaml
issue_number: 836
```

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-9A-C-004                                                     |
| タスク名     | SkillEditor Phase 12仕様同期ガード自動化                          |
| 分類         | 改善                                                              |
| 対象機能     | TASK-9A-skill-editor / Phase 12ドキュメント更新運用               |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 完了（2026-02-26）                                                |
| 発見元       | Phase 12（再確認）                                                |
| 発見日       | 2026-02-26                                                        |
| ブロック対象 | なし                                                              |
| 前提タスク   | TASK-9A（完了）、TASK-9A-C-001（未実施）、TASK-9A-C-003（未実施） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9A の Phase 12 再確認で、成果物自体は作成済みでも「仕様書への同期」と「監査結果の解釈」が手動運用に依存していた。  
その結果、同じ種類の漏れが再発し、再確認の工数が増えている。

### 1.2 問題点・課題

- 実装ガイドの Part 1/Part 2 要件（理由先行・日常例え・型/API/エッジケース）が手動確認で漏れやすい
- `audit-unassigned-tasks` の `current` と `baseline` の解釈が混同されやすい
- 未タスク指示書の `## メタ情報` セクション重複をレビューで見落としやすい
- `task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-agent-sdk-skill.md` の3点同期が同時完了しないことがある

### 1.3 放置した場合の影響

- Phase 12 の完了判定が不安定化し、再作業が常態化する
- 未タスク台帳とシステム仕様書が乖離し、後続タスク探索コストが増加する
- 同様の課題で毎回同じ確認作業を繰り返す

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-9A 系の Phase 12 で発生した再発課題を、機械検証可能なガードとして標準化し、未タスク登録から仕様書同期までを一貫して再現可能にする。

### 2.2 最終ゴール

- 未タスク仕様書に苦戦箇所（Section 3.5）が必ず記録される
- 3仕様書（`task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-agent-sdk-skill.md`）の未タスク参照が同時同期される
- `audit-unassigned-tasks` の判定記録が `current` / `baseline` 分離で残る
- 監査コマンド実行結果をもとに、再確認なしで Phase 12 判定ができる状態になる

### 2.3 スコープ

#### 含むもの

- TASK-9A 系未タスク登録時のチェックフロー標準化
- 未タスク指示書テンプレート準拠（9セクション + 3.5苦戦箇所）
- 3仕様書の関連未タスクテーブル同期
- 監査コマンド（`verify-unassigned-links`, `audit-unassigned-tasks`）の実行・記録形式統一

#### 含まないもの

- SkillEditor 本体の新機能実装（Monaco/CodeMirror移行等）
- TASK-9A-C-001 / TASK-9A-C-003 の実装着手
- 全未タスク資産（baseline違反全件）の一括是正

### 2.4 成果物

| 成果物         | パス                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| 未タスク指示書 | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` |
| 残課題台帳更新 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                     |
| 関連仕様更新   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`          |
| 関連仕様更新   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`        |
| 運用履歴更新   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-9A-skill-editor` の Phase 12 成果物が存在すること
- `task-specification-creator` と `aiworkflow-requirements` の最新ガイドラインを参照可能であること
- 作業ディレクトリが本ワークツリーであること

### 3.2 依存タスク

- TASK-9A（完了）
- TASK-9A-C-001（未実施）
- TASK-9A-C-003（未実施）

### 3.3 必要な知識

- Phase 12 Task 1/2 の必須要件（Part 1/Part 2、Step 1-A/1-B/1-C）
- `audit-unassigned-tasks.js` の `currentViolations` / `baselineViolations` 判定
- `verify-unassigned-links.js` の参照整合チェック

### 3.4 推奨アプローチ

1. 未タスク指示書を先に作成し、3.5で苦戦箇所を固定化する
2. 次に3仕様書テーブルを同時更新する
3. 最後に監査コマンドを実行し、`current=0` を合否基準に記録する

### 3.5 実装課題と解決策（TASK-9A再確認からの教訓）

| 課題                        | 発見経緯                                                   | 解決策                                                                     | 教訓                                                  |
| --------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| 実装ガイド2パート要件不足   | `implementation-guide.md` 再確認で Part 1/2 要件欠落を検出 | Part 1を理由先行+日常例え、Part 2を型/API/エラー/境界条件で固定            | 要件を文章品質ではなく構造要件で判定する              |
| `current` / `baseline` 誤読 | `audit-unassigned-tasks` 実行結果の解釈で混乱              | `--target-file` と `--diff-from` を合否判定、scopeなしを資産監視として分離 | 監査値は用途別に分離しないと誤判定を招く              |
| `## メタ情報` の重複        | 未タスク2件で見出し重複を後から検出                        | 1セクション化し `rg -n \"^## メタ情報\"` で機械確認                        | フォーマット規約はレビュー前に機械検証する            |
| 仕様書同期漏れ              | `task-workflow` のみ更新して関連仕様への反映が遅延         | 3仕様書を1セットとして同一作業で更新                                       | Step 1-C は単一ファイル完了ではなく横断完了で判定する |

---

## 4. 実行手順

### Phase構成

| Phase   | 名称       | 目的                                        |
| ------- | ---------- | ------------------------------------------- |
| Phase A | 指示書作成 | 未タスク指示書をテンプレート準拠で作成      |
| Phase B | 仕様同期   | 3仕様書テーブルへ未タスクを同時登録         |
| Phase C | 監査       | コマンド検証で `current=0` と参照整合を確認 |

### Phase A: 指示書作成

#### 目的

未タスク指示書を9セクション完全準拠で作成し、苦戦箇所を3.5に記録する。

#### 手順

1. `assets/unassigned-task-template.md` を基に本文を作成する
2. `## メタ情報` を1セクションで記述する
3. Section 3.5 に親タスク苦戦箇所を4項目以上記録する

#### 成果物

- `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md`

#### 完了条件

- 必須見出し10件（メタ情報 + 1〜9）が揃っている
- 3.5の表に課題/発見経緯/解決策/教訓がある

### Phase B: 仕様同期

#### 目的

システム仕様書スキル（aiworkflow-requirements）の正本へ未タスクを同期する。

#### 手順

1. `task-workflow.md` 残課題テーブルに `TASK-9A-C-004` を追加する
2. `ui-ux-feature-components.md` の関連未タスクへ同エントリを追加する
3. `interfaces-agent-sdk-skill.md` の関連未タスクへ同エントリを追加する
4. 変更履歴と `LOGS.md` に反映記録を追加する

#### 成果物

- 3仕様書の未タスクテーブル更新
- `aiworkflow-requirements/LOGS.md` 更新

#### 完了条件

- 3仕様書すべてに同一タスクID/同一パスが記載されている
- 変更履歴に反映記録がある

### Phase C: 監査

#### 目的

登録漏れ・参照切れ・フォーマット不整合がないことを機械的に確認する。

#### 手順

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行
2. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` を実行
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` を実行
4. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行

#### 成果物

- 監査実行ログ（コマンド結果）
- 再生成済み index ファイル

#### 完了条件

- `verify-unassigned-links` で missing=0
- `audit --target-file` と `audit --diff-from HEAD` の `currentViolations.total=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] 9セクション + 3.5 苦戦箇所が記載されている
- [ ] 3仕様書に同一IDで未タスク登録されている

### 品質要件

- [ ] `## メタ情報` が1回のみ
- [ ] Why/What/How が具体的かつ検証可能
- [ ] `current` と `baseline` を分離して記録している

### ドキュメント要件

- [ ] `task-workflow.md` 変更履歴に反映がある
- [ ] `ui-ux-feature-components.md` 変更履歴に反映がある
- [ ] `interfaces-agent-sdk-skill.md` 変更履歴に反映がある
- [ ] `aiworkflow-requirements/LOGS.md` に実行ログがある

---

## 6. 検証方法

### テストケース

| TC-ID | 観点         | 期待結果                        |
| ----- | ------------ | ------------------------------- |
| TC-01 | フォーマット | 必須見出しが全て存在する        |
| TC-02 | 参照整合     | 未タスクリンクに欠損がない      |
| TC-03 | 監査判定     | `currentViolations.total=0`     |
| TC-04 | 仕様同期     | 3仕様書に同一エントリが存在する |

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD
rg -n "^## メタ情報" docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                           |
| ---------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| 既存の変更履歴重複により差分が読みにくい | 中     | 中       | 追加行は最新行として先頭に限定し、既存重複は別タスクで整理する |
| 未タスク登録が1仕様書のみで止まる        | 高     | 中       | 3仕様書同期をPhase B完了条件に固定する                         |
| 監査結果の読み間違い                     | 高     | 中       | `currentViolations.total` を合否基準として明記する             |
| 将来のテンプレート変更で再度崩れる       | 中     | 低       | `task-specification-creator` のガイドラインに追記する          |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md`
- `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし（Phase 12 再確認での運用課題抽出）

### 補足事項

- 本タスクは「再発防止用の未タスク登録」であり、SkillEditor機能追加の実装タスクではない。
- 実装着手時は `TASK-9A-C-001` / `TASK-9A-C-003` との依存関係を再評価すること。
