# Phase 2: 検証マトリクス - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001     |
| タスク種別   | design（設計タスク）                           |
| 作成日       | 2026-03-21                                     |
| ステータス   | Phase 2 完了                                   |
| 後続フェーズ | Phase 3（設計レビュー）→ Phase 4（テスト作成） |

---

## 1. Phase 3 レビュー観点

Phase 3（設計レビュー）にて以下の観点で設計の妥当性を確認する。各 AC に対して drift しやすいポイントと確認コマンドを定義する。

### AC-1: surface-local 判定禁止の ownership table

| 確認項目                                                          | drift しやすいポイント                                                                   | 確認方法                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Ownership Table に 4 カテゴリが網羅されているか                   | 「authMode の参照権限」カテゴリが「表示目的 = OK」という理由で禁止事項が曖昧になりやすい | contract-matrix.md § 1 の全 4 行を確認                    |
| Renderer が禁止層として明記されているカテゴリが最低 3 つあるか    | handoff bundle の構築を「Renderer が HandoffGuidance をアセンブルする」と誤解するケース  | contract-matrix.md § 1-1 / 1-2 / 1-3 の「禁止層」行を確認 |
| 各行に「所有層」「入力」「出力型」「禁止事項」の全 4 項目があるか | 「禁止事項」列が「禁止」の 1 単語だけで具体的な違反パターンが記載されていないケース      | contract-matrix.md § 1 の全テーブルを目視確認             |

### AC-2: health route の primary 確定と legacy 残置条件

| 確認項目                                                                 | drift しやすいポイント                                                                    | 確認方法                                                         |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `llm:check-health` が primary として明記されているか                     | 「どちらも使える」という記述が混入して primary / legacy の区別が曖昧になるケース          | contract-matrix.md § 3 のテーブルを確認                          |
| `AI_CHECK_CONNECTION` の legacy 残置条件に廃止トリガーが明記されているか | 廃止条件が「将来的に削除」という曖昧表現にとどまり、grep コマンドが記載されていないケース | contract-matrix.md § 3 の「legacy route の残置条件詳細」テーブル |
| 「新規コードでの使用禁止」が明示されているか                             | 「legacy だが使ってよい」と誤解して新規コードが参照するケース                             | contract-matrix.md § 3 の「新規利用」列が「禁止」になっているか  |

### AC-3: RuntimePolicy / HandoffGuidance / Health DTO の責務境界

| 確認項目                                                        | drift しやすいポイント                                                                       | 確認方法                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 3 型の所有層（packages/shared / Main 内部）が図示されているか   | `TerminalHandoffBundle` が packages/shared に置かれていると誤解するケース                    | design-summary.md § 2-2「型の所有層マッピング」を確認                     |
| IPC 境界（Main ↔ Renderer）の通過可否が型ごとに定義されているか | `RuntimeDecision` の `apiKey` フィールドが Renderer に届いてしまうケース（DD-2 の抜け）      | contract-matrix.md § 2 の「IPC 通過可否」列を確認                         |
| 必須フィールドが型定義ファイルと整合しているか                  | `HealthCheckResult.checkedAt` の型（number / Date / ISO string）が型定義と不一致になるケース | `packages/shared/src/types/` の実ファイルと contract-matrix.md § 2 を照合 |

### AC-4: policy consumption contract の完成

| 確認項目                                                        | drift しやすいポイント                                                                      | 確認方法                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 4 原則が全て記載されているか                                    | 原則 3（handoff は `buildForSurface` 経由のみ）が「既存メソッドも使える」と曖昧になるケース | contract-matrix.md § 4 の原則 1-4 を確認                                |
| Step 03-09 実装者への警告コメントが含まれているか               | 「この型を変更すると全 surface に影響する」旨の記述が省略されるケース                       | contract-matrix.md § 2 の「警告」ブロックを確認                         |
| 型が `packages/shared` から import されることが明示されているか | Renderer が `apps/desktop/src/main/` から直接 import するケース                             | contract-matrix.md § 4 原則 4 の「import パターン」コードブロックを確認 |

---

## 2. Phase 4-7 テスト検証マトリクス

設計タスクのため Phase 4（テスト作成）以降で対応するテストの観点を予め定義する。

### Unit テスト観点

| テスト対象                                 | テストケース概要                                                                                  | 対応 FR/AC  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------- |
| `IRuntimePolicyResolver.resolve()`         | `authMode="api-key"` + 有効 apiKey → `integrated_api` を返すこと                                  | FR-1, FR-2  |
|                                            | `authMode="subscription"` → `terminal_handoff` を返すこと                                         | FR-1, FR-2  |
|                                            | `apiKey=""` → `terminal_handoff` を返すこと（P42 準拠の trim チェック）                           | FR-1, FR-2  |
|                                            | `apiKey=" "` → `terminal_handoff` を返すこと（スペースのみの入力）                                | FR-1, FR-2  |
|                                            | `integrated_api` の場合 `apiKey` フィールドが IPC 向け型から除外されること（DD-2）                | FR-1, NFR-2 |
| `TerminalHandoffBuilder.buildForSurface()` | `surfaceType="agent"` → `contextSummary` に `surface=agent` が含まれること                        | FR-6, AC-1  |
|                                            | `surfaceType="skill"` → `contextSummary` に `surface=skill` が含まれること                        | FR-6, AC-1  |
|                                            | 存在しない `surfaceType` を渡した場合にエラーが返ること                                           | FR-6        |
|                                            | `HandoffGuidance` の必須フィールド（terminalCommand / contextSummary / reason）が全て含まれること | FR-6, AC-3  |
| health route 選択                          | `llm:check-health` ハンドラーが `HealthCheckResult` 型を返すこと                                  | FR-3, AC-2  |
|                                            | `HealthCheckResult` に `checkedAt`（timestamp）が含まれること                                     | FR-7        |
|                                            | `AI_CHECK_CONNECTION` ハンドラーが `{ status: "disconnected" }` を返すこと（legacy 動作確認）     | FR-3        |

### Integration テスト観点

| テスト対象                             | テストケース概要                                                                          | 対応 FR/AC  |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| IPC ハンドラー + RuntimePolicyResolver | AI Chat ハンドラーが `IRuntimePolicyResolver.resolve()` を呼び出していること              | FR-1, AC-4  |
|                                        | Agent ハンドラーが `IRuntimePolicyResolver.resolve()` を呼び出していること                | FR-1, AC-4  |
|                                        | Skill ハンドラーが `IRuntimePolicyResolver.resolve()` を呼び出していること                | FR-1, AC-4  |
|                                        | `RuntimeDecision.type === "terminal_handoff"` の場合に `buildForSurface()` が呼ばれること | FR-1, FR-6  |
| IPC ハンドラーレスポンス               | `integrated_api` の IPC レスポンスに `apiKey` フィールドが含まれないこと（DD-2 検証）     | NFR-2, AC-3 |
|                                        | `terminal_handoff` の IPC レスポンスに `HandoffGuidance` が含まれること                   | FR-6, AC-3  |
|                                        | `terminal_handoff` の IPC レスポンスに `TerminalHandoffBundle` が含まれないこと           | NFR-2, AC-3 |

### Manual テスト観点（Phase 11 前倒し確認）

| テスト対象                                          | 確認内容                                                                                | 対応 AC |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- | ------- |
| `AI_CHECK_CONNECTION` の呼び出し元ゼロ確認          | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が 0 件であること     | AC-2    |
| `RuntimeResolver` の呼び出し元ゼロ確認（移行後）    | `grep -rn "RuntimeResolver" apps/desktop/src/` の結果が 0 件であること（deprecated 後） | AC-1    |
| `TerminalHandoffBundle` の Renderer import なし確認 | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/` の結果が 0 件であること   | AC-3    |
| `RuntimeResolution` の Renderer import なし確認     | `grep -rn "RuntimeResolution" apps/desktop/src/renderer/` の結果が 0 件であること       | AC-3    |

---

## 3. Phase 10 最終レビューの確認事項

全 AC との照合チェックリスト。Phase 10 レビュアーは以下を逐次確認する。

### AC-1 チェックリスト

- [ ] ownership table に 4 カテゴリ（runtime 実行可否 / health check / handoff bundle / authMode）が全て記載されていること
- [ ] 各カテゴリに「所有層」「入力」「出力型」「禁止層」「禁止事項」が明記されていること
- [ ] Renderer が禁止層として明記されているカテゴリが最低 3 つあること
- [ ] 禁止事項が「禁止」1 単語ではなく具体的な違反パターンで記載されていること
- [ ] `createFallbackStatus` による Renderer 側状態生成が禁止事項に含まれていること

### AC-2 チェックリスト

- [ ] `llm:check-health` が primary route として ownership table に明記されていること
- [ ] `AI_CHECK_CONNECTION` が legacy route として明記されていること
- [ ] legacy route に「新規コードでの使用禁止」が明記されていること
- [ ] 廃止トリガー条件が grep コマンド等の検証可能な形式で記載されていること
- [ ] 廃止手続き（cleanup タスク作成）の記述があること

### AC-3 チェックリスト

- [ ] `RuntimeDecision` / `HandoffGuidance` / `HealthCheckResult` の所有層が図示されていること
- [ ] `TerminalHandoffBundle` / `RuntimeResolution` が Main 内部型として分類されていること
- [ ] IPC 境界の通過可否が型ごとに定義されていること
- [ ] `RuntimeDecision.integrated_api.apiKey` の IPC 除外ルール（DD-2）が明記されていること
- [ ] 各型の必須フィールドが型定義ファイルと整合していること（実コードとの照合）

### AC-4 チェックリスト

- [ ] policy consumption contract の 4 原則（runtime 判定 / health check / handoff / 型 import）が全て記載されていること
- [ ] 各原則に「禁止」と「必須」が明示されていること
- [ ] 「この型を変更すると Step 03-09 全 surface に影響する」旨の警告が含まれていること
- [ ] 4 原則に対応する TypeScript コードスニペットが含まれていること
- [ ] `packages/shared` からの import が必須であることが記載されていること

### 全般チェックリスト

- [ ] design-summary.md / contract-matrix.md / validation-matrix.md の 3 ファイルが揃っていること
- [ ] 設計判断 DD-1〜DD-6 が全て記録されていること
- [ ] Simpler Alternative（案 A / B / C）の比較と不採用理由が記載されていること
- [ ] Phase 3 レビュー観点が明記されていること
- [ ] drift しやすいポイントが各 AC に対して記載されていること

---

## 4. Phase 11 手動テスト対象

設計タスクのため Phase 11 は主に「設計成果物の実装への反映確認」を行う。

### シナリオ 1: AI Chat の runtime 判定確認

**目的**: AI Chat ハンドラーが `RuntimePolicyResolver` を経由して runtime を判定することを確認する。

**前提条件**: Task03（AI Chat surface）の実装完了後に実施。

| ステップ                                 | 確認ポイント                                                           | 期待結果                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| API Key モードで AI Chat を実行する      | Main Process ログに `RuntimePolicyResolver.resolve()` の呼び出しを確認 | `integrated_api` が返されること                              |
| IPC レスポンスを DevTools で確認する     | `Network` タブの IPC レスポンスに `apiKey` フィールドがないこと        | `{ type: "integrated_api" }` のみが Renderer に届くこと      |
| Subscription モードで AI Chat を実行する | Main Process ログに `terminal_handoff` が返されることを確認            | Handoff 画面が表示されること                                 |
| Handoff 画面に表示される情報を確認する   | `HandoffGuidance` の 3 フィールドが全て表示されていること              | `terminalCommand` / `contextSummary` / `reason` が表示される |

### シナリオ 2: health check の primary route 確認

**目的**: `llm:check-health` が primary route として機能していることを確認する。

**前提条件**: LLM 設定が有効であること。

| ステップ                                       | 確認ポイント                                              | 期待結果                                          |
| ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| 設定画面でプロバイダーを選択して接続確認を行う | `llm:check-health` IPC チャンネルが呼ばれていること       | `HealthCheckResult` が返されること                |
| DevTools の Network タブで IPC 通信を確認する  | `AI_CHECK_CONNECTION` が呼ばれていないこと                | `AI_CHECK_CONNECTION` の呼び出しが 0 件であること |
| 無効な API Key を設定して接続確認を行う        | `HealthCheckResult.status === "unhealthy"` が返されること | エラーメッセージが UI に表示されること            |
| `HealthCheckResult.checkedAt` の値を確認する   | 現在時刻と近い timestamp であること                       | Unix timestamp（ミリ秒または秒）で現在時刻に対応  |

### シナリオ 3: surface-local 判定の禁止確認

**目的**: Renderer が `authMode` を参照して runtime を独自に判定していないことを確認する。

**前提条件**: DevTools が使用可能であること。

| ステップ                                               | 確認ポイント                                                                            | 期待結果                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| DevTools Console で `window.__store__.authMode` を確認 | Renderer Store の authMode に `apiKey` の生値が含まれていないこと                       | authMode の文字列（`"api-key"` / `"subscription"`）のみ        |
| authMode を変更して各 surface の動作を確認する         | Renderer 側のコードに `authMode === "subscription"` の分岐がないこと                    | 実行可否が Main Process の判定結果（IPC レスポンス）のみに依存 |
| grep による静的確認（Task03-09 実装後）                | `grep -rn "authMode.*=.*subscription\|authMode.*=.*api-key" apps/desktop/src/renderer/` | 0 件であること                                                 |

### シナリオ 4: HandoffGuidance の IPC 形式確認

**目的**: `TerminalHandoffBundle` が Renderer に送信されていないことを確認する。

**前提条件**: Task04（Agent surface）または Task05（Skill surface）の実装完了後に実施。

| ステップ                                                  | 確認ポイント                                                         | 期待結果                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| Subscription モードで Agent を実行する                    | IPC レスポンスに `HandoffGuidance` のフィールドが含まれること        | `terminalCommand` / `contextSummary` / `reason` が返る |
| IPC レスポンスに `TerminalHandoffBundle` がないことを確認 | `launcher` / `promptBundle` / `manualRetryRule` フィールドがないこと | 上記フィールドが DevTools で確認できないこと           |
| Agent と Skill で `contextSummary` の内容を比較する       | `surface=agent` / `surface=skill` の識別子が含まれていること         | 各 surface で異なる `contextSummary` が返ること        |
