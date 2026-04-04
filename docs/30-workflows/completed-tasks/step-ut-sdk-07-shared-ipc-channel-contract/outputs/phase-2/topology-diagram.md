# Phase 2 影響分析 (トポロジ図)

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 1. 変更ファイル一覧

```
packages/shared/src/ipc/channels.ts        [変更: 定数追加]  Risk: Low
packages/shared/src/ipc/__tests__/          [新規: テスト]    Risk: Low
apps/desktop/src/preload/channels.ts        [変更なし]        Risk: なし
```

---

## 2. 依存関係トポロジ

```
┌─────────────────────────────────────────────────┐
│  packages/shared/src/ipc/channels.ts            │
│                                                 │
│  [既存]                                         │
│    CHAT_EXPORT_CHANNELS                         │
│    FILE_SYSTEM_CHANNELS                         │
│    SKILL_CHANNELS                               │
│    NOTIFICATION_CHANNELS                        │
│    HISTORY_SEARCH_CHANNELS                      │
│                                                 │
│  [追加]                           ◄── 本タスク   │
│    APPROVAL_CHANNELS                            │
│      .APPROVAL_RESPOND    = "approval:respond"  │
│      .APPROVAL_REQUEST    = "approval:request"  │
│    EXECUTION_CHANNELS                           │
│      .EXECUTION_GET_DISCLOSURE_INFO             │
│           = "execution:get-disclosure-info"     │
│                                                 │
│  IPC_CHANNELS = { ...all spread }               │
└────────────────────┬────────────────────────────┘
                     │ parity テストで契約担保
                     ▼
┌─────────────────────────────────────────────────┐
│  apps/desktop/src/preload/channels.ts           │
│                                                 │
│  IPC_CHANNELS (フラット定義)                     │
│    L384: APPROVAL_RESPOND = "approval:respond"  │
│    L385: APPROVAL_REQUEST = "approval:request"  │
│    L386: EXECUTION_GET_DISCLOSURE_INFO           │
│           = "execution:get-disclosure-info"     │
│                                                 │
│  ALLOWED_INVOKE_CHANNELS                        │
│    ├── APPROVAL_RESPOND        (L673)           │
│    └── EXECUTION_GET_DISCLOSURE_INFO (L674)     │
│                                                 │
│  ALLOWED_ON_CHANNELS                            │
│    └── APPROVAL_REQUEST        (L732)           │
└─────────────────────────────────────────────────┘
```

---

## 3. リスク評価

| 変更対象                              | リスク   | 根拠                                                                               |
| ------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| shared: `APPROVAL_CHANNELS` 追加      | **Low**  | 新規定数追加のみ。既存コードへの影響なし。`as const` パターンは既存6グループと同一 |
| shared: `EXECUTION_CHANNELS` 追加     | **Low**  | 同上                                                                               |
| shared: `IPC_CHANNELS` スプレッド更新 | **Low**  | 既存エントリに影響なし。新しいキーが追加されるのみ                                 |
| desktop: コード変更なし               | **なし** | desktop 側は変更しない。parity テストで整合性を保証                                |
| テスト新規作成                        | **Low**  | 新規テストファイルのため既存テストへの影響なし                                     |

---

## 4. 波及影響

### 4.1 影響あり (軽微)

- `IpcChannel` 型のユニオンメンバーが3つ増加する → shared を import する消費者が新しいチャネル値を利用可能になる (破壊的変更ではない)

### 4.2 影響なし

- desktop のランタイム動作: チャネル文字列値は変更されないため、既存の IPC 通信に影響なし
- Renderer コンポーネント: preload API 経由のチャネル名は不変
- Electron ビルド: shared パッケージのバンドルサイズ増加は無視可能 (< 200 bytes)
