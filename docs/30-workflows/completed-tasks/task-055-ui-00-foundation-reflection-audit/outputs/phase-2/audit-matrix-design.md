# Phase 2 監査マトリクス設計

## 1. 目的

Phase 5で監査を再現可能にするため、`反映元 -> 反映先 -> 証跡 -> 判定 -> 修正案` の標準列を固定する。

## 2. マトリクス列定義（SubAgent-DESIGN-MATRIX）

| 列名                 | 必須     | 型          | 説明                                   |
| -------------------- | -------- | ----------- | -------------------------------------- |
| `audit_id`           | 必須     | string      | `SRC-T*` 系の反映元ID                  |
| `source_requirement` | 必須     | string      | 反映元要件名（Task 1/2/...）           |
| `target_spec`        | 必須     | path        | 反映先仕様書パス                       |
| `target_section`     | 必須     | string      | 反映先の章/節名                        |
| `source_evidence`    | 必須     | `path:line` | 反映元証跡                             |
| `target_evidence`    | 必須     | `path:line` | 反映先証跡                             |
| `judgement`          | 必須     | enum        | `反映済み`/`要追記`/`対象外`           |
| `severity`           | 条件付き | enum        | `critical/high/medium/low`（要追記時） |
| `proposal`           | 条件付き | string      | 修正案（要追記時）                     |
| `subagent`           | 必須     | string      | 担当SubAgent                           |
| `audited_at`         | 必須     | datetime    | `YYYY-MM-DDTHH:mm:ss+09:00`            |
| `command_log`        | 必須     | string      | 使用コマンド（`rg -n ...`）            |

## 3. 判定ルール

1. `反映済み`: source/target の双方証跡が存在し、意味一致。
2. `要追記`: sourceは存在するがtarget不足、または参照導線不整合。
3. `対象外`: 仕様責務として適用外（理由必須）。

## 4. 例外設計（判定不能時）

| 例外ID | 条件                             | 暫定処理          | 再判定条件                     |
| ------ | -------------------------------- | ----------------- | ------------------------------ |
| EX-01  | 反映先仕様が参照互換ファイルのみ | `要追記` で仮置き | 正本参照導線の追加を確認       |
| EX-02  | 章名不一致で直接照合不可         | `要追記` で仮置き | 同義語マッピング追加後に再判定 |
| EX-03  | 仕様リンク切れ                   | `要追記` + high   | 実在パス復旧後に再判定         |

## 5. aiworkflow-requirements 適用

| 参照                           | 適用ポイント                            |
| ------------------------------ | --------------------------------------- |
| `ui-ux-feature-components.md`  | 画面横断要件の整合判定                  |
| `arch-state-management.md:204` | P31観点（責務分離）をマトリクス列へ反映 |
| `task-workflow.md`             | 監査記録フォーマット統一                |
| `lessons-learned.md`           | 過去失敗パターンの再発防止              |
| `spec-guidelines.md`           | 表記ゆれ（ID・判定語彙）抑止            |

## 6. 再利用テンプレート

```markdown
| audit_id | source_requirement | target_spec                              | target_section   | source_evidence | target_evidence | judgement | severity | proposal | subagent             | audited_at                | command_log        |
| -------- | ------------------ | ---------------------------------------- | ---------------- | --------------- | --------------- | --------- | -------- | -------- | -------------------- | ------------------------- | ------------------ |
| SRC-T5D  | UX言語ガイドライン | task-058d-ui-07-dashboard-enhancement.md | 2.3 UX言語変換表 | task-050...:950 | task-058d...:34 | 反映済み  | -        | -        | SubAgent-IMP-SCREENS | 2026-03-05T11:00:00+09:00 | rg -n "UX言語" ... |
```

## 7. Task 100% 実行確認

- [x] マトリクス列を固定
- [x] 判定不能時処理を定義
- [x] 例外再判定条件を定義
- [x] Phase 3レビュー観点を明記
