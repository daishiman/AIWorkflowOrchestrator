# ApiKeysSection E2E統合テスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1046
```

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | UT-FIX-SETTINGS-APIKEY-E2E-001   |
| タスク名     | ApiKeysSection E2E統合テスト追加 |
| 分類         | テスト改善                       |
| 対象機能     | Settings > ApiKeysSection        |
| 優先度       | 低                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12                         |
| 発見日       | 2026-03-07                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 で Main 側（`apiKeyHandlers` の `Array.isArray` バリデーション）と Renderer 側（`ApiKeysSection` の type predicate フィルタ）の二重防御を実装した。しかし、現状は全て単体テスト（モック使用）で検証しており、実際の Electron IPC 通信経路での連携動作は未検証。

S28（Main ハンドラ間接テストパターン）で `ipcMain.handle` のコールバックを直接テストする手法を確立したが、これはあくまでモック環境での検証であり、contextBridge / structured clone の実動作は含まれない。

### 1.2 問題点・課題

- Main Process の `Array.isArray` バリデーションと Renderer の 5層防御（S27）が実際に連携動作するかを検証できていない
- contextBridge 経由の structured clone で型情報が変化するケース（P48の原因）が、単体テストでは再現不可能
- Electron 実行環境固有の問題（P40: テスト実行ディレクトリ依存）がE2Eレベルで顕在化する可能性がある

### 1.3 放置した場合の影響

- Main 側でバリデーション PASS したレスポンスが Renderer 側で予期せぬ shape になるケースを検出できない
- contextBridge の structured clone による型変換問題がリリース後に初めて発覚するリスクがある
- IPC 契約変更時に、単体テストは PASS するが実環境で動作しないリグレッションが混入する

---

## 2. 何を達成するか（What）

### 2.1 目的

ApiKeysSection の契約防御を E2E で再現し、実環境回帰を検出できる状態にする。

### 2.2 最終ゴール

最低3ケース（正常/非配列/malformed混在）のE2EがCIで安定実行できる。

### 2.3 スコープ

#### 含むもの

- Playwright Electron 統合による E2E テスト追加（3ケース以上）
- テスト用 fixture データ整備
- E2E 実行手順のドキュメント化
- CI パイプラインへの E2E テスト組み込み

#### 含まないもの

- 全設定画面の E2E 網羅（本タスクは ApiKeysSection に限定）
- 既存 unit test の置換（単体テストは維持し、E2E は補完的に追加）
- Playwright Electron 基盤そのものの構築（別途基盤タスクが必要な場合は分離）

---

## 3. どう実装するか（How）

### 3.1 実装方針

1. **Playwright Electron 統合**: `electron.launch()` で実際の Electron アプリを起動し、BrowserWindow 経由でテストを実行する
2. **既存スクリプト流用**: Phase 11 スクリーンショットスクリプト（`capture-task-06-settings-apikey-contract-guard-phase11.mjs`）をベースに、Playwright テストへ移行する
3. **fixture 設計**: 正常/異常レスポンスの fixture を JSON ファイルとして管理し、IPC レスポンスをインジェクトする
4. **flaky 抑制**: `waitForSelector` / `waitForResponse` 等の明示的 wait 条件を使用し、タイミング依存を排除する

### 3.2 修正対象ファイル

| ファイル                                                  | 変更内容                      |
| --------------------------------------------------------- | ----------------------------- |
| `apps/desktop/e2e/settings-apikey.spec.ts`（新規）        | E2E テスト本体（3ケース以上） |
| `apps/desktop/e2e/fixtures/apikey-providers.json`（新規） | 正常/異常レスポンス fixture   |
| `apps/desktop/playwright.config.ts`（新規or既存）         | Playwright Electron 設定      |
| `apps/desktop/package.json`                               | `test:e2e` スクリプト追加     |

### 3.3 実装手順

#### Phase 1: E2E シナリオ設計（Phase 1-3 相当）

1. テスト対象の IPC チャンネルと期待レスポンスを整理
2. GAP-01〜06（`security-electron-ipc.md`）から E2E で検証すべき防御ポイントを抽出
3. テストケース設計書を作成

#### Phase 2: テスト環境構築（Phase 4 相当）

1. Playwright Electron 統合をセットアップ（`@playwright/test` + `electron`）
2. `contextIsolation: true` + `sandbox: true` 環境でのテスト起動を確認
3. Preload スクリプト読み込みと IPC 通信初期化の待機処理を実装

#### Phase 3: テスト実装（Phase 5-6 相当）

1. TC-E2E-01: 正常系ケースを実装
2. TC-E2E-02: 非配列ケースを実装
3. TC-E2E-03: malformed 混在ケースを実装
4. 各テストで `page.screenshot()` による証跡を自動取得

#### Phase 4: CI 統合（Phase 9 相当）

1. `pnpm --filter @repo/desktop test:e2e` スクリプトを整備
2. CI ワークフローに E2E テストステップを追加
3. flaky 検出のためリトライ設定（`retries: 1`）を付与

---

## 4. 受入基準

### 機能要件

- [ ] 最低3ケース（TC-E2E-01〜03）の E2E テストが実装されている
- [ ] 各テストが実際の Electron IPC 通信経路を通じて検証している
- [ ] Main Process のバリデーションと Renderer の 5層防御（S27）が連携動作することを確認できる
- [ ] `page.screenshot()` による自動証跡が各テストケースで取得される

### 品質要件

- [ ] CI で安定実行できる（連続3回以上の PASS）
- [ ] flaky 抑制策が実装されている（明示的 wait 条件、fixture 固定）
- [ ] テスト実行時間が 60秒以内に収まる（3ケース合計）

### ドキュメント要件

- [ ] E2E テスト実行手順が README またはスクリプトコメントに記載されている
- [ ] Phase 11/12 証跡運用への E2E 自動証跡の統合方法が記録されている

---

## 5. テスト計画

### テストケース一覧

| ID        | テストケース     | 入力                                                  | 期待結果                                                     |
| --------- | ---------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| TC-E2E-01 | 正常表示         | providers が正しい `{provider, apiKey, isSet}[]` 配列 | 全プロバイダが設定画面に表示される                           |
| TC-E2E-02 | providers 非配列 | providers が `null` / `undefined` / `"string"`        | エラーなくフォールバック表示（空リストまたはデフォルト表示） |
| TC-E2E-03 | malformed 混在   | 配列内に `{provider: 123}` 等の不正要素が混在         | 有効要素のみ表示、不正要素は除外される                       |

### 検証手順

1. `pnpm --filter @repo/desktop test:e2e` を実行
2. 全テストケースが PASS することを確認
3. `e2e/screenshots/` 配下に各テストのスクリーンショットが生成されることを確認
4. CI 環境で連続3回実行し、flaky がないことを確認

### カバレッジ対象

| 防御ポイント                         | 対応テスト    | 検証内容                                                         |
| ------------------------------------ | ------------- | ---------------------------------------------------------------- |
| GAP-01: Renderer null/undefined 防御 | TC-E2E-02     | IPC レスポンスが null の場合の UI 挙動                           |
| GAP-02: Renderer 非配列防御          | TC-E2E-02     | IPC レスポンスが string の場合の UI 挙動                         |
| GAP-03: Renderer malformed 要素防御  | TC-E2E-03     | 配列内不正要素のフィルタリング                                   |
| GAP-04: Renderer 空配列防御          | TC-E2E-01     | 空配列時のフォールバック表示                                     |
| GAP-05: Main Process バリデーション  | TC-E2E-01〜03 | Main 側 `Array.isArray` が通過したレスポンスの Renderer 到達確認 |

---

## 6. リスク・注意事項

| リスク                                       | 影響度 | 発生確率 | 対策                                                                   |
| -------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| E2E テストの flaky 化                        | 中     | 中       | wait 条件の明確化、fixture 固定、リトライ設定（`retries: 1`）          |
| テスト実行時間の増加                         | 低     | 中       | スモーク3ケースに限定、並列実行の検討                                  |
| Playwright Electron 統合のセットアップ複雑性 | 中     | 高       | `contextIsolation: true` + `sandbox: true` 環境での起動手順を事前検証  |
| CI 環境での Electron 起動失敗                | 中     | 中       | headless モード + xvfb の設定、CI 用 Electron バイナリの事前キャッシュ |
| テスト実行ディレクトリ依存（P40）            | 低     | 中       | `pnpm --filter @repo/desktop` で実行を標準化                           |

---

## 7. 関連タスク・参照資料

### 関連タスク

| タスクID                                    | 関係                   | 内容                         |
| ------------------------------------------- | ---------------------- | ---------------------------- |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | 前提タスク（完了済み） | Main/Renderer 二重防御の実装 |

### 参照資料（実装パターン・仕様書）

| 仕様書                                        | 参照内容                                                |
| --------------------------------------------- | ------------------------------------------------------- |
| `architecture-implementation-patterns.md` S27 | Renderer 境界5層防御パターン                            |
| `architecture-implementation-patterns.md` S28 | Main ハンドラ間接テストパターン                         |
| `security-electron-ipc.md` v1.14.0            | Main/Renderer 双方の防御仕様、GAP-01〜06 テーブル       |
| `ipc-contract-checklist.md` CC-7              | Renderer 側防御チェックリスト（E2E テストで自動検証化） |
| `lessons-learned.md`                          | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の教訓      |
| `task-workflow.md`                            | 残課題テーブル                                          |

### 参照資料（aiworkflow-requirements）

| 仕様書                                       | 参照内容                                                       |
| -------------------------------------------- | -------------------------------------------------------------- |
| `testing-component-patterns.md` セクション15 | IPC レスポンス異常値テストパターン（E2E でも同カテゴリを網羅） |
| `quality-e2e-testing.md`                     | Playwright E2E テスト設計方針                                  |
| `security-electron-ipc.md`                   | GAP-01〜06 テーブル（E2E で検証すべき防御ポイント）            |
| `ipc-contract-checklist.md` CC-7             | Renderer 側防御チェックリスト（E2E テストで自動検証化）        |
| `06-known-pitfalls.md` P40                   | テスト実行ディレクトリ依存（モノレポ）                         |
| `06-known-pitfalls.md` P53                   | CLI 環境でのスクリーンショット取得制約                         |

### 参考資料

- `apps/desktop/scripts/capture-task-06-settings-apikey-contract-guard-phase11.mjs` — Phase 11 スクリーンショットスクリプト（E2Eテストの基盤として流用可能）
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/rules/06-known-pitfalls.md` — P40（テスト実行ディレクトリ依存）, P48, P49

---

## 8. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **単体テストとE2Eの検証範囲ギャップ（P53関連）**: 現在のテスト59件は全てモックベースの単体テスト。Main Process のバリデーション（GAP-05）と Renderer のフィルタ（GAP-01〜04）が連携して動作することは、単体テストでは検証できない。実際の IPC 通信で structured clone が介在した場合にのみ顕在化する不整合がある可能性

2. **CLI環境でのスクリーンショット取得制約（P53）**: Phase 11 で手動テストのスクリーンショットが要求されたが、CLI 環境では Electron アプリの実画面キャプチャができなかった。E2E テスト基盤を整備することで、`page.screenshot()` による自動証跡取得が可能になる

3. **Electron テスト環境のセットアップ複雑性**: Playwright の Electron 統合は `electron.launch()` で BrowserWindow にアクセスする。`contextIsolation: true` + `sandbox: true` 環境でのテストは、通常のWebアプリE2Eと異なり、Preload スクリプトの読み込みとIPC通信の初期化を待つ必要がある

4. **テスト実行ディレクトリ依存（P40）**: モノレポ環境では `cd apps/desktop && pnpm vitest run` でないと happy-dom 設定が読み込まれない。E2E テストでも同様にディレクトリ依存の問題が発生する可能性がある

5. **Main ハンドラの直接テスト困難性（S28）**: `ipcMain.handle` で登録されたコールバックは直接呼び出せない。S28パターン（`ipcMain.handle` をモックし、`mock.calls` からコールバックを取得して直接テスト）で解決したが、E2E テストではこの制約がなくなり、実際のIPC通信を検証できる

6. **Renderer 5層防御の検証限界**: 単体テストではモックされたIPCレスポンスに対する防御を検証できるが、実際の Main Process → Preload → Renderer の通信経路での防御連携は検証できない。E2E テストで初めて「Main側 `Array.isArray` + Renderer側 type predicate」の二重防御が連携動作することを確認できる

### レビュー指摘の原文

```text
UT-3: E2E テストでの設定画面統合テスト — 現在のテストは単体テスト（モック使用）のみ。
実際の Electron 環境での IPC 通信を含む統合テストにより、Main Process のバリデーションと
Renderer のフィルタが連携して動作することを確認できる。
```

### 補足事項

- 優先度低。E2E基盤整備タスクと同時に実施する
- Phase 11 スクリーンショットスクリプトをベースに、Playwright の Electron テストに移行することを推奨
- 最低3ケース（正常/非配列/malformed混在）に限定し、flaky リスクを最小化する
