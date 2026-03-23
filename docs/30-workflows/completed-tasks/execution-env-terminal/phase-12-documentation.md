# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

実装ガイド・システム仕様更新・未タスク検出・スキルフィードバックを完了する。

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**成果物**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル概念説明

- **日常の例え話**: 「飲食店の注文」に例える
  - `assertNoSilentFallback` = 注文を取る前に「何を注文するか決めましたか？」と確認する店員
  - `DEFAULT_CONFIG` fallback = 注文を聞かずに勝手にカレーを出すこと（NG）
  - `LLMConfigNotSelectedError` = 「まだ注文が決まっていません」というお客さんへの丁寧な案内
- **なぜ必要か**: AI にお願いする時、どの AI を使うか（Provider/Model）を先に選ばないと、意図しない AI が使われてしまう
- **何をするか**: 「選んでいない状態」を検出して、ユーザーに選択を促す仕組みを作る

#### Part 2: 技術者向け実装詳細

- `assertNoSilentFallback()` のインターフェース仕様
- `LLMConfigNotSelectedError` のエラー型仕様
- `ExecutionEnvironment.terminal` の Props 拡張
- テストケース一覧（T-1〜T-18）
- 影響範囲分析

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に assertNoSilentFallback 仕様を追記（AC-7）
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル両方、P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新

- [ ] `assertNoSilentFallback` のステータスを「実装完了」に更新
- [ ] `ExecutionEnvironment.terminal` のステータスを「実装完了」に更新

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "UT-EXECUTION-ENV-TERMINAL-001" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 関連仕様書のステータスを更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] topic-map.md が再生成されている

#### Step 1-G: 検証コマンド順次実行（Phase 12 同期ガード）

```bash
# 1. 未タスク参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 2. 索引再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js

# 3. SKILL 検証（全3スキル）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 4. Mirror sync 差分確認
diff -qr ./.claude/skills/ ./.agents/skills/ || echo "差分あり"
```

- [ ] 未タスク参照リンクが全て有効（`ALL_LINKS_EXIST`）
- [ ] 3 スキル全てで Error 0 件
- [ ] Mirror sync 差分が 0 件

#### Step 2: システム仕様更新（該当する場合）

- `assertNoSilentFallback` は新規インターフェースのため、Step 2 該当
- `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に以下を追記:
  - `assertNoSilentFallback()` のシグネチャ
  - `LLMConfigNotSelectedError` のエラー型定義
  - P62 対策としてのガード仕様

### Task 3: documentation-changelog.md

**成果物**: `outputs/phase-12/documentation-changelog.md`

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（P4 対策: 全 Step 確認後に記載）

### Task 4: 未タスク検出

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

未タスク検出ソース:

| ソース                | 確認項目                       |
| --------------------- | ------------------------------ |
| 元タスク仕様書        | スコープ外として明示された項目 |
| Phase 10 レビュー結果 | MINOR 判定の指摘事項           |
| Phase 11 手動テスト   | スコープ外の発見事項           |
| コードコメント        | TODO/FIXME/HACK/XXX            |

検出した未タスクの 3 ステップ（P3/P38 対策）:

1. `docs/30-workflows/unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

- [ ] 未タスク 0 件でもレポート作成必須

### Task 5: スキルフィードバックレポート

**成果物**: `outputs/phase-12/skill-feedback-report.md`

| 観点             | 記録内容                       |
| ---------------- | ------------------------------ |
| テンプレート改善 | Phase テンプレートの漏れ・曖昧 |
| ワークフロー改善 | 機械検証・手順分岐の改善余地   |
| ドキュメント改善 | 再利用しやすいガイドライン化   |

- [ ] 改善点なしでもレポート作成必須

## 参照資料

| 資料名                          | パス                                                                                                              | 説明                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| spec-update-workflow.md         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                    | 仕様更新手順        |
| phase-12-documentation-guide.md | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                            | Phase 12 詳細ガイド |
| interfaces-agent-sdk-skill-ref  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | 追記対象の仕様書    |

## 成果物

| 成果物                       | パス                                                                                      | 説明               |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| 実装ガイド                   | `docs/30-workflows/execution-env-terminal/outputs/phase-12/implementation-guide.md`       | Part 1 + Part 2    |
| ドキュメント更新履歴         | `docs/30-workflows/execution-env-terminal/outputs/phase-12/documentation-changelog.md`    | 変更記録           |
| 未タスク検出レポート         | `docs/30-workflows/execution-env-terminal/outputs/phase-12/unassigned-task-detection.md`  | 0 件でも必須       |
| スキルフィードバックレポート | `docs/30-workflows/execution-env-terminal/outputs/phase-12/skill-feedback-report.md`      | 改善点なしでも必須 |
| システム仕様更新サマリー     | `docs/30-workflows/execution-env-terminal/outputs/phase-12/system-spec-update-summary.md` | 仕様更新の実績ログ |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] Task 2 Step 1-A: LOGS.md が 2 ファイル両方更新されている（P1/P25 対策）
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 1-D: topic-map.md が再生成されている（P2/P27 対策）
- [ ] Task 2 Step 1-G: 検証コマンド全 PASS（未タスクリンク検証、SKILL 検証 Error 0、Mirror sync 差分 0）
- [ ] Task 2 Step 2: interfaces 仕様書に assertNoSilentFallback が追記されている（AC-7）
- [ ] Task 3: documentation-changelog.md が作成されている（全 Step 確認後に記載、P4 対策）
- [ ] Task 4: 未タスク検出レポートが作成されている（0 件でも必須）
- [ ] Task 4: 検出した未タスクは 3 ステップ全完了（P3/P38 対策）
- [ ] Task 5: スキルフィードバックレポートが作成されている
- [ ] Mirror sync: `.claude/skills/` → `.agents/skills/` の同期が完了
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 13: PR作成
