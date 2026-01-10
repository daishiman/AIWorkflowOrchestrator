# TDD Red Phase サマリー - index.html→structure.md 逆同期機能

## メタ情報

| 項目        | 内容                             |
| ----------- | -------------------------------- |
| 機能名      | slide-reverse-sync               |
| タスクID    | task-feat-slide-reverse-sync-001 |
| 作成日      | 2026-01-10                       |
| Phase       | 4                                |
| TDDステージ | Red（失敗するテスト作成）        |

---

## 1. 作成したテストファイル

### 1.1 ユニットテスト

| ファイル               | テスト数 | 失敗数 | 状態        |
| ---------------------- | -------- | ------ | ----------- |
| file-watcher.test.ts   | 18       | 5      | TDD Red完了 |
| sync-manager.test.ts   | 20       | 12     | TDD Red完了 |
| skill-executor.test.ts | 21       | 4      | TDD Red完了 |
| modifier-skill.test.ts | 14       | 14     | TDD Red完了 |

### 1.2 統合テスト

| ファイル                  | テスト数 | 失敗数 | 状態        |
| ------------------------- | -------- | ------ | ----------- |
| slide-integration.test.ts | 14       | 7      | TDD Red完了 |

---

## 2. 追加したテストケース

### 2.1 FileWatcher テスト（FW-01〜FW-06）

| テストID | テスト名                                            | 失敗理由                   |
| -------- | --------------------------------------------------- | -------------------------- |
| FW-01    | should watch index.html in addition to structure.md | index.html監視未実装       |
| FW-02    | should call onHtmlChange callback on html change    | onHtmlChangeメソッド未実装 |
| FW-03    | should ignore html skill-originated changes         | onHtmlChangeメソッド未実装 |
| FW-04    | should ignore modifier skill-originated changes     | 既存テスト（パス）         |
| FW-05    | should process html changes after TTL               | onHtmlChangeメソッド未実装 |
| FW-06    | should handle bidirectional loop prevention         | onHtmlChangeメソッド未実装 |

### 2.2 SyncManager テスト（SM-01〜SM-06）

| テストID | テスト名                                     | 失敗理由                     |
| -------- | -------------------------------------------- | ---------------------------- |
| SM-01    | should execute modifier skill on reverseSync | reverseSyncメソッド未実装    |
| SM-02    | should return structure changes on success   | reverseSyncメソッド未実装    |
| SM-03    | should throw error on reverseSync failure    | reverseSyncメソッド未実装    |
| SM-04    | should update sync direction on reverseSync  | onStatusChangeメソッド未実装 |
| SM-05    | should handle cancel during reverseSync      | reverseSyncメソッド未実装    |
| SM-06    | should emit progress during reverseSync      | reverseSyncメソッド未実装    |

### 2.3 SkillExecutor テスト（SE-01〜SE-06）

| テストID | テスト名                                | 失敗理由           |
| -------- | --------------------------------------- | ------------------ |
| SE-01    | should execute modifier skill           | 既存テスト（パス） |
| SE-02    | should pass correct context to modifier | projectPath未返却  |
| SE-03    | should handle modifier skill timeout    | タイムアウト未実装 |
| SE-04    | should retry on modifier skill failure  | 既存テスト（パス） |
| SE-05    | should report progress during modifier  | 既存テスト（パス） |
| SE-06    | should handle abort during modifier     | 既存テスト（パス） |

### 2.4 ModifierSkill テスト（MS-01〜MS-06）

| テストID | テスト名                                 | 失敗理由                    |
| -------- | ---------------------------------------- | --------------------------- |
| MS-01    | should build correct prompt from context | buildModifierPrompt未実装   |
| MS-02    | should parse valid JSON response         | parseModifierResponse未実装 |
| MS-03    | should extract JSON from markdown block  | parseModifierResponse未実装 |
| MS-04    | should return error on invalid response  | parseModifierResponse未実装 |
| MS-05    | should validate structure changes format | parseModifierResponse未実装 |
| MS-06    | should handle empty changes array        | parseModifierResponse未実装 |

### 2.5 統合テスト（IT-01〜IT-06）

| テストID | テスト名                                      | 失敗理由                     |
| -------- | --------------------------------------------- | ---------------------------- |
| IT-01    | should trigger reverseSync on html change     | onHtmlChangeメソッド未実装   |
| IT-02    | should update structure.md on successful sync | reverseSyncメソッド未実装    |
| IT-03    | should prevent infinite loop on bidirectional | onHtmlChangeメソッド未実装   |
| IT-04    | should emit correct IPC events                | onStatusChangeメソッド未実装 |
| IT-05    | should handle concurrent sync requests        | reverseSyncメソッド未実装    |
| IT-06    | should recover from Agent SDK failure         | reverseSyncメソッド未実装    |

---

## 3. 作成したスタブファイル

Phase 5での実装に向けて、以下のスタブファイルを作成：

### 3.1 modifier-skill.ts

```typescript
// スタブ関数（すべて "Not implemented" エラーを投げる）
- buildModifierPrompt(context: ModifierContext): string
- parseModifierResponse(response: string): ModifierResponse
- createModifierSkill(): ModifierSkill
```

### 3.2 agent-client.ts

```typescript
// スタブ関数
- getAgentAPI(): AgentAPI
```

---

## 4. 実装が必要なインターフェース

Phase 5で実装が必要なメソッド/関数：

### 4.1 SlideWatcher拡張

```typescript
interface SlideWatcher {
  // 新規追加
  onHtmlChange(callback: (path: string) => void): void;
}
```

### 4.2 SyncManager拡張

```typescript
interface SyncManager {
  // 新規追加
  reverseSync(projectPath: string): Promise<SyncResult>;
  onStatusChange(callback: (status: SyncStatus) => void): void;
}
```

### 4.3 ModifierSkill実装

```typescript
function buildModifierPrompt(context: ModifierContext): string;
function parseModifierResponse(response: string): ModifierResponse;
function createModifierSkill(): ModifierSkill;
```

---

## 5. 次フェーズへの引き継ぎ事項

### 5.1 Phase 5（TDD Green）で実装すべき項目

1. **FileWatcher拡張**
   - `onHtmlChange`コールバック追加
   - index.html監視の追加

2. **SyncManager拡張**
   - `reverseSync`メソッド実装
   - `onStatusChange`メソッド実装
   - direction（forward/reverse）の追跡

3. **ModifierSkill実装**
   - プロンプト構築ロジック
   - レスポンスパースロジック
   - Agent SDK連携

4. **SkillExecutor拡張**
   - modifier実行時のコンテキスト返却
   - タイムアウト処理実装
   - direction返却

### 5.2 テスト実行コマンド

```bash
# 全slideテスト実行
pnpm vitest run src/main/slide/__tests__/

# 個別テスト実行
pnpm vitest run src/main/slide/__tests__/file-watcher.test.ts
pnpm vitest run src/main/slide/__tests__/sync-manager.test.ts
pnpm vitest run src/main/slide/__tests__/skill-executor.test.ts
pnpm vitest run src/main/slide/__tests__/modifier-skill.test.ts
pnpm vitest run src/main/slide/__tests__/slide-integration.test.ts
```

---

## 6. 関連ドキュメント

| ドキュメント       | パス                                         |
| ------------------ | -------------------------------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      |
| テストケース       | `outputs/phase-4/test-cases.md`              |
| 統合テスト設計書   | `outputs/phase-4/integration-test-design.md` |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
