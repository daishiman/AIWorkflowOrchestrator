# Phase 5: 実装

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 5                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

`notifySkillCreationFailure()` ヘルパーを追加し、3箇所のインライン重複を置換する。

## 修正ファイル一覧

| ファイルパス                                                          | 変更種別   | 変更内容                                        |
| --------------------------------------------------------------------- | ---------- | ----------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 実装変更   | ヘルパー追加・3箇所置換（純粋リファクタリング） |
| テストファイル（既存）                                                | テスト追加 | T-HC-01〜06 追加                                |

## 実装手順

### Step 1: プライベートヘルパーを追加する

`RuntimeSkillCreatorFacade.ts` の `recordImproveFailureSnapshot()` 付近に追加:

```typescript
private notifySkillCreationFailure(message: string): void {
  try {
    this.notificationService?.notify("スキル作成失敗", message);
  } catch {
    // 通知の失敗は呼び出し元の処理結果に影響しない
  }
}
```

### Step 2: 3箇所の既存インライン重複を置換する

各箇所の:

```typescript
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // ...
}
```

を:

```typescript
this.notifySkillCreationFailure(errorMessage);
```

に置換する。

### Step 3: テスト T-HC-01〜06 を追加する

## 品質チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物   | 配置先                                    |
| -------- | ----------------------------------------- |
| 実装メモ | `outputs/phase-5/implementation-notes.md` |

## 完了条件

- [ ] ヘルパー関数が追加されている
- [ ] 3箇所の置換が完了している
- [ ] T-HC-01〜06 が全て PASS する
- [ ] `pnpm typecheck` がエラーなしで通過する

## タスク100%実行確認【必須】

Phase 5 完了時に以下を確認すること:

- [ ] ヘルパー関数追加を完全に実行した
- [ ] 3箇所の置換を完全に実行した
- [ ] テスト追加を完全に実行した

## 次Phase

→ [Phase 6: テスト拡充](phase-6-test-expansion.md)

**Phase 5→6 の遷移条件**: T-HC-01〜06 が全て PASS であること
