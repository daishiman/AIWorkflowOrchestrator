# Phase 13: 完了 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | 完了                               |
| 前提Phase  | Phase 12 (ドキュメント更新)        |
| 後続Phase  | -（完了）                          |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| 機能名     | skill:scan IPCハンドラーの新規追加 |

---

## 目的

成果物を最終確認し、PRを作成してCI確認を行う。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。

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

| 参照資料     | パス                                                        | 内容                   |
| ------------ | ----------------------------------------------------------- | ---------------------- |
| 実装コード   | `apps/desktop/src/main/ipc/skillHandlers.ts`                | PR対象コード           |
| テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | PR対象テスト           |
| タスク指示書 | `tasks/02b-task-fix-17-1-skill-scan-handler.md`             | タスク要件             |
| 実装ガイド   | `phase-outputs/TASK-FIX-17-1/implementation-guide.md`       | 変更内容のドキュメント |

---

## 成果物

| 成果物 | パス                                     | 内容           |
| ------ | ---------------------------------------- | -------------- |
| PR情報 | `phase-outputs/TASK-FIX-17-1/pr-info.md` | PR URL・CI結果 |

---

## 成果物確認チェックリスト

PRを作成する前に、以下の成果物が揃っていることを確認してください。

### 必須成果物

| #   | 成果物                    | 確認項目                                                  | 確認 |
| --- | ------------------------- | --------------------------------------------------------- | ---- |
| 1   | skillHandlers.ts          | SKILL_SCAN ハンドラーが追加されている                     | [ ]  |
| 2   | skillHandlers.ts          | unregisterSkillHandlers に removeHandler が追加されている | [ ]  |
| 3   | skillHandlers.test.ts     | SKILL_SCAN のテストケースが追加されている                 | [ ]  |
| 4   | implementation-guide.md   | Part 1（概念説明）が作成されている                        | [ ]  |
| 5   | implementation-guide.md   | Part 2（技術詳細）が作成されている                        | [ ]  |
| 6   | unassigned-task-report.md | 未タスク検出レポートが作成されている                      | [ ]  |

### 実装詳細確認

```typescript
// skillHandlers.ts に以下のパターンで実装されていることを確認

ipcMain.handle(
  IPC_CHANNELS.SKILL_SCAN,
  withValidation(async (_event) => {
    const skills = await skillService.scanAvailableSkills(true);
    return { success: true, data: skills };
  }),
);
```

---

## PR準備

### ブランチ名

```
fix/task-fix-17-1-skill-scan-handler
```

### PRタイトル

```
fix(skill): add SKILL_SCAN IPC handler
```

### PR本文テンプレート

```markdown
## Summary

- SKILL_SCAN IPCハンドラーを追加
- skill:scan チャンネルで強制再スキャン機能を実装
- 既存の SKILL_LIST ハンドラーとの整合性を維持

## Test plan

- [ ] SKILL_SCAN ハンドラーの単体テストが PASS
- [ ] `scanAvailableSkills(true)` が呼び出されることを確認
- [ ] エラー時のレスポンス形式を確認
- [ ] 全 IPC テストが PASS

## Related

- Closes: TASK-FIX-17-1-SKILL-SCAN-HANDLER
- Related: TASK-FIX-5-1-SKILL-API-UNIFICATION（Preload側のスタブ解消）
```

---

## 重要な注意事項

> **PRの作成はユーザーの明示的な許可を得てから実行すること**
>
> PRを作成する前に、必ずユーザーに以下を確認してください:
>
> 1. 成果物確認チェックリストが全て完了していること
> 2. ブランチ名・タイトル・本文の内容が適切であること
> 3. PR作成の許可

---

## PR作成フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
ユーザーの許可を取得【必須】
    ↓
PR作成
    ↓
CI通過確認
    ↓
タスク指示書を completed-task/ に移動
    ↓
artifacts.json の status を "completed" に更新
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## タスク完了時の移動手順

```bash
# 1. タスク指示書をcompleted-taskに移動
mv docs/30-workflows/skill-import-agent-system/tasks/02b-task-fix-17-1-skill-scan-handler.md \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 2. 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep task-fix-17-1

# 3. 変更をコミット
git add docs/30-workflows/skill-import-agent-system/
git commit -m "docs(workflows): TASK-FIX-17-1をcompleted-taskに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 |
| --- | ---------------------------------------------------- | ---- |
| 1   | PRが作成されている                                   | Yes  |
| 2   | CIが全て通過している                                 | Yes  |
| 3   | タスク指示書が `completed-task/` に移動済み          | Yes  |
| 4   | `artifacts.json` の `status` が `"completed"`        | Yes  |
| 5   | Phase 12で検出した未タスク（TASK-FIX-5-1）が記録済み | Yes  |
| 6   | **本Phase内の全作業を100%完了**                      | Yes  |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスク指示書が移動されている
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
- artifacts.json更新: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

- SKILL_SCAN ハンドラー実装により、skill:scan チャンネルが動作可能に
- TASK-FIX-5-1 で Preload 側のスタブ解消を行えば、完全な E2E 動作が可能
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスク指示書は以下に移動されます:
`docs/30-workflows/skill-import-agent-system/tasks/completed-task/02b-task-fix-17-1-skill-scan-handler.md`
