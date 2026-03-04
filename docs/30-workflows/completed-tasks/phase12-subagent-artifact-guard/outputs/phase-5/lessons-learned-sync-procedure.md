# lessons-learned.md 同期手順 — Phase 12 教訓記録・P43対策・三点突合教訓

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 5                                          |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |
| 担当タスク | Task 5-6（lessons-learned.md 同期手順）    |

---

## 1. 対象ファイル

```
.claude/skills/aiworkflow-requirements/references/lessons-learned.md
```

---

## 2. P43関連教訓の記録手順

### 手順 2-1: P43対策教訓の追加・更新

P43「Phase 12 サブエージェントの rate limit 中断」に関連する教訓を追加・更新する。

**追加対象**: SubAgent分割ルール（3ファイル以下/SubAgent）が運用中に新たに発見された知見。

**記録テンプレート:**

```markdown
### P<番号>: <タイトル>

- **教訓**: <1-2文で教訓の要点>
- **再発条件**: <この問題が再発する具体的な条件>
- **解決策**: <今回の対処方法>
- **関連タスク**: <TASK-ID>
```

### 手順 2-2: 3ファイル以下/SubAgent ルールの記録

P43の解決策として、以下の教訓が最新の状態で記録されていることを確認する。

```markdown
### P43: Phase 12 サブエージェントの rate limit 中断

- **教訓**: Phase 12 Task 2を1つのサブエージェントに7ファイルの一括更新を
  委譲すると、rate limit に到達して中断する
- **解決策**:
  1. 仕様書更新は3ファイル以下/エージェントに分割する
  2. LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする
  3. 中断後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認
- **関連タスク**: TASK-9A-B
```

---

## 3. 三点突合ルールの教訓記録手順

### 手順 3-1: 新規教訓の追加（該当する場合）

Phase 12で三点突合を実施した結果、DRIFTが検出された場合や、新たな整合性の問題が発見された場合に教訓を記録する。

**記録テンプレート:**

```markdown
### P<番号>: Phase 12 三点突合の<具体的な問題>

- **教訓**: <三点突合で検出された問題の要点>
- **再発条件**: <この問題が再発する具体的な条件>
  - 例: Step 2判定をdocumentation-changelog.mdに記録した後、
    spec-update-summary.mdの更新を忘れた場合
- **解決策**:
  1. <今回の対処方法>
  2. <再発防止策>
- **関連タスク**: <TASK-ID>
```

### 手順 3-2: 既存教訓との関連付け

三点突合で発見された問題が既存の教訓（P1〜P47）と関連する場合、関連パターンを明記する。

```markdown
- **関連パターン**: P<番号>（<教訓タイトル>）
```

---

## 4. 苦戦箇所の再利用可能化手順

### 手順 4-1: task-workflow.md の苦戦箇所との整合

task-workflow.md に記録した苦戦箇所と、lessons-learned.md に記録する教訓の内容が整合していることを確認する。

**確認ポイント:**

- task-workflow.md の苦戦箇所 → lessons-learned.md に再発条件付きで教訓化
- lessons-learned.md の教訓 → 簡潔解決手順が記録済み

### 手順 4-2: 簡潔解決手順の記録

教訓には、同種の問題に遭遇した場合の解決手順を含める。

```markdown
- **解決策**:
  1. <問題の特定方法>
  2. <修正手順>
  3. <検証方法>
```

---

## 5. 検証コマンド

教訓の記録が正しく行われていることを確認するコマンド。

```bash
# P43教訓が記録されていることを確認
rg -n 'P43.*rate limit\|3ファイル以下' \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md

# 今回タスクの教訓が記録されていることを確認
rg -n 'UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD' \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md
```

---

## 6. 変更履歴

| バージョン | 日付       | 内容                                |
| ---------- | ---------- | ----------------------------------- |
| 1.0.0      | 2026-03-03 | lessons-learned.md 同期手順初版作成 |
