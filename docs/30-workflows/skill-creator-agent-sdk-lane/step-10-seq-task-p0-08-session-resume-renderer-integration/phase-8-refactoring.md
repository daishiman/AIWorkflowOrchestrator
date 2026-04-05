# Phase 8: リファクタリング

## メタ情報

| 項目      | 値               |
| --------- | ---------------- |
| Phase     | 8                |
| Phase名   | リファクタリング |
| カテゴリ  | 品質             |
| 前提Phase | Phase 7          |
| 後続Phase | Phase 9          |
| 作成日    | 2026-04-06       |

## 目的

実装コードの品質を改善し、薄いIPCラッパー原則・命名規則・責務境界が守られていることを確認する。
変更内容は `対象 / Before / After / 理由` テーブルで記録する（Feedback RT-03 対応）。

---

## 実行タスク

### タスク1: 薄いIPCラッパー原則の確認

IPC ハンドラー内のビジネスロジック混入がないかコードレビューする:

```bash
# IPC ハンドラーが Facade 呼び出しのみか確認
grep -A 5 "SKILL_CREATOR_LIST_SESSIONS\|SKILL_CREATOR_RESUME_SESSION\|SKILL_CREATOR_DELETE_SESSION\|SKILL_CREATOR_CLEANUP_SESSIONS" \
  apps/desktop/src/main/ipc/index.ts
```

**確認基準**: `ipcMain.handle` のコールバック内が `return facade.method(params)` の1行のみであること。

### タスク2: 命名規則の統一確認

| 確認項目                        | 確認コマンド                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| data-testid が kebab-case か    | `grep -n "data-testid" apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx` |
| IPC チャンネル名が RT-06 準拠か | `grep -n "skill-creator:" packages/shared/src/ipc/channels.ts`                             |
| 型名が PascalCase か            | `grep -n "export.*interface\|export.*type" packages/shared/src/types/skillCreator.ts`      |

### タスク3: 重複・ナビゲーションドリフトの除去

- `SessionResumePrompt.tsx` と `SessionIndicator.tsx` に重複ロジックがないか確認する
- `SkillLifecyclePanel.tsx` に P0-06 と P0-08 の責務が混在していないか確認する

### タスク4: 変更内容の記録

`outputs/phase-8/refactoring-log.md` に以下の形式で記録する:

| 対象                           | Before                  | After                   | 理由         |
| ------------------------------ | ----------------------- | ----------------------- | ------------ |
| （リファクタリング箇所を記載） | （変更前のコード/設計） | （変更後のコード/設計） | （変更理由） |

---

## 参照資料

| 資料名             | パス                                 | 説明           |
| ------------------ | ------------------------------------ | -------------- |
| Phase 5 実装       | `phase-5-implementation.md`          | 実装内容       |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md` | カバレッジ結果 |

---

## 成果物

| 成果物             | パス                                 | 説明                                         |
| ------------------ | ------------------------------------ | -------------------------------------------- |
| refactoring-log.md | `outputs/phase-8/refactoring-log.md` | 対象/Before/After/理由テーブル形式の変更記録 |

---

## 統合テスト連携【必須】

| 判定項目                          | 基準 | 備考                                              |
| --------------------------------- | ---- | ------------------------------------------------- |
| リファクタリング後の全テスト PASS | PASS | TC-U / TC-I / TC-E / TC-B / TC-R 全て             |
| 薄いIPCラッパー原則の遵守確認     | PASS | `ipcMain.handle` が Facade 呼び出しのみであること |

## 完了条件

- [ ] IPC ハンドラーが薄いラッパー（Facade 呼び出しのみ）であることが確認されている
- [ ] 命名規則（data-testid・IPC チャンネル名・型名）が統一されている
- [ ] 重複コードが除去されている
- [ ] 変更内容が `対象/Before/After/理由` テーブルで記録されている
- [ ] リファクタリング後も全テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
