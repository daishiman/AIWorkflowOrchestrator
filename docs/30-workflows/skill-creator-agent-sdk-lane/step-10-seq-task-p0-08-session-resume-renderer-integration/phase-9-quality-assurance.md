# Phase 9: 品質保証

## メタ情報

| 項目      | 値         |
| --------- | ---------- |
| Phase     | 9          |
| Phase名   | 品質保証   |
| カテゴリ  | 品質       |
| 前提Phase | Phase 8    |
| 後続Phase | Phase 10   |
| 作成日    | 2026-04-06 |

## 目的

lint・型チェック・テスト・セキュリティ観点を一括で実行し、Phase 10 最終レビューへの進入ゲートを通過できることを確認する。

---

## 実行タスク

1. 自動品質チェック一括実行（型チェック・ESLint・テスト・カバレッジ）
2. IPC 4層整合の最終確認（定数・ホワイトリスト・ハンドラ・Preload API）
3. セキュリティ確認（XSS・any 型・コンテキスト分離）
4. MINOR 指摘の解決確認（Phase 3 追跡テーブルの全件クローズ）

### タスク1: 自動品質チェック一括実行

以下を順番に実行し、全て PASS することを確認する:

```bash
# 1. TypeScript 型チェック（全パッケージ）
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# 2. ESLint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# 3. 全テスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SessionResumePrompt|SessionIndicator|session-resume-ipc|SkillLifecyclePanel"

# 4. カバレッジ確認（Phase 7 の結果を再確認）
pnpm --filter @repo/desktop vitest run --coverage \
  -- --testPathPattern="SessionResumePrompt|SessionIndicator|session-resume-ipc"
```

### タスク2: IPC 4層整合の最終確認

| 層                | チェック内容                                             | 確認コマンド                                                                                                                         |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1. 定数定義       | `channels.ts` にセッション関連チャンネルが定義されている | `grep -n "skill-creator:.*session\|SKILL_CREATOR" packages/shared/src/ipc/channels.ts`                                               |
| 2. ホワイトリスト | preload の allowedChannels に追加されている              | `grep -n "skill-creator:.*session" apps/desktop/src/preload/index.ts`                                                                |
| 3. ハンドラ登録   | `ipcMain.handle` で 4 件が登録されている                 | `grep -n "SKILL_CREATOR_LIST\|SKILL_CREATOR_RESUME\|SKILL_CREATOR_DELETE\|SKILL_CREATOR_CLEANUP" apps/desktop/src/main/ipc/index.ts` |
| 4. Preload API    | `contextBridge.exposeInMainWorld` で公開されている       | `grep -n "listSessions\|resumeSession\|deleteSession\|cleanupExpired" apps/desktop/src/preload/skill-creator-api.ts`                 |

### タスク3: セキュリティ確認

| 確認項目                                                    | 確認方法                                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| XSS: sessionId / skillName のサニタイズ                     | コンポーネントが dangerouslySetInnerHTML を使用していないことを確認                                               |
| コンテキスト分離: renderer が node API を直接使用していない | `grep -n "require\|__dirname\|process.env" SessionResumePrompt.tsx`                                               |
| IPC 引数バリデーション: sessionId が文字列であることを検証  | IPC ハンドラー内の型チェックを確認                                                                                |
| `any` 型の不使用                                            | `grep -n ": any\|as any" apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx SessionIndicator.tsx` |

### タスク4: MINOR 指摘の解決確認

Phase 3 で記録した MINOR 追跡テーブルの解決状況を確認し、記録する:

| MINOR ID  | 指摘内容         | 解決状況    | 解決確認Phase |
| --------- | ---------------- | ----------- | ------------- |
| TECH-M-01 | （Phase 3 記載） | PASS/未解決 | Phase 9       |

---

## 参照資料

| 資料名             | パス                                    | 説明               |
| ------------------ | --------------------------------------- | ------------------ |
| Phase 3 review     | `outputs/phase-3/design-review-gate.md` | MINOR 追跡テーブル |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`    | カバレッジ実測値   |
| CLAUDE.md          | `CLAUDE.md`                             | 開発方針・禁止事項 |

---

## 成果物

| 成果物       | パス                           | 説明                                            |
| ------------ | ------------------------------ | ----------------------------------------------- |
| qa-report.md | `outputs/phase-9/qa-report.md` | 自動チェック結果・IPC 4層確認・セキュリティ確認 |

---

## 統合テスト連携【必須】

| 判定項目                                | 基準 | 備考                                        |
| --------------------------------------- | ---- | ------------------------------------------- |
| TypeScript 型チェック（desktop/shared） | PASS | `pnpm typecheck` 全パッケージ               |
| ESLint（desktop/shared）                | PASS | `pnpm lint` 全パッケージ                    |
| 全テスト実行                            | PASS | TC-U/TC-I/TC-E/TC-B/TC-R 全件               |
| IPC 4層整合                             | PASS | 定数・ホワイトリスト・ハンドラ・Preload API |
| セキュリティ確認                        | PASS | XSS・any型・コンテキスト分離                |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/shared typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] 全テスト（TC-U/TC-I/TC-E/TC-B/TC-R）が PASS している
- [ ] IPC 4層整合（定数・ホワイトリスト・ハンドラ・Preload API）が確認されている
- [ ] セキュリティ確認（XSS・any型・コンテキスト分離）が完了している
- [ ] Phase 3 MINOR 指摘の解決状況が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー
