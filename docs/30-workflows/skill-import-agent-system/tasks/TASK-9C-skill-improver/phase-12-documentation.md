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

### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書（`interfaces-agent-sdk-skill.md`等）に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

```markdown
## 完了タスク

### タスク: TASK-9C スキル改善・自動修正機能（2026-02-XX完了）

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-9C                                       |
| ステータス | **完了**                                      |
| テスト数   | XX（自動）+ 17（手動）                        |
| 成果物     | SkillAnalyzer, SkillImprover, PromptOptimizer |
```

### Step 1-B: 実装状況テーブル更新【必須】

以下のファイルの実装状況を「完了」に更新:

- `interfaces-agent-sdk-skill.md`: skill:analyze, skill:improve, skill:optimize チャネル

### Step 1-C: 関連タスクテーブル更新【必須】

該当する仕様書の「関連タスク」テーブルでTASK-9Cのステータスを更新。

### Step 2: システム仕様更新【条件付き】

**更新必要な場合**:

- 新規型定義（SkillAnalysis, Suggestion, ImprovementResult等）
- 新規IPCチャネル（skill:analyze, skill:improve, skill:optimize）
- 新規サービス（SkillAnalyzer, SkillImprover, PromptOptimizer）

**更新対象ファイル**:

- `interfaces-agent-sdk-skill.md`: 型定義、IPCチャネル追加
- `architecture-electron-services.md`: サービス一覧追加
- `security-skill-execution.md`: 改善操作のセキュリティ考慮追加

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

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルを更新した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

| スクリプト        | 代替手順                                             |
| ----------------- | ---------------------------------------------------- |
| complete-phase.js | 手動で artifacts.json を更新（Phase 12成果物を追加） |

---

## 次のPhase

Phase 13: PR作成
