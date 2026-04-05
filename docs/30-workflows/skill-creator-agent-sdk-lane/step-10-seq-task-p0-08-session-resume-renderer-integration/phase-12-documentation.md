# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値               |
| --------- | ---------------- |
| Phase     | 12               |
| Phase名   | ドキュメント更新 |
| カテゴリ  | ドキュメント     |
| 前提Phase | Phase 11         |
| 後続Phase | Phase 13         |
| 作成日    | 2026-04-06       |

## 目的

5 つの必須タスクを全て完了し、実装ガイド・システム仕様更新・変更履歴・未タスク検出・スキルFBを揃える。
**全5タスクは0件でも省略不可**。

---

## 実行タスク

1. 実装ガイド作成（Part 1: 中学生レベル + Part 2: 技術者レベル）
2. システム仕様書更新（Step 1-A〜Step 2 の 4 サブステップ）
3. ドキュメント更新履歴作成（全 Step の結果を記録）
4. 未タスク検出レポート作成（0 件でも出力必須）
5. スキルフィードバックレポート作成（改善なしでも出力必須）

Phase 12 では以下の 5 タスクを全て完了する（0件・改善なしでも省略不可）:

| Task | 名称                                | 出力先                                           |
| ---- | ----------------------------------- | ------------------------------------------------ |
| 1    | 実装ガイド作成（2パート構成）       | `outputs/phase-12/implementation-guide.md`       |
| 2    | システム仕様書更新（4サブステップ） | `outputs/phase-12/system-spec-update-summary.md` |
| 3    | ドキュメント更新履歴作成            | `outputs/phase-12/documentation-changelog.md`    |
| 4    | 未タスク検出レポート作成            | `outputs/phase-12/unassigned-task-detection.md`  |
| 5    | スキルフィードバックレポート作成    | `outputs/phase-12/skill-feedback-report.md`      |

---

## Task 1: 実装ガイド作成（2パート構成）

**出力先**: `outputs/phase-12/implementation-guide.md`

### Part 1（中学生レベル）— 必須要件

- 日常生活の例え話を必ず含める
- 専門用語を使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する

**例え話の案**:

> 「スキル作成を途中でやめてアプリを閉じたとき、次に開いたら『前の続きからやりますか？』と聞いてくれる機能です。まるで本に栞を挟んでおくようなイメージです。」

### Part 2（技術者レベル）— 必須要件

以下を全て含める:

1. **インターフェース/型定義（TypeScript）**:
   - `SkillCreatorSessionSummary`
   - `SkillCreatorSessionResumeResult`
   - `SkillCreatorSessionApi`（Preload API）

2. **APIシグネチャと使用例**:
   - IPC チャンネル 4 件（`list-sessions` / `resume-session` / `delete-session` / `cleanup-expired-sessions`）
   - Preload API 経由の呼び出し例

3. **エラーハンドリングとエッジケース**:
   - `errorReason: "incompatible"` / `"expired"` / `"not_found"` の対処方針
   - `listSessions()` 失敗時のサイレント処理

4. **設定可能なパラメータ**:
   - セッション TTL（期限切れ判定基準）

---

## Task 2: システム仕様書更新（4サブステップ）

### Step 1-A: タスク完了記録

以下を更新する:

- `aiworkflow-requirements/references/task-workflow-completed.md`: TASK-P0-08 完了記録を追加
- `aiworkflow-requirements/LOGS.md`: 完了エントリを追加
- `task-specification-creator/LOGS.md`: close-out エントリを追加
- `aiworkflow-requirements/references/topic-map.md`: セッション復元セクションを追加

### Step 1-B: 実装状況テーブル更新

`aiworkflow-requirements/references/task-workflow-backlog.md` の TASK-P0-08 エントリを `spec_created` → `completed` に更新する。

### Step 1-C: 関連タスクテーブル更新

以下の関連タスクのステータスを current facts へ更新する:

| タスク                                   | 更新内容                                         |
| ---------------------------------------- | ------------------------------------------------ |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | TASK-P0-08 Phase 11 完了・スクリーンショット済み |

### Step 2: システム仕様更新（条件付き）

新規インターフェース（`SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` / `SkillCreatorSessionApi`）を追加したため **Step 2 実施必須**。

更新対象: `aiworkflow-requirements/references/interfaces-skill-creator.md`（または対応する仕様ファイル）

---

## Task 3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

以下の形式で全 Step の結果を記録する（「該当なし」も必ず記録）:

```markdown
## TASK-P0-08 documentation changelog

### Step 1-A: タスク完了記録

- task-workflow-completed.md: TASK-P0-08 完了記録追加 ✅
- aiworkflow-requirements/LOGS.md: 更新 ✅
- task-specification-creator/LOGS.md: 更新 ✅
- topic-map.md: セッション復元セクション追加 ✅

### Step 1-B: 実装状況テーブル更新

- TASK-P0-08: spec_created → completed ✅

### Step 1-C: 関連タスクテーブル更新

- UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001: ステータス更新 ✅

### Step 2: システム仕様更新

- interfaces-skill-creator.md: 新規型 3 件追加 ✅
```

---

## Task 4: 未タスク検出レポート作成（0件でも出力必須）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

以下のソースから未タスク候補を検出する:

| ソース                  | 確認項目                           |
| ----------------------- | ---------------------------------- |
| unassigned task 仕様書  | 「スコープ外」として明示された項目 |
| Phase 3/10 レビュー結果 | MINOR 判定の指摘事項               |
| Phase 11 手動テスト     | スコープ外の発見事項・改善提案     |
| コードコメント          | TODO / FIXME / HACK / XXX          |

既知の未タスク:

| 未タスクID                               | 内容                                            |
| ---------------------------------------- | ----------------------------------------------- |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | Phase 11 スクリーンショット取得（既存未タスク） |

```bash
# 未タスク検出スクリプト
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill \
  --output .tmp/unassigned-candidates.json
```

---

## Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**出力先**: `outputs/phase-12/skill-feedback-report.md`

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase 仕様書テンプレートの漏れや曖昧さ |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

また、`outputs/phase-12/phase12-task-spec-compliance-check.md` を root evidence として作成する。

---

## 成果物チェックリスト（Phase 12 完了前に全て確認）

| 成果物                                | パス                                                     | 必須 |
| ------------------------------------- | -------------------------------------------------------- | ---- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | ✅   |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

---

## 参照資料

| 資料名               | パス                                                                                   | 説明                 |
| -------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 5タスク詳細手順      |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1-A〜Step 2手順 |
| Phase 11 テスト結果  | `outputs/phase-11/manual-test-result.md`                                               | 手動テスト結果       |

---

## 完了条件

- [ ] Task 1: `implementation-guide.md`（Part 1 中学生レベル + Part 2 技術者レベル）が完成している
- [ ] Task 2 Step 1-A: タスク完了記録（4ファイル）が更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている（`completed`）
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 2: 新規型定義がシステム仕様書に反映されている
- [ ] Task 3: `documentation-changelog.md` に全 Step の結果が記録されている
- [ ] Task 4: `unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] Task 5: `skill-feedback-report.md` + `phase12-task-spec-compliance-check.md` が作成されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR 作成（ユーザーの明示承認後のみ実施）
