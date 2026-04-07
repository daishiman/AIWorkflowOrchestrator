# Phase 7 成果物: カバレッジレポート

## カバレッジレポート - UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

### 計測対象（変更ブロックのみ）

#### packages/shared/src/ipc/channels.ts（SKILL_CREATOR_RUNTIME_CHANNELS 追加ブロック）

| メトリクス        | 結果 | 基準値 | 判定 |
| ----------------- | ---- | ------ | ---- |
| Line Coverage     | 100% | 80%+   | PASS |
| Branch Coverage   | N/A  | 60%+   | N/A  |
| Function Coverage | 100% | 80%+   | PASS |

**根拠**: `SKILL_CREATOR_RUNTIME_CHANNELS` の全 3 チャンネルが TC-01〜TC-06 でカバーされており、`IPC_CHANNELS` スプレッドも TC-04〜TC-06 と`IPC_CHANNELS 統合オブジェクト`テストでカバーされている。

#### apps/desktop/src/preload/channels.ts（import 変更ブロック）

| メトリクス        | 結果 | 基準値 | 判定 |
| ----------------- | ---- | ------ | ---- |
| Line Coverage     | 100% | 80%+   | PASS |
| Branch Coverage   | N/A  | 60%+   | N/A  |
| Function Coverage | 100% | 80%+   | PASS |

**根拠**: `SKILL_CREATOR_RUNTIME_CHANNELS` が `IPC_CHANNELS` スプレッドを通じて preload テストと governance-bundle parity テストでカバーされている。

### governance-bundle parity テスト

| メトリクス   | 結果 | 判定 |
| ------------ | ---- | ---- |
| 実行テスト数 | 20   | PASS |
| PASS 数      | 20   | PASS |

### 総合判定: **PASS**

変更ブロックの全行が 3 テストファイル（shared, preload, governance-bundle）によりカバーされている。
