# Phase 2: 設計

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 2                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

ヘルパー関数のシグネチャと配置位置を確定する。

## 実行タスク

- Task 2-1: ヘルパー関数設計
- Task 2-2: 置換対象箇所一覧確定
- Task 2-3: 変更ファイル一覧確定

## 参照資料

| 資料名           | パス                                                                  | 説明                   |
| ---------------- | --------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物   | `phase-1-requirements.md`                                             | FR/AC/エッジケース参照 |
| 対象実装ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 設計確認用             |

## 実行手順

### Step 1: Task 2-1 ヘルパー関数設計

```typescript
/**
 * スキル作成失敗通知を安全に送信する。
 * notificationService が未設定、または notify() が例外を投げた場合も呼び出し元に影響しない。
 */
private notifySkillCreationFailure(message: string): void {
  try {
    this.notificationService?.notify("スキル作成失敗", message);
  } catch {
    // 通知の失敗は呼び出し元の処理結果に影響しない
  }
}
```

**配置位置**: `RuntimeSkillCreatorFacade.ts` 内のプライベートヘルパーセクション（`recordImproveFailureSnapshot()` 付近）

### Step 2: Task 2-2 置換対象箇所一覧

| 箇所                        | 変更内容                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `_executeInternal()` 内     | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |
| `improve()` 内              | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |
| `verifyAndImproveLoop()` 内 | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |

### Step 3: Task 2-3 変更ファイル一覧

| 種別       | ファイルパス                                                                                      | 変更内容                                        |
| ---------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 実装変更   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | ヘルパー追加・3箇所置換（純粋リファクタリング） |
| テスト追加 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | ヘルパー関数の独立ユニットテスト追加            |

## 成果物

| 成果物   | 配置先                            |
| -------- | --------------------------------- |
| 設計メモ | `outputs/phase-2/design-notes.md` |

## 完了条件

- [ ] ヘルパー関数シグネチャ確定
- [ ] 置換対象3箇所の変数名確認（`errorMessage` / `error.message` 等）
- [ ] 変更ファイル一覧確定
- [ ] Phase 3 開始条件が整っている

## タスク100%実行確認【必須】

Phase 2 完了時に以下を確認すること:

- [ ] Task 2-1（ヘルパー関数設計）を完全に実行した
- [ ] Task 2-2（置換対象箇所一覧確定）を完全に実行した
- [ ] Task 2-3（変更ファイル一覧確定）を完全に実行した

## 次Phase

→ [Phase 3: 設計レビュー](phase-3-design-review.md)

**Phase 2→3 の遷移条件**: ヘルパー設計・置換対象・変更ファイルが全て確定していること
