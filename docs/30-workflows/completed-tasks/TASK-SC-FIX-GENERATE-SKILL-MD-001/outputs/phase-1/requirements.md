# Phase 1 成果物: 要件定義書

## 真の論点

`SkillCreatorService.ts:155-158` で `generate_skill_md.js` を `["--path", skillDir]` で呼び出しているが、
スクリプトの仕様は `--plan <json>` と `--output <path>` が必須引数として定義されている。

この引数ミスマッチにより `generateResult.success` が常に `false` となり、
`ensureSkillMdExists` フォールバックのみで動作し続けている。

## 問題背景

| 項目                 | 内容                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 実際の呼び出し引数   | `["--path", skillDir]`                                                                      |
| スクリプトの仕様     | `--plan <json_path>` と `--output <md_path>` が必須                                         |
| 常時発生する副作用   | `generateResult.success === false` → フォールバック `ensureSkillMdExists` のみ実行          |
| フォールバックの欠如 | フォールバック生成の SKILL.md には `## Task一覧` セクションと YAML フロントマターが不足する |

## 採用アプローチ（B案）

`SkillCreatorService` 側で `description` から最小限の構造計画 JSON を組み立て、
tmp json ファイルに書いて `--plan` / `--output` 引数で渡す。finally 節で cleanup する。

**A案不採用の理由**: スクリプト自体を `--path` 対応に修正すると影響範囲が広く、
他の呼び出し箇所の調査が必要になる。B案のほうが変更範囲が局所的で安全。

## 受入条件

| ID   | 条件                                                              |
| ---- | ----------------------------------------------------------------- |
| AC-1 | `generate_skill_md.js` が終了コード 0 で完了する                  |
| AC-2 | 生成 SKILL.md に `## Task一覧` セクションが含まれる               |
| AC-3 | 生成 SKILL.md に YAML フロントマター（`---` ブロック）が含まれる  |
| AC-4 | スクリプト不在時は `ensureSkillMdExists` フォールバックが機能する |
| AC-5 | tmp json ファイルが finally 節で確実に削除される                  |

## スコープ境界

**含む**:

- `SkillCreatorService.ts:152-165` の修正
- `SkillCreatorService.test.ts` のテスト追加・更新

**含まない**:

- `generate_skill_md.js` スクリプト自体の変更
- `ensureSkillMdExists` の変更
- `init_skill.js` 呼び出しロジックの変更
- IPC 契約変更・PR 作成
