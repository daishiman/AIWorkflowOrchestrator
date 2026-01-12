# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 5                    |
| Phase名    | 実装                 |
| 前提Phase  | Phase 4              |
| 後続Phase  | Phase 6              |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通す最小限の実装を行う。
4つのIPCハンドラーを実装し、HistoryServiceと連携させる。

## 背景

Phase 4で作成したテストが全て失敗（Red）状態にある。本Phaseでは、これらのテストを通す実装を行い、Green状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: historyHandlers.ts の作成

**目的**: IPCハンドラーのメインファイルを作成する。

**実行手順**:

1. `apps/desktop/src/main/ipc/historyHandlers.ts` を作成する
2. 必要な型定義をインポートする
3. `registerHistoryHandlers` 関数のスケルトンを作成する

**期待される成果物**:

- `apps/desktop/src/main/ipc/historyHandlers.ts`（IPCハンドラー実装）

---

### タスク2: 4つのIPCハンドラー実装

**目的**: 各IPCチャンネルのハンドラーを実装する。

**実行手順**:

1. `history:getFileHistory` ハンドラーを実装する
   - HistoryService.getFileHistory を呼び出す
   - Result型で結果をラップして返却する
   - エラー時は catch でエラー情報を返却する
2. `history:getVersionDetail` ハンドラーを実装する
3. `history:getConversionLogs` ハンドラーを実装する
4. `history:restoreVersion` ハンドラーを実装する
5. 全ハンドラーにログ出力を追加する

**実装コード参考**:

```typescript
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { HistoryService } from "../services/HistoryService";

interface Result<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

export function registerHistoryHandlers(historyService: HistoryService): void {
  ipcMain.handle(
    "history:getFileHistory",
    async (
      _event: IpcMainInvokeEvent,
      fileId: string,
      options?: PaginationOptions,
    ): Promise<Result<unknown>> => {
      try {
        const result = await historyService.getFileHistory(fileId, options);
        return { success: true, data: result };
      } catch (error) {
        console.error("[IPC] history:getFileHistory error:", error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  );
  // ... 他のハンドラー
}
```

**期待される成果物**:

- 4つのIPCハンドラー実装コード

---

### タスク3: main.ts への登録追加

**目的**: アプリケーション起動時にIPCハンドラーを登録する。

**実行手順**:

1. `apps/desktop/src/main/main.ts` を開く
2. historyHandlers のインポートを追加する
3. `app.whenReady()` 内でハンドラー登録を呼び出す
4. HistoryServiceのインスタンスを取得・注入する

**期待される成果物**:

- `apps/desktop/src/main/main.ts` の更新

---

### タスク4: index.ts へのエクスポート追加

**目的**: IPCハンドラーをモジュールからエクスポートする。

**実行手順**:

1. `apps/desktop/src/main/ipc/index.ts` を開く
2. historyHandlers のエクスポートを追加する

**期待される成果物**:

- `apps/desktop/src/main/ipc/index.ts` の更新

---

### タスク5: テスト成功の確認（Green状態）

**目的**: 全てのテストが成功することを確認する。

**実行手順**:

1. `pnpm --filter @repo/desktop test` を実行する
2. 全てのテストが成功（Green）であることを確認する
3. `outputs/phase-5/green-state-confirmation.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-5/green-state-confirmation.md`（Green状態確認結果）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                          |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| 履歴/ログ表示UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | IPCチャンネル名・データ型定義 |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件       |

---

## 成果物

| 成果物            | パス                                           | 内容                |
| ----------------- | ---------------------------------------------- | ------------------- |
| IPCハンドラー     | `apps/desktop/src/main/ipc/historyHandlers.ts` | 4つのハンドラー実装 |
| main.ts更新       | `apps/desktop/src/main/main.ts`                | ハンドラー登録追加  |
| index.ts更新      | `apps/desktop/src/main/ipc/index.ts`           | エクスポート追加    |
| Green状態確認結果 | `outputs/phase-5/green-state-confirmation.md`  | テスト成功の確認    |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携アクション

IPCハンドラー実装とHistoryService接続を行うこと。

| 項目               | 内容                                             |
| ------------------ | ------------------------------------------------ |
| IPC-Service接続    | HistoryServiceとの接続が正常に動作することを確認 |
| Result型返却       | 全ハンドラーでResult型形式の返却を実装           |
| エラーハンドリング | try-catch でエラーを捕捉しResult型で返却         |

---

## 完了条件

- [ ] historyHandlers.ts が作成された
- [ ] 4つのIPCハンドラーが実装された
- [ ] main.ts でハンドラーが登録された
- [ ] index.ts でエクスポートが追加された
- [ ] 全てのテストが成功状態（Green）である
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1（historyHandlers.ts の作成）: [結果を記入]
- タスク2（4つのIPCハンドラー実装）: [結果を記入]
- タスク3（main.ts への登録追加）: [結果を記入]
- タスク4（index.ts へのエクスポート追加）: [結果を記入]
- タスク5（テスト成功の確認）: [結果を記入]

### TDD状態

- Green状態: [確認済み/未確認]
- テスト成功数: [N]/[N]件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ipc-handlers/phase-6-test-expansion.md`
