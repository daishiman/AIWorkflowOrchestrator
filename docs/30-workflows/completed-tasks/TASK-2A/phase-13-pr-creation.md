# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（タスク完了）           |
| ステータス | 未実施                       |
| 作成日     | 2026-01-24                   |
| 機能名     | TASK-2A: SkillScanner        |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行う。全ての変更をリモートリポジトリに反映し、レビュー可能な状態にする。

## 背景

TASK-2A の全実装が完了した段階で、変更を main ブランチにマージするための Pull Request を作成する。CI が通過することを確認し、レビュー準備を整える。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェックリスト

**目的**: PR作成前の最終確認を行う

**実行手順**:

1. 以下のチェックリストを実行する：

| #   | 確認項目             | コマンド                                | 結果 |
| --- | -------------------- | --------------------------------------- | ---- |
| 1   | ビルドが成功する     | `pnpm --filter @repo/desktop build`     | □    |
| 2   | 全テストがパスする   | `pnpm --filter @repo/desktop test`      | □    |
| 3   | 型チェックがパスする | `pnpm --filter @repo/desktop typecheck` | □    |
| 4   | Lintエラーがない     | `pnpm --filter @repo/desktop lint`      | □    |

2. 全ての項目がパスしていることを確認する

3. `outputs/phase-13/pre-pr-checklist.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-13/pre-pr-checklist.md`

---

### タスク2: 変更差分の確認

**目的**: コミット対象の変更を確認する

**実行手順**:

1. 変更ファイルを確認する：

```bash
git status
git diff --stat
```

2. 以下の変更が含まれていることを確認する：

| カテゴリ     | ファイル                                                              | 変更種別 |
| ------------ | --------------------------------------------------------------------- | -------- |
| 実装         | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 新規     |
| 実装         | `apps/desktop/src/main/services/skill/index.ts`                       | 新規     |
| テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 新規     |
| フィクスチャ | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/*`       | 新規     |
| ドキュメント | `docs/.../tasks/TASK-2A/*`                                            | 新規     |
| 依存関係     | `apps/desktop/package.json`                                           | 修正     |

3. 不要なファイルが含まれていないことを確認する

**期待される成果物**:

- 変更差分の確認完了

---

### タスク3: ユーザー確認の取得【重要】

**目的**: PR作成前にユーザーの明示的な許可を得る

**実行手順**:

1. ユーザーに以下の情報を提示する：
   - 変更ファイル一覧
   - コミットメッセージ案
   - PR タイトル・本文案

2. ユーザーからの明示的な許可を待つ

> ⚠️ **重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

**コミットメッセージ案**:

```
feat(desktop): implement SkillScanner for skill directory scanning

- Add SkillScanner class to scan ~/.aiworkflow/skills/ and ~/.claude/skills/
- Parse SKILL.md YAML frontmatter for metadata extraction
- Scan subdirectories: agents/, references/, scripts/, assets/, schemas/, indexes/
- Support readonly flag for Claude CLI skills
- Add comprehensive unit tests with fixtures

TASK-2A
```

**PR タイトル案**:

```
feat(desktop): implement SkillScanner (TASK-2A)
```

**期待される成果物**:

- ユーザーからの許可確認

---

### タスク4: /ai:diff-to-pr 実行

**目的**: コミット・PR作成・CI確認を実行する

**実行手順**:

1. ユーザーの許可を得た後、`/ai:diff-to-pr` を実行する

2. PR作成後、以下を確認する：
   - PR が正常に作成されたこと
   - CI ワークフローが起動したこと

3. CI の結果を待つ（または手動で確認）

**期待される成果物**:

- PR URL
- CI 実行結果

---

### タスク5: CI確認

**目的**: CI が全てパスしていることを確認する

**実行手順**:

1. GitHub Actions の結果を確認する：

| ジョブ    | 期待結果 | 実際結果 |
| --------- | -------- | -------- |
| lint      | PASS     |          |
| typecheck | PASS     |          |
| test      | PASS     |          |
| build     | PASS     |          |

2. 失敗したジョブがある場合は修正し、再度プッシュする

3. `outputs/phase-13/ci-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク6: マージ準備完了報告

**目的**: タスク完了をユーザーに報告する

**実行手順**:

1. 以下の完了報告を作成する：

```markdown
## TASK-2A: SkillScanner 実装完了

### PR 情報

- **PR URL**: [リンク]
- **CI 状態**: 全てパス ✅

### 成果物サマリー

- SkillScanner クラス実装
- ユニットテスト（XX テストケース）
- テストカバレッジ: Line XX%, Branch XX%

### 次のステップ

PR のレビューをお願いします。レビュー完了後、マージ可能です。

⚠️ マージはユーザーが GitHub UI で手動実行してください。
```

2. ユーザーに報告する

**期待される成果物**:

- 完了報告

---

## 参照資料

| 参照資料              | パス                            | 内容            |
| --------------------- | ------------------------------- | --------------- |
| Phase 1-12 成果物     | `outputs/phase-*/`              | 各 Phase 成果物 |
| /ai:diff-to-pr スキル | `.claude/skills/ai:diff-to-pr/` | PR作成スキル    |

---

## 成果物

| 成果物             | パス                                   | 内容             |
| ------------------ | -------------------------------------- | ---------------- |
| PR前チェックリスト | `outputs/phase-13/pre-pr-checklist.md` | ローカル確認結果 |
| CI結果             | `outputs/phase-13/ci-result.md`        | CI 実行結果      |
| PR URL             | （GitHub上）                           | 作成されたPR     |

---

## 重要な注意事項

### PR作成に関する重要な注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

### マージについて

⚠️ **マージはユーザーが GitHub UI で手動実行してください。**

Claude Code はマージを自動実行しません。これはレビュープロセスを尊重し、ユーザーが最終判断を行うためです。

---

## 完了条件

- [ ] ローカル確認チェックリストが全てパスしている
- [ ] 変更差分が確認されている
- [ ] ユーザーからPR作成の許可を得ている
- [ ] PR が作成されている
- [ ] CI が全てパスしている
- [ ] 完了報告がユーザーに提示されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

Phase 13 が完了すると、TASK-2A: SkillScanner 実装は完了となります。

PR がマージされた後、後続タスク（TASK-3-1, TASK-4-2）の実装に進むことができます。
