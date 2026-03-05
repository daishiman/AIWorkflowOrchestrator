# Phase 4 テスト仕様

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 4                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 1. テスト方針

Phase 5で導入する Store baseline 実装（型 + 台帳 + 境界マトリクス + 規約定義）を対象に、以下3分類で検証する。

- Unit: データ構造の妥当性（型・列定義・判定種別）
- Integration: `store/index.ts` との整合（persist/selector/export）
- Regression: P31再発防止（合成Hook非推奨・命名規約）

## 2. テスト対象

| 区分        | 対象ファイル                                                 | 目的                       |
| ----------- | ------------------------------------------------------------ | -------------------------- |
| Unit        | `store/sliceBaseline.ts`                                     | 台帳/境界/規約定義の妥当性 |
| Integration | `store/index.ts`, `store/types.ts`, `store/sliceBaseline.ts` | export整合と persist整合   |
| Regression  | `store/index.ts`, `store/sliceBaseline.ts`                   | P31対策の後退防止          |

## 3. 重点検証項目

| ID    | 観点         | 期待値                                                           |
| ----- | ------------ | ---------------------------------------------------------------- |
| TS-01 | 境界判定値   | `new/extend/no-change/local-useState` のみ                       |
| TS-02 | 必須ドメイン | Notification/HistorySearch/SkillCenter/ViewType が全件存在       |
| TS-03 | Slice行数    | 16行以上（15 Slice + chatEditSlice）                             |
| TS-04 | 永続化整合   | baselineの persisted keys が `partialize` と一致                 |
| TS-05 | 規約整合     | 合成Hookは非推奨リストに存在し、個別セレクタ利用方針が保持される |

## 4. 失敗時ログ方針

- 失敗ケースは `expected` / `actual` / `domain or sliceName` を必ず出力する。
- 判定種別の失敗時は「不正値」「許容値一覧」を同時表示する。
- 永続化整合の失敗時は不足キー/過剰キーを分離表示する。

## 5. 統合テスト連携

| 接続要件カテゴリ | テスト観点                                |
| ---------------- | ----------------------------------------- |
| API接続          | IPC追加なしの前提を破る定義がないこと     |
| 認証フロー       | Auth関連Slice境界が変更されていないこと   |
| データフロー     | Store境界が一方向依存で定義されていること |
