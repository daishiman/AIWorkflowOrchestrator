# Phase 1: 要件定義書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 1                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. 機能要件（Functional Requirements）

### FR-01: 権限確認リクエスト送信

| 項目        | 内容                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| ID          | FR-01                                                                                           |
| 要件        | Main ProcessからRenderer Processへ権限確認リクエストを送信できる                                |
| 優先度      | 高                                                                                              |
| 詳細        | SkillExecutorが権限確認が必要なツール使用時に、PermissionResolverを通じてRenderer Processに通知 |
| 関連型      | `SkillPermissionRequest`                                                                        |
| IPCチャネル | `skill:permission-request`                                                                      |

### FR-02: 権限確認ダイアログ表示

| 項目             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| ID               | FR-02                                                    |
| 要件             | Renderer Processで権限確認ダイアログを表示できる         |
| 優先度           | 高                                                       |
| 詳細             | PermissionDialogコンポーネントがモーダルとして表示される |
| UIコンポーネント | `PermissionDialog.tsx`                                   |

### FR-03: ユーザー判断選択

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| ID       | FR-03                                                                   |
| 要件     | ユーザーが許可/拒否を選択できる                                         |
| 優先度   | 高                                                                      |
| 詳細     | 「許可」「拒否」ボタンを押下し、判断結果を送信できる                    |
| 判断種別 | `allow` / `deny` （将来的に `always_allow` / `always_deny` も対応可能） |

### FR-04: 判断結果返却

| 項目        | 内容                                                             |
| ----------- | ---------------------------------------------------------------- |
| ID          | FR-04                                                            |
| 要件        | ユーザーの判断結果をMain Processに返却できる                     |
| 優先度      | 高                                                               |
| 詳細        | Preload APIを通じてMain ProcessのIPCハンドラーにレスポンスを送信 |
| 関連型      | `SkillPermissionResponse`                                        |
| IPCチャネル | `skill:permission-response`                                      |

### FR-05: Promise解決

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| ID     | FR-05                                                                          |
| 要件   | PermissionResolver.waitForResponse()が正しく解決される                         |
| 優先度 | 高                                                                             |
| 詳細   | resolveRequest()呼び出し後、waitForResponse()で待機しているPromiseが解決される |

### FR-06: 複数リクエストのキュー管理

| 項目   | 内容                                                  |
| ------ | ----------------------------------------------------- |
| ID     | FR-06                                                 |
| 要件   | 複数リクエストがキュー管理される                      |
| 優先度 | 中                                                    |
| 詳細   | 複数リクエスト時、1つずつ順番にダイアログが表示される |

### FR-07: ダイアログ情報表示

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| ID     | FR-07                                                    |
| 要件   | ダイアログでツール名・引数・理由が表示される             |
| 優先度 | 中                                                       |
| 詳細   | `toolName`, `args`, `reason`を適切にフォーマットして表示 |

---

## 2. 非機能要件（Non-Functional Requirements）

### NFR-01: ホワイトリストパターン

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| ID     | NFR-01                                                    |
| 要件   | IPC通信はホワイトリストパターンに従う                     |
| 優先度 | 高                                                        |
| 詳細   | `ALLOWED_ON_CHANNELS`に新チャネルを登録、sender検証を実施 |

### NFR-02: タイムアウト処理

| 項目   | 内容                                                          |
| ------ | ------------------------------------------------------------- |
| ID     | NFR-02                                                        |
| 要件   | タイムアウト処理が正しく機能する（デフォルト5分）             |
| 優先度 | 高                                                            |
| 詳細   | PermissionResolver側で管理済み（DEFAULT_TIMEOUT_MS = 300000） |

### NFR-03: メモリリーク防止

| 項目   | 内容                                                  |
| ------ | ----------------------------------------------------- |
| ID     | NFR-03                                                |
| 要件   | メモリリークが発生しない（購読解除の徹底）            |
| 優先度 | 高                                                    |
| 詳細   | useEffectのクリーンアップで購読解除関数を必ず呼び出す |

### NFR-04: アクセシビリティ

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| ID     | NFR-04                                                 |
| 要件   | ダイアログはアクセシビリティに配慮する                 |
| 優先度 | 中                                                     |
| 詳細   | キーボード操作可能、フォーカストラップ、ARIAラベル適用 |

### NFR-05: TypeScript型安全性

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| ID     | NFR-05                                                 |
| 要件   | TypeScript型安全性を確保する                           |
| 優先度 | 高                                                     |
| 詳細   | 型エラーなしでビルドが通る、`@repo/shared`の型を再利用 |

---

## 3. IPC通信仕様

### 3.1 新規IPCチャネル

| チャネル名                  | 方向            | データ型                  | 説明               |
| --------------------------- | --------------- | ------------------------- | ------------------ |
| `skill:permission-request`  | Main → Renderer | `SkillPermissionRequest`  | 権限確認リクエスト |
| `skill:permission-response` | Renderer → Main | `SkillPermissionResponse` | 権限確認応答       |

### 3.2 データ型定義（既存 - packages/shared/src/types/skill.ts）

```typescript
interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

### 3.3 セキュリティ要件

| 項目           | 要件                                                         |
| -------------- | ------------------------------------------------------------ |
| ホワイトリスト | `ALLOWED_ON_CHANNELS`に`skill:permission-request`を追加      |
| ホワイトリスト | `ALLOWED_INVOKE_CHANNELS`に`skill:permission-response`を追加 |
| sender検証     | validateIpcSenderによるウィンドウ検証                        |

---

## 4. UI要件

### 4.1 PermissionDialogコンポーネント

| 要素           | 要件                                               |
| -------------- | -------------------------------------------------- |
| モーダル       | 他の操作をブロックするモーダルダイアログ           |
| タイトル       | 「権限の確認」または類似の文言                     |
| ツール名表示   | `toolName`を明確に表示                             |
| 引数表示       | `args`をJSON形式で表示（機密情報はサニタイズ済み） |
| 理由表示       | `reason`が存在する場合は表示                       |
| 許可ボタン     | 「許可」ボタン（プライマリ）                       |
| 拒否ボタン     | 「拒否」ボタン（セカンダリ）                       |
| キーボード操作 | Escで閉じる、Enter/Spaceでボタン操作               |
| フォーカス管理 | モーダル内でフォーカストラップ                     |

### 4.2 usePermissionDialogフック

| 項目       | 要件                                     |
| ---------- | ---------------------------------------- |
| 状態管理   | 表示中リクエスト、キュー、応答待ちフラグ |
| 購読管理   | `skill:permission-request`の購読と解除   |
| 応答送信   | `skill:permission-response`の送信        |
| キュー処理 | 複数リクエストの順次処理                 |

---

## 5. 統合テスト連携要件

| 接続要件カテゴリ | 記載内容                                                |
| ---------------- | ------------------------------------------------------- |
| IPCチャンネル    | `skill:permission-request`, `skill:permission-response` |
| データ形式       | `SkillPermissionRequest`, `SkillPermissionResponse`     |
| セキュリティ     | ホワイトリストパターン、sender検証                      |
| 結合点           | Main Process ↔ Preload API ↔ Renderer Process           |

---

## 6. 依存関係

### 6.1 既存実装への依存

| 依存先                  | パス                                                             | 用途               |
| ----------------------- | ---------------------------------------------------------------- | ------------------ |
| PermissionResolver      | `apps/desktop/src/main/services/skill/PermissionResolver.ts`     | 権限確認待機・解決 |
| SkillPermissionRequest  | `packages/shared/src/types/skill.ts`                             | リクエスト型       |
| SkillPermissionResponse | `packages/shared/src/types/skill.ts`                             | レスポンス型       |
| IPC_CHANNELS            | `apps/desktop/src/preload/channels.ts`                           | チャネル定義       |
| validateIpcSender       | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | セキュリティ検証   |

### 6.2 新規作成ファイル

| ファイル               | パス                                                     | 責務             |
| ---------------------- | -------------------------------------------------------- | ---------------- |
| permission-handlers.ts | `apps/desktop/src/main/ipc/permission-handlers.ts`       | IPCハンドラー    |
| skill-api.ts（更新）   | `apps/desktop/src/preload/skill-api.ts`                  | Preload API拡張  |
| PermissionDialog.tsx   | `apps/desktop/src/renderer/components/Permission/`       | UIコンポーネント |
| usePermissionDialog.ts | `apps/desktop/src/renderer/hooks/usePermissionDialog.ts` | React Hook       |

---

## 7. スコープ外

以下は本タスクのスコープ外：

- `always_allow`/`always_deny`の永続化機能
- 権限設定のUI管理画面
- 複数ウィンドウ対応
- 権限履歴の保存・表示
