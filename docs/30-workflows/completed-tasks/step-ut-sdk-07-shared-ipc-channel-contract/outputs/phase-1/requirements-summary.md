# Phase 1 要件サマリー -- P50 ドリフト検出結果

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 1. 調査結果: shared / desktop チャネル定義ドリフト

### 1.1 対象ファイル

| レイヤー | ファイルパス                           |
| -------- | -------------------------------------- |
| shared   | `packages/shared/src/ipc/channels.ts`  |
| desktop  | `apps/desktop/src/preload/channels.ts` |

### 1.2 検出されたドリフト (3チャネル)

| #   | チャネルキー                    | 文字列値                          | shared 定義 | desktop 定義    | desktop allowlist                           |
| --- | ------------------------------- | --------------------------------- | ----------- | --------------- | ------------------------------------------- |
| 1   | `APPROVAL_RESPOND`              | `"approval:respond"`              | **欠落**    | L384 に定義済み | `ALLOWED_INVOKE_CHANNELS` に含まれる (L673) |
| 2   | `APPROVAL_REQUEST`              | `"approval:request"`              | **欠落**    | L385 に定義済み | `ALLOWED_ON_CHANNELS` に含まれる (L732)     |
| 3   | `EXECUTION_GET_DISCLOSURE_INFO` | `"execution:get-disclosure-info"` | **欠落**    | L386 に定義済み | `ALLOWED_INVOKE_CHANNELS` に含まれる (L674) |

> 補足: desktop 側には `EXECUTION_GET_TERMINAL_LOG` (`"execution:get-terminal-log"`, L387) と `EXECUTION_GET_COPY_COMMAND` (`"execution:get-copy-command"`, L388) も存在するが、これらはタスクスコープ外の付随チャネルである。本タスクで合わせて shared 側へ追加することも検討可能。

### 1.3 shared 側の既存構造

`packages/shared/src/ipc/channels.ts` は以下のグループ定数を `as const` で定義:

- `CHAT_EXPORT_CHANNELS`
- `FILE_SYSTEM_CHANNELS`
- `SKILL_CHANNELS`
- `NOTIFICATION_CHANNELS`
- `HISTORY_SEARCH_CHANNELS`
- `IPC_CHANNELS` (上記すべてのスプレッド結合)

**`APPROVAL_CHANNELS` および `EXECUTION_CHANNELS` は存在しない。**

### 1.4 影響度

- **契約整合性**: shared を Single Source of Truth とする設計方針に対し、3チャネルが desktop ローカル定義のみで存在しており SSoT 違反
- **テスト信頼性**: cross-layer parity テストが存在しないため、ドリフトが検出されない (false green リスク)
- **後続タスク**: governance bundle テストの観点5 (disclosure separation) が共有定義を前提としている

---

## 2. P50 判定

| 判定基準     | 結果                                         |
| ------------ | -------------------------------------------- |
| ドリフト件数 | 3チャネル                                    |
| 影響範囲     | shared + desktop 2ファイル                   |
| リスクレベル | 中 (機能動作には影響なし、契約整合性の問題)  |
| 修正規模     | 小規模 (定義追加 + import 変更 + テスト追加) |

---

## 3. 命名パターン分析

shared channels.ts のチャネル文字列値には以下の命名パターンが混在している:

| パターン                       | 例                                                                 | 出現グループ                                      |
| ------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------- |
| `namespace:kebab-case`         | `approval:respond`, `skill:get-detail`, `notification:get-history` | NOTIFICATION, HISTORY_SEARCH, APPROVAL, EXECUTION |
| `namespace:camelCase`          | `chat:exportSession`, `fs:writeFile`, `skill:readFile`             | CHAT_EXPORT, FILE_SYSTEM, SKILL                   |
| `namespace:sub:action` (3階層) | `skill:permission:request`                                         | SKILL                                             |

**今回追加する3チャネルは全て `namespace:kebab-case` 形式**。テスト作成時に命名パターンの検証を行う場合、camelCase/kebab-case の両方を許容する正規表現が必要（`/^[a-zA-Z-]+:[a-zA-Z-]+$/` 等）。

---

## 4. チャネル分類（invoke / on）

| チャネル                        | 分類      | 理由                                   |
| ------------------------------- | --------- | -------------------------------------- |
| `APPROVAL_RESPOND`              | invoke    | Renderer → Main への応答送信           |
| `APPROVAL_REQUEST`              | on (push) | Main → Renderer への承認リクエスト通知 |
| `EXECUTION_GET_DISCLOSURE_INFO` | invoke    | Renderer → Main への情報取得           |

→ allowlist テスト設計に反映する。

**結論**: ドリフトが確認された。Phase 2 設計に進む。
