# TASK-3-1-D 実装ガイド - Permission Dialog UI

## Part 1: 概念説明（中学生レベル）

### 1.1 「権限確認」とは何か

#### 日常生活での例え

スマートフォンのアプリを使うとき、「カメラを使用していいですか？」「位置情報を取得していいですか？」という確認画面が出てきたことはありませんか？

これは「アプリが勝手にあなたの情報を使わないように、あなたの許可を求めている」のです。

Permission Dialog（権限確認ダイアログ）も同じです。AIアシスタント（スキル）が「ファイルを作成していいですか？」「コマンドを実行していいですか？」とあなたに確認を求める仕組みです。

#### なぜ必要なのか

想像してみてください。あなたの代わりにお手伝いさんが家の中で作業をしてくれるとします。

- お手伝いさんが勝手に冷蔵庫の中身を捨てたら困りますよね？
- 勝手に郵便物を開けられても困ります
- でも「これを捨てていいですか？」と聞いてくれたら安心です

AIアシスタントも同じです。あなたのパソコンで作業するとき、大事なファイルを勝手に消したり、危険なコマンドを実行したりしないように、「これをやっていいですか？」と確認してくれるのです。

#### この機能でできること

| 機能           | 説明                                 | 例                           |
| -------------- | ------------------------------------ | ---------------------------- |
| 確認を受け取る | AIからの「やっていい？」を画面に表示 | 「Bashコマンドを実行します」 |
| 許可する       | 「OK、やっていいよ」と伝える         | 「許可」ボタンをクリック     |
| 拒否する       | 「それはやめて」と伝える             | 「拒否」ボタンをクリック     |
| 覚えておく     | 「次からは聞かなくていいよ」と設定   | 「この選択を記憶」にチェック |

#### 動きの流れ

```
AIが作業中...
    ↓
「ファイルを作成していいですか？」（確認画面が出る）
    ↓
あなたが「許可」か「拒否」を選ぶ
    ↓
AIが続きの作業をする（許可された場合）
```

---

## Part 2: 技術的詳細（開発者向け）

### 2.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│ Main Process (Electron)                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ SkillExecutor                                           │ │
│  │  → PermissionResolver.requestPermission()               │ │
│  │  → IPC: skill:permission:request                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC通信
┌──────────────────────────▼──────────────────────────────────┐
│ Renderer Process                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Preload (skill-api.ts)                                  │ │
│  │  → onPermission(): リクエスト受信                        │ │
│  │  → respondPermission(): レスポンス送信                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ React (useSkillPermission.ts)                           │ │
│  │  → pendingPermission: 現在のリクエスト                   │ │
│  │  → handleApprove(): 許可処理                            │ │
│  │  → handleDeny(): 拒否処理                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ SkillStreamDisplay.tsx                                  │ │
│  │  → PermissionDialog表示                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 インターフェース定義

#### SkillPermissionRequest

```typescript
interface SkillPermissionRequest {
  /** 実行セッションID */
  executionId: string;
  /** リクエスト一意識別子（応答時に使用） */
  requestId: string;
  /** ツール名（"Bash", "Write", "Edit"等） */
  toolName: string;
  /** サニタイズされた引数オブジェクト */
  args: Record<string, unknown>;
  /** ユーザー向け理由説明（オプション） */
  reason?: string;
}
```

#### SkillPermissionResponse

```typescript
interface SkillPermissionResponse {
  /** 対応するリクエストID */
  requestId: string;
  /** 許可/拒否フラグ */
  approved: boolean;
  /** 選択を永続化するか */
  rememberChoice?: boolean;
}
```

### 2.3 API リファレンス

#### Preload API (window.skillAPI)

| メソッド            | シグネチャ                                                        | 説明                   |
| ------------------- | ----------------------------------------------------------------- | ---------------------- |
| `onPermission`      | `(callback: (req: SkillPermissionRequest) => void) => () => void` | リクエストリスナー登録 |
| `respondPermission` | `(response: SkillPermissionResponse) => Promise<boolean>`         | 応答送信               |

#### React Hook (useSkillPermission)

```typescript
function useSkillPermission(): {
  pendingPermission: SkillPermissionRequest | null;
  handleApprove: (rememberChoice?: boolean) => void;
  handleDeny: (rememberChoice?: boolean) => void;
};
```

### 2.4 IPC チャンネル

| チャンネル名               | 方向            | データ型                  |
| -------------------------- | --------------- | ------------------------- |
| `skill:permission:request` | Main → Renderer | `SkillPermissionRequest`  |
| `skill:permission:respond` | Renderer → Main | `SkillPermissionResponse` |

### 2.5 セキュリティ考慮事項

1. **チャンネルホワイトリスト**: `ALLOWED_ON_CHANNELS`/`ALLOWED_INVOKE_CHANNELS`で許可済みチャンネルのみ
2. **contextBridge経由**: 直接的なipcRenderer露出を防止
3. **requestId検証**: レスポンスの対応するリクエスト存在確認

### 2.6 エラーハンドリング

| エラー状況       | 対応                             |
| ---------------- | -------------------------------- |
| タイムアウト     | Main Process側でタイムアウト管理 |
| 不正なrequestId  | レスポンス無視（ログ記録）       |
| Renderer未初期化 | Main Processで待機・リトライ     |

### 2.7 使用例

```typescript
// SkillStreamDisplay.tsx での統合例
function SkillStreamDisplay({ skillId }: Props) {
  const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();

  return (
    <>
      {/* 通常のストリーム表示 */}
      <StreamContent skillId={skillId} />

      {/* Permission Dialog */}
      {pendingPermission && (
        <PermissionDialog
          request={pendingPermission}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      )}
    </>
  );
}
```

---

## 関連ドキュメント

| ドキュメント       | パス                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| API詳細            | `outputs/phase-12/api-documentation.md`                                     |
| IPC仕様            | `outputs/phase-12/ipc-documentation.md`                                     |
| コンポーネント仕様 | `outputs/phase-12/component-documentation.md`                               |
| システム仕様書     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` |

---

## 変更履歴

| Date       | Changes                        |
| ---------- | ------------------------------ |
| 2026-01-26 | 初版作成（Part 1/Part 2 構成） |
