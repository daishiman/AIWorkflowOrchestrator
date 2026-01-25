# SkillExecutor IPC Handler統合 - タスク指示書

## メタ情報

```yaml
issue_number: 496
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-3-1-B                                 |
| タスク名     | SkillExecutor IPC Handler統合              |
| 分類         | 機能追加                                   |
| 対象機能     | SkillExecutor → IPC → Renderer Process連携 |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | TASK-3-1-A（SDK query()基本実装）完了時    |
| 発見日       | 2026-01-25                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-AでSkillExecutorクラス（SDK query() API基本実装）が完了した。SkillExecutorは`skill:stream` IPCチャンネル経由でRenderer Processへストリーミングメッセージを送信する機能を持つが、Renderer Process側のIPC Handlerおよび受信ロジックは未実装。

### 1.2 問題点・課題

現在の状態:

- Main Process: SkillExecutor実装済み（`skill:stream`送信可能）
- Preload API: `skillAPI.onStream()`未実装
- Renderer Process: ストリーミングメッセージ受信・表示ロジック未実装

この状態ではUIがスキル実行結果をリアルタイムで表示できない。

### 1.3 放置した場合の影響

- スキル実行機能がUIと連携できない
- ストリーミングレスポンスがユーザーに見えない
- スキルシステム全体が未完成のまま

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorからのストリーミングメッセージをRenderer Processで受信し、UIにリアルタイム表示できるようにする。

### 2.2 最終ゴール

- `skillAPI.onStream(callback)` Preload APIが動作する
- AgentViewでストリーミングメッセージがリアルタイム表示される
- 中断ボタンで`abort()`を呼び出せる
- エラー時に適切なエラー表示がされる

### 2.3 スコープ

#### 含むもの

- Preload API拡張（`skillAPI.onStream`）
- IPC Handler登録（`skill:stream`リスナー）
- AgentViewへのストリーミング表示統合
- 中断UI（Abortボタン）
- エラーハンドリングUI

#### 含まないもの

- SkillExecutor本体の変更（TASK-3-1-Aで完了済み）
- スキル選択UI（既存機能）
- スキル一覧取得（SkillScannerで完了済み）

### 2.4 成果物

- `apps/desktop/src/preload/skill-api.ts`（更新）
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`（新規）
- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`（新規または更新）
- 単体テスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-A（SkillExecutor SDK query()基本実装）が完了していること ✅
- SkillScannerが動作していること ✅

### 3.2 依存タスク

| タスクID     | タスク名             | ステータス |
| ------------ | -------------------- | ---------- |
| TASK-3-1-A   | SDK query() 基本実装 | 完了       |
| SkillScanner | スキルスキャン機能   | 完了       |

### 3.3 必要な知識

- Electron IPC（Main → Renderer方向のイベント送信）
- React Hooks（useEffect、useState）
- TypeScript
- SkillExecutor API（TASK-3-1-A実装ガイド参照）

### 3.4 推奨アプローチ

#### Preload API設計

```typescript
// apps/desktop/src/preload/skill-api.ts
export const skillAPI = {
  // 既存
  execute: (request: SkillExecutionRequest) =>
    ipcRenderer.invoke("skill:execute", request),

  // 新規追加
  onStream: (callback: (message: SkillStreamMessage) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, message: SkillStreamMessage) => {
      callback(message);
    };
    ipcRenderer.on("skill:stream", handler);
    return () => ipcRenderer.removeListener("skill:stream", handler);
  },

  abort: (executionId: string): Promise<boolean> =>
    ipcRenderer.invoke("skill:abort", executionId),
};
```

#### Main Process IPC Handler

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts
ipcMain.handle(
  "skill:execute",
  async (event, request: SkillExecutionRequest) => {
    const skill = await skillScanner.getSkillById(request.skillId);
    return skillExecutor.execute(request, skill);
  },
);

ipcMain.handle("skill:abort", async (event, executionId: string) => {
  return skillExecutor.abort(executionId);
});
```

#### React Hook

```typescript
// apps/desktop/src/renderer/hooks/useSkillExecution.ts
export function useSkillExecution(skillId: string) {
  const [messages, setMessages] = useState<SkillStreamMessage[]>([]);
  const [status, setStatus] = useState<
    "idle" | "running" | "completed" | "error"
  >("idle");
  const executionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = skillAPI.onStream((message) => {
      if (message.executionId === executionIdRef.current) {
        setMessages((prev) => [...prev, message]);
        if (message.type === "complete") setStatus("completed");
        if (message.type === "error") setStatus("error");
      }
    });
    return unsubscribe;
  }, []);

  const execute = async (prompt: string) => {
    setMessages([]);
    setStatus("running");
    const response = await skillAPI.execute({ prompt, skillId });
    executionIdRef.current = response.executionId;
    return response;
  };

  const abort = async () => {
    if (executionIdRef.current) {
      await skillAPI.abort(executionIdRef.current);
    }
  };

  return { messages, status, execute, abort };
}
```

---

## 4. 実行手順

### Phase構成

13フェーズ構成（task-specification-creator標準ワークフロー適用）

### Phase 1: 要件定義

#### 目的

IPC統合の詳細要件を定義する

#### 手順

1. SkillExecutorのAPIを確認（TASK-3-1-A実装ガイド参照）
2. Preload API拡張仕様を定義
3. UI要件（ストリーミング表示仕様）を定義
4. 受け入れ基準を作成

#### 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- Preload API仕様が定義されている
- UI表示要件が明確になっている

### Phase 2: 設計

#### 目的

IPC Handler・Preload API・UI連携の設計

#### 手順

1. IPC Handlerアーキテクチャ設計
2. Preload API設計
3. React Hook設計
4. UIコンポーネント設計

#### 成果物

- `outputs/phase-2/architecture-design.md`
- `outputs/phase-2/interface-design.md`

#### 完了条件

- IPC Handler設計完了
- Preload API設計完了
- UIコンポーネント設計完了

### Phase 3-13

標準ワークフロー（TDD Red/Green/Refactor）に従う

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skillAPI.onStream()`が動作する
- [ ] ストリーミングメッセージがUIに表示される
- [ ] 中断ボタンで実行を中止できる
- [ ] エラー時にエラーメッセージが表示される
- [ ] 完了時に完了状態が表示される

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが全件PASS
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] システム仕様書（interfaces-agent-sdk.md）が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID    | テスト内容                | 期待結果                       |
| -------- | ------------------------- | ------------------------------ |
| TC-B-001 | onStream コールバック登録 | コールバックが正しく登録される |
| TC-B-002 | ストリームメッセージ受信  | メッセージが正しく受信される   |
| TC-B-003 | 複数メッセージの順序保持  | メッセージが順序通り表示される |
| TC-B-004 | abort呼び出し             | 実行が中断される               |
| TC-B-005 | エラーメッセージ受信      | エラーが正しく表示される       |
| TC-B-006 | 完了メッセージ受信        | 完了状態になる                 |
| TC-B-007 | リスナー解除              | メモリリークなし               |

### 検証手順

1. 自動テストを実行（`pnpm --filter @repo/desktop test`）
2. 手動でスキル実行を確認（ストリーミング表示）
3. 中断ボタンの動作確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                  |
| ------------------------------ | ------ | -------- | ------------------------------------- |
| 高頻度メッセージのUI更新遅延   | 中     | 中       | バッチ更新、requestAnimationFrame使用 |
| メモリリーク（リスナー未解除） | 高     | 中       | useEffectクリーンアップを確実に実装   |
| IPC通信エラー                  | 中     | 低       | エラーハンドリング、リトライロジック  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-3-1-A-sdk-query/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`

### 参考資料

- SkillExecutor実装: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- SkillExecutorテスト: `apps/desktop/src/main/services/skill/__tests__/`

---

## 9. 備考

### 関連タスク

| タスクID                  | 関係性 |
| ------------------------- | ------ |
| TASK-3-1-A                | 依存   |
| TASK-SKILL-EXEC-LOGIC     | 関連   |
| TASK-SKILL-EXEC-STREAMING | 関連   |

### 補足事項

- TASK-3-1-AのSkillExecutorは`skill:stream` IPCチャンネルで送信済み
- Renderer側の受信実装が本タスクの主な作業
