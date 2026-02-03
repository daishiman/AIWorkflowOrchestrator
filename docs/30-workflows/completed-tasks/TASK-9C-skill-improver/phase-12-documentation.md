# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 12                               |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- Task 1: 実装ガイド作成【必須】
- Task 2: システムドキュメント更新【必須】
- Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】
- Task 4: 未タスク検出【必須】

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

### Part 1: 概念説明（中学生レベル）

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**例え話のヒント**:

- スキル分析 → 「テストの採点」「健康診断」
- 改善提案 → 「先生からのアドバイス」「コーチからの改善点」
- 自動修正 → 「自動添削機能」「スペルチェック」
- バックアップ → 「テストの下書きを保存しておく」

### Part 2: 技術的詳細

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- IPCチャネル仕様を記載
- 使用例（コードサンプル）を記載
- エラーハンドリングを説明

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書（`interfaces-agent-sdk-skill.md`等）に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

**⚠️ 重要**: LOGS.mdは以下の**2ファイル両方**を更新すること:
| ファイル | 目的 |
| -------- | ---- |
| `.claude/skills/aiworkflow-requirements/LOGS.md` | システム仕様書更新の記録 |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |

```markdown
## 完了タスク

### タスク: TASK-9C スキル改善・自動修正機能（2026-02-XX完了）

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-9C                                       |
| 完了日     | 2026-02-XX                                    |
| ステータス | **完了**                                      |
| テスト数   | XX（自動）+ 17（手動）                        |
| 成果物     | SkillAnalyzer, SkillImprover, PromptOptimizer |

#### テスト結果サマリー

| カテゴリ        | テスト数 | PASS | FAIL |
| --------------- | -------- | ---- | ---- |
| SkillAnalyzer   | X        | X    | 0    |
| SkillImprover   | X        | X    | 0    |
| PromptOptimizer | X        | X    | 0    |
| IPC統合         | X        | X    | 0    |

#### 成果物

| 成果物             | パス                                                             |
| ------------------ | ---------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/.../outputs/phase-11/manual-test-result.md`   |
| 実装ガイド         | `docs/30-workflows/.../outputs/phase-12/implementation-guide.md` |
```

### Step 1-B: 実装状況テーブル更新【必須】

以下のファイルの実装状況を「完了」に更新:

- `interfaces-agent-sdk-skill.md`: skill:analyze, skill:improve, skill:optimize チャネル

**⚠️ 注意**: 「既存型を再利用しているので更新不要」は誤判断です。実装状況テーブルの更新は必須です。

### Step 1-C: 関連タスクテーブル更新【必須】

該当する仕様書の「関連タスク」「未タスク候補」テーブルでTASK-9Cのステータスを更新。

**確認すべきファイル**:

| 確認対象ファイル                  | テーブル名   |
| --------------------------------- | ------------ |
| `arch-state-management.md`        | 関連タスク   |
| `interfaces-agent-sdk-history.md` | 未タスク候補 |
| `interfaces-agent-sdk-skill.md`   | 関連タスク   |

**⚠️ 発見手順**: 必ずGrepで全箇所を確認すること:

```bash
grep -rn "TASK-9C" .claude/skills/aiworkflow-requirements/references/
```

### Step 1-D: topic-map.md再生成【⚠️ 見落としやすい】

仕様書にセクション追加・行数変更があった場合、以下を実行:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 2: システム仕様更新【条件付き】

**更新必要な場合**:

- 新規型定義（SkillAnalysis, Suggestion, ImprovementResult等）
- 新規IPCチャネル（skill:analyze, skill:improve, skill:optimize）
- 新規サービス（SkillAnalyzer, SkillImprover, PromptOptimizer）

**更新対象ファイル**:

| ファイル                            | 更新内容                       |
| ----------------------------------- | ------------------------------ |
| `interfaces-agent-sdk-skill.md`     | 型定義、IPCチャネル追加        |
| `architecture-electron-services.md` | サービス一覧追加               |
| `security-skill-execution.md`       | 改善操作のセキュリティ考慮追加 |

**更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記する

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

---

## Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                    |
| --- | ---------------------- | --------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項         |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項         |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項        |
| 4   | 元タスク仕様書         | 「スコープ外」項目          |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント |

**スコープ外候補**:

- UI表示機能（分析結果のUI、改善提案一覧UI）
- 改善履歴の永続化
- A/Bテスト実行・結果比較機能
- スキル品質ダッシュボード

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                    |
| -------------------- | ----------------------------------------------- | ---- | ----------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1 + Part 2         |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力） |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成          |

---

## 完了条件

### Task 1: 実装ガイド作成

- [ ] 実装ガイド（Part 1: 概念的説明 - 中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている

### Task 2: システムドキュメント更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] **詳細テンプレート**で完了記録を追加した（テスト結果サマリー表・成果物テーブル含む）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加した

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書の「実装状況」テーブルがある場合、該当行を「完了」に更新した

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-9C"` で全仕様書を検索した
- [ ] 該当タスクのステータスを「**完了**」に更新した

#### Step 1-D: topic-map.md再生成

- [ ] `generate-index.js` を実行してtopic-map.mdを再生成した

#### Step 2: システム仕様更新

- [ ] システム仕様更新の要否を判断した
- [ ] 更新実施/更新不要の理由を `documentation-changelog.md` に記録した

### Task 3: ドキュメント更新履歴

- [ ] `documentation-changelog.md` が作成されている
- [ ] `artifacts.json` が更新されている

### Task 4: 未タスク検出

- [ ] **未タスク検出レポートが出力されている**【0件でも必須】
- [ ] 検出された未タスクに対して指示書が作成されている（1件以上の場合）

### Phase完了確認

- [ ] **本Phase内の全タスク（Task 1〜4）を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成（Part 1 + Part 2）
2. Task 2 Step 1-A: タスク完了記録
3. Task 2 Step 1-B: 実装状況テーブル更新
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 1-D: topic-map.md再生成
6. Task 2 Step 2: システム仕様更新判断
7. Task 3: documentation-changelog.md & artifacts.json更新
8. Task 4: 未タスク検出レポート作成
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜4）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 12
```

---

## フォールバック手順

| スクリプト        | 代替手順                                             |
| ----------------- | ---------------------------------------------------- |
| complete-phase.js | 手動で artifacts.json を更新（Phase 12成果物を追加） |

---

## 次のPhase

Phase 13: PR作成
