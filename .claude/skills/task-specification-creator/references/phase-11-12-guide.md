# Phase 11/12 実行ガイダンス

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 11（手動テスト検証）、Phase 12（ドキュメント更新）実行時
> - 読み込み条件: 手動テストまたはドキュメント更新を行うとき

---

## Phase 11: 手動テスト検証

### 実行フロー

```
1. 関連する自動テストを全て実行して確認
   ↓
2. テストカテゴリを特定（機能/エラーハンドリング/アクセシビリティ/統合）
   ↓
3. 各カテゴリのテスト項目を実行・記録
   ↓
4. 結果を outputs/phase-11/manual-test-result.md に出力
   ↓
5. 発見課題を outputs/phase-11/discovered-issues.md に出力
```

### テスト結果レポート形式

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID | 機能 | 期待結果 | 結果 | 備考 |
| ----- | ---- | -------- | ---- | ---- |
| TC-001 | {{機能名}} | {{期待される動作}} | PASS | |

### エラーハンドリングテスト（異常系）

| TC-ID | 状況 | 期待結果 | 結果 | 備考 |
| ----- | ---- | -------- | ---- | ---- |
| TC-101 | {{異常状況}} | {{期待されるエラー}} | PASS | |

### アクセシビリティテスト

| TC-ID | 要件 | 結果 | WCAG違反 |
| ----- | ---- | ---- | -------- |
| TC-201 | キーボードナビゲーション | PASS | なし |

### 統合テスト連携

| テスト項目 | 結果 | 課題有無 |
| ---------- | ---- | -------- |
| IPC接続 | PASS | なし |
```

---

## Phase 12: ドキュメント更新

### 必須タスク（5タスク - 全て完了必須）

#### Task 1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者 | 内容 |
| ------ | -------- | ---- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）** |
| Part 2 | 開発者・技術者 | 技術的詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）記述ルール**:
- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明

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

📖 **詳細**: `references/technical-documentation-guide.md`

---

#### Task 2: システム仕様書更新【必須・2ステップ】

> **重要**: 詳細は `references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録【必須・全タスク】**

```
□ 該当する仕様書に「## 完了タスク」セクションを追加
□ 「## 関連ドキュメント」に実装ガイドリンクを追加
```

**Step 2: システム仕様更新【条件付き】**

更新判断基準:

| 更新必要 | 更新不要 |
| -------- | -------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| 新規定数/設定値追加 | バグ修正（仕様変更なし） |
| 外部連携インターフェース追加 | テスト追加のみ |

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

---

#### Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

| 観点 | 確認内容 |
| --- | --- |
| テンプレート改善 | Phaseテンプレートの不足・曖昧な判定条件 |
| ワークフロー改善 | 自動検証化できるチェックポイント |
| ドキュメント改善 | 横断ガイドライン化すべき知見 |

**出力**: `outputs/phase-12/skill-feedback-report.md`

---

## Phase 12 完了条件チェックリスト

- [ ] 実装ガイド（Part 1: **中学生レベル概念説明**）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 【Step 1-A】システム仕様書に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】LOGS.md **2ファイル両方**（aiworkflow-requirements + task-specification-creator）を更新した
- [ ] 【Step 1-A】SKILL.md **2ファイル両方**の変更履歴テーブルにバージョンを追記した ⚠️ **P23: 漏れやすい**
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（Warning の分類は `spec-update-workflow.md` Step 1-G.3.1 を参照）
- [ ] 【Step 1-C】`grep -rn "TASK_ID" references/` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.md再生成を実行した（下記コマンド参照）
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 【Step 2】今回の実装で苦戦した箇所をシステム仕様書（`lessons-learned.md` または関連 `interfaces-*.md`）に記録した
- [ ] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜3の実施結果を記録した
- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】
- [ ] 未タスク検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した ⚠️ **P24: 漏れやすい**
- [ ] 未タスク検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 未タスク検出時、**指示書の物理ファイル存在を確認**（`ls docs/30-workflows/unassigned-task/` で作成済みファイルを検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`task-workflow.md` 内の未タスクリンク参照切れが0件であることを確認
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、completed成果物の参照切れが0件であることを確認
- [ ] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [ ] **未実施**タスク指示書（未着手/未実施/進行中）が `completed-tasks/unassigned-task/` に混在していない（存在する場合は `docs/30-workflows/unassigned-task/` へ是正）
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、baseline監視結果（全体違反件数）を記録した
- [ ] artifacts.jsonが更新されている
- [ ] .claude/rules/ の技術的負債テーブルが最新（負債解消時は「完了」に更新）
- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した（下記コマンド参照）
- [ ] 【品質】コメントフォーマット（JSDoc形式）が統一されている
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されていること（親タスクのtasks/ではない） ⚠️ **P3派生: TASK-9B-Iで再発**
- [ ] テスト数が実際の `it()` ブロック数と一致すること（Phase 4 の想定値ではなく実測値を使用） ⚠️ **TASK-9B-I教訓**
- [ ] SDK 型定義変更時は、カスタム declare module ファイルの有無を確認し、不要なら削除を未タスク化すること
- [ ] **本Phase内の全タスクを100%実行完了**

### Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --regenerate

# 未実施タスク誤配置チェック（completed配下に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"

# 対象監査（今回変更分合否: current）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/{{TASK_FILE}}.md

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

# SKILL検証（正規経路: quick_validate.js）— 判定基準は spec-update-workflow.md Step 1-G.3.1 参照
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements

# 検証結果の読み方:
#   ✓ = Pass（検証項目をパス）
#   ⚠ = Warning（合否に影響しない。分類は spec-update-workflow.md Step 1-G.3.1 参照）
#   ✗ = Error（修正必須）
```

### ⚠️ Phase 12 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID | 漏れやすいポイント | 対策 |
| -- | ------------------ | ---- |
| P23 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P24 | 未タスク検出時の関連ファイル調査不足 | `grep -rn` で同様パターンをプロジェクト全体から検索 |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P3 | 未タスク管理の3ステップ不完全 | 指示書作成だけでなく、テーブル登録まで完了すること |
| P3派生 | 未タスク配置ディレクトリの間違い（TASK-9B-I） | 必ず `unassigned-task/` に配置。親タスクの `tasks/` ではない |
| P48 | 全体監査FAILを今回差分FAILと誤認 | baselineとcurrentを分離し、今回差分起因の有無を別レポートで記録 |
| - | テスト数の設計時固定値使用（TASK-9B-I） | Phase 12では `grep -c "it\\(" *.test.ts` で実測値を使用 |

---

## 完了タスク

### タスク: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 skill-creator検証ゲート整合化（2026-02-26完了）

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                    |
| 完了日     | 2026-02-26                                                                                     |
| ステータス | **完了**                                                                                       |
| 概要       | `quick_validate.js` 統一経路、Warning判定基準、Phase 11/12成果物の整合、未タスク監査運用を同期 |

## 関連ドキュメント

- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-11-manual-test.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-12-documentation.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/spec-update-summary.md`

---

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-02-26 | `UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001` の完了タスク記録・関連ドキュメントリンクを追加 |
| 2026-02-25 | `audit-unassigned-tasks.js` の scope制御（`--target-file`/`--diff-from`）を標準手順化。Phase 12チェックリストを「対象監査（current）→全体監査（baseline）」の2段判定に更新 |
| 2026-02-25 | skill-creator連携を追加: Phase 12完了条件に `quick_validate.js` 検証を追加し、SKILL frontmatterの破損検知を標準化 |
| 2026-02-25 | 未タスク監査運用を補強: `audit-unassigned-tasks.js` が既存baseline違反で失敗する場合の current差分分離手順（`detect-unassigned-tasks --scan`）と記録要件を追加 |
| 2026-02-24 | Phase 12整合性改善: 必須タスク数を5に更新（Task 5: skill-feedback-report 必須化）。完了条件に `spec-update-summary.md` 作成・`artifacts.json` 二重台帳同期チェックを追加 |
| 2026-02-22 | 未タスク監査強化: `audit-unassigned-tasks.js` 実行チェックを追加（フォーマット違反/命名違反/誤配置の一括検証） |
| 2026-02-13 | TASK-FIX-13-1教訓反映: Phase 12完了チェックリストに「苦戦箇所のシステム仕様書記録」を追加 |
| 2026-02-12 | TASK-9B-I教訓反映: 未タスク配置ディレクトリ確認・テスト数実測値確認・SDK declare module確認の3項目をチェックリストに追加。漏れやすいポイントテーブルに2件追加 |
| 2026-02-12 | TASK-FIX-7-1スキル改善: 未タスク指示書の物理ファイル存在確認ステップを完了条件チェックリストに追加 |
| 2026-02-10 | Phase 12チェックリスト強化: Step 1-D(topic-map.md再生成)、ESLintキャッシュクリア、コメントフォーマット統一、自動化コマンドセクション追加 |
| 2026-01-26 | SKILL.mdから分離・作成、中学生レベル解説の仕様を明確化 |
