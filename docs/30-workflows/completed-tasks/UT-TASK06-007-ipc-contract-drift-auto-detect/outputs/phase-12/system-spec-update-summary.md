# システム仕様更新サマリー - UT-TASK06-007

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | UT-TASK06-007                |
| 作成日   | 2026-03-18                   |
| Phase    | 12 - ドキュメント            |
| 実施状況 | 全Step実施済み（2026-03-18） |

---

## Step 1-A: ログ・変更履歴の更新

### 実施状況: 完了（4ファイル同時更新）

| ファイル                                             | 更新内容                             | 実施状況 |
| ---------------------------------------------------- | ------------------------------------ | -------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | UT-TASK06-007 完了エントリを追加     | 完了     |
| `.claude/skills/task-specification-creator/LOGS.md`  | UT-TASK06-007 完了エントリを追加     | 完了     |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに本タスク完了を追記 | 完了     |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルに本タスク完了を追記 | 完了     |

### 追記内容テンプレート（LOGS.md）

```markdown
## UT-TASK06-007 - IPC契約ドリフト自動検出スクリプト（2026-03-18）

- **成果物**: `apps/desktop/scripts/check-ipc-contracts.ts`（478行）
- **テスト**: `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`
- **検出ルール**: R-01（存在チェック）、R-02（セマンティクス）、R-03（リテラル）、R-04（登録漏れ）
- **未タスク**: UT-TASK06-007-EXT-001/002/003（拡張対応3件）
- **Phase 10判定**: PASS
```

---

## Step 1-B: 実装ステータステーブルの更新

### 実施状況: 完了

| ファイル                                                                    | 更新内容                                              | 実施状況 |
| --------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 「IPC Contract Drift Auto-Detection」セクションを追記 | 完了     |

### 追記内容の概要

`quality-requirements.md` の「自動化品質チェック」セクションに以下を追加:

```markdown
### IPC Contract Drift Auto-Detection

- **スクリプト**: `apps/desktop/scripts/check-ipc-contracts.ts`
- **実装タスク**: UT-TASK06-007（2026-03-18 完了）
- **検出ルール**: R-01 存在チェック / R-02 セマンティクス / R-03 リテラル / R-04 登録漏れ
- **実行コマンド**: `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only`
- **CI統合**: 推奨（--format json で機械処理可能）
```

---

## Step 1-C: 関連タスクテーブルの更新

### 実施状況: 完了（関連仕様書にUT-TASK06-007記録追加）

```bash
grep -rn "UT-TASK06-007" .claude/skills/aiworkflow-requirements/references/
```

**検索結果**: 0件（既存仕様書に本タスクIDへの参照なし）

以下のファイルへの参照追加を実施済み:

| ファイル                                                                      | 追加した参照内容                                 | 実施状況 |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | -------- |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | UT-TASK06-007 の自動検出スクリプトへの参照を追加 | 完了     |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 自動検出スクリプト実装完了の記録                 | 完了     |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | UT-TASK06-007 完了タスクセクションへの追加       | 完了     |

---

## Step 1-D: topic-map.md 再生成

### 実施状況: 完了（generate-index.js実行完了）

```bash
node ./.claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**実行結果**: 360ファイルを分類、indexes/topic-map.md + indexes/keywords.json（2277キーワード）を生成。

---

## Step 2: システム仕様書の更新

### 実施状況: 完了

| ファイル                                                                      | 更新内容                                                               | 実施状況 |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 7（自動検出）セクションに UT-TASK06-007 スクリプトへの参照を追加 | 完了     |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | IPC Contract Drift Auto-Detection セクションを新設                     | 完了     |
| `.claude/skills/task-specification-creator/references/phase-templates.md`     | Phase 12チェックリストへの自動検出スクリプト確認項目追加               | 完了     |

### ipc-contract-checklist.md への追記内容

Phase 7（自動検出）として以下を追加:

````markdown
## Phase 7: 自動検出スクリプトによる検証

UT-TASK06-007 で実装した自動検出スクリプトを使用して、新規ハンドラ追加後の契約ドリフトを検出する。

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```
````

- **R-01**: Preload公開ハンドラとMainハンドラの対称性
- **R-03**: 文字列リテラルによるチャンネル名指定の検出
- **R-04**: IPC_CHANNELSに定義されたチャンネルの登録漏れ

```

---

## 完了状態サマリー

| Step | 内容                                            | 状態                                         |
| ---- | ----------------------------------------------- | -------------------------------------------- |
| 1-A  | LOGS.md x 2, SKILL.md x 2 の更新               | 完了（4ファイル同時更新）                    |
| 1-B  | quality-requirements.md 更新                    | 完了（セクション追記）                       |
| 1-C  | 関連タスクテーブル確認・更新                    | 完了（3ファイルにUT-TASK06-007記録追加）     |
| 1-D  | topic-map.md 再生成                             | 完了（360ファイル・2277キーワード）          |
| 2    | ipc-contract-checklist.md, quality-requirements.md, phase-templates.md 更新 | 完了 |
```
