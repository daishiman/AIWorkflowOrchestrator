# Phase 2: 設計

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase番号  | 2                             |
| Phase名    | 設計                          |
| 目的       | アーキテクチャ・詳細設計      |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |

---

## 目的

Agent SDK統合のアーキテクチャ設計を行う。

---

## 使用スキル

| スキル名                      | パス                                                    | 選定理由                                                 |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| architectural-patterns        | `.claude/skills/architectural-patterns/SKILL.md`        | アーキテクチャ設計（Trigger: アーキテクチャ設計）        |
| clean-architecture-principles | `.claude/skills/clean-architecture-principles/SKILL.md` | クリーンアーキテクチャ原則（Anchor: Clean Architecture） |
| electron-ipc-patterns         | `.claude/skills/electron-ipc-patterns/SKILL.md`         | Electron IPC通信パターン（Trigger: IPC通信）             |
| api-contract-design           | `.claude/skills/api-contract-design/SKILL.md`           | API契約設計（Trigger: API設計）                          |
| claude-agent-sdk              | `.claude/skills/claude-agent-sdk/SKILL.md`              | Agent SDK統合パターン（Phase 0で作成）                   |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物               | 説明                     | 配置先                                 |
| -------------------- | ------------------------ | -------------------------------------- |
| コンポーネント設計書 | モジュール構成・責務定義 | `outputs/phase-2/component-design.md`  |
| API設計書            | IPC通信API仕様           | `outputs/phase-2/api-design.md`        |
| シーケンス図         | スキル呼び出しフロー     | `outputs/phase-2/sequence-diagrams.md` |
| 型定義設計           | TypeScript型定義         | `outputs/phase-2/type-definitions.md`  |

---

## 実行手順

### Step 1: アーキテクチャ設計

architectural-patternsとclean-architecture-principlesスキルを使用して、全体アーキテクチャを設計する。

**設計対象**:

```
packages/shared/src/agent/
├── agent-client.ts          # Agent SDK統合クライアント
├── session-manager.ts       # セッション管理
├── types.ts                 # 共通型定義
└── errors.ts                # エラー定義

apps/desktop/src/main/agent/
├── agent-handler.ts         # IPCハンドラー
└── agent-initializer.ts     # 初期化処理

apps/desktop/src/preload/
└── agent-api.ts             # プリロードAPI
```

### Step 2: IPC通信設計

electron-ipc-patternsスキルを使用して、IPC通信を設計する。

**IPC通信パターン**:

```typescript
// メインプロセス (main/agent/agent-handler.ts)
ipcMain.handle("agent:query", async (event, prompt, options) => {
  const result = await agentClient.query(prompt, options);
  return result;
});

// プリロードスクリプト (preload/agent-api.ts)
contextBridge.exposeInMainWorld("agentAPI", {
  query: (prompt, options) =>
    ipcRenderer.invoke("agent:query", prompt, options),
});
```

### Step 3: API契約設計

api-contract-designスキルを使用して、API契約を定義する。

**API契約**:

| API名         | 入力                                  | 出力        |
| ------------- | ------------------------------------- | ----------- |
| agent:query   | prompt: string, options: QueryOptions | QueryResult |
| agent:session | action: 'create' \| 'resume'          | SessionInfo |

---

## 完了条件

- [ ] Agent SDK統合モジュールの設計が完了
- [ ] IPC通信のハンドラー設計が完了
- [ ] 型定義が明確化されている
- [ ] シーケンス図が作成されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

統合ポイント/契約（API・スキーマ）を設計に反映すること:

- [ ] Agent SDK API契約
- [ ] IPC通信インターフェース契約
- [ ] エラーレスポンススキーマ

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容                  |
| ---------------- | ----------------------------------------------------------------------- | --------------------- |
| architecture-rag | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | RAGアーキテクチャ設計 |
| api-endpoints    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`    | APIエンドポイント仕様 |

---

## スキルフィードバック記録

| スキル                        | 結果    | 備考              |
| ----------------------------- | ------- | ----------------- |
| architectural-patterns        | pending | Phase完了後に記録 |
| clean-architecture-principles | pending | Phase完了後に記録 |
| electron-ipc-patterns         | pending | Phase完了後に記録 |
| api-contract-design           | pending | Phase完了後に記録 |
| claude-agent-sdk              | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. architectural-patternsスキルの実行
3. clean-architecture-principlesスキルの実行
4. electron-ipc-patternsスキルの実行
5. api-contract-designスキルの実行
6. claude-agent-sdkスキルの実行
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 2
```

---

## 次のPhase

Phase 3: 設計レビューゲート

---

## 備考

- shared packageの設計はElectronに依存しない形で行う
- セキュリティ（API Key露出防止）を設計段階で考慮する
