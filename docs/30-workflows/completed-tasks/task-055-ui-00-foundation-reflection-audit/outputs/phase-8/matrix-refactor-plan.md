# Phase 8 リファクタ計画

## 1. 目的

Phase 5〜7成果物を次回監査で再利用しやすくするため、命名規則・判定語彙・見出し構造を統一する。

## 2. 統一ルール（SubAgent-REFACTOR-STRUCT）

| 項目     | 旧                             | 新                                  |
| -------- | ------------------------------ | ----------------------------------- |
| 判定語彙 | 反映済み/要追記/対象外（維持） | 維持（固定）                        |
| 重要度   | high/medium/low + 日本語混在   | `critical/high/medium/low` に正規化 |
| 監査ID   | A-xxx + SRC混在                | `AUD-055-xxx` へ別名マッピング追加  |
| 見出し   | `## 1.` 形式と素見出し混在     | `## N.` 形式へ統一                  |

## 3. 実施対象

- `outputs/phase-5/reflection-matrix.md`
- `outputs/phase-5/finding-log.md`
- `outputs/phase-6/followup-finding-log.md`
- `outputs/phase-7/improvement-backlog.md`

## 4. 非機能ルール

- 判定値自体は変更しない（意味変換禁止）。
- 証跡 `path:line` は原文を保持。
- 回帰検証で件数一致を確認する。

## 5. Task 100% 実行確認

- [x] 統一ルールを確定
- [x] 対象ファイルを固定
- [x] 回帰条件を定義
