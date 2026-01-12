# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成                     |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-12                     |
| 機能名     | history-service-db-integration |

---

## 目的

TDDのRed段階として、HistoryService DB統合の期待動作を検証するテストを実装より先に作成する。全てのテストが失敗状態（Red）であることを確認する。

## 背景

テストファースト開発により、実装の目標を明確にし、リグレッションを防止する。既存の22件のIPCハンドラーテストは維持しつつ、新たに統合テストを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト方針の策定

**目的**: テスト戦略を明確にする

**実行手順**:

1. テスト種別を整理:
   - ユニットテスト: HistoryService各メソッド
   - 統合テスト: HistoryService + Repository
   - E2Eテスト: IPC → HistoryService → DB
2. モック戦略を決定:
   - ConversionRepositoryのモック
   - FileRepositoryのモック
   - IConversionLoggerのモック
3. テストデータ設計

**期待される成果物**:

- テスト方針書

---

### タスク2: ユニットテストケース作成

**目的**: HistoryServiceの各メソッドをテストするケースを作成する

**実行手順**:

1. `getFileHistory` テストケース:

   ```typescript
   describe("getFileHistory", () => {
     it("正常系: ファイルIDに対応する履歴を取得できる", async () => {});
     it("正常系: ページネーションが正しく動作する", async () => {});
     it("正常系: hasMoreが正しく判定される", async () => {});
     it("異常系: 存在しないファイルIDでエラーを返す", async () => {});
   });
   ```

2. `getVersionDetail` テストケース:

   ```typescript
   describe("getVersionDetail", () => {
     it("正常系: 変換IDに対応する詳細を取得できる", async () => {});
     it("異常系: 存在しない変換IDでエラーを返す", async () => {});
   });
   ```

3. `getConversionLogs` テストケース:

   ```typescript
   describe("getConversionLogs", () => {
     it("正常系: 変換ログを取得できる", async () => {});
     it("正常系: ログレベルでフィルタできる", async () => {});
     it("正常系: ページネーションが動作する", async () => {});
   });
   ```

4. `restoreVersion` テストケース:
   ```typescript
   describe("restoreVersion", () => {
     it("正常系: バージョンを復元できる", async () => {});
     it("異常系: 存在しない変換IDでエラーを返す", async () => {});
     it("異常系: ファイルIDが一致しない場合エラーを返す", async () => {});
   });
   ```

**期待される成果物**:

- ユニットテストファイル（`apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts`）

---

### タスク3: 統合テストシナリオ作成

**目的**: HistoryService-Repository間の統合テストを作成する

**実行手順**:

1. API接続テスト:
   - HistoryService → ConversionRepository 疎通確認
   - 正しい引数が渡されているか

2. データフローテスト:
   - getFileHistory: Repository → HistoryService → 変換結果
   - getVersionDetail: Repository → HistoryService → 変換結果

3. エラーハンドリングテスト:
   - Repository失敗時のHistoryServiceの挙動
   - Result型でのエラー伝搬

4. 状態同期テスト:
   - restoreVersion後のバージョン番号更新

**期待される成果物**:

- 統合テストファイル

---

### タスク4: テスト実行・Red確認

**目的**: 全てのテストが失敗することを確認する

**実行手順**:

1. テストを実行:
   ```bash
   pnpm --filter @repo/desktop test apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts
   ```
2. 全テストが失敗（Red）であることを確認
3. 失敗理由が「未実装」であることを確認

**期待される成果物**:

- テスト実行結果（全件Red）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                        | 内容                 |
| ---------- | --------------------------------------------------------------------------- | -------------------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テストカバレッジ基準 |

### Phase 1-3成果物

| 参照資料     | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | テスト対象の要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | テスト基準       |
| 設計書       | `outputs/phase-2/architecture-design.md`     | テスト対象の設計 |

---

## 成果物

| 成果物       | パス                                                                          | 内容                       |
| ------------ | ----------------------------------------------------------------------------- | -------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                                       | テスト方針・ケース一覧     |
| テストコード | `apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts` | 統合テスト（コード成果物） |

---

## 統合テスト連携（Phase 1〜11は必須）

HistoryService-DB統合テストシナリオを作成:

- API接続テスト（HistoryService ↔ Repository）
- データフローテスト（Repository → Service → 型変換）
- エラーハンドリングテスト（Result型伝搬）
- 状態同期テスト（バージョン復元後の状態）

---

## 完了条件

- [ ] テスト方針が策定されている
- [ ] ユニットテストケースが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] 全てのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-service-db-integration/phase-5-implementation.md`
