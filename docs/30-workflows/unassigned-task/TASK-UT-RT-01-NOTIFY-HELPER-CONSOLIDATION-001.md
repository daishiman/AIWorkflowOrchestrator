# TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001

## メタ情報

```yaml
issue_number: 1936
```

## メタ情報

| 項目       | 値                                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001                                         |
| 機能名     | notify-helper-consolidation-001                                                       |
| ステータス | open（未着手）                                                                        |
| 作成日     | 2026-04-06                                                                            |
| 親タスク   | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001（Phase 10 MINOR 指摘） |
| 優先度     | Medium                                                                                |
| タスク種別 | refactoring（コード変更タスク）                                                       |

## 概要

`RuntimeSkillCreatorFacade` 内の `notify("スキル作成失敗", ...)` 呼び出しパターンが `execute()` 単体ガード・`improve()` 単体ガード・`verifyAndImproveLoop()` 内の3箇所にインライン重複している。共通ヘルパー関数 `notifySkillCreationFailure()` を抽出して統一することで、将来の通知文言変更・ロギング追加・エラー追跡の一元管理を可能にする。

本タスクは TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001（Phase 10 MINOR 指摘）および TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 の連鎖タスクである。前タスクでは「変更範囲最小化のためインライン維持」を選択したが、通知パターンが3箇所に固まったことで共通化の価値が生じた。

## スコープ

### 含む

- `RuntimeSkillCreatorFacade.ts` 内のプライベートヘルパー `notifySkillCreationFailure(message: string): void` の定義
- `_executeInternal()`、`improve()`、`verifyAndImproveLoop()` 内の既存 `try { notify() } catch {}` ブロックをヘルパー呼び出しへ置換
- ヘルパー関数のユニットテスト追加（notify 呼び出し・optional chaining・例外安全性）
- 既存テストのリグレッションなし確認

### 含まない

- `notificationService` インターフェース自体の変更
- 通知文言・タイトルの変更（`"スキル作成失敗"` のまま維持）
- `notificationService` の Setter Injection 方式の変更
- 他クラスへの通知ヘルパー展開

## 受入基準

| ID   | 基準                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| AC-1 | `notifySkillCreationFailure(message)` が定義され、3箇所のインライン重複が除去される |
| AC-2 | 通知タイトル `"スキル作成失敗"` と `message` 引数の動作が変更前と同等である         |
| AC-3 | `notificationService` が `undefined` の場合、例外なく安全にスキップする             |
| AC-4 | `notificationService.notify()` が例外を投げた場合、ヘルパーが例外を吸収する         |
| AC-5 | 既存テスト（T-VL-01〜07、T-REG-01）がリグレッションなし                             |
| AC-6 | TypeScript 型チェックがエラーなしで通過する                                         |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | open       |
| 2     | 設計             | open       |
| 3     | 設計レビュー     | open       |
| 4     | テスト作成       | open       |
| 5     | 実装             | open       |
| 6     | テスト拡充       | open       |
| 7     | カバレッジ確認   | open       |
| 8     | リファクタリング | open       |
| 9     | 品質検証         | open       |
| 10    | 最終レビュー     | open       |
| 11    | 手動テスト       | open       |
| 12    | ドキュメント     | open       |
| 13    | PR作成           | open       |

---

## Phase 1: 要件定義

### 目的

`RuntimeSkillCreatorFacade.ts` 内の重複通知パターンを調査し、ヘルパー化の対象箇所と設計制約を確定する。

### Task 1-1: 現行コード調査

**調査対象**:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `_executeInternal()` 内の notify 呼び出しブロック
  - `improve()` 内の notify 呼び出しブロック
  - `verifyAndImproveLoop()` 内の notify 呼び出しブロック

**重複パターン**:

```typescript
// 現在3箇所に重複しているパターン
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // 通知の失敗は呼び出し元の結果に影響しない
}
```

### Task 1-2: 機能要件定義

| ID   | 要件                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| FR-1 | プライベートメソッド `notifySkillCreationFailure(message: string): void` を定義する                    |
| FR-2 | メソッド内で `try { this.notificationService?.notify("スキル作成失敗", message) } catch {}` を実装する |
| FR-3 | 3箇所のインライン重複を `this.notifySkillCreationFailure(errorMessage)` に置換する                     |
| FR-4 | 置換後に既存の外部動作（通知動作・エラー戻り値）が変わらないことを保証する                             |

### Task 1-3: エッジケース洗い出し

| ケース | 説明                                        | 対応                                                             |
| ------ | ------------------------------------------- | ---------------------------------------------------------------- |
| E-1    | `notificationService` が `undefined` の場合 | optional chaining で安全にスキップ                               |
| E-2    | `notify()` が例外を投げた場合               | `catch {}` で吸収、呼び出し元に影響させない                      |
| E-3    | 3箇所すべてでメッセージ引数が異なる場合     | 各呼び出し元で `errorMessage` を渡す（ヘルパーは文言固定しない） |

---

## Phase 2: 設計

### 目的

ヘルパー関数のシグネチャと配置位置を確定する。

### Task 2-1: ヘルパー関数設計

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

### Task 2-2: 置換対象箇所一覧

| 箇所                        | 変更内容                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `_executeInternal()` 内     | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |
| `improve()` 内              | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |
| `verifyAndImproveLoop()` 内 | インライン `try { notify() } catch {}` → `this.notifySkillCreationFailure(errorMessage)` |

### Task 2-3: 変更ファイル一覧

| 種別       | ファイルパス                                                                                      | 変更内容                                        |
| ---------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 実装変更   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | ヘルパー追加・3箇所置換（純粋リファクタリング） |
| テスト追加 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | ヘルパー関数の独立ユニットテスト追加            |

---

## Phase 3: 設計レビュー

### 設計の評価

| 観点       | 評価                                                               | 判定 |
| ---------- | ------------------------------------------------------------------ | ---- |
| SRP        | ヘルパーは通知送信の副作用のみを担う。エラー処理は呼び出し元に残る | PASS |
| 最小変更   | 外部の型・インターフェース・IPC 変更なし。内部リファクタリングのみ | PASS |
| 通知統一   | 文言（タイトル）はヘルパー内で固定。将来の一括変更が容易になる     | PASS |
| 後方互換性 | 3箇所の動作が置換前後で同等であることをテストで保証                | PASS |

**Phase 4 へ進む: APPROVED**

---

## Phase 4: テスト作成

### テストマトリクス

| テストID | シナリオ                                            | 検証項目                                           | 優先度 |
| -------- | --------------------------------------------------- | -------------------------------------------------- | ------ |
| T-HC-01  | `notifySkillCreationFailure()` が notify を呼び出す | `notify("スキル作成失敗", message)` が呼ばれること | HIGH   |
| T-HC-02  | `notificationService` が未設定の場合                | エラーなく終了すること                             | HIGH   |
| T-HC-03  | `notify()` が例外を投げた場合                       | 例外が外部に漏れないこと                           | HIGH   |
| T-HC-04  | `_executeInternal()` での adapter エラー時          | 既存の T-VL-01 相当のテストがリグレッションなし    | HIGH   |
| T-HC-05  | `improve()` での adapter エラー時                   | 既存テストがリグレッションなし                     | HIGH   |
| T-HC-06  | `verifyAndImproveLoop()` での adapter エラー時      | 既存テストがリグレッションなし                     | HIGH   |

### 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

---

## Phase 5: 実装

### 実装手順

**Step 1**: `RuntimeSkillCreatorFacade.ts` にプライベートヘルパーを追加する

```typescript
private notifySkillCreationFailure(message: string): void {
  try {
    this.notificationService?.notify("スキル作成失敗", message);
  } catch {
    // 通知の失敗は呼び出し元の処理結果に影響しない
  }
}
```

**Step 2**: 3箇所の既存インライン `try { notify() } catch {}` を `this.notifySkillCreationFailure(errorMessage)` に置換する

**Step 3**: テスト T-HC-01〜06 を追加する

### 品質チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test
```

---

## Phase 6: テスト拡充

### 追加テスト

| テストID | シナリオ                                           | 優先度 |
| -------- | -------------------------------------------------- | ------ |
| T-HC-07  | 複数回呼び出した場合の独立性確認                   | LOW    |
| T-HC-08  | `notify()` の引数の型チェック（string であること） | LOW    |

---

## Phase 7: カバレッジ確認

### カバレッジ目標

| 項目                                        | 目標 |
| ------------------------------------------- | ---- |
| `notifySkillCreationFailure()` の branch    | 100% |
| optional chaining 分岐（undefined/defined） | 100% |
| `catch {}` ブロック                         | 100% |

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="notification"
```

---

## Phase 8: リファクタリング

### 変更内容

| 対象                 | Before                                     | After                                                   | 理由                          |
| -------------------- | ------------------------------------------ | ------------------------------------------------------- | ----------------------------- |
| notify 呼び出し3箇所 | インライン `try { notify() } catch {}` × 3 | `this.notifySkillCreationFailure(errorMessage)` × 3     | DRY原則・将来の変更コスト削減 |
| ヘルパー関数         | なし                                       | `private notifySkillCreationFailure(msg: string): void` | 責務の明確化                  |

---

## Phase 9: 品質検証

### 検証チェックリスト

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] T-HC-01〜08 が全て PASS する
- [ ] 既存テスト（T-VL-01〜07、T-REG-01 相当）がリグレッションなし
- [ ] `pnpm lint` がエラーなしで通過する

---

## Phase 10: 最終レビュー

### 受入基準チェック

| ID   | 受入基準                                   | 判定 | 証跡             |
| ---- | ------------------------------------------ | ---- | ---------------- |
| AC-1 | ヘルパー定義と3箇所の重複除去              | [ ]  | T-HC-01 PASS     |
| AC-2 | 通知動作が変更前と同等                     | [ ]  | T-HC-04〜06 PASS |
| AC-3 | `notificationService` undefined 時の安全性 | [ ]  | T-HC-02 PASS     |
| AC-4 | `notify()` 例外の吸収                      | [ ]  | T-HC-03 PASS     |
| AC-5 | 既存テストのリグレッションなし             | [ ]  | 全テスト PASS    |
| AC-6 | TypeScript 型チェック通過                  | [ ]  | typecheck PASS   |

---

## Phase 11: 手動テスト

### テスト分類

`NON_VISUAL` — Main プロセスのみの変更。UI 変更なし。

### 自動テスト代替記録

| 証跡         | 内容                                               |
| ------------ | -------------------------------------------------- |
| 自動テスト名 | T-HC-01〜08、T-VL-01〜07 相当                      |
| 理由         | Main プロセス内の純粋リファクタリング。UI 変更なし |

---

## Phase 12: ドキュメント更新

### Task 12-1: 実装ガイド（2パート）

#### Part 1（中学生レベル）

**なぜこれが必要か？**

プログラムの中に「同じ処理のコピーが3つ」ある状態を想像してください。たとえば、同じ電話番号に電話する処理を3か所に別々に書くのではなく、「電話する」という関数を1つ作って、どこからでも呼べるようにするのが良いプログラムの書き方です。

今回は「スキル作成に失敗しました」という通知を送る処理が3か所にバラバラに書かれています。これを1か所にまとめることで、将来「通知のメッセージを変えたい」「通知にログを追加したい」というときに1か所だけ直せばよくなります。

- 変更前: 同じ通知処理が3か所に分散 → 変更時は3箇所すべてを直す必要がある
- 変更後: ヘルパー関数1つに集約 → 変更時は1箇所だけ直せばよい

#### Part 2（技術者レベル）

**変更ファイル**:

| ファイル                                                              | 変更内容                                         |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `notifySkillCreationFailure()` 追加・3箇所の置換 |

**ヘルパー関数シグネチャ**:

```typescript
private notifySkillCreationFailure(message: string): void {
  try {
    this.notificationService?.notify("スキル作成失敗", message);
  } catch {
    // 通知の失敗は呼び出し元の処理結果に影響しない
  }
}
```

**置換前後の比較**:

```typescript
// Before（各箇所にインライン記述）
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // ...
}

// After（ヘルパー呼び出し）
this.notifySkillCreationFailure(errorMessage);
```

### Task 12-2: システム仕様書更新

- `task-workflow-completed.md` に本タスクの完了記録を追加
- `task-workflow-backlog.md` の本タスクのステータスを `open` → `completed` に更新
- `aiworkflow-requirements/LOGS.md` を更新

### Task 12-3: 未タスク検出

追加の未タスクはなし（リファクタリングスコープ内に収まる）。

---

## Phase 13: PR作成

PR作成はユーザーの明示承認後のみ実施する。

---

## 苦戦箇所（事前予測）

### 予測される苦戦箇所 1: テストでのヘルパー関数テスト方法

**問題**: `notifySkillCreationFailure()` はプライベートメソッドのため、直接呼び出しテストができない可能性がある。

**対策**: `vi.spyOn(facade as any, 'notifySkillCreationFailure')` でプライベートメソッドをスパイするか、通知サービスのモックを通じて間接的に検証する。後者が型安全で推奨される。

### 予測される苦戦箇所 2: 3箇所の errorMessage 変数名の不一致

**問題**: 3箇所でローカル変数名が異なる可能性がある（`errorMessage` / `error.message` / `msg` など）。

**対策**: 置換前に各箇所の変数名を確認し、ヘルパー引数に正しい値を渡す。

---

## 参照資料

| 資料名                              | パス                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                             |
| 親タスク1（execute/improve ガード） | `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-improve-adapter-guard-001.md`（または completed-tasks/） |
| 親タスク2（loop 通知統一）          | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md`             |
| 通知テストファイル                  | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`                 |
