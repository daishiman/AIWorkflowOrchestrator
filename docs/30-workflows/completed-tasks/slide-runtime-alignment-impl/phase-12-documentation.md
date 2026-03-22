# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 12                           |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

実装完了後のドキュメントを更新し、次のコントリビューターが実装内容を正確に理解できる状態にする。`05-task-execution.md` の Phase 12 チェックリストに完全準拠する。

> **注意**: 全 Task 完了前に「完了」と記録しない（P4 対策）。各 Step は実行後に結果を記録する。

## 実行タスク

| タスク | 内容                                               | 必須 |
| ------ | -------------------------------------------------- | ---- |
| Task 1 | 実装ガイド作成（Part 1 + Part 2）                  | 必須 |
| Task 2 | システム仕様書更新（Step 1-A〜Step 2）             | 必須 |
| Task 3 | documentation-changelog.md 作成                    | 必須 |
| Task 4 | 未タスク検出レポート（0件でも必須）                | 必須 |
| Task 5 | スキルフィードバックレポート（改善点なしでも必須） | 必須 |

## 参照資料

| 資料名                  | パス                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                                            |
| 仕様書更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  |
| IPC 正本                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      |
| drift 記録              | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`（P1, P2, P3, P4, P25, P43, P51, P56, P57）                 |

---

## Task 1: 実装ガイド作成

**成果物パス**: `docs/30-workflows/slide-runtime-alignment-impl/implementation-guide.md`

### Part 1: 中学生レベル概念説明

たとえば、スライド機能をお店のシステムに例えると...という比喩を使って、技術的な前提知識なしに理解できる説明を作成する。

**記載内容**:

1. **スライド機能とは何か**（お店のバックヤードとフロントの例え）
   - 「AIがスライドを作ってくれる機能」
   - フェーズ（hearing/structure/html/modifier）を「料理のレシピのステップ」に例える

2. **IPC とは何か**（フロアスタッフとバックヤードの伝言システム）
   - 「お客さんの注文（Renderer）→ 注文票（Preload）→ 厨房（Main Process）」の流れ

3. **RuntimeResolver とは何か**（配送方法の自動選択システム）
   - 「自分で届けるか（integrated）、別の配送業者に頼むか（handoff）を自動で判断する」
   - handoff の場合は「この宅配業者に渡してください」という指示書（guidance）を返す

4. **今回の修正で何が変わったか**
   - 「伝言票の書き方（チャネル名）を正しいルールに統一した」
   - 「厨房に繋がる扉（IPC 接続）を正しく開けた」
   - 「セキュリティチェック（validateIpcSender）を全ての窓口に設置した」

### Part 2: 開発者向け実装詳細

**記載内容**:

1. **12チャネル定義**

   | チャネル                    | 種別   | 引数                                     | 戻り値                                    |
   | --------------------------- | ------ | ---------------------------------------- | ----------------------------------------- |
   | `slide:executePhase`        | invoke | `phase: SkillPhase, projectPath: string` | `{ success, data: SkillExecutionResult }` |
   | `slide:watch-start`         | invoke | `projectPath: string`                    | `{ success }`                             |
   | `slide:watch-stop`          | invoke | `projectPath: string`                    | `{ success }`                             |
   | `slide:sync-status`         | invoke | `projectPath: string`                    | `{ success, data: SyncStatus }`           |
   | `slide:reverse-sync`        | invoke | `projectPath: string`                    | `{ success }`                             |
   | `slide:cancel`              | invoke | `projectPath: string`                    | `{ success }`                             |
   | `slide:sync-status-changed` | push   | -                                        | `SyncStatus`                              |
   | `slide:sync-progress`       | push   | -                                        | `{ percent, message }`                    |
   | `slide:sync-error`          | push   | -                                        | `{ code, message }`                       |
   | `slide:execution-progress`  | push   | -                                        | `number`                                  |
   | `slide:structureChanged`    | push   | -                                        | `void`                                    |
   | `slide:watch-status`        | push   | -                                        | `boolean`                                 |

2. **RuntimeResolver contract**

   ```typescript
   // RuntimeResolver.resolve() の戻り値
   type RuntimeMode = "integrated" | "handoff";

   // handoff 時の guidance
   interface HandoffGuidance {
     command: string; // terminal で実行するコマンド
     contextSummary: string; // コンテキスト要約
     reason: string; // handoff の理由
   }
   ```

3. **validateSlideRequest() パターン**

   6本の invoke ハンドラ全てで以下の順序で検証する:
   1. `validateIpcSender()` — 送信元ウィンドウの検証
   2. P42 3段バリデーション — `typeof === "string"` → `=== ""` → `.trim() === ""`
   3. `detectPathTraversal()` — パストラバーサル攻撃の防止

4. **Wave 実装順序と依存関係**（Phase 2 設計の要約）

---

## Task 2: システム仕様書更新

> **重要（P43・P57 対策）**: サブエージェントに委譲する場合は3ファイル以下に分割する。各ファイルの更新完了を確認してから次へ進む。

### Step 1-A: タスク完了記録（2ファイル必須）

**対象 1**: `.claude/skills/aiworkflow-requirements/LOGS.md`

追記内容:

```
## [2026-03-22] slide-runtime-alignment-impl (#1363)
- D1-D6（6件の drift）を解消
- 12チャネルを正本仕様に統一
- validateIpcSender + P42 + path guard を全ハンドラに適用
- RuntimeResolver 統合 + modifier-skill.ts 統合
- slideSlice store fields 7項目を追加
```

**対象 2**: `.claude/skills/task-specification-creator/LOGS.md`

同一内容を追記する（P1/P25 対策: 2ファイル両方の更新を確認すること）。

**SKILL.md 変更履歴更新（2ファイル）**:

- `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴テーブルに追記
- `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブルに追記

### Step 1-B: 実装状況テーブル更新

**対象**: `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`

drift 記述箇所を「実装済み」ステータスに更新する。

更新対象の drift 記述:

- `D1: IPC handler 未接続` → `実装済み（2026-03-22）`
- `D2: チャネル名 legacy` → `実装済み（2026-03-22）`
- `D3: SDK 直接利用` → `実装済み（2026-03-22）`
- `D4: modifier-skill 独立実装` → `実装済み（2026-03-22）`
- `D5: validateIpcSender 未実装` → `実装済み（2026-03-22）`
- `D6: slideSlice store fields 不足` → `実装済み（2026-03-22）`

### Step 1-C: 関連タスクテーブル確認

```bash
grep -rn "#1363\|slide-runtime-alignment-impl\|TASK-SLIDE-RUNTIME" .claude/skills/aiworkflow-requirements/references/
```

検出された関連仕様書に完了タスクの参照リンクを追加する。

### Step 1-D: topic-map.md 再生成

> **必須（P2/P27 対策）**: 仕様書に変更があれば必ず再生成する。「新規セクションなし」でも更新・削除があれば再生成が必要。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、`indexes/topic-map.md` が更新されていることを `git diff --stat -- .claude/skills/` で確認する。

### Step 2: IPC 正本仕様書の更新

**対象**: `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`

slide セクションの各チャネル定義を「実装済み」ステータスに更新する。

更新内容:

- invoke 6本、push 6本の合計12チャネルの実装ステータスを「`implemented`」に変更
- `validateSlideRequest()` ヘルパーの実装について補足を追記
- `HandoffGuidance` 型の追加について補足を追記

---

## Task 3: documentation-changelog.md 作成

**成果物パス**: `docs/30-workflows/slide-runtime-alignment-impl/documentation-changelog.md`

> **注意（P4 対策）**: 全 Step 完了後に changelog に「完了」と記録する。実行前に「完了」と書かない。

記載フォーマット:

```markdown
# Documentation Changelog: slide-runtime-alignment-impl

## 概要

- 機能: slide-runtime-alignment-impl
- Issue: #1363
- 完了日: 2026-03-22

## Task 1: 実装ガイド

- [x] implementation-guide.md 作成（Part 1 + Part 2）

## Task 2: システム仕様書更新

### Step 1-A

- [x] aiworkflow-requirements/LOGS.md 更新
- [x] task-specification-creator/LOGS.md 更新
- [x] aiworkflow-requirements/SKILL.md 変更履歴更新
- [x] task-specification-creator/SKILL.md 変更履歴更新

### Step 1-B

- [x] workflow-ai-runtime-authmode-unification.md の drift D1-D6 を「実装済み」に更新

### Step 1-C

- [x] 関連タスクテーブル確認・更新（検出件数: N件）

### Step 1-D

- [x] topic-map.md 再生成実行（git diff で変更を確認済み）

### Step 2

- [x] api-ipc-system-core.md の slide 12チャネルを「実装済み」に更新

## Task 3

- [x] この changelog ファイル作成

## Task 4

- [x] unassigned-task-report.md 作成（検出件数: N件）

## Task 5

- [x] skill-feedback-report.md 作成
```

---

## Task 4: 未タスク検出レポート

**成果物パス**: `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task-report.md`

> **必須（P3/P38 対策）**: 0件でも必ず作成する。

未タスクを検出した場合は P3 の3ステップを全て実行する:

1. `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task/` に指示書ファイルを作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**再評価クローズ時（P56 対策）**: タスクを再評価クローズした場合は `gh issue close <number>` で GitHub Issue を同時に Close する。

### 未タスク候補（Phase 12 で検出）

- **UT-SLIDE-CI-DRIFT-SCAN-001**: `api-ipc-system-core.md` の canonical チャネルリストと `registerAllIpcHandlers()` の実際の登録リストを自動突合する CI スクリプトの作成（根拠: why思考による5 Why分析 — drift再発の構造的防止）
- **UT-SLIDE-GUIDANCE-UI-001**: `handoffGuidance` を表示する Renderer コンポーネント（SlideGuidanceBlock）の実装（根拠: システム思考 — Store に保存しても表示コンポーネントがなければユーザーに到達しない）
- **UT-SLIDE-IPC-TEMPLATE-001**: IPC ハンドラ追加時の標準テンプレート（登録・セキュリティ・Preload 同期を含む scaffold）の整備（根拠: 帰納的思考 — D1/D2/D5 は「最後の一手の省略」パターン）

**unassigned-task-detection.md の更新**:

`.claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md` に未タスク検出件数とステータスを更新する。

---

## Task 5: スキルフィードバックレポート

**成果物パス**: `docs/30-workflows/slide-runtime-alignment-impl/skill-feedback-report.md`

> **必須（P28 対策）**: 改善点がなくても「改善点なし」として作成する。

記載フォーマット:

```markdown
# Skill Feedback Report: slide-runtime-alignment-impl

## ワークフロー上の改善点

### 発見した問題

[問題があれば記載、なければ「なし」]

### 改善提案

[提案があれば記載、なければ「改善点なし。現行のワークフローで問題なく進行できた」]

## 既知の落とし穴（pitfalls）に関するフィードバック

### 今回のタスクで発生した pitfall

[発生があれば記載]

### 新規 pitfall の候補

[新しいパターンがあれば記載]

## 仕様書品質に関するフィードバック

[Phase 仕様書の改善点があれば記載]
```

---

## Mirror Sync（必要な場合）

`.claude/skills/` を正本として更新した後、`.agents/skills/` との同期状態を確認する。

```bash
# 差分確認
diff -qr .claude/skills/ .agents/skills/ 2>/dev/null

# 差分がある場合は rsync で同期
rsync -avz --checksum .claude/skills/ .agents/skills/
```

---

## 成果物

| 成果物                     | パス                                                                          | 説明                 |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| 実装ガイド Part 1          | `outputs/phase-12/implementation-guide-part1.md`                              | 中学生レベル概念説明 |
| 実装ガイド Part 2          | `outputs/phase-12/implementation-guide-part2.md`                              | 開発者向け技術詳細   |
| documentation-changelog.md | `docs/30-workflows/slide-runtime-alignment-impl/documentation-changelog.md`   | 更新履歴             |
| 未タスク検出レポート       | `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task-detection.md` | 検出結果             |
| スキルフィードバック       | `docs/30-workflows/slide-runtime-alignment-impl/skill-feedback.md`            | 改善提案             |

## 完了条件チェックリスト

### Task 1

- [ ] `implementation-guide.md` Part 1（中学生レベル概念説明・日常例え使用）が作成済み
- [ ] `implementation-guide.md` Part 2（12チャネル定義・RuntimeResolver contract・validateSlideRequest パターン）が作成済み

### Task 2

- [ ] `aiworkflow-requirements/LOGS.md` に完了記録が追記されている
- [ ] `task-specification-creator/LOGS.md` に完了記録が追記されている（**2ファイル両方確認**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴が更新されている
- [ ] `task-specification-creator/SKILL.md` 変更履歴が更新されている
- [ ] `workflow-ai-runtime-authmode-unification.md` の D1-D6 が「実装済み」に更新されている
- [ ] 関連タスクテーブルの確認・更新が完了している
- [ ] `topic-map.md` の再生成が完了し、`git diff` で変更が確認できる
- [ ] `api-ipc-system-core.md` の slide セクションが「実装済み」に更新されている

### Task 3

- [ ] `documentation-changelog.md` が全 Step 完了後に作成されている（実行前の「完了」記載なし）

### Task 4

- [ ] `unassigned-task-report.md` が作成されている（0件でも作成済み）
- [ ] 未タスクがある場合は3ステップ（指示書・残課題テーブル・参照リンク）が全て完了している
- [ ] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [ ] 再評価クローズ分の GitHub Issue が Close されている（P56 対策）

### Task 5

- [ ] `skill-feedback-report.md` が作成されている（改善点なしでも作成済み）

### Mirror Sync

- [ ] `.claude/skills/` と `.agents/skills/` の差分が確認されている（差分ある場合は同期済み）

## 次のPhase

Phase 13（完了）へ進む。
