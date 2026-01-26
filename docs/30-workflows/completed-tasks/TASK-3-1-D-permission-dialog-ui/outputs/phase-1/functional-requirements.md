# 機能要件定義書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. skillAPI拡張要件

### FR-D-001: onPermissionメソッド追加

**目的**: Main Processからの権限リクエストを受信するリスナー登録機能を提供する

**インターフェース**:

```typescript
onPermission: (callback: (request: SkillPermissionRequest) => void) => () => void
```

**動作要件**:

1. `SKILL_PERMISSION_REQUEST`チャネル（`skill:permission:request`）からのIPCメッセージをリッスンする
2. メッセージ受信時に登録されたコールバック関数を呼び出す
3. 戻り値としてクリーンアップ関数（リスナー解除）を返す
4. セキュリティのため、`ALLOWED_ON_CHANNELS`に登録されたチャネルのみ許可する

**入力データ型（SkillPermissionRequest）**:

```typescript
interface SkillPermissionRequest {
  executionId: string; // 実行ID
  requestId: string; // リクエストID（応答時に使用）
  toolName: string; // ツール名
  args: Record<string, unknown>; // サニタイズされた引数
  reason: string; // ユーザー向け理由説明
}
```

### FR-D-002: respondPermissionメソッド追加

**目的**: ユーザーの権限応答をMain Processに送信する機能を提供する

**インターフェース**:

```typescript
respondPermission: (response: SkillPermissionResponse) => Promise<void>;
```

**動作要件**:

1. `SKILL_PERMISSION_RESPOND`チャネル（`skill:permission:respond`）を通じてIPCメッセージを送信する
2. セキュリティのため、`ALLOWED_INVOKE_CHANNELS`に登録されたチャネルのみ許可する
3. 送信完了後にPromiseをresolveする

**出力データ型（SkillPermissionResponse）**:

```typescript
interface SkillPermissionResponse {
  requestId: string; // リクエストID
  approved: boolean; // 許可/拒否
  rememberChoice?: boolean; // 選択を記憶するか（オプション）
  rejectReason?: string; // 拒否理由（オプション）
}
```

---

## 2. SkillStreamDisplayコンポーネント連携要件

### FR-D-003: 権限リクエスト受信とダイアログ表示

**目的**: skillAPIからの権限リクエストを受信し、PermissionDialogを表示する

**動作要件**:

1. コンポーネントマウント時に`skillAPI.onPermission()`でリスナーを登録する
2. コンポーネントアンマウント時にリスナーを解除する
3. 権限リクエスト受信時に、Zustand状態（`pendingPermission`）を更新する
4. `pendingPermission`がnullでない場合、PermissionDialogを表示する

**状態管理**:

```typescript
// agentSliceまたは専用skillSliceで管理
pendingSkillPermission: SkillPermissionRequest | null;
```

### FR-D-004: 許可/拒否応答処理

**目的**: ユーザーの選択をMain Processに送信し、状態をリセットする

**動作要件**:

1. PermissionDialogの`onApprove`コールバックで:
   - `skillAPI.respondPermission({ requestId, approved: true, rememberChoice })`を呼び出す
   - `pendingSkillPermission`をnullにリセットする

2. PermissionDialogの`onDeny`コールバックで:
   - `skillAPI.respondPermission({ requestId, approved: false, rememberChoice })`を呼び出す
   - `pendingSkillPermission`をnullにリセットする

---

## 3. IPC通信要件

### FR-D-005: Main → Renderer 権限リクエスト送信

**チャネル**: `skill:permission:request`

**方向**: Main Process → Renderer Process

**送信タイミング**: SkillExecutor.sendPermissionRequest()呼び出し時

**ペイロード**:

```typescript
{
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>; // sanitizeArgs()でサニタイズ済み
  reason: string; // getPermissionReason()で生成
}
```

### FR-D-006: Renderer → Main 権限応答送信

**チャネル**: `skill:permission:respond`

**方向**: Renderer Process → Main Process

**送信タイミング**: ユーザーが「許可」または「拒否」をクリック時

**ペイロード**:

```typescript
{
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

### FR-D-007: IPCチャネルホワイトリスト登録

**目的**: セキュリティのため、使用するIPCチャネルをホワイトリストに登録する

**登録先**: `apps/desktop/src/preload/channels.ts`

**追加チャネル**:

| 定数名                   | 値                         | 登録先                  |
| ------------------------ | -------------------------- | ----------------------- |
| SKILL_PERMISSION_REQUEST | `skill:permission:request` | ALLOWED_ON_CHANNELS     |
| SKILL_PERMISSION_RESPOND | `skill:permission:respond` | ALLOWED_INVOKE_CHANNELS |

---

## 4. ユーザーインタラクション要件

### FR-D-008: ダイアログ表示時のフォーカス管理

**動作要件**:

1. ダイアログ表示時、最初のフォーカス可能な要素（拒否ボタン）にフォーカスを移動する
2. フォーカストラップを実装し、Tabキーでモーダル内のみを循環する
3. 背景クリックでダイアログが閉じないようにする

### FR-D-009: 「許可」ボタン操作

**動作要件**:

1. クリックまたはEnterキー（フォーカス時）で許可応答を送信
2. `approved: true`で`respondPermission()`を呼び出す
3. 「この選択を記憶する」チェック状態を`rememberChoice`に含める

### FR-D-010: 「拒否」ボタン操作

**動作要件**:

1. クリックまたはEnterキー（フォーカス時）で拒否応答を送信
2. `approved: false`で`respondPermission()`を呼び出す
3. 「この選択を記憶する」チェック状態を`rememberChoice`に含める

### FR-D-011: キーボードナビゲーション

**動作要件**:

| キー        | 動作                                         |
| ----------- | -------------------------------------------- |
| Tab         | 次のフォーカス可能な要素に移動（ループ）     |
| Shift+Tab   | 前のフォーカス可能な要素に移動（ループ）     |
| Enter/Space | フォーカス中のボタンをクリック               |
| Escape      | （オプション）ダイアログを閉じる（拒否扱い） |

---

## 5. 型定義要件

### FR-D-012: 共有型の定義場所

**目的**: Renderer/Main両方で使用する型を共有ライブラリに定義する

**定義場所**: `packages/shared/src/types/skill-execution.ts`

**追加型定義**:

```typescript
/** スキル権限リクエスト */
export interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason: string;
}

/** スキル権限応答 */
export interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

---

## 6. 機能要件サマリー

| ID       | 機能                               | 優先度 |
| -------- | ---------------------------------- | ------ |
| FR-D-001 | skillAPI.onPermission追加          | 必須   |
| FR-D-002 | skillAPI.respondPermission追加     | 必須   |
| FR-D-003 | 権限リクエスト受信・ダイアログ表示 | 必須   |
| FR-D-004 | 許可/拒否応答処理                  | 必須   |
| FR-D-005 | Main→Renderer IPC                  | 必須   |
| FR-D-006 | Renderer→Main IPC                  | 必須   |
| FR-D-007 | IPCチャネルホワイトリスト登録      | 必須   |
| FR-D-008 | フォーカス管理                     | 必須   |
| FR-D-009 | 許可ボタン操作                     | 必須   |
| FR-D-010 | 拒否ボタン操作                     | 必須   |
| FR-D-011 | キーボードナビゲーション           | 必須   |
| FR-D-012 | 共有型定義                         | 必須   |
