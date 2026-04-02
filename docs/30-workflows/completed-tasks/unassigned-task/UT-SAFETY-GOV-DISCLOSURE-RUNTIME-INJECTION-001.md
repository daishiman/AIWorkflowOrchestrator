# UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001: disclosure 情報を runtime から注入

## メタ情報

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| ステータス | 完了                                                                      |
| 優先度     | 高                                                                        |
| 起票日     | 2026-03-31                                                                |
| 起票元     | safety-gov-production-integration Phase 12 / unassigned-task-detection.md |
| 関連タスク | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001                              |
| Issue番号  | #1804                                                                     |

## 1. なぜこのタスクが必要か（Why）

現在の `getDisclosureInfo()` は `anthropic` / `claude-sonnet` / `[]` の固定値を返す
placeholder 実装であり、ExecutionConsole の disclosure 表示が実際の設定と一致しない。

`safety-gov-production-integration` では IPC チャンネルの配線は完了しているが、
情報源が実際の runtime state に接続されていない。
ユーザーが画面で確認できる「使用中の AI プロバイダー情報」が常に静的なため、
信頼性の観点から production 品質と見なせない状態にある。

## 2. 何を達成するか（What）

`getDisclosureInfo()` の placeholder 実装を廃止し、
実際の LLM 設定または runtime state から provider / model / destination 情報を注入する。

### 受入基準

- 実際の LLM 設定または runtime state から disclosure 情報を取得する
- API key や token を返さない（セキュリティ要件）
- provider 未設定時の degrade 動作が定義されている
- 単体テストで動的取得が検証されている

### 影響ファイル（予定）

| ファイル                                          | 変更内容               |
| ------------------------------------------------- | ---------------------- |
| `apps/desktop/src/main/ipc/index.ts`              | disclosureInfo DI 接続 |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts` | placeholder 除去・実装 |

## 3. どのように実行するか（How）

1. LLM 設定を保持している store / service を特定する
   - `apps/desktop/src/main/` 配下の LLM config 管理箇所を調査
2. `getDisclosureInfo()` を DI パターンで runtime state に接続する
   ```typescript
   // 例: LLM config store から取得
   const info: DisclosureInfo = {
     provider: llmConfig.provider ?? "unknown",
     model: llmConfig.model ?? "unknown",
     destinations: llmConfig.destinations ?? [],
   };
   ```
3. API key / token を除外するフィルタリングを追加する
4. provider 未設定時の fallback 値を定義する
5. 単体テストで動的取得を検証する

## 4. 苦戦箇所の記録（safety-gov-production-integration より）

### UI payload と実データ接続の分岐不明確

- **問題**: 型定義・IPC・preload API を実装した時点で「disclosure 実装済み」に見えるが、
  実際は static metadata を返す placeholder のまま
- **解決方法（未解決）**: LLM config store との DI 接続を実装する
- **教訓**: Phase 12 チェックで「定義」「接続」「実データ取得」を別の達成基準として区別すべき
