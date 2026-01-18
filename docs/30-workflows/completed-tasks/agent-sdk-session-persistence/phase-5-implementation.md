# Phase 5: 実装（Green） - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 5                             |
| Phase名    | 実装（TDD Green）             |
| 前提Phase  | Phase 4（テスト作成）         |
| 後続Phase  | Phase 6（テスト拡充）         |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを全て成功させる実装を行う。electron-storeを使用したSessionPersistenceServiceとSessionStorageを実装する。

## 背景

テストファーストで作成されたテストケースに対して、最小限のコードで全テストを成功させる。この段階ではコードの美しさより「テストを通すこと」を優先する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 依存パッケージのインストール

**目的**: electron-storeパッケージをインストールする

**実行手順**:

1. 以下のコマンドで依存パッケージをインストール:

```bash
pnpm --filter @repo/desktop add electron-store
pnpm --filter @repo/desktop add -D @types/electron-store
```

2. package.jsonの更新を確認
3. pnpm installで依存解決を確認

**期待される成果物**:

- `apps/desktop/package.json`（更新）

---

### タスク2: 型定義の実装

**目的**: Phase 2で設計した型定義を実装する

**実行手順**:

1. `packages/shared/src/types/agent.ts`に以下の型を追加:
   - PersistedSession
   - SessionPersistenceConfig
   - SessionStorageState
2. Zodスキーマを実装
3. 型エクスポートを追加
4. 型チェックを実行して確認

**期待される成果物**:

- `packages/shared/src/types/agent.ts`（更新）

---

### タスク3: SessionStorage実装

**目的**: electron-storeラッパーを実装する

**実行手順**:

1. `apps/desktop/src/main/services/session/SessionStorage.ts`を作成
2. 以下のメソッドを実装:
   - `constructor()`: electron-store初期化
   - `get()`: データ取得
   - `set()`: データ保存
   - `delete()`: データ削除
   - `clear()`: 全データ削除
3. スキーマバリデーションを実装
4. テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/main/services/session/SessionStorage.ts`

---

### タスク4: SessionPersistenceService実装

**目的**: 永続化サービスの本体を実装する

**実行手順**:

1. `apps/desktop/src/main/services/session/SessionPersistenceService.ts`を作成
2. 以下のメソッドを実装:
   - `listPersistedSessions()`: 一覧取得
   - `saveSession()`: 保存
   - `deleteSession()`: 削除
   - `clearAllSessions()`: 全削除
   - `getStorageInfo()`: 情報取得
3. LRU削除ポリシーを実装
4. テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`

---

### タスク5: IPCハンドラー実装

**目的**: セッション永続化のIPCハンドラーを実装する

**実行手順**:

1. `apps/desktop/src/main/ipc/sessionHandlers.ts`を作成または更新
2. 以下のIPCハンドラーを実装:
   - `session:list-persisted`
   - `session:save`
   - `session:delete`
   - `session:clear-all`
   - `session:get-storage-info`
3. IPCハンドラー登録を確認
4. 統合テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/main/ipc/sessionHandlers.ts`
- `apps/desktop/src/preload/channels.ts`（更新）

---

### タスク6: 全テスト成功の確認

**目的**: Phase 4で作成した全テストが成功することを確認する

**実行手順**:

1. 以下のコマンドでテストを実行:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="session"
```

2. 全テストが成功することを確認
3. テスト結果を記録

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容                      |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存セッション型定義      |
| IPC実装パターン           | `apps/desktop/src/main/ipc/`                                                | 既存IPCハンドラーパターン |

### Phase 2/4成果物

| 参照資料           | パス                                     | 内容               |
| ------------------ | ---------------------------------------- | ------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 全体アーキテクチャ |
| IPC設計            | `outputs/phase-2/ipc-design.md`          | IPC通信設計        |
| テスト仕様         | `outputs/phase-4/test-specification.md`  | テスト仕様         |

---

## 成果物

| 成果物                    | パス                                                                  | 内容                   |
| ------------------------- | --------------------------------------------------------------------- | ---------------------- |
| 型定義                    | `packages/shared/src/types/agent.ts`                                  | PersistedSession等     |
| SessionStorage            | `apps/desktop/src/main/services/session/SessionStorage.ts`            | electron-storeラッパー |
| SessionPersistenceService | `apps/desktop/src/main/services/session/SessionPersistenceService.ts` | 永続化サービス         |
| IPCハンドラー             | `apps/desktop/src/main/ipc/sessionHandlers.ts`                        | IPCハンドラー          |
| テスト成功確認            | `outputs/phase-5/test-green-status.md`                                | テスト結果             |

---

## 統合テスト連携（Phase 1〜11は必須）

- Main Process永続化サービスとRenderer Process連携の実装を完了すること
- IPC通信が正常に動作することを確認すること
- 統合テストが成功することを確認すること

---

## 完了条件

- [ ] electron-storeパッケージがインストールされている
- [ ] 型定義が実装されている
- [ ] SessionStorageが実装されている
- [ ] SessionPersistenceServiceが実装されている
- [ ] IPCハンドラーが実装されている
- [ ] **Phase 4で作成した全テストが成功している（Green状態）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --testPathPattern="session"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-session-persistence/phase-6-test-expansion.md`
