# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| Phase名    | PR作成                                    |
| 前提Phase  | Phase 12 (ドキュメント更新)               |
| 後続Phase  | -（完了）                                 |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-09                                |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| 機能名     | スキル状態管理のZustand集約（仕様書準拠） |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

全Phaseが完了した状態で、状態管理の集約変更を本番ブランチにマージするためのPRを作成する。本タスクはリファクタリングであり、機能追加はないため、リグレッションが発生していないことの確認が重要。

---

## 使用スキル

> このPhaseでは `/ai:diff-to-pr` スキルを使用してPR作成を行います。

### diff-to-pr スキルの使用

```bash
# diff-to-pr スキルを呼び出し
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## 参照資料

| 参照資料         | パス                                                                                         | 内容                   |
| ---------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| タスク指示書     | `docs/30-workflows/skill-import-agent-system/tasks/03b-task-fix-6-1-state-centralization.md` | タスク要件             |
| 修正後agentSlice | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                       | PR対象コード           |
| 削除ファイル一覧 | `skillSlice.ts`, `skillExecutionSlice.ts`                                                    | 削除対象               |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`                                                   | 変更内容のドキュメント |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                     | テスト結果             |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## 実行手順

## 統合テスト連携【必須】

PR作成前にCI統合テストを確認:

| 確認項目   | 基準                   |
| ---------- | ---------------------- |
| CI全テスト | 全てPASS               |
| カバレッジ | 基準達成               |
| 静的解析   | ESLint/TypeScript警告0 |
| E2Eテスト  | 全シナリオPASS         |

---

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**ユーザーへの依頼内容**:

````markdown
## ローカル動作確認のお願い

PR作成前に、以下の動作確認をお願いします:

### 確認手順

1. 開発サーバーを起動
   ```bash
   pnpm --filter @repo/desktop dev
   ```
````

2. 以下の動作を確認
   - [ ] スキル一覧が正しく表示される
   - [ ] スキルを選択できる
   - [ ] スキルを実行できる
   - [ ] 実行結果がストリーミング表示される
   - [ ] エラー時に適切なメッセージが表示される

3. DevToolsでの状態確認（任意）
   - React DevToolsでAgentViewにローカルstateがないことを確認
   - Zustand DevToolsでagentSliceの状態を確認

### 確認結果

確認完了後、PRを作成してよいかお知らせください。

````

---

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー - TASK-FIX-6-1-STATE-CENTRALIZATION

### 概要

スキル状態管理を3つの経路からagentSlice単一に集約するリファクタリング

### 変更ファイル

#### 修正

| ファイル             | 変更内容                                   |
| -------------------- | ------------------------------------------ |
| agentSlice.ts        | skillSlice/skillExecutionSliceの機能を統合 |
| AgentView.tsx        | ローカルstate排除、agentSlice使用に変更    |
| useSkillExecution.ts | agentSliceのラッパーに変更                 |
| store/index.ts       | 不要なsliceのexportを削除                  |

#### 削除

| ファイル                 | 理由                   |
| ------------------------ | ---------------------- |
| skillSlice.ts            | agentSliceに統合       |
| skillExecutionSlice.ts   | agentSliceに統合       |
| skillSlice.test.ts       | 対象ファイル削除に伴う |
| skillExecutionSlice.test.ts | 対象ファイル削除に伴う |

#### 追加/更新（テスト）

| ファイル             | 変更内容                    |
| -------------------- | --------------------------- |
| agentSlice.test.ts   | 統合後のテストケース追加    |

### 影響範囲

- **機能への影響**: なし（リファクタリングのため）
- **パフォーマンス**: 改善の可能性あり（状態更新の一元化）
- **テスト**: 全テストPASS確認済み

### PRを作成してもよろしいですか?
````

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

---

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

---

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

---

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# 1. 変更をステージング
git add apps/desktop/src/renderer/store/
git add apps/desktop/src/renderer/components/AgentView.tsx
git add apps/desktop/src/renderer/hooks/useSkillExecution.ts
git add docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/

# 2. コミット
git commit -m "refactor(store): スキル状態管理をagentSliceに集約

- skillSlice.ts, skillExecutionSlice.tsを削除
- AgentViewのローカルstateを排除
- useSkillExecutionをagentSliceラッパーに変更
- race condition対策（executionId事前生成）を実装

TASK-FIX-6-1-STATE-CENTRALIZATION

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 3. ブランチをプッシュ
git push -u origin refactor/task-fix-6-1-state-centralization

# 4. PRを作成
gh pr create --title "refactor(store): スキル状態管理をagentSliceに集約" --body "$(cat <<'EOF'
## Summary

- スキル状態管理を3つの経路からagentSlice単一に集約
- skillSlice.ts, skillExecutionSlice.tsを削除
- race condition対策（executionId事前生成）を実装

## Test plan

- [ ] agentSlice統合後の単体テストがPASS
- [ ] スキル実行→完了の状態遷移テストがPASS
- [ ] race condition検証テストがPASS
- [ ] 全IPCテストがPASS
- [ ] 手動テスト全項目がPASS

## Related

- Closes: TASK-FIX-6-1-STATE-CENTRALIZATION
- Enables: TASK-6-1-SKILL-SLICE（仕様書に基づく完全な状態管理実装）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 成果物確認チェックリスト

PRを作成する前に、以下の成果物が揃っていることを確認してください。

### 必須成果物

| #   | 成果物                    | 確認項目                                               | 確認 |
| --- | ------------------------- | ------------------------------------------------------ | ---- |
| 1   | agentSlice.ts             | skillSlice/skillExecutionSliceの機能が統合されている   | [ ]  |
| 2   | skillSlice.ts             | ファイルが削除されている                               | [ ]  |
| 3   | skillExecutionSlice.ts    | ファイルが削除されている                               | [ ]  |
| 4   | AgentView.tsx             | ローカルstateが排除されている                          | [ ]  |
| 5   | useSkillExecution.ts      | agentSliceのラッパーになっている                       | [ ]  |
| 6   | agentSlice.test.ts        | 統合後のテストケースが追加されている                   | [ ]  |
| 7   | implementation-guide.md   | Part 1（概念説明）+ Part 2（技術詳細）が作成されている | [ ]  |
| 8   | unassigned-task-report.md | 未タスク検出レポートが作成されている                   | [ ]  |

### 実装詳細確認

```typescript
// agentSlice.ts に以下のパターンで実装されていることを確認

// 1. 統一状態インターフェース
interface AgentSliceState {
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];
  selectedSkill: string | null;
  isExecuting: boolean;
  executionId: string | null;
  streamingMessages: SkillStreamMessage[];
  error: string | null;
  // ... アクション
}

// 2. race condition対策
executeSkill: async (prompt: string) => {
  const tempExecutionId = generateExecutionId(); // ← IPC呼び出し前にID生成
  set({
    isExecuting: true,
    streamingMessages: [],
    executionId: tempExecutionId,
  });
  // ...
};
```

---

## PR準備

### ブランチ名

```
refactor/task-fix-6-1-state-centralization
```

### PRタイトル

```
refactor(store): スキル状態管理をagentSliceに集約
```

### PR本文テンプレート

```markdown
## Summary

- スキル状態管理を3つの経路からagentSlice単一に集約
- skillSlice.ts, skillExecutionSlice.tsを削除
- race condition対策（executionId事前生成）を実装

## Test plan

- [ ] agentSlice統合後の単体テストがPASS
- [ ] スキル実行→完了の状態遷移テストがPASS
- [ ] race condition検証テストがPASS
- [ ] 全IPCテストがPASS
- [ ] 手動テスト全項目がPASS

## Related

- Closes: TASK-FIX-6-1-STATE-CENTRALIZATION
- Enables: TASK-6-1-SKILL-SLICE（仕様書に基づく完全な状態管理実装）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 重要な注意事項

> **PRの作成はユーザーの明示的な許可を得てから実行すること**
>
> PRを作成する前に、必ずユーザーに以下を確認してください:
>
> 1. ローカル動作確認が完了していること
> 2. 変更サマリーの内容が適切であること
> 3. PR作成の許可

---

## PR作成フロー

```
Phase 13: PR作成
    ↓
1. ユーザーにローカル動作確認を依頼【必須】
    ↓
2. 変更サマリーを提示【必須】
    ↓
3. ユーザーの許可を取得【必須】
    ↓
4. /ai:diff-to-pr または手動でPR作成
    ↓
5. CI通過確認
    ↓
6. タスク指示書を completed-task/ に移動
    ↓
7. artifacts.json の status を "completed" に更新
    ↓
8. 変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## タスク完了時の移動手順

```bash
# 1. タスク指示書をcompleted-taskに移動
mv docs/30-workflows/skill-import-agent-system/tasks/03b-task-fix-6-1-state-centralization.md \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 2. 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep task-fix-6-1

# 3. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/ \
   docs/30-workflows/completed-tasks/

# 4. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-FIX-6-1

# 5. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-6-1-STATE-CENTRALIZATIONをcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | ユーザーにローカル動作確認を依頼している           | Yes  |
| 2   | 変更サマリーを提示しPR作成の許可を得ている         | Yes  |
| 3   | PRが作成されている                                 | Yes  |
| 4   | CIが全て通過している                               | Yes  |
| 5   | タスク指示書が `completed-task/` に移動済み        | Yes  |
| 6   | タスクディレクトリが `completed-tasks/` に移動済み | Yes  |
| 7   | `artifacts.json` の `status` が `"completed"`      | Yes  |
| 8   | Phase 12で検出した未タスクが記録済み               | Yes  |
| 9   | **本Phase内の全作業を100%完了**                    | Yes  |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスク指示書が移動されている
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-task移動: {{完了/未完了}}
- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

- agentSlice統合により、スキル状態管理が単一経路に集約された
- race condition対策により、メッセージ損失リスクが解消された
- TASK-6-1-SKILL-SLICE の前提条件が整った
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは以下に移動されます:
`docs/30-workflows/completed-tasks/TASK-FIX-6-1-STATE-CENTRALIZATION/`

タスク指示書は以下に移動されます:
`docs/30-workflows/skill-import-agent-system/tasks/completed-task/03b-task-fix-6-1-state-centralization.md`
