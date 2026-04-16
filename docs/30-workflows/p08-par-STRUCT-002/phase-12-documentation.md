# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-STRUCT-002   |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | 未実施               |
| 作成日     | 2026-04-16           |

## 目的

本タスクの実装内容を中学生レベルの概念説明と技術者向けの実装ガイドとして記録する。
system spec への反映と未タスクの検出を行い、後続の LLM 統合タスクへの引き継ぎ情報を整備する。
Phase 12 標準に合わせ、`TASK-SW-STRUCT-002-skill-feedback-report.md` と `TASK-SW-STRUCT-002-phase12-task-spec-compliance-check.md` も同波で作成する。

## 実行タスク

### Task 1: 中学生レベルの概念説明

**何を直したか（誰でもわかる説明）**:

このタスクでは、スキル作成アプリの「作成モード」で、スキルの設計書（`structurePlan`）が
完全に無視されていた問題を解決しました。

これまでは、せっかく「スキルの目的（purpose）」や「スキル名（skillName）」などの情報を
集めても、実際にファイル（SKILL.md）を作るときには使われず、別の固定テンプレートが使われていました。
これは「せっかく書いた設計図を捨てて、別の紙に書き直す」のと同じような非効率な状態でした。

修正後は:

- スキルの設計書（`structurePlan`）の内容が実際に SKILL.md の生成に使われる
- 設計書が空（null）だった場合でも、以前と同じ方法でちゃんとファイルが作られる

これにより、スキルの説明や目的が正しく SKILL.md に反映されるようになります。

### Task 2: 技術者向け実装ガイド

**修正ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正箇所と変更内容**:

1. `:126` の `void structurePlan;` を削除（意図的な未実装プレースホルダーの解消）
2. `logger` プライベートフィールドを追加（`console.error` / `console.warn` ラッパー）
3. `generateSkillMd(skillDir, structurePlan)` プライベートメソッドを新規実装
   - `StructurePlanJson` → `generate_skill_md.js` 用 `plan` オブジェクトへの変換
   - `purpose` → `trigger.description` への正規化変換
   - `triggers` / `anchors` の Optional フォールバック処理
   - tmp ファイル経由での `generate_skill_md.js` 呼び出し
   - 3段階フォールバック（スクリプト失敗 / ファイル未生成 / 例外）
4. SKILL.md 生成フローを `structurePlan` の有無による分岐に変更

**後続タスクへの引き継ぎ**:

- LLM 統合タスクで `structurePlan.purpose` が実際の LLM 出力に変わる際、`generateSkillMd` の変換ロジックを更新する
- `logger` は将来的に専用ロガーに差し替え可能な設計

### Task 3: system spec 反映確認

本タスクの変更は `SkillCreatorService` 内部メソッドの追加であり、
外部仕様（IPC 契約・API）に変更はない。system spec への反映は最小限。
`generateSkillMd` の追加によって create モードの SKILL.md 生成品質が向上したことを記録する。

### Task 4: 未タスク検出

本タスクの実施中に判明した未タスク候補:

| 未タスクID | 内容                                                                               | 優先度 |
| ---------- | ---------------------------------------------------------------------------------- | ------ |
| FUTURE-001 | LLM による `structurePlan.purpose` の実際の抽出（TASK-SW-STRUCT-001 の技術的負債） | Medium |
| FUTURE-002 | LLM による `structurePlan.features` の自動生成                                     | Medium |
| FUTURE-003 | `logger` を専用ロガーに差し替える                                                  | Low    |
| FUTURE-004 | `generate_skill_md.js` の引数仕様変更に追従する仕組みの整備                        | Low    |

### Task 5: スキルフィードバックレポート

Phase 12 の実行で得られた学びを整理し、今後の同系タスクに再利用できる観点を残す。

- `void expr;` パターンはプレースホルダーとして有効だが、コメントに「タスクID完了後に接続」を明記することで後続タスクへの引き継ぎが明確になる
- フォールバックを3段階（スクリプト失敗 / ファイル未生成 / 例外）に分けることで、障害モードごとの観察が容易になる
- `shouldUseFallback` フラグを使った2段階チェックは読みやすく、テストしやすい設計パターンである
- tmp ファイルの cleanup は `finally` + `catch(() => {})` で non-fatal として扱うパターンを統一する

### Task 6: 準拠チェック

6 成果物が揃っていること、task prefix 付きファイル名が spec と一致していること、planned wording がないことを確認する。

## 参照資料

- `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/TASK-SW-STRUCT-002-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 本フェーズはドキュメント作成のみ。統合テストの変更は不要。

## 成果物

| 成果物                                                   | パス                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| TASK-SW-STRUCT-002-implementation-guide.md               | `outputs/phase-12/TASK-SW-STRUCT-002-implementation-guide.md`               |
| TASK-SW-STRUCT-002-system-spec-update-summary.md         | `outputs/phase-12/TASK-SW-STRUCT-002-system-spec-update-summary.md`         |
| TASK-SW-STRUCT-002-documentation-changelog.md            | `outputs/phase-12/TASK-SW-STRUCT-002-documentation-changelog.md`            |
| TASK-SW-STRUCT-002-unassigned-task-detection.md          | `outputs/phase-12/TASK-SW-STRUCT-002-unassigned-task-detection.md`          |
| TASK-SW-STRUCT-002-skill-feedback-report.md              | `outputs/phase-12/TASK-SW-STRUCT-002-skill-feedback-report.md`              |
| TASK-SW-STRUCT-002-phase12-task-spec-compliance-check.md | `outputs/phase-12/TASK-SW-STRUCT-002-phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] 中学生レベルの概念説明が記述されている
- [ ] 技術者向け実装ガイドが完成している
- [ ] system spec 反映確認が完了している
- [ ] 未タスク検出が記録されている
- [ ] スキルフィードバックレポートが記録されている
- [ ] 準拠チェックが完了している
- [ ] LLM 統合タスクへの引き継ぎ情報が整備されている

## タスク100%実行確認【必須】

- [ ] Task 1（中学生レベルの概念説明）を100%実行した
- [ ] Task 2（技術者向け実装ガイド）を100%実行した
- [ ] Task 3（system spec 反映確認）を100%実行した
- [ ] Task 4（未タスク検出）を100%実行した
- [ ] Task 5（スキルフィードバックレポート）を100%実行した
- [ ] Task 6（準拠チェック）を100%実行した
- [ ] 全成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
