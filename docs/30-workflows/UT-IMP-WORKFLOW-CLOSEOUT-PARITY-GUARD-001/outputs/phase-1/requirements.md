# Phase 1: 要件定義

> 作成日: 2026-04-19
> 対象: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

## 1. 目的

Phase 12 close-out 時に **`index.md` / root `artifacts.json` / `outputs/artifacts.json` / 各 `phase-N-*.md` frontmatter** の四者（三者＋α）で status が drift する事故を、**機械検証可能な parity guard** として固定する。親タスク UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査で発見された SSOT 崩壊を、手動チェックから validator PASS/FAIL への昇格で恒久防止する。

## 2. 背景

- **発見事象**: `outputs/artifacts.json` が `completed` を主張していても root 側（`index.md` / `artifacts.json`）が `pending` のまま残り、「何が真の完了か」を人が目視で復元せざるを得なかった
- **影響**: close-out 判定の SSOT（Single Source of Truth）が壊れ、後続タスクが依存する完了状態の信用が失われる
- **頻度**: `30-workflows/` baseline で 1 件、`completed-tasks/` で 28 件の drift 実測（Phase 1 Step 0 観測）

## 3. 観測対象（S1〜S4）

| ID  | ソース                   | 格納位置                         | 抽出規則            |
| --- | ------------------------ | -------------------------------- | ------------------- | ---------- | ---------------- | -------------- |
| S1  | `index.md`               | 「Phase一覧」表のステータス列    | 行頭 `              | {N}        | ` から列読み取り |
| S2  | `artifacts.json` (root)  | `phases.{N}.status`              | JSON パース直接取得 |
| S3  | `outputs/artifacts.json` | `phases.{N}.status`              | JSON パース直接取得 |
| S4  | `phase-{N}-*.md` 本文    | メタ情報テーブル「ステータス」行 | `                   | ステータス | {value}          | ` 正規表現抽出 |

## 4. parity ルール

- **同一 Phase N に対し S1 / S2 / S3 / S4 の status は完全一致しなければならない**
- 一致定義: 文字列完全一致（`pending` / `in_progress` / `completed` / `blocked`）
- 例外: S1 の「Phase一覧」表で `-` 表記は「未使用」扱いとし、他ソースが `pending` ならば一致とみなす

## 5. 許可 status 列挙

- `pending` / `in_progress` / `completed` / `blocked`（S2 / S3 / S4 共通）
- S1 のみ追加で `-` を許容（空欄を意味する運用表記）
- 日本語表記（「完了」「進行中」等）は **許容しない**

## 6. エラー分類コード

| コード                 | 説明                                                | exit code |
| ---------------------- | --------------------------------------------------- | --------- |
| `PARITY_OK`            | 全ソース一致                                        | 0         |
| `PARITY_DRIFT`         | 少なくとも 2 ソース間で status 不一致               | 1         |
| `MISSING_SOURCE`       | S1〜S3 のいずれかが欠損（ファイル不在 / JSON 破損） | 2         |
| `INVALID_STATUS_VALUE` | status 値が許可列挙外                               | 3         |

## 7. drift observation baseline（Phase 1 Step 0 実測）

詳細は `drift-inventory.md` を参照。要約:

- `docs/30-workflows/` 配下（進行中）: 1 件 drift（`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001`）
- `docs/30-workflows/completed-tasks/` 配下: 28 件 drift
- 本タスクは **観測のみ** 行い、遡及修正は AC-7 により範囲外

## 8. 失敗モード（ネガティブ要件）

| 失敗モード                                                    | 対策                                           |
| ------------------------------------------------------------- | ---------------------------------------------- |
| phase-{N}-\*.md frontmatter を無視して S1〜S3 のみ比較する    | S4 を必ず比較対象に含める                      |
| 遡及で既存完了 workflow を一斉修正しようとする                | drift-inventory は観測のみ、修正は別タスク化   |
| 手動チェックリスト削除のみで validator 未実装のまま運用に出す | AC-1 / AC-3 の validator 実在を必須 gate       |
| validator の exit code は 0 だが JSON レポートは drift を報告 | exit code と JSON の双方一致を契約テストで強制 |

## 9. 非目標（明示的に含まない）

- 既存完了 workflow の drift 遡及修正（別タスク化）
- Phase 定義そのものの変更（13 Phase 構造は維持）
- workflow テンプレート刷新
- `generate-index.js` の出力フォーマット変更（status 列の読み取り規則固定のみ）

## 10. 参照

- 受け入れ基準: `acceptance-criteria.md`
- drift baseline: `drift-inventory.md`
- 設計: Phase 2 成果物群
