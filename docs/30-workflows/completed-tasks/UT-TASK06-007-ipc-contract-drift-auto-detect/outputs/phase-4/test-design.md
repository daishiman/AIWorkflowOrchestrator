# Phase 4 テスト設計書: IPC契約ドリフト自動検出スクリプト

## タスクID: UT-TASK06-007

## 作成日: 2026-03-18

## テストファイル

`apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`

## exit code 仕様（P60対策: 事前合意）

| 条件                   | exit code | stdout 出力                             |
| ---------------------- | --------- | --------------------------------------- |
| 全チャンネル整合       | 0         | `ALL CHECKS PASSED` を含む              |
| ドリフト検出あり       | 1         | DriftReport（Markdown or JSON）を出力   |
| `--report-only` 指定時 | 0         | DriftReport を出力するが exit code は 0 |
| スクリプトエラー       | 2         | エラーメッセージを stderr に出力        |

## テストケース一覧

### 1. extractMainHandlers テスト (T-4-1)

| #      | テストケース名                                       | 入力                                             | 期待出力                            | 分類   |
| ------ | ---------------------------------------------------- | ------------------------------------------------ | ----------------------------------- | ------ |
| T-4-1a | ipcMain.handle行から文字列リテラルチャンネル名を抽出 | `ipcMain.handle('skill:import', ...)`            | channel='skill:import'              | 正常系 |
| T-4-1b | IPC_CHANNELS定数参照からチャンネル名を抽出           | `ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, ...)` | channel='IPC_CHANNELS.SKILL_IMPORT' | 正常系 |
| T-4-1c | ipcMain.on行からチャンネル名を抽出                   | `ipcMain.on('system:theme-changed', ...)`        | channel='system:theme-changed'      | 正常系 |
| T-4-1d | 複数ハンドラを含むソースから全件抽出                 | 複数ipcMain.handle                               | 全件HandlerEntry[]                  | 正常系 |
| T-4-1e | ハンドラ0件のファイルは空配列                        | 空ソース                                         | []                                  | 境界値 |

### 2. extractPreloadEntries テスト (T-4-2)

| #      | テストケース名                   | 入力                                               | 期待出力               | 分類   |
| ------ | -------------------------------- | -------------------------------------------------- | ---------------------- | ------ |
| T-4-2a | safeInvoke + primitive引数を抽出 | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` | argPattern='primitive' | 正常系 |
| T-4-2b | safeOn行を抽出                   | `safeOn(IPC_CHANNELS.SYSTEM_THEME, callback)`      | detected               | 正常系 |
| T-4-2c | 文字列リテラルチャンネル名を抽出 | `safeInvoke('skill:import', data)`                 | channel='skill:import' | 正常系 |
| T-4-2d | object引数パターンを抽出         | `safeInvoke(ch, { skillName, dest })`              | argPattern='object'    | 正常系 |
| T-4-2e | エントリ0件は空配列              | 空ソース                                           | []                     | 境界値 |

### 3. R-01: チャンネル孤児検出テスト (T-4-3)

| #      | テストケース名                   | 入力             | 期待出力             | 分類   |
| ------ | -------------------------------- | ---------------- | -------------------- | ------ |
| T-4-3a | Mainのみ存在→main-only孤児       | Main有/Preload無 | orphan(main-only)    | 異常系 |
| T-4-3b | Preloadのみ存在→preload-only孤児 | Main無/Preload有 | orphan(preload-only) | 異常系 |
| T-4-3c | 全チャンネル双方存在→孤児なし    | 両方存在         | orphans: []          | 正常系 |
| T-4-3d | 両側0件→孤児なし                 | 空               | orphans: []          | 境界値 |

### 4. R-02: 引数形式不一致検出テスト (T-4-4)

| #      | テストケース名                                | 入力                           | 期待出力   | 分類   |
| ------ | --------------------------------------------- | ------------------------------ | ---------- | ------ |
| T-4-4a | P44パターン: object vs primitive → R-02 error | Main=object, Preload=primitive | drift R-02 | 異常系 |
| T-4-4b | 引数形式一致→ドリフトなし                     | 両方primitive                  | drifts: [] | 正常系 |
| T-4-4c | unknown同士は不一致としない                   | 両方unknown                    | drifts: [] | 境界値 |

### 5. R-03: ハードコード文字列検出 (T-4-5)

| #      | テストケース名                  | 入力             | 期待出力         | 分類   |
| ------ | ------------------------------- | ---------------- | ---------------- | ------ |
| T-4-5a | 文字列リテラル → R-03 warning   | 'skill:import'   | drift R-03       | 異常系 |
| T-4-5b | IPC_CHANNELS定数のみ → R-03なし | IPC_CHANNELS.XXX | drifts(R-03): [] | 正常系 |

### 6. レポート出力テスト (T-4-6)

| #      | テストケース名                 | 入力                    | 期待出力             | 分類   |
| ------ | ------------------------------ | ----------------------- | -------------------- | ------ |
| T-4-6a | Markdown形式出力               | DriftReport with drifts | Markdownテーブル含む | 正常系 |
| T-4-6b | JSON形式出力                   | DriftReport             | JSON.parse可能       | 正常系 |
| T-4-6c | ドリフトなし→ALL CHECKS PASSED | 空DriftReport           | 含む                 | 正常系 |

### 7. resolveChannelMap テスト (T-4-7)

| #      | テストケース名                | 入力             | 期待出力    | 分類   |
| ------ | ----------------------------- | ---------------- | ----------- | ------ |
| T-4-7a | channels.tsからマッピング構築 | IPC_CHANNELS定義 | Map entries | 正常系 |
| T-4-7b | 空コンテンツ→空Map            | 空文字列         | empty Map   | 境界値 |

### 8. matchAndValidate with channelMap テスト (T-4-8)

| #      | テストケース名                               | 入力             | 期待出力   | 分類   |
| ------ | -------------------------------------------- | ---------------- | ---------- | ------ |
| T-4-8a | channelMap使用でIPC_CHANNELS.XXXが解決される | IPC_CHANNELS参照 | 解決後照合 | 正常系 |
| T-4-8b | 解決後の同一チャンネル照合が正しい           | 同一チャンネル   | matched    | 正常系 |

## モック戦略

| 対象             | モック方法       | 理由                            |
| ---------------- | ---------------- | ------------------------------- |
| ソースコード     | インライン文字列 | 純粋関数テストのため外部I/O不要 |
| process.exitCode | 直接参照         | main()のテストで使用            |

## P対策

- P9: テスト間で状態を共有しない（各テストでインラインデータ使用）
- P40: `cd apps/desktop && pnpm vitest run` で実行
- P60: exit code仕様を事前合意済み（上記テーブル）

## 完了条件チェック

- [x] T-4-1〜T-4-8の全テストケースが設計されている
- [x] P9/P40/P60 対策が適用されている
- [x] P44 パターンがテストケースとして含まれている
- [x] exit code 仕様がテストに反映されている
- [x] 本Phase内の全タスクを100%実行完了
