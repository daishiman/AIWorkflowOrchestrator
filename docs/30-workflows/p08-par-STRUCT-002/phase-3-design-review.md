# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビューゲート  |
| 対象機能   | TASK-SW-STRUCT-002  |
| 前提Phase  | Phase 2: 設計       |
| 次Phase    | Phase 4: テスト作成 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`generateSkillMd` の変換仕様、フォールバック設計の妥当性、TASK-SW-STRUCT-001 との依存整合性を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                                              | 評価 |
| ---- | ----------------------------------------------------------------------------------------- | ---- |
| AC-1 | `void structurePlan;` 削除の設計が明記されている                                          | TBD  |
| AC-2 | `generateSkillMd` が `structurePlan` の内容を `plan` オブジェクトに変換する設計がある     | TBD  |
| AC-3 | `structurePlan` null 時の `ensureSkillMdExists` フォールバック設計が明記されている        | TBD  |
| AC-4 | collaborative / orchestrate モードへの変更がなく、既存テストへの影響なしと確認されている  | TBD  |
| AC-5 | `purpose` / `skillName` が `triggerDescription` / `plan.skillName` に反映される設計がある | TBD  |

### Task 2: TASK-SW-STRUCT-001 との依存整合性確認

- TASK-SW-STRUCT-001 が設定する `structurePlan.purpose = options.description` が本タスクの設計と整合するか確認
- `structurePlan.agents` はプライベートメソッドの変換対象外であるが、SKILL.md 生成に不要であることを確認
- `structurePlan.features` は空配列であるが、`plan` への変換時に問題がないことを確認

### Task 3: リスク評価

| ID   | リスク                                                                            | 影響度 | 対策                                                                                   |
| ---- | --------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| R-01 | `generate_skill_md.js` の失敗時にフォールバックが機能しない                       | 中     | try/catch + `shouldUseFallback` フラグで3段階フォールバックを設計済み                  |
| R-02 | `structurePlan.purpose` が空文字列の場合に `triggerDescription` が短くなる        | 低     | 空文字列は `normalizedPurpose` が falsy になり短縮形を使用する設計で問題なし           |
| R-03 | tmp ファイルのクリーンアップ失敗                                                  | 低     | `finally` ブロックで `catch(() => {})` を使用して non-fatal 扱いにする設計済み         |
| R-04 | `anchors` の型が `StructurePlanJson` では `Anchor[]` に変更済みであることへの対応 | 中     | TASK-SW-STRUCT-001 の commits で `anchors?: Anchor[]` に変更済み。変換時にそのまま渡す |

### Task 4: simpler alternative 検討

**代替案**: `generateSkillMd` を別メソッドにせず、既存の SKILL.md 生成コードをインラインで修正する

- メリット: メソッド分割が不要でコードが短くなる
- デメリット: 責務が混在し、テスト容易性が下がる。フォールバックロジックが複雑になる

**判断**: 現設計（`generateSkillMd` として分離）を採用する。テスト容易性・責務明確化・フォールバック設計の観点で優れている。

### Task 5: MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                                                        | 解決予定Phase | 解決確認Phase | 備考                                            |
| --------- | ------------------------------------------------------------------------------- | ------------- | ------------- | ----------------------------------------------- |
| TECH-M-01 | `purpose` → `triggerDescription` 変換はヒューリスティックであり変更可能性がある | 別タスク      | 別タスク      | LLM 統合タスクで purpose が変わった場合に再評価 |
| TECH-M-02 | `logger` は最小実装（console.error/warn）であり本番品質ではない                 | Phase 5       | Phase 9/10    | 将来的に専用ロガーに差し替え可能な設計にする    |

## ゲート判定

**判定**: TBD（実施時に PASS / MINOR / MAJOR を判定する）

Phase 4 開始条件: ゲート判定が PASS または MINOR の場合のみ進行する。
MAJOR 判定の場合は Phase 2 へ差し戻す。

Phase 13 blocked 条件: ユーザー承認がない限り commit / push / PR を実行しない。

## 参照資料

- `outputs/phase-2/TASK-SW-STRUCT-002-design.md` — レビュー対象（設計書）
- `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md` — AC 確認基準
- `docs/30-workflows/p01-par-STRUCT-001/phase-3-design-review.md` — depends_on のレビュー参照

## 統合テスト連携

- IPC 契約の変更がないことを設計レビューで確認する
- `generateSkillMd` の実装が `createSkill()` の外部動作に影響しないことを確認する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STRUCT-002-review.md | `outputs/phase-3/TASK-SW-STRUCT-002-review.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-5）が設計でカバーされていることを確認した
- [ ] TASK-SW-STRUCT-001 との依存整合性を確認した
- [ ] リスク台帳（R-01〜R-04）が作成されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] MINOR 追跡テーブルが作成されている
- [ ] ゲート判定が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（設計整合性チェック）を100%実行した
- [ ] Task 2（TASK-SW-STRUCT-001 との依存整合性確認）を100%実行した
- [ ] Task 3（リスク評価）を100%実行した
- [ ] Task 4（simpler alternative 検討）を100%実行した
- [ ] Task 5（MINOR 追跡テーブル）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-review.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
