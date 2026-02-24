# aiworkflow-requirements 抽出レポート

## 対象タスク

- タスクID: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- 目的: task-9 系列と UI 仕様の IPC データフロー型ギャップ（6件）を仕様書レベルで解消する

## 抽出方針

1. `resource-map.md` で関連カテゴリ（API/インターフェース/セキュリティ/実装パターン/エラー処理）を特定
2. 実装に直接関係する仕様ファイルのみを抽出対象に限定
3. Gap ごとに「適用する要件」と「適用先仕様書」をマッピング

## 抽出した必須要件

| 抽出ID | 参照仕様                                  | 抽出した要件                                                              | 適用Gap         | 適用先仕様書                  |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------- | --------------- | ----------------------------- |
| AR-01  | `security-electron-ipc.md`                | IPC 契約変更時は Main/Preload/呼び出し例の3箇所を同時更新する             | Gap 6           | task-020b                     |
| AR-02  | `security-skill-ipc.md`                   | 文字列引数は `typeof` / 空文字 / `trim()` の3段バリデーションを必須化する | Gap 6           | task-020b                     |
| AR-03  | `interfaces-agent-sdk-skill.md`           | `safeInvoke` / `safeOn` のホワイトリスト前提と cleanup パターンを明記する | Gap 5, 6        | task-031b, task-020b          |
| AR-04  | `architecture-implementation-patterns.md` | IPC 戻り値の型変換（Result→UI 変換）を境界で明示する                      | Gap 4           | task-030                      |
| AR-05  | `api-ipc-agent.md`                        | Request/Response 型契約と引数命名の一貫性を維持する                       | Gap 3, 6        | task-030, task-020b           |
| AR-06  | `error-handling.md`                       | 失敗時のエラー種別・UI表示・再試行条件を仕様に記載する                    | Gap 4           | task-030                      |
| AR-07  | `task-workflow.md`                        | MINOR 指摘は未タスク化し、追跡可能な残課題管理に登録する                  | Phase 3, 10, 12 | 本タスクワークフロー全体      |
| AR-08  | `ipc-contract-checklist.md`               | IPC 修正前後の契約整合チェック（P44/P45/P42）を品質ゲートとして適用する   | Gap 5, 6        | task-031b, task-020b          |
| AR-09  | `ipc-type-resolution-guide.md`            | IPC 境界の型変換ルール（引数統一/戻り値2段変換/S13）を仕様に反映する      | Gap 1, 4, 6     | task-022, task-030, task-020b |

## 不足していた点と改善

| 観点     | 修正前                                                    | 改善内容                                                                |
| -------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| 参照元   | pitfalls 中心で、aiworkflow-requirements の正本参照が不足 | Phase 1〜11 へ aiworkflow-requirements の参照を追加                     |
| 具体性   | 抽出結果が文書化されていない                              | 本レポート（AR-01〜AR-07）を追加し、Phase 1 にリンク                    |
| 実在パス | task-9\*.md を aiworkflow-requirements 配下で参照していた | 実際の修正対象 `docs/30-workflows/skill-import-agent-system/...` に修正 |

## 適用完了条件

- [x] aiworkflow-requirements から必要要件を抽出した
- [x] Gap と要件の対応関係を定義した
- [x] ワークフロー仕様書（Phase 1〜11）に参照反映した
- [x] 非実在参照パスを実在パスに修正した
