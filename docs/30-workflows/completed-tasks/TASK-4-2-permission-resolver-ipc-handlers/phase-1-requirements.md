# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 1                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

PermissionResolver IPC Handlers のIPC通信仕様・UI要件を明文化し、受け入れ基準を定義する。

## 実行タスク

### Task 1-1: 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

**機能要件（FR）:**

| FR-ID | 要件                                                             | 優先度 |
| ----- | ---------------------------------------------------------------- | ------ |
| FR-01 | Main ProcessからRenderer Processへ権限確認リクエストを送信できる | 高     |
| FR-02 | Renderer Processで権限確認ダイアログを表示できる                 | 高     |
| FR-03 | ユーザーが許可/拒否を選択できる                                  | 高     |
| FR-04 | ユーザーの判断結果をMain Processに返却できる                     | 高     |
| FR-05 | PermissionResolver.waitForResponse()が正しく解決される           | 高     |
| FR-06 | 複数リクエストがキュー管理される                                 | 中     |
| FR-07 | ダイアログでツール名・引数・理由が表示される                     | 中     |

**非機能要件（NFR）:**

| NFR-ID | 要件                                              | 優先度 |
| ------ | ------------------------------------------------- | ------ |
| NFR-01 | IPC通信はホワイトリストパターンに従う             | 高     |
| NFR-02 | タイムアウト処理が正しく機能する（デフォルト5分） | 高     |
| NFR-03 | メモリリークが発生しない（購読解除の徹底）        | 高     |
| NFR-04 | ダイアログはアクセシビリティに配慮する            | 中     |
| NFR-05 | TypeScript型安全性を確保する                      | 高     |

### Task 1-2: 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

| FR/NFR-ID | 受け入れ基準                                                       |
| --------- | ------------------------------------------------------------------ |
| FR-01     | `skill:permission-request` IPCチャンネルでリクエストが送信される   |
| FR-02     | PermissionDialogコンポーネントがモーダルとして表示される           |
| FR-03     | 「許可」「拒否」ボタンがクリック可能である                         |
| FR-04     | `skill:permission-response` IPCチャンネルでレスポンスが返却される  |
| FR-05     | resolveRequest()呼び出し後、waitForResponse()のPromiseが解決される |
| FR-06     | 複数リクエスト時、1つずつ順番にダイアログが表示される              |
| FR-07     | ダイアログにtoolName、args、reasonが表示される                     |
| NFR-01    | `ALLOWED_ON_CHANNELS`に`skill:permission-request`が含まれる        |
| NFR-02    | タイムアウト後、Errorがthrowされる                                 |
| NFR-03    | useEffectのクリーンアップで購読解除関数が呼ばれる                  |
| NFR-04    | キーボード操作でダイアログが操作可能である                         |
| NFR-05    | 型エラーなしでビルドが通る                                         |

### Task 1-3: IPC通信仕様定義

**IPCチャンネル仕様:**

| チャンネル                  | 方向            | データ型                  | 説明               |
| --------------------------- | --------------- | ------------------------- | ------------------ |
| `skill:permission-request`  | Main → Renderer | `SkillPermissionRequest`  | 権限確認リクエスト |
| `skill:permission-response` | Renderer → Main | `SkillPermissionResponse` | 権限確認応答       |

**データ型定義（既存）:**

```typescript
// packages/shared/src/types/skill.ts で定義済み
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

### Task 1-4: UI要件定義

**PermissionDialogコンポーネント要件:**

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

## 参照資料

| 資料名             | パス                                                                             | 説明            |
| ------------------ | -------------------------------------------------------------------------------- | --------------- |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`      | 型定義・API仕様 |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | IPCパターン     |
| PermissionResolver | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                     | 既存実装参照    |
| 元の指示書         | `docs/30-workflows/unassigned-task/task-4-2-permission-resolver-ipc-handlers.md` | タスク指示書    |

## 統合テスト連携【必須】

IPC通信要件（チャンネル・データ形式）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                |
| ---------------- | ------------------------------------------------------- |
| IPCチャンネル    | `skill:permission-request`, `skill:permission-response` |
| データ形式       | `SkillPermissionRequest`, `SkillPermissionResponse`     |
| セキュリティ     | ホワイトリストパターン、sender検証                      |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 機能要件（FR-01〜FR-07）が抽出されている
- [ ] 非機能要件（NFR-01〜NFR-05）が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] IPCチャンネル仕様が定義されている
- [ ] UI要件が定義されている
- [ ] 接続要件（IPC通信）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを管理すること:

1. Task 1-1: 要件抽出
2. Task 1-2: 受け入れ基準作成
3. Task 1-3: IPC通信仕様定義
4. Task 1-4: UI要件定義
5. 成果物の作成・配置
6. 完了条件の検証

## 次のPhase

Phase 2: 設計
