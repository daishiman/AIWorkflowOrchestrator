# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 1                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

`RuntimeSkillCreatorFacade.ts` 内の重複通知パターンを調査し、ヘルパー化の対象箇所と設計制約を確定する。

## 実行タスク

- Task 1-1: 現行コード調査 — 3箇所の重複 `try { notify() } catch {}` パターンを特定
- Task 1-2: 機能要件定義 — FR/AC定義
- Task 1-3: エッジケース洗い出し — E-1〜E-3の対処方針確定

## 参照資料

| 資料名             | パス                                                                                              | 説明                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ----------------------- |
| 対象実装ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | 重複通知パターンが3箇所 |
| 通知テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | 既存テスト参照          |
| 旧未タスク仕様書   | `docs/30-workflows/unassigned-task/TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001.md`              | 詳細要件参照            |

## 実行手順

### Step 0: P50チェック（必須）

Phase 1 開始前に対象ファイルの現在の実装状態を確認する。

```bash
# 重複通知パターンの確認
rg -n "notificationService.*notify\|try.*notify\|catch.*通知" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 既存テストの確認
rg -n "notify\|notificationService" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts
```

### Step 1: Task 1-1 現行コード調査

**調査対象**:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `_executeInternal()` 内の notify 呼び出しブロック
  - `improve()` 内の notify 呼び出しブロック
  - `verifyAndImproveLoop()` 内の notify 呼び出しブロック

**重複パターン（確認対象）**:

```typescript
// 現在3箇所に重複しているパターン
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // 通知の失敗は呼び出し元の結果に影響しない
}
```

### Step 2: Task 1-2 機能要件定義

| ID   | 要件                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| FR-1 | プライベートメソッド `notifySkillCreationFailure(message: string): void` を定義する                    |
| FR-2 | メソッド内で `try { this.notificationService?.notify("スキル作成失敗", message) } catch {}` を実装する |
| FR-3 | 3箇所のインライン重複を `this.notifySkillCreationFailure(errorMessage)` に置換する                     |
| FR-4 | 置換後に既存の外部動作（通知動作・エラー戻り値）が変わらないことを保証する                             |

**受入基準（Acceptance Criteria）**:

| ID   | 基準                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| AC-1 | `notifySkillCreationFailure(message)` が定義され、3箇所のインライン重複が除去される |
| AC-2 | 通知タイトル `"スキル作成失敗"` と `message` 引数の動作が変更前と同等である         |
| AC-3 | `notificationService` が `undefined` の場合、例外なく安全にスキップする             |
| AC-4 | `notificationService.notify()` が例外を投げた場合、ヘルパーが例外を吸収する         |
| AC-5 | 既存テスト（T-VL-01〜07、T-REG-01）がリグレッションなし                             |
| AC-6 | TypeScript 型チェックがエラーなしで通過する                                         |

### Step 3: Task 1-3 エッジケース洗い出し

| ケース | 説明                                        | 対応                                                             |
| ------ | ------------------------------------------- | ---------------------------------------------------------------- |
| E-1    | `notificationService` が `undefined` の場合 | optional chaining で安全にスキップ                               |
| E-2    | `notify()` が例外を投げた場合               | `catch {}` で吸収、呼び出し元に影響させない                      |
| E-3    | 3箇所すべてでメッセージ引数が異なる場合     | 各呼び出し元で `errorMessage` を渡す（ヘルパーは文言固定しない） |

## 統合テスト連携【必須】

| 連携アクション | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| 接続要件確認   | `INotificationService` インターフェースの型定義確認        |
| データフロー   | 3箇所の重複パターン → ヘルパー呼び出しへの置換フローの明記 |

## 成果物

| 成果物                     | 配置先                                  |
| -------------------------- | --------------------------------------- |
| 現行コード調査メモ         | `outputs/phase-1/code-investigation.md` |
| 機能要件定義（FR-1〜FR-4） | 本ファイル内（上記 Step 2 に記載）      |
| 受入基準（AC-1〜AC-6）     | 本ファイル内（上記 Step 2 に記載）      |
| エッジケース表（E-1〜E-3） | 本ファイル内（上記 Step 3 に記載）      |

## 完了条件

- [ ] P50チェック完了（対象ファイルの現状把握・重複箇所特定）
- [ ] FR-1〜FR-4 が定義されている
- [ ] AC-1〜AC-6 が定義されている
- [ ] E-1〜E-3 のエッジケースと対処方針が明記されている
- [ ] Phase 2 開始条件が整っている

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認すること:

- [ ] Task 1-1（現行コード調査）を完全に実行した
- [ ] Task 1-2（機能要件定義）を完全に実行した
- [ ] Task 1-3（エッジケース洗い出し）を完全に実行した

## 次Phase

→ [Phase 2: 設計](phase-2-design.md)

**Phase 1→2 の遷移条件**: FR/AC/エッジケースが全て定義されていること
