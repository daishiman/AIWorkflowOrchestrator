# TASK-3-2: SkillExecutor IPC Handler統合

## メタ情報

```yaml
task_id: TASK-3-2
task_name: SkillExecutor IPC Handler統合
category: 機能追加
target_feature: SkillExecutor → IPC → Renderer Process連携
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-3-1-A（SDK query()基本実装）完了時
created_date: 2026-01-25
dependencies: [TASK-3-1-A]
github_issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/496
spec_path: docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/
```

| 項目         | 内容   |
| ------------ | ------ |
| 優先度       | 高     |
| 規模         | 中規模 |
| ステータス   | 未実施 |
| GitHub Issue | #496   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-AでSkillExecutorクラス（SDK query() API基本実装）が完了した。SkillExecutorは`skill:stream` IPCチャンネル経由でRenderer Processへストリーミングメッセージを送信する機能を持つが、Renderer Process側のIPC Handlerおよび受信ロジックは未実装。

### 1.2 問題点・課題

現在の状態:

| コンポーネント   | 状態                                             |
| ---------------- | ------------------------------------------------ |
| Main Process     | SkillExecutor実装済み（`skill:stream`送信可能）  |
| Preload API      | `skillAPI.onStream()`未実装                      |
| Renderer Process | ストリーミングメッセージ受信・表示ロジック未実装 |

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

| 項目                 | 詳細                    |
| -------------------- | ----------------------- |
| Preload API拡張      | `skillAPI.onStream`追加 |
| IPC Handler登録      | `skill:stream`リスナー  |
| AgentView統合        | ストリーミング表示      |
| 中断UI               | Abortボタン             |
| エラーハンドリングUI | エラー表示              |

#### 含まないもの

| 項目                  | 理由                   |
| --------------------- | ---------------------- |
| SkillExecutor本体変更 | TASK-3-1-Aで完了済み   |
| スキル選択UI          | 既存機能               |
| スキル一覧取得        | SkillScannerで完了済み |

### 2.4 成果物

| 成果物             | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| Preload API拡張    | `apps/desktop/src/preload/skill-api.ts`（新規または更新）               |
| ストリーミング表示 | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| React Hook         | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  |
| 単体テスト         | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                  |
| 統合テスト         | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 前提                                        | ステータス |
| ------------------------------------------- | ---------- |
| TASK-3-1-A（SkillExecutor SDK query()実装） | 完了       |
| SkillScannerが動作していること              | 完了       |

### 3.2 依存タスク

| タスクID     | タスク名             | ステータス |
| ------------ | -------------------- | ---------- |
| TASK-3-1-A   | SDK query() 基本実装 | 完了       |
| SkillScanner | スキルスキャン機能   | 完了       |

### 3.3 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               SkillStreamDisplay.tsx                     │ │
│  │               useSkillExecution.ts                       │ │
│  │                       ↑                                  │ │
│  │              skillAPI.onStream(callback)                 │ │
│  └──────────────────────┬──────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │ IPC (skill:stream)
┌─────────────────────────┼───────────────────────────────────┐
│                   Main Process                               │
│  ┌──────────────────────┴──────────────────────────────────┐ │
│  │                  SkillExecutor                           │ │
│  │   - execute()                                            │ │
│  │   - sendStream()  → webContents.send("skill:stream")     │ │
│  │   - abort()                                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 推奨実装アプローチ

#### Preload API設計

```typescript
// apps/desktop/src/preload/skill-api.ts
import { ipcRenderer, IpcRendererEvent } from "electron";
import type { SkillStreamMessage, SkillExecutionRequest } from "@repo/shared";

export const skillAPI = {
  // 既存（skill:execute）
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

#### React Hook設計

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

## 4. Phase構成

本タスクは13フェーズ構成で実行する。

| Phase | 名称                 | 概要                                 |
| ----- | -------------------- | ------------------------------------ |
| 1     | 要件定義             | IPC統合の詳細要件定義                |
| 2     | 設計                 | Preload API・UI連携設計              |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証               |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）       |
| 5     | 実装                 | TDD: Green（テストを通す実装）       |
| 6     | テスト拡充           | カバレッジ目標達成に向けた追加テスト |
| 7     | テストカバレッジ確認 | カバレッジ目標検証・統合テスト実行   |
| 8     | リファクタリング     | TDD: Refactor（品質改善）            |
| 9     | 品質保証             | 静的解析・セキュリティ・性能         |
| 10    | 最終レビューゲート   | 全体品質・整合性検証                 |
| 11    | 手動テスト検証       | UX・実環境動作確認                   |
| 12    | ドキュメント更新     | 実装ガイド・仕様書更新               |
| 13    | PR作成               | コミット・PR・CI確認                 |

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

- [ ] 実装ガイドが作成されている
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

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                            | 内容                 |
| -------------------- | ------------------------------------------------------------------------------- | -------------------- |
| Agent SDK仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | IPC・型定義・API仕様 |
| セキュリティ実装     | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | セキュリティ要件     |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | UI設計ガイドライン   |

### 関連ドキュメント

| ドキュメント         | パス                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| TASK-3-1-A実装ガイド | `docs/30-workflows/completed-tasks/TASK-3-1-A-sdk-query/outputs/phase-12/implementation-guide.md` |
| SkillExecutor実装    | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                           |
| SkillExecutorテスト  | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`                            |

---

## 9. 備考

### 関連タスク

| タスクID   | 関係性   | 備考                          |
| ---------- | -------- | ----------------------------- |
| TASK-3-1-A | 依存     | SkillExecutor基本実装（完了） |
| TASK-3-1-B | 別タスク | Hooks実装（別タスク仕様書）   |
| TASK-3-1-C | 後続     | PermissionRequest実装         |

### タスクID重複に関する注意

GitHub Issue #496では元々「TASK-3-1-B」として定義されていたが、既存の`task-3-1-b-hooks.md`（Hooks実装）と内容が異なるため、本タスク仕様書では**TASK-3-2**として新規IDを割り当てた。

---

## 変更履歴

| Version | Date       | Changes                           |
| ------- | ---------- | --------------------------------- |
| 1.0.0   | 2026-01-25 | 初版作成（GitHub Issue #496より） |
