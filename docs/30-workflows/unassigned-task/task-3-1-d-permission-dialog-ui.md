# 権限ダイアログUI実装 - タスク指示書

## メタ情報

```yaml
issue_number: 509
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-3-1-D                               |
| タスク名     | Renderer側権限ダイアログUI実装           |
| 分類         | 新機能                                   |
| 対象機能     | スキル実行権限確認ダイアログ             |
| 優先度       | 中                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | **完了**（2026-01-26）                   |
| 発見元       | TASK-3-1-C（PermissionRequest Hook統合） |
| 発見日       | 2026-01-25                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-Cで、Main ProcessにPermissionRequest Hook統合を実装した。これによりSkillExecutorからRenderer Processへ権限リクエストがIPC経由で送信されるようになったが、Renderer側でリクエストを受け取りユーザーに表示するダイアログUIは未実装。

### 1.2 問題点・課題

- Main ProcessからのIPCリクエスト（`skill:permission:request`）を受信する処理がない
- 権限確認ダイアログコンポーネントが存在しない
- ユーザーが「許可」「拒否」を選択できるUIがない
- 権限応答（`skill:permission:response`）を送信する処理がない

### 1.3 放置した場合の影響

- スキル実行時の権限確認機能が動作しない
- ユーザーが危険な操作を事前に確認できない
- セキュリティ上の懸念が残る

---

## 2. 何を達成するか（What）

### 2.1 目的

Renderer Process側に権限確認ダイアログUIを実装し、PermissionRequest Hook統合を完成させる。

### 2.2 最終ゴール

- 権限確認ダイアログがモーダルとして表示される
- ツール名、引数、理由メッセージが表示される
- 「許可」「拒否」ボタンでユーザーが選択できる
- 選択結果がMain Processに正しく送信される

### 2.3 スコープ

#### 含むもの

- PermissionDialogコンポーネント実装
- preload APIへのpermission関連メソッド追加
- Zustand状態管理（pendingPermission）との連携
- アクセシビリティ対応（WCAG 2.1 AA準拠）

#### 含まないもの

- 「次回から確認しない」（rememberChoice）の永続化実装
- 複数リクエストのキュー管理
- アニメーション・トランジション

### 2.4 成果物

| 成果物                   | パス                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| ダイアログコンポーネント | `apps/desktop/src/renderer/components/PermissionDialog.tsx`                |
| Preload API              | `apps/desktop/src/preload/api/permissionAPI.ts`                            |
| テストファイル           | `apps/desktop/src/renderer/components/__tests__/PermissionDialog.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-C（PermissionRequest Hook統合）が完了していること
- IPCチャネル（`skill:permission:request`, `skill:permission:response`）が定義済みであること

### 3.2 依存タスク

| タスク                                  | ステータス |
| --------------------------------------- | ---------- |
| TASK-3-1-C (PermissionRequest Hook統合) | 完了       |

### 3.3 必要な知識

- React + TypeScript
- Electron IPC（preload API）
- Zustand状態管理
- アクセシビリティ（WCAG 2.1）

### 3.4 推奨アプローチ

1. 既存のモーダルダイアログ（確認ダイアログ等）を参考にベースコンポーネント作成
2. preload APIにpermission関連メソッドを追加
3. agentSliceのpendingPermissionステートと連携
4. アクセシビリティ対応（フォーカストラップ、スクリーンリーダー対応）

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                         |
| ----- | ---------------- | ---------------------------- |
| 1     | 要件定義         | UI仕様・アクセシビリティ要件 |
| 2     | 設計             | コンポーネント設計           |
| 4     | テスト作成       | ユニットテスト作成           |
| 5     | 実装             | コンポーネント実装           |
| 7     | カバレッジ確認   | テスト実行・カバレッジ確認   |
| 11    | 手動テスト検証   | 実環境での動作確認           |
| 12    | ドキュメント更新 | 仕様書更新                   |

### Phase 5: 実装

#### 目的

権限確認ダイアログコンポーネントを実装する。

#### 手順

1. `PermissionDialog.tsx`を作成
2. preload APIに`onPermissionRequest`, `sendPermissionResponse`を追加
3. agentSliceの`pendingPermission`と連携
4. テストを実行し全件PASSを確認

#### 完了条件

- ダイアログが正しく表示される
- 「許可」クリックで`approved: true`が送信される
- 「拒否」クリックで`approved: false`が送信される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PermissionDialogコンポーネントが作成されている
- [ ] ツール名、引数、理由メッセージが表示される
- [ ] 「許可」「拒否」ボタンが機能する
- [ ] 権限応答がMain Processに送信される

### 品質要件

- [ ] ユニットテストカバレッジ80%以上
- [ ] TypeScript strict PASS
- [ ] ESLint PASS
- [ ] アクセシビリティ（WCAG 2.1 AA準拠）

### ドキュメント要件

- [ ] システム仕様書（interfaces-agent-sdk.md）が更新されている
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容         | 期待結果                                       |
| ------ | ------------------ | ---------------------------------------------- |
| TC-001 | ダイアログ表示     | pendingPermissionがnull以外で表示              |
| TC-002 | 「許可」クリック   | approved=trueでresponse送信、ダイアログ閉じる  |
| TC-003 | 「拒否」クリック   | approved=falseでresponse送信、ダイアログ閉じる |
| TC-004 | Escキー            | ダイアログが閉じない（モーダル）               |
| TC-005 | フォーカストラップ | Tab/Shift+Tabでダイアログ内を循環              |

### アクセシビリティ検証

| 項目                   | 検証方法                     |
| ---------------------- | ---------------------------- |
| スクリーンリーダー対応 | VoiceOverで読み上げ確認      |
| キーボード操作         | Tab/Enter/Escで操作可能      |
| コントラスト比         | 4.5:1以上                    |
| フォーカス表示         | 可視のフォーカスインジケータ |

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                               |
| ----------------------- | ------ | -------- | ---------------------------------- |
| フォーカス管理の複雑さ  | 中     | 中       | react-focuslockライブラリ使用      |
| IPC通信のタイミング問題 | 中     | 低       | タイムアウト処理をMain側で実装済み |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                                        |
| -------------------------------- | --------------------------------------------------------------------------- |
| PermissionRequest Hook実装ガイド | `docs/guides/permission-request-hook.md`                                    |
| Agent SDKインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` |
| TASK-3-1-Cタスク仕様書           | `docs/30-workflows/task-3-1-c-permission-request/`                          |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                        | 内容                         |
| ------------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | PermissionRequest型、IPC仕様 |
| UI/UXコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | ダイアログ設計パターン       |

---

## 9. 備考

### 発見元タスクからの引用

> Renderer側UI（ダイアログ表示）は別タスクで実装予定。
>
> - 権限ダイアログコンポーネント: TASK-3-1-Dで実装予定
> - ダイアログの視認性: UI実装後に確認
> - キーボードナビゲーション: UI実装後に確認

### 補足事項

- TASK-3-1-C完了時に99テストPASS、Main Process側は完成
- 本タスクでRenderer側を実装し、PermissionRequest機能が完成する
- 「次回から確認しない」機能の永続化は別タスクで実装
