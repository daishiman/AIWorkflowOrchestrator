# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

DI 境界・インターフェース設計・型配置・`before-quit` ガードの実装場所を決定する。
Phase 3 のゲートでレビューを通過するための根拠となる設計書を作成する。

---

## 実行タスク

### タスク 2-1: `INotificationService` の型配置判断

**判断基準:**

| 判断軸                        | 評価                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| この interface を使うクラス数 | `ElectronNotificationService`（本番）、`MockNotificationService`（テスト）の 2 クラス |
| 複数パッケージをまたぐか      | Main Process 内のみ。`packages/shared` への露出は不要                                 |
| DI 境界のどこに配置するか     | `services/notification/` ディレクトリ内に `INotificationService.ts` として配置        |

**結論: `INotificationService` は `ElectronNotificationService.ts` と同じディレクトリに独立ファイルとして配置する。**

理由:

- 1 ファイルに interface + class を同梱すると、テスト時の import が循環参照になるリスクがある
- `services/notification/` ディレクトリを ports ライクに扱い、interface を先に定義する

配置後のファイル構成:

```
apps/desktop/src/main/services/notification/
├── INotificationService.ts          # interface 定義
├── ElectronNotificationService.ts   # 本番実装
└── __tests__/
    └── ElectronNotificationService.test.ts
```

### タスク 2-2: 型設計

**`INotificationService` インターフェース:**

```typescript
export interface INotificationService {
  notify(title: string, body: string): void;
}
```

**`ElectronNotificationService` 実装:**

```typescript
import { Notification } from "electron";
import type { INotificationService } from "./INotificationService";

export class ElectronNotificationService implements INotificationService {
  notify(title: string, body: string): void {
    if (!Notification.isSupported()) {
      console.warn(
        "[ElectronNotificationService] Notification is not supported on this platform",
      );
      return;
    }
    new Notification({ title, body }).show();
  }
}
```

**`MockNotificationService`（テストファイル内で定義）:**

```typescript
class MockNotificationService implements INotificationService {
  readonly calls: Array<{ title: string; body: string }> = [];
  notify(title: string, body: string): void {
    this.calls.push({ title, body });
  }
}
```

### タスク 2-3: DI 注入ポイントの設計

**`RuntimeSkillCreatorFacadeDeps` への追加:**

```typescript
interface RuntimeSkillCreatorFacadeDeps {
  // 既存フィールド（変更なし）
  // ...
  // 追加フィールド
  notificationService: INotificationService;
}
```

**`execute` の修正箇所:**

```typescript
// 完了時
try {
  this.deps.notificationService.notify("スキル作成完了", skillName);
} catch {
  // 通知失敗はスキル生成結果に影響させない
}

// 失敗時（catch ブロック内）
try {
  this.deps.notificationService.notify("スキル作成失敗", errorSummary);
} catch {
  // 通知失敗はスキル生成結果に影響させない
}
```

注意: `notify()` は `void` を返すが、エラーが起きても `execute` を中断しないこと。
通知の失敗はスキル生成の結果に影響しない。ラップして `try/catch` する。

### タスク 2-4: `hasRunningExecution()` の実装設計

`RuntimeSkillCreatorFacade` の実行状態はシンプルなカウンタで管理する。
並行実行数が必要なだけなので、`Map`/`Set` よりも `activeExecutionCount` の方がエレガントで保守性が高い。

**実装方針:**

```typescript
private activeExecutionCount = 0;

async execute(...) {
  this.activeExecutionCount += 1;
  try {
    // 既存の実行フロー
  } finally {
    this.activeExecutionCount = Math.max(0, this.activeExecutionCount - 1);
  }
}

hasRunningExecution(): boolean {
  return this.activeExecutionCount > 0;
}
```

### タスク 2-5: `before-quit` ガードの実装場所

**実装場所: `apps/desktop/src/main/ipc/index.ts` + `apps/desktop/src/main/ipc/beforeQuitGuard.ts`**

理由:

- `RuntimeSkillCreatorFacade` の組み立ては `ipc/index.ts` に集約されている
- `before-quit` ガードを `beforeQuitGuard.ts` に切り出すと、テストと再利用が容易になる
- `unregisterAllIpcHandlers()` と同じライフサイクルで解除できる

**実装パターン（ヘルパー切り出し）:**

```typescript
// beforeQuitGuard.ts
export const registerBeforeQuitGuard = ({ app, dialog, facade }) => {
  const handler = (event) => {
    if (!facade.hasRunningExecution()) {
      return;
    }
    event.preventDefault();
    dialog
      .showMessageBox({
        type: "warning",
        buttons: ["中断して終了", "キャンセル"],
        message: "スキル作成が進行中です",
        detail: "スキル作成を中断してアプリを終了しますか？",
      })
      .then(({ response }) => {
        if (response === 0) {
          app.exit(0);
        }
      })
      .catch((error: unknown) => {
        console.warn(
          "[beforeQuitGuard] Failed to show confirmation dialog",
          error,
        );
      });
  };

  app.on("before-quit", handler);
  return () => app.removeListener("before-quit", handler);
};
```

**`ipc/index.ts` での登録イメージ:**

```typescript
const unregisterBeforeQuitGuard = registerBeforeQuitGuard({
  app,
  dialog,
  facade,
});

// unregisterAllIpcHandlers() の中で解除
unregisterBeforeQuitGuard();
```

### タスク 2-6: macOS Notification 権限の確認

Electron の `Notification` API は macOS では OS レベルの通知権限要求が不要（Electron アプリは通知をデフォルトで送信できる）。
`Notification.isSupported()` を `ElectronNotificationService.notify()` の先頭で呼び、未対応環境では `console.warn` のみを出力して return する。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン               |

### Electron 公式仕様

| 項目                         | 内容                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Notification API             | Main Process で `new Notification({ title, body }).show()` を使用する               |
| `Notification.isSupported()` | プラットフォームが通知をサポートするかを返す静的メソッド                            |
| `before-quit` イベント       | 全ウィンドウを閉じる前に発火する。`event.preventDefault()` で終了をキャンセルできる |

---

## 実行手順

### ステップ 1: 型配置の決定

タスク 2-1 の結論を `outputs/phase-2/design-topology.md` に記録する。

### ステップ 2: 型設計の確定

タスク 2-2 の型定義コードを `outputs/phase-2/design-topology.md` に記録する。

### ステップ 3: DI 注入ポイントの確認

`RuntimeSkillCreatorFacade.ts` の現在の `deps` 型定義を確認し、追加フィールドの位置を決定する。

### ステップ 4: `hasRunningExecution()` の実装設計確定

`RuntimeSkillCreatorFacade.ts` の現在の実行管理変数を確認し、`activeExecutionCount > 0` チェックの対象を特定する。

### ステップ 5: `before-quit` ガードの実装設計確定

`apps/desktop/src/main/ipc/index.ts` と `apps/desktop/src/main/ipc/beforeQuitGuard.ts` を確認し、
ガード登録の位置（`ElectronNotificationService` の DI 後）と解除タイミングを特定する。

---

## 多角的チェック観点

| 観点                     | 確認内容                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| DI 境界の明確さ          | `INotificationService` が `services/notification/` ディレクトリ内に閉じており、外部パッケージに露出しない |
| テスト容易性             | `MockNotificationService` が `INotificationService` を implements することで、型安全にモック注入できる    |
| 通知失敗の副作用         | `notify()` のエラーが `execute` の完了/失敗判定に影響しないこと（個別 try/catch）                         |
| `before-quit` の副作用   | `event.preventDefault()` 後に `app.exit(0)` を呼ぶことで、無限ループにならないこと                        |
| 既存 DI パターンへの準拠 | `RuntimeSkillCreatorFacadeDeps` に追加するフィールドが既存の他フィールドと命名スタイルが一致すること      |

---

## 成果物

| 成果物         | パス                                 | 説明                                  |
| -------------- | ------------------------------------ | ------------------------------------- |
| 設計トポロジー | `outputs/phase-2/design-topology.md` | 型配置・DI設計・before-quit設計の一覧 |

---

## 完了条件

- [ ] `INotificationService` の型配置（独立ファイル、`services/notification/` ディレクトリ）が確定した
- [ ] `INotificationService`、`ElectronNotificationService`、`MockNotificationService` の型定義が記述された
- [ ] `RuntimeSkillCreatorFacadeDeps` への追加フィールドが設計された
- [ ] `execute` 完了/失敗時の `notify()` 呼び出し箇所が設計された
- [ ] `hasRunningExecution()` の実装方針（`activeExecutionCount > 0`）が確定した
- [ ] `before-quit` ガードの実装場所（`ipc/index.ts` + `beforeQuitGuard.ts`）と実装パターンが確定した
- [ ] macOS Notification 権限の確認事項が記録された
- [ ] `outputs/phase-2/design-topology.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 2 完了時に以下を明記すること:

- `INotificationService` の配置先確定
- 全型定義の骨格記述完了
- DI 注入ポイントの特定（`RuntimeSkillCreatorFacadeDeps` の変更箇所）
- `before-quit` ガードの追加場所（`ipc/index.ts` の行番号範囲）

---

## 次 Phase

Phase 2 の完了条件が全て満たされたら Phase 3（設計レビューゲート）へ進む。
