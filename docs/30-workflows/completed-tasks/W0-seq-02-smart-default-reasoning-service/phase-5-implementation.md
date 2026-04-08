# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装を行う。

## 実行タスク

1. サービス本体を `packages/shared/src/services/skillCreator/` に実装する。
2. barrel export を追加して外部利用を可能にする。
3. 最小実装で全テストを Green にする。

## 統合テスト連携

- Phase 6 / 7 へ引き継ぐため、推論ルールとフォールバックの境界を崩さない。
- Phase 9 の lint / typecheck に通る形で実装する。

## 実装計画（新規作成・修正ファイル一覧）

| ファイル                                                                                   | 変更種別 | 内容                                |
| ------------------------------------------------------------------------------------------ | -------- | ----------------------------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規作成 | 推論サービス本体                    |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規作成 | ユニットテスト（Phase 4 定義）      |
| `packages/shared/src/services/skillCreator/index.ts`                                       | 修正     | barrel に inferSmartDefaults を追加 |
| `packages/shared/index.ts`                                                                 | 修正     | root barrel に再 export を追加      |

## 実装仕様

### 推論ロジック

```
1. purpose テキストでツール推論（先勝ちルール: Slack > GitHub > Notion）
2. purpose テキストでタイミング推論（scheduled / realtime）
3. category でフォーマット推論（code-support → code, data-analysis → structured）
4. 各推論の根拠を inferenceLog に追記
5. 未推論フィールドは null（フォールバック）
```

### barrel エクスポート

- `packages/shared/src/services/skillCreator/index.ts` に `inferSmartDefaults` を named export
- `packages/shared/index.ts` に `@repo/shared/types/skillCreator` 経由の再 export を追加

## 検証コマンド

```bash
# テスト Green 確認
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# 型チェック
pnpm --filter @repo/shared typecheck

# lint
pnpm lint
```

## 参照資料

| 資料名             | パス                                    | 用途           |
| ------------------ | --------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| Red テスト結果     | `outputs/phase-4/red-test-result.md`    | Phase 4 成果物 |
| API シグネチャ設計 | `outputs/phase-2/api-design.md`         | Phase 2 成果物 |

## 実行手順

1. Phase 4 のテスト仕様を確認する。
2. `packages/shared/src/services/skillCreator/` ディレクトリを確認・作成する。
3. `smartDefaultReasoningService.ts` を実装する。
4. `index.ts`（barrel）を更新する。
5. `packages/shared/index.ts` を更新する。
6. テストを実行し、全件 Green を確認する。

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装概要・変更点       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルの一覧 |
| 契約 diff        | `outputs/phase-5/contract-diff.md`          | 公開 API の前後差分    |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Phase 4 の全テスト（TC-01〜TC-15）が Green であること
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] barrel export が追加されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
