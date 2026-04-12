# Phase 2: 依存整合マトリクス

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## 既存コンポーネント再利用評価

| コンポーネント                     | 再利用可否         | 変更内容                              |
| ---------------------------------- | ------------------ | ------------------------------------- |
| `trackEvent.ts`                    | 修正               | sink部分のみ差し替え（公開APIは不変） |
| `SkillCreateWizard.tsx`            | 再利用（変更なし） | 計装ポイントへの変更不要              |
| `preload/channels.ts`              | 修正               | `ANALYTICS_SEND` チャネル追加         |
| `preload/index.ts`                 | 修正               | `analyticsAPI` 追加                   |
| 既存 IPC ハンドラーパターン        | 参照               | `register*Handlers()` パターンを踏襲  |
| `safeInvoke` / `invokeWithTimeout` | 再利用             | そのまま使用                          |

## 新規作成コンポーネント

| コンポーネント             | 理由                            |
| -------------------------- | ------------------------------- |
| `analyticsAdapter.ts`      | analytics送信抽象化・キュー管理 |
| `analyticsHandler.ts`      | Main側IPC受信・ログ記録         |
| `analyticsAdapter.test.ts` | TDDテスト                       |
| `analyticsHandler.test.ts` | TDDテスト                       |

## 依存関係

```
SkillCreateWizard.tsx
  └─ trackEvent.ts (公開API不変)
       └─ analyticsAdapter.ts (新規)
            └─ window.analyticsAPI (Preload新規)
                 └─ analyticsHandler.ts (新規・Main)
```

---

_生成日: 2026-04-11 / Phase 2 完了_
