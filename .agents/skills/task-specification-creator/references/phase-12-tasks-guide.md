# Phase 12: 6タスク詳細ガイド

> 親ファイル: [phase-11-12-guide.md](phase-11-12-guide.md)
> 読み込み条件: Phase 12 の各タスク（Task 1〜6）を実施するとき。

---

## Phase 12: ドキュメント更新

### 必須タスク（6タスク - 全て完了必須）

#### Task 1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者 | 内容 |
| ------ | -------- | ---- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）** |
| Part 2 | 開発者・技術者 | 技術的詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）記述ルール**:
- 日常生活での例え話を**必ず**含め、`たとえば` を最低1回明示する
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

**Part 1 テンプレート**:
```markdown
### X.X [機能名]とは何か

#### 日常生活での例え

[日常の具体的なシーン]に似ています。

例えば、[身近な例]のようなものです。

#### この機能でできること

| 機能 | 説明 | 例 |
|------|------|-----|
| 機能A | 簡単な説明 | 具体例 |
```

詳細: `references/technical-documentation-guide.md`
実体確認: `references/phase12-checklist-definition.md`

---

#### Task 2: システム仕様書更新【必須・2ステップ】

> **重要**: 詳細は `references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録【必須・全タスク】**

```
□ 該当する仕様書に「## 完了タスク」セクションを追加
□ 「## 関連ドキュメント」に実装ガイドリンクを追加
```

詳細手順: [spec-update-step1-detailed-checklist.md](spec-update-step1-detailed-checklist.md)

**Step 2: システム仕様更新【条件付き】**

更新判断基準:

| 更新必要 | 更新不要 |
| -------- | -------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| 新規定数/設定値追加 | バグ修正（仕様変更なし） |
| 外部連携インターフェース追加 | テスト追加のみ |

IPC/型定義のマッピング: [spec-update-ipc-mapping-guide.md](spec-update-ipc-mapping-guide.md)

---

#### Task 3: ドキュメント更新履歴作成

```bash
# 自動生成スクリプト（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

生成後、手動で補完:
- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

#### Task 3.5: 実行証跡整合ガード【必須】

Phase 12 は「成果物ファイルが存在する」だけでは完了扱いにしない。以下3点を同時に満たすこと:

1. `outputs/phase-12/` の必須5成果物が実在する
2. `artifacts.json` の `phases.12.status` が `completed` である
3. `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストが実体証跡と同期している

差分監査の合否判定は `audit-unassigned-tasks --diff-from HEAD` の `currentViolations.total` を使用し、`baselineViolations.total` は監視値として別記録する。

**UI/UX変更タスク専用ゲート（⛔ FB-UT-UIUX-001-A）**: UI/UX変更タスクでは上記3点に加え、以下4点が `outputs/phase-11/` に存在することを確認する。1点でも欠ければ Phase 12 PASS 禁止。

| 必須ファイル | 確認コマンド |
| ------------ | ------------ |
| `outputs/phase-11/screenshots/screenshot-plan.json` | `ls outputs/phase-11/screenshots/screenshot-plan.json` |
| `outputs/phase-11/screenshots/phase11-capture-metadata.json` | `ls outputs/phase-11/screenshots/phase11-capture-metadata.json` |
| `outputs/phase-11/screenshot-coverage.md` | `ls outputs/phase-11/screenshot-coverage.md` |
| `outputs/phase-11/screenshots/*.png`（1件以上） | `ls outputs/phase-11/screenshots/*.png \| wc -l` > 0 |

---

#### Task 4: 未タスク検出レポート作成【0件でも出力必須】

| ソース | 確認項目 |
| ------ | -------- |
| Phase 11テスト結果 | FAILテスト |
| 発見課題 | 重要度「高」課題 |
| アクセシビリティ | WCAG違反 |

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース | 検出数 |
| ------ | ------ |
| テスト結果 | 0件 |
| 発見課題 | 0件 |
| アクセシビリティ | 0件 |
| **合計** | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

詳細: [unassigned-task-guidelines.md](unassigned-task-guidelines.md)

---

#### Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

| 観点 | 確認内容 |
| --- | --- |
| テンプレート改善 | Phaseテンプレートの不足・曖昧な判定条件 |
| ワークフロー改善 | 自動検証化できるチェックポイント |
| ドキュメント改善 | 横断ガイドライン化すべき知見 |

**出力**: `outputs/phase-12/skill-feedback-report.md`

Task 5 の基本対象は `aiworkflow-requirements` と `task-specification-creator` だが、ユーザーがスキル改善を明示した場合、または Task 5 で再利用パターンを抽出して `skill-creator` 自体を更新した場合は、`skill-creator` も同じレポートへ含める。

---

#### Task 6: phase12-task-spec-compliance-check【必須・最終確認】

Phase 12 の Task 1〜5 と Step 1-A〜1-G / Step 2 を 1 ファイルへ集約した root evidence。

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**最低限必要な内容**:

- Task 12-1〜12-5 の成果物存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 結果、root parity、artifacts 同期、planned wording 0 件の記録

**判定ルール（PASS 断言の防止）**:

- 未充足が 1 つでもある場合、`PASS` を書かず `FAIL` または `BLOCKED` とし、blocker を列挙する
- `PASS` は「成果物の実体 + validator 実測値 + same-wave sync 証跡」が揃った後にのみ許可する

Task 6 は「存在すればよい」ではなく、Phase 12 の最終判定を裏付ける root evidence として機械検証結果を残す。

---

## Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --regenerate

# 実装ガイド内容要件（Task 1）
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json

# 未実施タスク誤配置チェック（completed-only area に未着手/未実施が混在していないか）
rg -n "^\| ステータス\s*\|.*未着手|^\| ステータス\s*\|.*未実施|^\| ステータス\s*\|.*進行中" \
  docs/30-workflows/completed-tasks -g "*.md"

# 対象監査（今回変更分合否: current）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/{{TASK_FILE}}.md

# standalone 完了指示書の current 監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/{{TASK_FILE}}.md

# 差分監査（git差分を current 判定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# TODO/FIXMEスキャン（補助）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc \
  --output docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-12/.tmp-unassigned-candidates.json

# ESLintキャッシュクリア（Hooksでエラーが残る場合）
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未使用importの自動修正
pnpm lint --fix

# SKILL検証（正規経路: quick_validate.js）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements

# 全3スキル一括検証
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

---

## Phase 12 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID | 漏れやすいポイント | 対策 |
| -- | ------------------ | ---- |
| P23 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P24 | 未タスク検出時の関連ファイル調査不足 | `grep -rn` で同様パターンをプロジェクト全体から検索 |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P3 | 未タスク管理の3ステップ不完全 | 指示書作成だけでなく、テーブル登録まで完了すること |
| P3派生 | 未タスク配置ディレクトリの間違い | 必ず `unassigned-task/` に配置。親タスクの `tasks/` ではない |
| P48 | 全体監査FAILを今回差分FAILと誤認 | baselineとcurrentを分離し、今回差分起因の有無を別レポートで記録 |
