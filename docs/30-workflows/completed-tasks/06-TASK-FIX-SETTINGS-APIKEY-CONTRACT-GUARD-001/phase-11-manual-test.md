# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 11                                               |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

自動テストではカバーできない UI 操作・視覚的フィードバック・E2E シナリオを手動で検証する。

## 実行タスク

- テストマトリクス実行: MT-01〜MT-07 の全シナリオを手動実行し証跡を記録する
- DevTools 確認: electronAPI 存在確認、console.warn ログ出力、メモリリークチェック
- 証跡管理: スクリーンショット / ログ抜粋を outputs/phase-11/ に保存する

## テストマトリクス

## テストケース

| TC-ID    | 内容                                           |
| -------- | ---------------------------------------------- |
| TC-11-01 | 正常系: providers が表示される                 |
| TC-11-02 | 異常系: providers 非配列で空配列フォールバック |
| TC-11-03 | 異常系: malformed 要素を除外して表示継続       |

## 画面カバレッジマトリクス

| TC-ID    | 証跡                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-settings-apikey-normal.png`             |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-settings-apikey-nonarray-providers.png` |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-settings-apikey-malformed-items.png`    |

### 正常系

| ID    | シナリオ                  | 操作手順                            | 期待結果                                             | 証跡  |
| ----- | ------------------------- | ----------------------------------- | ---------------------------------------------------- | ----- |
| MT-01 | 4 プロバイダー正常表示    | 設定画面 → API キーセクションを開く | OpenAI, Anthropic, Google, Azure の 4 行が表示される | SS-01 |
| MT-02 | 登録/未登録ステータス切替 | API キーを登録 → 一覧を再読込       | ステータスが「未登録」→「登録済み」に変化する        | SS-02 |

### 異常系

| ID    | シナリオ                       | 操作手順                                                       | 期待結果                                          | 証跡  |
| ----- | ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------- | ----- |
| MT-03 | electronAPI undefined          | DevTools で `delete window.electronAPI` → 設定画面再開         | エラーメッセージ表示 + 再試行ボタン               | SS-03 |
| MT-04 | apiKey.list() エラーレスポンス | Main Process でエラーを返すように設定 → 設定画面を開く         | エラーメッセージ + 再試行ボタン、画面は操作可能   | SS-04 |
| MT-05 | providers 非配列               | Main Process で `providers: "invalid"` を返す → 設定画面を開く | 空一覧にフォールバック、console.warn が出力される | SS-05 |

### Edge ケース

| ID    | シナリオ       | 操作手順                                | 期待結果                                     | 証跡  |
| ----- | -------------- | --------------------------------------- | -------------------------------------------- | ----- |
| MT-06 | ネットワーク断 | ネットワークを切断 → API キー検証を実行 | タイムアウト後にエラー表示、再試行で回復可能 | SS-06 |
| MT-07 | 高速連続操作   | 設定画面を素早く開閉を 5 回繰り返す     | メモリリーク・二重リスナーが発生しない       | SS-07 |

## DevTools 確認項目

手動テスト実施時に DevTools で以下を確認する。

| 確認項目                    | コマンド / 操作                           | 期待結果                               |
| --------------------------- | ----------------------------------------- | -------------------------------------- |
| `electronAPI.apiKey` の存在 | `typeof window.electronAPI?.apiKey`       | `"object"`                             |
| `apiKey.list` の存在        | `typeof window.electronAPI?.apiKey?.list` | `"function"`                           |
| 異常時の console.warn ログ  | Console タブを監視                        | `"providers is not iterable"` 等の警告 |
| メモリリーク                | Performance タブ → Heap snapshot 比較     | 開閉前後で大幅な増加なし               |

## 証跡管理

| 証跡 ID | 形式                              | 保存先                                   |
| ------- | --------------------------------- | ---------------------------------------- |
| SS-01   | スクリーンショット                | `outputs/phase-11/screenshots/ss-01.png` |
| SS-02   | スクリーンショット                | `outputs/phase-11/screenshots/ss-02.png` |
| SS-03   | スクリーンショット                | `outputs/phase-11/screenshots/ss-03.png` |
| SS-04   | スクリーンショット                | `outputs/phase-11/screenshots/ss-04.png` |
| SS-05   | スクリーンショット + console ログ | `outputs/phase-11/screenshots/ss-05.png` |
| SS-06   | スクリーンショット                | `outputs/phase-11/screenshots/ss-06.png` |
| SS-07   | Heap snapshot                     | `outputs/phase-11/screenshots/ss-07.png` |

## 実行手順

1. `pnpm --filter @repo/desktop dev` で開発サーバーを起動する
2. MT-01 → MT-02 の正常系シナリオを順次実行する
3. MT-03 → MT-05 の異常系シナリオを実行する（DevTools 操作含む）
4. MT-06 → MT-07 の Edge ケースを実行する
5. 各シナリオの証跡を取得し、結果を手動テスト行列に記録する
6. 発見した不具合は不具合リストに起票する

## 参照資料

| 資料名              | パス                                                                       | 用途                       |
| ------------------- | -------------------------------------------------------------------------- | -------------------------- |
| ui-ux-settings      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`      | 異常系表示仕様（v1.5.0）   |
| ui-ux-design-system | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | Error 色 = red-600/red-500 |
| Phase 2 成果物      | `outputs/phase-2/design-decisions.md`                                      | 期待UXと設計意図の照合     |
| Phase 5 成果物      | `outputs/phase-5/implementation-sequence.md`                               | 実装内容とテスト観点の照合 |
| Phase 6 成果物      | `outputs/phase-6/regression-expansion-plan.md`                             | 回帰観点の確認             |
| Phase 7 成果物      | `outputs/phase-7/coverage-results.md`                                      | カバレッジ結果の照合       |
| Phase 8 成果物      | `outputs/phase-8/refactoring-log.md`                                       | リファクタリング影響の確認 |
| Phase 9 成果物      | `outputs/phase-9/quality-checklist.md`                                     | QA結果の照合               |
| Phase 10 成果物     | `outputs/phase-10/`                                                        | レビュー結果の確認         |

## 成果物

| 成果物         | パス                                     | 説明                              |
| -------------- | ---------------------------------------- | --------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 全シナリオの PASS/FAIL 結果       |
| 証跡一覧       | `outputs/phase-11/screenshots/`          | スクリーンショットと console ログ |
| 不具合リスト   | `outputs/phase-11/bug-list.md`           | 発見された不具合の一覧            |

## 完了条件

- [ ] MT-01〜MT-07 の全シナリオが実行されている
- [ ] 各シナリオに対応する証跡が取得されている
- [ ] DevTools 確認項目が全て検証されている
- [ ] 発見された不具合が不具合リストに記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 12: ドキュメント更新

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
