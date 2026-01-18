# Phase 4: テスト作成（Red） - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD Red）         |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |

---

## 目的

TDDのRedフェーズとして、Phase 2の設計に基づき失敗するテストを作成する。テストが失敗することを確認してからPhase 5の実装に進む。

## 背景

TDD（Test-Driven Development）の原則に従い、実装前にテストを作成することで、設計の妥当性を検証し、実装の品質を担保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト戦略の策定

**目的**: セッション永続化機能のテスト戦略を策定する

**実行手順**:

1. テスト種別と対象を整理:
   - ユニットテスト: SessionPersistenceService, SessionStorage
   - 統合テスト: IPC通信、electron-store連携
   - E2Eテスト: アプリ再起動シナリオ
2. テストカバレッジ目標を設定（80%+）
3. モック戦略を決定
4. テスト戦略ドキュメントを作成

**期待される成果物**:

- `outputs/phase-4/test-strategy.md`

---

### タスク2: SessionPersistenceService ユニットテスト作成

**目的**: Main Processの永続化サービスのテストを作成する

**実行手順**:

1. テストファイル作成: `apps/desktop/src/main/services/session/__tests__/SessionPersistenceService.test.ts`
2. 以下のテストケースを実装:
   - `listPersistedSessions()`: 永続化セッション一覧取得
   - `saveSession()`: セッション保存
   - `deleteSession()`: セッション削除
   - `clearAllSessions()`: 全セッション削除
   - `getStorageInfo()`: ストレージ情報取得
   - LRU削除ポリシー: 容量超過時の古いセッション削除
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/main/services/session/__tests__/SessionPersistenceService.test.ts`

---

### タスク3: SessionStorage ユニットテスト作成

**目的**: electron-storeラッパーのテストを作成する

**実行手順**:

1. テストファイル作成: `apps/desktop/src/main/services/session/__tests__/SessionStorage.test.ts`
2. 以下のテストケースを実装:
   - `get()`: データ取得
   - `set()`: データ保存
   - `delete()`: データ削除
   - `clear()`: 全データ削除
   - バリデーション: スキーマ検証
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/main/services/session/__tests__/SessionStorage.test.ts`

---

### タスク4: IPC統合テスト作成

**目的**: Renderer ↔ Main間のIPC通信テストを作成する

**実行手順**:

1. テストファイル作成: `apps/desktop/src/main/services/session/__tests__/session-ipc.integration.test.ts`
2. 以下のテストケースを実装:
   - `session:list-persisted`: 一覧取得IPC
   - `session:save`: 保存IPC
   - `session:delete`: 削除IPC
   - `session:clear-all`: 全削除IPC
   - `session:get-storage-info`: ストレージ情報IPC
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/main/services/session/__tests__/session-ipc.integration.test.ts`

---

### タスク5: テスト仕様書作成

**目的**: 作成したテストの仕様をドキュメント化する

**実行手順**:

1. テストケース一覧を整理
2. テストデータ・モック定義を整理
3. テスト実行方法を記載
4. テスト仕様書を作成

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容           |
| ------------------------- | --------------------------------------------------------------------------- | -------------- |
| テスト戦略                | `.claude/skills/task-specification-creator/SKILL.md`                        | カバレッジ目標 |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義         |

### Phase 2成果物

| 参照資料           | パス                                     | 内容               |
| ------------------ | ---------------------------------------- | ------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 全体アーキテクチャ |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型定義   |
| IPC設計            | `outputs/phase-2/ipc-design.md`          | IPC通信設計        |

---

## 成果物

| 成果物                          | パス                                                                                 | 内容                   |
| ------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| テスト戦略                      | `outputs/phase-4/test-strategy.md`                                                   | テスト戦略ドキュメント |
| SessionPersistenceServiceテスト | `apps/desktop/src/main/services/session/__tests__/SessionPersistenceService.test.ts` | ユニットテスト         |
| SessionStorageテスト            | `apps/desktop/src/main/services/session/__tests__/SessionStorage.test.ts`            | ユニットテスト         |
| IPC統合テスト                   | `apps/desktop/src/main/services/session/__tests__/session-ipc.integration.test.ts`   | 統合テスト             |
| テスト仕様書                    | `outputs/phase-4/test-specification.md`                                              | テスト仕様ドキュメント |

---

## 統合テスト連携（Phase 1〜11は必須）

- 永続化→復元の統合テストシナリオを作成すること
- IPC通信の正常系・異常系をカバーすること
- アプリ再起動シナリオのテスト設計を含めること

---

## 完了条件

- [ ] テスト戦略ドキュメントが作成されている
- [ ] SessionPersistenceServiceのユニットテストが作成されている
- [ ] SessionStorageのユニットテストが作成されている
- [ ] IPC統合テストが作成されている
- [ ] テスト仕様書が作成されている
- [ ] **全テストが失敗することを確認している（Red状態）**

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-session-persistence/phase-5-implementation.md`
