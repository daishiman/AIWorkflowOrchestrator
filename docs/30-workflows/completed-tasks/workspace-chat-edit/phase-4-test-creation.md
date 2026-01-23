# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 4                   |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。TDD原則に従い、受け入れ基準からテストシナリオを導出し、失敗するテストを作成する。

## 実行タスク

- **コンテキスト連携テスト**: ファイル添付機能のユニットテスト・統合テスト
- **編集指示テスト**: 編集コマンド処理のテスト
- **結果適用テスト**: 差分プレビュー・適用のテスト
- **統合テストシナリオ**: E2Eテストシナリオ設計と作成

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| ドメインモデル     | `outputs/phase-2/domain-model.md`            | Phase 2成果物 |
| IPC API設計        | `outputs/phase-2/ipc-api-design.md`          | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                        | 内容           |
| ---------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | TDD実践ガイド  |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略詳細 |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する。

#### ユニットテストシナリオ

| テストID | 対象             | シナリオ                     | 期待結果                     |
| -------- | ---------------- | ---------------------------- | ---------------------------- |
| UT-001   | useFileContext   | ファイルコンテキスト追加     | コンテキスト配列に追加される |
| UT-002   | useFileContext   | 選択範囲付きコンテキスト追加 | selection情報が含まれる      |
| UT-003   | useFileContext   | コンテキスト削除             | 配列から削除される           |
| UT-004   | useFileContext   | 全コンテキストクリア         | 空配列になる                 |
| UT-005   | chatEditSlice    | 生成結果の設定               | 状態が更新される             |
| UT-006   | chatEditSlice    | 結果承認                     | statusがapprovedに変更       |
| UT-007   | chatEditSlice    | 結果却下                     | statusがrejectedに変更       |
| UT-008   | useDiffApply     | 差分計算                     | DiffHunk配列が生成される     |
| UT-009   | useDiffApply     | ファイル適用                 | writeFile呼び出し            |
| UT-010   | FileContextBadge | バッジ表示                   | ファイル名・行数が表示       |
| UT-011   | DiffPreview      | 差分エディタ表示             | Monaco Diff Editor表示       |
| UT-012   | ApplyControls    | 適用ボタンクリック           | onApplyコールバック呼び出し  |

#### 統合テストシナリオ

| テストID | カテゴリ           | シナリオ                   | 期待結果                   |
| -------- | ------------------ | -------------------------- | -------------------------- |
| IT-001   | IPC接続            | ファイル読み取りIPC        | ファイル内容が返される     |
| IT-002   | IPC接続            | ファイル書き込みIPC        | ファイルが更新される       |
| IT-003   | データフロー       | 添付→LLM→差分表示          | 差分が正しく表示される     |
| IT-004   | エラーハンドリング | 存在しないファイル読み取り | エラーメッセージ表示       |
| IT-005   | エラーハンドリング | 書き込み権限なしファイル   | エラーメッセージ表示       |
| IT-006   | 状態同期           | 複数コンテキスト追加       | 全コンテキストが保持される |
| IT-007   | 認証連携           | LLM APIエラー              | 適切なエラー表示           |

### 2. ユニットテスト作成

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/useFileContext.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileContext } from "../useFileContext";

describe("useFileContext", () => {
  describe("addFileContext", () => {
    it("ファイルコンテキストを追加できる", () => {
      // Arrange
      const { result } = renderHook(() => useFileContext());
      const fileContext = {
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
      };

      // Act
      act(() => {
        result.current.addFileContext(fileContext);
      });

      // Assert
      expect(result.current.fileContexts).toHaveLength(1);
      expect(result.current.fileContexts[0].fileName).toBe("file.ts");
    });

    it("選択範囲付きコンテキストを追加できる", () => {
      // Arrange
      const { result } = renderHook(() => useFileContext());
      const fileContext = {
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        selection: {
          startLine: 1,
          startColumn: 0,
          endLine: 1,
          endColumn: 12,
          selectedText: "const x = 1;",
        },
      };

      // Act
      act(() => {
        result.current.addFileContext(fileContext);
      });

      // Assert
      expect(result.current.fileContexts[0].selection).toBeDefined();
      expect(result.current.fileContexts[0].selection?.selectedText).toBe(
        "const x = 1;",
      );
    });
  });

  describe("removeFileContext", () => {
    it("指定したコンテキストを削除できる", () => {
      // テスト実装
    });
  });

  describe("clearAllContexts", () => {
    it("全コンテキストをクリアできる", () => {
      // テスト実装
    });
  });
});
```

### 3. 統合テスト作成

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Workspace Chat Edit Integration", () => {
  describe("IPC接続テスト", () => {
    it("ファイル読み取りIPCが正常に動作する", async () => {
      // Arrange
      const mockIpc = vi.fn().mockResolvedValue({
        success: true,
        content: "file content",
        language: "typescript",
      });

      // Act & Assert
      // テスト実装
    });

    it("ファイル書き込みIPCが正常に動作する", async () => {
      // テスト実装
    });
  });

  describe("データフローテスト", () => {
    it("添付→LLM→差分表示の流れが正常に動作する", async () => {
      // テスト実装
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("存在しないファイル読み取り時にエラー表示される", async () => {
      // テスト実装
    });
  });
});
```

### 4. 境界値テスト

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/boundary.test.ts

describe("境界値テスト", () => {
  describe("ファイルサイズ", () => {
    it("空ファイルを処理できる", () => {});
    it("1MB以上のファイルを処理できる", () => {});
    it("最大サイズ(10MB)を超えるファイルでエラー表示", () => {});
  });

  describe("コンテキスト数", () => {
    it("コンテキスト0件で送信不可", () => {});
    it("コンテキスト1件で送信可能", () => {});
    it("コンテキスト10件以上で警告表示", () => {});
  });

  describe("選択範囲", () => {
    it("選択なしで全ファイル添付", () => {});
    it("1文字選択で正常処理", () => {});
    it("ファイル全体選択で正常処理", () => {});
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                      | テストファイル                   |
| ------------------ | --------------------------------------------- | -------------------------------- |
| IPC接続テスト      | chat-edit:read-file, chat-edit:write-file疎通 | `integration/ipc.test.ts`        |
| データフローテスト | Renderer→Main→LLM→Main→Rendererの往復         | `integration/dataflow.test.ts`   |
| エラーハンドリング | ファイル読取/書込エラー時のUI表示             | `integration/error.test.ts`      |
| 状態同期テスト     | chatEditSlice⇔workspaceSlice連携              | `integration/state-sync.test.ts` |

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

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストシナリオ設計
3. useFileContextテスト作成
4. chatEditSliceテスト作成
5. useDiffApplyテスト作成
6. UIコンポーネントテスト作成
7. 統合テスト作成（IPC接続）
8. 統合テスト作成（データフロー）
9. 統合テスト作成（エラーハンドリング）
10. 境界値テスト作成
11. 成果物の作成・配置
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
