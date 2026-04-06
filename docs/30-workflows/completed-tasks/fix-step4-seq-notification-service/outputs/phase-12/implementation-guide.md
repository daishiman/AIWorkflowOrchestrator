# Phase 12: 実装ガイド

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-02                    |

---

## Part 1: 中学生レベルの概念説明

### 「通知サービス」とは何か、なぜこの設計にしたか

通知サービスは「スキル作成が終わったら教えてくれるお知らせ係」です。

スキルを作るのには時間がかかります（10〜30 分）。その間、他の作業をしていると「終わったのかな？」と気になって何度も確認しに行く必要があります。これは面倒です。

そこで、スキル作成が終わったときに自動でパソコンの画面の隅に「完了したよ！」という通知が出るようにしました。これは、スマートフォンでメッセージが届いたときにポップアップが出るのと同じ仕組みです。

### なぜ「インターフェース」を作ったか

プログラムでは、「何をするか」の約束（インターフェース）と「どうやってするか」の実装を別々にすると、テストがしやすくなります。

例えば:

- **本番**: Electron（アプリ）の通知機能を使って実際に通知を出す
- **テスト時**: 「通知を出した」という記録をリストに追加するだけの偽の実装を使う

テスト時に本物の通知を出してしまうと、テスト中に画面にポップアップが出て邪魔になります。
偽の実装（`MockNotificationService`）を使えば、テストが通知の挙動を確認しながらも実際の通知は出しません。

これが「依存性の注入（DI）」という設計パターンです。「インターフェース」という約束を守っていれば、本物でも偽物でも使えます。

---

## Part 2: INotificationService 設計詳細

### インターフェース設計

```typescript
// apps/desktop/src/main/services/notification/INotificationService.ts
export interface INotificationService {
  notify(title: string, body: string): void;
}
```

### 設計判断

| 判断項目                              | 決定内容                                        | 理由                                           |
| ------------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| インターフェースの配置                | `services/notification/INotificationService.ts` | Main Process 内閉鎖、循環参照回避              |
| メソッドの戻り値型                    | `void`                                          | 通知の成功/失敗がスキル生成結果に影響しない    |
| `MockNotificationService` の配置      | テストファイル内のみ                            | 本番コードへのテスト実装の混入を防ぐ           |
| `Notification.isSupported()` チェック | `notify()` の先頭                               | macOS 以外での実行時の安全なフォールバック     |
| `notificationService` を optional に  | `notificationService?: INotificationService`    | 既存コードのテスト破壊を避け、段階的 DI を実現 |

### DI 注入経路

```
ipc/index.ts
  └─ ElectronNotificationService (new)
      └─ RuntimeSkillCreatorFacade({ notificationService })
```

### 新しい通知実装の追加方法

`INotificationService` を implements するクラスを作成し、`ipc/index.ts` で DI するだけで差し替え可能:

```typescript
// 例: Windows トースト通知実装
export class WindowsNotificationService implements INotificationService {
  notify(title: string, body: string): void {
    // Windows 固有の通知 API を呼ぶ
  }
}
```

### activeExecutionCount カウンター設計

```typescript
private activeExecutionCount: number = 0;

async execute(...): Promise<SkillExecuteResponse> {
  this.activeExecutionCount += 1;       // 同期的にインクリメント
  try {
    return await this._executeInternal(...);
  } finally {
    this.activeExecutionCount = Math.max(0, this.activeExecutionCount - 1);
  }
}

hasRunningExecution(): boolean {
  return this.activeExecutionCount > 0;
}
```

`Math.max(0, ...)` によるアンダーフロー防止と、`try/finally` による確実なデクリメントが重要。
