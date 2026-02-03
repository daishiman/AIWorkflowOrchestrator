# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 4                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: handleGetSelection、editorSelectionユーティリティ
- 統合テスト作成: IPC経由での選択範囲取得
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する。

| AC-ID | テストシナリオ                         |
| ----- | -------------------------------------- |
| AC-1  | 選択範囲がある時にTextSelectionが返る  |
| AC-2  | 選択がない時にnullが返る               |
| AC-3  | 全フィールドが正しい値を持つ           |
| AC-4  | IPC経由でデータが正しく送受信される    |
| AC-5  | IPC登録後にチャンネルが有効になる      |
| AC-6  | 新規コードのカバレッジが80%以上        |
| AC-7  | contextBridge経由のみでAPIが公開される |

### 2. ユニットテスト作成

**テストファイル構成**:

| ファイル                                                  | テスト対象                     |
| --------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/chatEditHandlers.test.ts`      | handleGetSelection             |
| `apps/desktop/src/renderer/utils/editorSelection.test.ts` | getEditorSelection             |
| `apps/desktop/src/preload/chatEditApi.test.ts`            | chatEditAPI.getEditorSelection |

**テストケース一覧**:

```typescript
// handleGetSelection テスト
describe("handleGetSelection", () => {
  it("選択範囲がある場合、TextSelectionオブジェクトを返す", async () => {});
  it("選択範囲がない場合、nullを返す", async () => {});
  it("エディタが存在しない場合、nullを返す", async () => {});
  it("validateIpcSender()で検証される", async () => {});
});

// getEditorSelection テスト
describe("getEditorSelection", () => {
  it("Monaco Editorの選択範囲をTextSelection形式で返す", () => {});
  it("選択がない場合はnullを返す", () => {});
  it("複数行選択時にstartLine < endLineになる", () => {});
  it("単一行内の部分選択時に同一行でstartColumn < endColumnになる", () => {});
  it("selectedTextが選択範囲の文字列と一致する", () => {});
  it("エディタが未初期化の場合はnullを返す", () => {});
});
```

### 3. 統合テスト作成

**IPC統合テスト**:

```typescript
// chatEdit.integration.test.ts
describe("chat-edit:get-selection IPC", () => {
  it("Renderer→Main間でTextSelectionが送受信される", async () => {});
  it("選択なし時にnullがRenderer側に返る", async () => {});
  it("チャンネルがALLOWED_INVOKE_CHANNELSに登録されている", () => {});
});
```

### 4. 境界値テスト

| テストケース     | 入力                 | 期待結果             |
| ---------------- | -------------------- | -------------------- |
| 1文字選択        | startCol=1, endCol=2 | 1文字のselectedText  |
| 空行選択         | 空行のみ選択         | 空文字のselectedText |
| ファイル全体選択 | 全行選択             | 全テキスト           |
| マルチバイト文字 | 日本語テキスト選択   | 正しいバイト数       |

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                           | テストファイル                 |
| ------------------ | ---------------------------------- | ------------------------------ |
| IPC接続テスト      | chat-edit:get-selection疎通        | `chatEdit.integration.test.ts` |
| データフローテスト | Renderer→Preload→Main→戻り値の往復 | `chatEdit.flow.test.ts`        |
| エラーハンドリング | エディタ未存在時のnull返却         | `chatEdit.error.test.ts`       |

## アーキテクチャ層別テスト

| 層               | テスト観点                    | テストファイル配置                          |
| ---------------- | ----------------------------- | ------------------------------------------- |
| Renderer Process | editorSelectionユーティリティ | `apps/desktop/src/renderer/utils/*.test.ts` |
| Main Process     | handleGetSelection            | `apps/desktop/src/main/ipc/*.test.ts`       |
| IPC通信          | チャンネル登録、型安全性      | `*.integration.test.ts`                     |
| Preload          | chatEditAPI                   | `apps/desktop/src/preload/*.test.ts`        |

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/*.test.ts`              | 実際のテストコード |

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（テストシナリオ設計、ユニットテスト作成、統合テスト作成、境界値テスト）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 4
```

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
