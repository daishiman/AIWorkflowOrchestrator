# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

Phase 1で定義した要件に基づき、PermissionStore・SkillExecutor連携・設定UIの詳細設計を行う。

## 背景

Phase 1で定義されたデータスキーマとインターフェースを実装可能な設計に落とし込む必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: PermissionStoreクラス設計

**目的**: 永続化ストアの詳細設計を行う

**実行手順**:

1. クラス構造を設計（コンストラクタ、プライベートメソッド含む）
2. electron-storeの設定（名前空間、デフォルト値）を決定
3. エラーハンドリング（破損ファイル対応等）を設計
4. シングルトンパターンの採用可否を検討
5. 設計をドキュメント化

**期待される成果物**:

- `outputs/phase-2/permission-store-design.md`

**設計例**:

```typescript
class PermissionStore implements IPermissionStore {
  private store: ElectronStore<PermissionStoreSchema>;

  constructor() {
    this.store = new ElectronStore({
      name: 'permission-store',
      defaults: {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString()
      }
    });
  }

  isToolAllowed(toolName: string): boolean { ... }
  allowTool(toolName: string): void { ... }
  revokeTool(toolName: string): void { ... }
  getAllowedTools(): string[] { ... }
  clearAll(): void { ... }
}
```

---

### タスク2: SkillExecutor連携設計

**目的**: SkillExecutorとPermissionStoreの連携方法を設計する

**実行手順**:

1. PermissionStoreのインジェクション方法を決定
2. sendPermissionRequest前の自動許可チェック処理を設計
3. handlePermissionResponse時の永続化処理を設計
4. 連携フローを図示

**期待される成果物**:

- `outputs/phase-2/skillexecutor-integration-design.md`

**連携フロー**:

```
SkillExecutor.sendPermissionRequest(request)
    ↓
PermissionStore.isToolAllowed(toolName)
    ↓
[true] → 自動許可レスポンス生成、ダイアログスキップ
[false] → 通常の権限確認フローへ
    ↓
ユーザー応答受信
    ↓
handlePermissionResponse(response)
    ↓
[rememberChoice=true && approved=true]
    ↓
PermissionStore.allowTool(toolName)
```

---

### タスク3: IPCチャネル設計

**目的**: Renderer-Main間の通信インターフェースを設計する

**実行手順**:

1. 必要なIPCチャネルを定義（取得、削除、一覧）
2. リクエスト/レスポンス型を定義
3. エラーハンドリング方針を決定
4. IPCチャネル定義をドキュメント化

**期待される成果物**:

- `outputs/phase-2/ipc-channel-design.md`

**IPCチャネル一覧**:
| チャネル名 | 方向 | 内容 |
| ----------------------------- | --------------- | -------------------------- |
| `permission:getAllowedTools` | Renderer → Main | 許可済みツール一覧取得 |
| `permission:revokeTool` | Renderer → Main | ツール許可取り消し |
| `permission:clearAll` | Renderer → Main | 全許可設定クリア |

---

### タスク4: 設定UI設計

**目的**: 許可済みツール管理UIを設計する

**実行手順**:

1. UI配置場所を決定（設定画面内のセクション）
2. コンポーネント構造を設計
3. 状態管理方法を決定（Zustand連携）
4. UIワイヤーフレームを作成

**期待される成果物**:

- `outputs/phase-2/permission-settings-ui-design.md`

**コンポーネント構成**:

```
PermissionSettings (コンテナ)
├── PermissionSettingsHeader (タイトル・説明)
├── AllowedToolList (許可済みツール一覧)
│   └── AllowedToolItem × N (個別ツール表示・削除ボタン)
└── PermissionSettingsFooter (全クリアボタン)
```

---

### タスク5: シーケンス図作成

**目的**: 主要ユースケースのシーケンス図を作成する

**実行手順**:

1. ツール許可→永続化フロー
2. 自動許可（ダイアログスキップ）フロー
3. 設定画面からの削除フロー
4. 各フローのシーケンス図を作成

**期待される成果物**:

- `outputs/phase-2/sequence-diagrams.md`

---

## 参照資料

| 参照資料                  | パス                                                                         | 内容                       |
| ------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 1成果物             | `outputs/phase-1/`                                                           | 要件定義・スキーマ・IF定義 |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | PermissionResolver仕様     |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Electronアーキテクチャ     |

---

## 成果物

| 成果物                | パス                                                  | 内容                 |
| --------------------- | ----------------------------------------------------- | -------------------- |
| PermissionStore設計   | `outputs/phase-2/permission-store-design.md`          | クラス詳細設計       |
| SkillExecutor連携設計 | `outputs/phase-2/skillexecutor-integration-design.md` | 連携フロー設計       |
| IPCチャネル設計       | `outputs/phase-2/ipc-channel-design.md`               | IPC定義              |
| 設定UI設計            | `outputs/phase-2/permission-settings-ui-design.md`    | UIコンポーネント設計 |
| シーケンス図          | `outputs/phase-2/sequence-diagrams.md`                | 主要フローの図示     |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合ポイント/契約（API・スキーマ）を設計に反映
- Main-Renderer間のIPC連携テスト観点を設計
- electron-store永続化のテスト観点を設計

---

## 完了条件

- [ ] PermissionStoreクラスの詳細設計が完了した
- [ ] SkillExecutorとの連携方法が設計された
- [ ] IPCチャネルの定義が完了した
- [ ] 設定UIのコンポーネント設計が完了した
- [ ] 主要ユースケースのシーケンス図が作成された
- [ ] 全ての成果物が`outputs/phase-2/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-03-design-review.md`
