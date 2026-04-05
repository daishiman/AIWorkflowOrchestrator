# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値             |
| --------- | -------------- |
| Phase     | 7              |
| Phase名   | カバレッジ確認 |
| カテゴリ  | 品質           |
| 前提Phase | Phase 6        |
| 後続Phase | Phase 8        |
| 作成日    | 2026-04-06     |

## 目的

変更したファイル・関数・ブランチのカバレッジを可視化し、AC-1〜AC-9 の検証漏れがないことを確認する。
広域指定ではなく、本タスクで変更したブロックのカバレッジを明示的に記録する（Feedback 5 対応）。

---

## カバレッジ対象範囲（変更ファイルに限定）

| 対象ファイル                                          | カバレッジ目標         | 備考                             |
| ----------------------------------------------------- | ---------------------- | -------------------------------- |
| `SessionResumePrompt.tsx`                             | Line 80%+, Branch 60%+ | 互換性判定・エラー分岐を含む     |
| `SessionIndicator.tsx`                                | Line 80%+, Branch 60%+ | isActive の分岐を含む            |
| `SkillLifecyclePanel.tsx`（追加部分のみ）             | Line 80%+              | useEffect の detectSessions 関数 |
| `apps/desktop/src/main/ipc/index.ts`（追加部分）      | Line 100%              | 4 件の IPC ハンドラー            |
| `packages/shared/src/types/skillCreator.ts`（追加型） | N/A（型定義のみ）      | —                                |

---

## 実行タスク

1. カバレッジレポートの生成（4ターゲット別 `vitest run --coverage`）
2. ブランチカバレッジの確認（変更ブロック単位で実測値を記録）
3. 不足カバレッジの補完（目標未達ブロックにテストを追加）

### タスク1: カバレッジレポートの生成

```bash
# SessionResumePrompt + SessionIndicator 対象
pnpm --filter @repo/desktop vitest run --coverage \
  -- --testPathPattern="SessionResumePrompt|SessionIndicator"

# IPC 統合テスト対象
pnpm --filter @repo/desktop vitest run --coverage \
  -- --testPathPattern="session-resume-ipc"

# SkillLifecyclePanel 統合テスト対象
pnpm --filter @repo/desktop vitest run --coverage \
  -- --testPathPattern="SkillLifecyclePanel"
```

### タスク2: ブランチカバレッジの確認（変更ブロック単位）

以下の関数・ブロックの line / branch カバレッジ実測値を記録する:

| 対象関数 / ブロック                        | line カバレッジ | branch カバレッジ | 目標達成 |
| ------------------------------------------ | --------------- | ----------------- | -------- |
| `SessionResumePrompt` render               | TBD             | TBD               | TBD      |
| `SessionResumePrompt` onResume handler     | TBD             | TBD               | TBD      |
| `SessionIndicator` render                  | TBD             | TBD               | TBD      |
| `SkillLifecyclePanel.detectSessions`       | TBD             | TBD               | TBD      |
| IPC `SKILL_CREATOR_LIST_SESSIONS` handler  | TBD             | TBD               | TBD      |
| IPC `SKILL_CREATOR_RESUME_SESSION` handler | TBD             | TBD               | TBD      |

### タスク3: 不足カバレッジの補完

目標未達のブロックに対してテストを追加する。
**広域指定（全体 X%）ではなく、変更した関数/ブロックのカバレッジを根拠として記録する**。

---

## 参照資料

| 資料名         | パス                                | 説明             |
| -------------- | ----------------------------------- | ---------------- |
| Phase 4 テスト | `outputs/phase-4/test-matrix.md`    | 基本テストケース |
| Phase 6 拡充   | `outputs/phase-6/test-expansion.md` | 追加テストケース |

---

## 成果物

| 成果物             | パス                                 | 説明                           |
| ------------------ | ------------------------------------ | ------------------------------ |
| coverage-report.md | `outputs/phase-7/coverage-report.md` | 変更ファイル別カバレッジ実測値 |

---

## 統合テスト連携【必須】

| 判定項目                        | 基準     | 備考                                   |
| ------------------------------- | -------- | -------------------------------------- |
| SessionResumePrompt Line/Branch | 80%/60%+ | 変更ブロック単位で実測値を記録すること |
| SessionIndicator Line/Branch    | 80%/60%+ | isActive 分岐を含む                    |
| IPC ハンドラー追加部分 Line     | 100%     | 4件全て                                |

## 完了条件

- [ ] 変更ファイルのカバレッジが関数/ブロック単位で測定されている
- [ ] `SessionResumePrompt.tsx`: Line 80%+, Branch 60%+ を達成している
- [ ] `SessionIndicator.tsx`: Line 80%+, Branch 60%+ を達成している
- [ ] `ipc/index.ts` 追加ハンドラー部分: Line 100% を達成している
- [ ] ブランチカバレッジ実測値が `coverage-report.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
