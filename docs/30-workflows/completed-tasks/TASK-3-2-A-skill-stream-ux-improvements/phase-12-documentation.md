# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                       |
| --------- | -------------------------- |
| Phase     | 12                         |
| 名称      | ドキュメント更新           |
| タスクID  | TASK-3-2-A                 |
| Issue番号 | #520                       |
| 前提Phase | Phase 11（手動テスト検証） |
| 次Phase   | Phase 13（PR作成）         |

---

## 1. 目的

実装完了に伴うドキュメント更新を行い、知識ベースを最新状態に保つ。

---

## 2. タスク（4タスク - 全て必須）

### Task 12-1: 実装ガイド作成（2パート構成）

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者・中学生レベル向け

**必須要件**:

- 日常生活での例え話を必ず含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**構成例**:

```markdown
## Part 1: わかりやすい解説

### なぜこの改善が必要だったの？

想像してみてください。レストランで料理を注文したとき、料理が来るまで何も情報がなかったらどうでしょう？

不安になりますよね。「ちゃんと注文入ったかな？」「忘れられてないかな？」

コンピュータのプログラムでも同じです。処理中に何も表示されないと、ユーザーは...
[続く]

### R1: クルクル回るマーク（ローディングスピナー）

みなさんがスマホでアプリを使うとき、クルクル回るマークを見たことがありますよね？
あれは「今、作業中ですよ」というサインです。
[続く]
```

#### Part 2: 開発者・技術者向け

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**構成例**:

```markdown
## Part 2: 技術的詳細

### 実装概要

| 機能                    | 実装ファイル                                 | 変更行数 |
| ----------------------- | -------------------------------------------- | -------- |
| R1 ローディングスピナー | SkillStreamDisplay.tsx                       | +10行    |
| R2 タイムスタンプ       | formatTime.ts (新規), SkillStreamDisplay.tsx | +30行    |
| R3 クリップボードコピー | SkillStreamDisplay.tsx                       | +40行    |

### API仕様

#### formatRelativeTime

| パラメータ | 型     | 説明                         |
| ---------- | ------ | ---------------------------- |
| timestamp  | number | UNIXタイムスタンプ（ミリ秒） |
| **戻り値** | string | 相対時刻文字列               |

[続く]
```

---

### Task 12-2: システム仕様書更新（2ステップ）

#### Step 1: タスク完了記録（必須）

**1-A: 完了タスクセクション追加**

対象ファイル: `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`

```markdown
## 完了タスク

| タスクID   | 機能名                    | 完了日     |
| ---------- | ------------------------- | ---------- |
| TASK-3-2-A | SkillStreamDisplay UX改善 | 2026-01-XX |
```

**1-B: 実装状況テーブル更新**

対象ファイル: `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`

```markdown
| SkillStreamDisplay | TASK-3-2-A | スキル実行ストリーム表示（スピナー/タイムスタンプ/コピー機能付き） |
```

#### Step 2: システム仕様更新（条件付き）

**このタスクの場合**: 新規インターフェースや型の追加はないため、**Step 2はスキップ可能**。

ただし、以下をドキュメントに追記:

- formatRelativeTime関数の存在と場所
- 新規追加されたaria属性

---

### Task 12-3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

**内容**:

```markdown
# ドキュメント更新履歴

## TASK-3-2-A: SkillStreamDisplay UX改善

### 更新日: 2026-01-XX

### 更新ファイル一覧

| ファイル                 | 更新内容             |
| ------------------------ | -------------------- |
| ui-ux-agent-execution.md | 完了タスク追加       |
| ui-ux-components.md      | 実装状況テーブル更新 |
| implementation-guide.md  | 新規作成             |

### 変更サマリー

- R1: ローディングスピナー追加
- R2: メッセージタイムスタンプ表示追加
- R3: クリップボードコピー機能追加
```

---

### Task 12-4: 未タスク検出レポート作成（0件でも必須）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**確認ソース**:

| ソース                 | 確認項目             |
| ---------------------- | -------------------- |
| Phase 3/10レビュー結果 | MINOR判定の指摘事項  |
| Phase 11手動テスト     | スコープ外の発見事項 |
| コードコメント         | TODO/FIXME/HACK/XXX  |

**検出コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/AgentView \
  --output .tmp/unassigned-candidates.json
```

**出力形式**:

```markdown
# 未タスク検出レポート

## 検出日: 2026-01-XX

## 検出結果

| ID  | 発見元 | 内容     | 推奨アクション |
| --- | ------ | -------- | -------------- |
| -   | -      | 検出なし | -              |

または

| ID   | 発見元             | 内容                     | 推奨アクション       |
| ---- | ------------------ | ------------------------ | -------------------- |
| UT-1 | Phase 11手動テスト | XX機能が〇〇で動作しない | 新規タスクとして起票 |

## 結論

本タスクのスコープ外の未完了事項は検出されませんでした。
```

---

## 3. 完了条件

| ID  | 条件                                                | 確認方法     |
| --- | --------------------------------------------------- | ------------ |
| 1   | 実装ガイド（Part 1 + Part 2）が作成されている       | ファイル確認 |
| 2   | システム仕様書が更新されている                      | 差分確認     |
| 3   | ドキュメント更新履歴が作成されている                | ファイル確認 |
| 4   | 未タスク検出レポートが作成されている（0件でも必須） | ファイル確認 |

---

## 4. 成果物

| 成果物               | パス                                          |
| -------------------- | --------------------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md      |
| ドキュメント更新履歴 | outputs/phase-12/documentation-changelog.md   |
| 未タスク検出レポート | outputs/phase-12/unassigned-task-detection.md |

---

## 5. 参考資料

| 資料                    | パス/URL                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| Phase 11/12ガイド       | .claude/skills/task-specification-creator/references/phase-11-12-guide.md    |
| 仕様更新ワークフロー    | .claude/skills/task-specification-creator/references/spec-update-workflow.md |
| UI/UXコンポーネント仕様 | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md        |
| UI/UXエージェント実行   | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md   |
