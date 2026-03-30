# UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001: AdapterStatus リアルタイム更新をポーリングからサブスクリプションへ移行

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| ステータス | 未着手                                        |
| 優先度     | Low                                           |
| 起票日     | 2026-03-29                                    |
| 起票元     | TASK-RT-02-API-KEY-UI-ADAPTER-STATUS Phase 12 |
| 関連タスク | TASK-RT-02 (api-key-ui-adapter-status)        |

## 1. なぜこのタスクが必要か（Why）

TASK-RT-02-API-KEY-UI-ADAPTER-STATUS の実装では、`ApiKeysSection` コンポーネントが `llm.checkHealth` を mount 時にポーリングして LLM アダプターの状態を取得する設計を採用した。これは「新規 IPC チャネルを追加しない」という設計方針（エレガント方針: Settings 局所状態 + 既存 public IPC 再利用）に基づく意識的なトレードオフである。

しかし、この設計ではアダプター状態がバックグラウンドで変化した場合（例: ネットワーク復旧、API キー更新後の自動再認証）に UI が自動更新されず、ユーザーがページを再読み込みしなければ最新状態を確認できない。

## 2. 何を達成するか（What）

Main プロセスから Renderer への IPC push イベント（`llm:adapter-status-changed`）を追加し、`ApiKeysSection` がそのイベントを subscribe してリアルタイムに状態を更新する。これにより、手動リトライ不要でアダプター状態変化が UI に自動反映されるようになる。

## 3. どのように実行するか（How）

1. `packages/shared/src/ipc/channels.ts` に `LLM_CHANNELS` グループを追加し、`llm:adapter-status-changed` チャネルを定義する
2. `apps/desktop/src/main/services/runtime/LLMAdapterFactory.ts`（または `RuntimeSkillCreatorFacade.ts`）でアダプター状態変化時に `BrowserWindow.webContents.send` で push イベントを発火する
3. `apps/desktop/src/preload/skill-creator-api.ts`（または `llm-api.ts`）に `onAdapterStatusChanged` リスナーを追加する
4. `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` で `useEffect` を使って `onAdapterStatusChanged` を subscribe し、ローカル状態を更新する
5. 単体テストで push イベントの受信と UI 更新を確認する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                                                             | 原因                                                                                               | 解決策                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade の private 状態を Settings UI に露出すると責務汚染が起きる | Skill Creator runtime の内部状態（`llmAdapterStatus`）は Settings の public surface とは分離すべき | Settings 側では既存の `apiKey.list` + `llm.checkHealth` の public IPC を再利用し、runtime の内部状態を直接参照しない。TASK-RT-02 で採択した「エレガント方針」を維持する |
| Settings と SkillLifecyclePanel でアダプター状態の取得経路が重複する                 | 主導線（SettingsView）と補助導線（SkillLifecyclePanel）が両方 `llm.checkHealth` を呼ぶ             | 状態の single source of truth を Jotai atom に持ち、両コンポーネントが同一 atom を subscribe する設計に変更する                                                         |
| push イベントの発火タイミングが不明確                                                | `LLMAdapterFactory` がアダプター状態を変更するケースが複数ある（初期化・リトライ・失敗）           | `LLMAdapterStatus` の型定義に基づいて `ready` / `initializing` / `failed` への遷移をすべて検出してイベントを発火する                                                    |

## 4. 実行手順

1. `packages/shared/src/ipc/channels.ts` に `llm:adapter-status-changed` チャネルを追加する
2. Main プロセス側で状態変化時の push 実装を追加する
3. preload に `onAdapterStatusChanged` リスナーを追加する
4. Renderer の `ApiKeysSection` を subscription ベースに変更する
5. Jotai atom（または React context）で複数コンポーネント間の状態共有を実現する
6. テストを更新・追加する

## 5. 完了条件チェックリスト

- [ ] アダプター状態変化時に push イベントが発火される
- [ ] `ApiKeysSection` が手動操作なしでリアルタイム更新される
- [ ] `SkillLifecyclePanel` と `ApiKeysSection` が同一 atom を参照する（重複ポーリング解消）
- [ ] 単体テストで push → UI 更新の経路が確認される

## 6. 検証方法

```bash
# ApiKeysSection のテストが green
pnpm --filter @repo/desktop test:run -- src/renderer/components/organisms/ApiKeysSection

# アダプター状態テストが green
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/
```

## 7. リスクと対策

- リスク: push イベントの発火が頻繁すぎて Renderer がチャタリングする
- 対策: 実装時に `debounce`（300ms 程度）を状態変化検知に追加する
- リスク: Settings UI からの Skill Creator runtime 依存が責務汚染になる
- 対策: IPC チャネルは `LLM_CHANNELS` として独立したグループにし、Skill Creator runtime の internal API を通さず、独立した LLM status service として実装する

## 8. 参照情報

- `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/index.tsx`（TASK-RT-02 で実装）
- `apps/desktop/src/renderer/components/atoms/RetryButton/index.tsx`（TASK-RT-02 で実装）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/ipc/channels.ts`
- `docs/30-workflows/task-rt-02-api-key-ui-adapter-status/index.md`（「エレガント方針」テーブル）

## 9. 備考

本タスクは改善系（Low）。現行のポーリング実装は機能的に正しく、リアルタイム更新は UX 改善として将来対応する。
着手時は「エレガント方針: Settings 局所状態 + 既存 public IPC 再利用」の設計判断を継承しつつ、新規 IPC チャネルの追加を最小限に抑えること。
