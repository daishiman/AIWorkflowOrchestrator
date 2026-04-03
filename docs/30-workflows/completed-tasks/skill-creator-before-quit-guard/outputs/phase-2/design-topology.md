# Phase 2: 設計 — design-topology

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 2                                        |
| タスクID | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| 作成日   | 2026-04-03                               |

## 設計トポロジー

### コンポーネント構成

```
[Electron app.on('before-quit')]
         │
         ▼
[registerBeforeQuitGuard]  ← ipc/beforeQuitGuard.ts
         │
         ├─ facade.hasRunningExecution() ── false → 早期 return（通常終了）
         │
         └─ true → event.preventDefault()
                    │
                    ▼
           [dialog.showMessageBox]
                    │
              ┌─────┴─────┐
              │           │
           response=0  response=1
           「中断して終了」  「キャンセル」
              │
              ▼
          app.exit(0)    ← 即時強制終了
```

### hasRunningExecution() の状態管理

```
RuntimeSkillCreatorFacade
  ├─ activeExecutionCount: number = 0
  ├─ execute(...)
  │    └─ activeExecutionCount += 1
  │       try { ... } finally {
  │         activeExecutionCount = Math.max(0, activeExecutionCount - 1)
  │       }
  └─ hasRunningExecution(): boolean
       └─ return activeExecutionCount > 0
```

## 設計決定事項

### 決定 1: `app.exit(0)` 前クリーンアップ — 既知リスクとして受容

**理由**:

1. スキル生成成果物は atomic write 前提のため部分書き込みリスクは低い
2. graceful shutdown は LLM 側協調が必要で初回スコープ外
3. 「中断して終了」選択はユーザーのリスク受容に相当
4. 再起動時にチェックポイントからの再開が可能

**記録先**: Phase 12 `implementation-guide.md` に既知制限として明記。

### 決定 2: 追加テスト設計

| テストケース | 検証内容                                                           | 対応AC |
| ------------ | ------------------------------------------------------------------ | ------ |
| TC-B-04      | response=0 時に app.exit(0) が呼ばれる                             | AC-6   |
| TC-B-05      | dialog.showMessageBox が reject した場合に console.warn が呼ばれる | AC-7   |

## 変更対象ファイル

| ファイル                                                                                          | Phase | 変更種別 | 内容                               |
| ------------------------------------------------------------------------------------------------- | ----- | -------- | ---------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | 4     | 既存確認 | TC-F-04〜TC-F-08                   |
| `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | 6     | 追加     | TC-B-04〜TC-B-05                   |
| `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                    | 5     | 検証のみ | 変更不要（既存実装が要件を満たす） |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | 5     | 検証のみ | 変更不要（既存実装が要件を満たす） |

## 成果物

| 成果物          | パス                                 | 説明                           |
| --------------- | ------------------------------------ | ------------------------------ |
| design-topology | `outputs/phase-2/design-topology.md` | 設計トポロジーと設計決定の記録 |
