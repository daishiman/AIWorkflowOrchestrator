# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | -                                     |
| 後続Phase  | Phase 2（設計）                       |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

---

## 目的

`SkillCreatorService.ts` の `runCreateWorkflow` 内で `features` フィールドが空配列 `[]` で固定されているため、create モードで作成された SKILL.md の機能一覧が空になる問題を解決する。LLM を使ってスキルの機能一覧（features）を自動生成することで SKILL.md の品質を向上させることを目的とする。

---

## 実行タスク

- P50チェック: `runCreateWorkflow` の現状コードを調査し、`features: []` が固定されていることを確認する
- TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存関係を明確にする
- 受け入れ基準 AC-1〜AC-4 を定義する
- 対象ファイル・対象行の特定と現状把握を行う
- 既存のcreate/update ワークフローに対する影響範囲を調査する

---

## 参照資料

| 資料名                          | パス                                                               | 用途                                      |
| ------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| SkillCreatorService             | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | 主要変更対象ファイル                      |
| SkillCreatorService（line 937） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts#L937` | `runCreateWorkflow` メソッドの現状確認    |
| SkillCreatorService（line 946） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts#L946` | `features: []` 固定箇所                   |
| SkillCreatorService（line 961） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts#L961` | `generateSkillMd` メソッド確認            |
| 依存タスク仕様                  | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT                                   | purpose フィールドLLM自動生成の先行タスク |

---

## 実行手順

### 1. P50チェック: 現状コード調査

以下のコマンドで現状を調査し、`features: []` が固定されている箇所と周辺コードを確認する。

```bash
grep -n "features" apps/desktop/src/main/services/skill/SkillCreatorService.ts
git log --oneline -5 -- apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

確認事項:

1. `features: []` が固定されている行番号と文脈
2. `StructurePlanJson` 型の定義（features フィールドの型）
3. `generateSkillMd()` メソッドが features を SKILL.md にどう反映するか
4. `loadAgent("plan-structure")` および `loadAgent("extract-purpose")` の使用箇所
5. `runCreateWorkflow` と `runUpdateWorkflow` の両メソッドにおける features の扱い

### 2. 受け入れ基準の定義

以下の4つの受け入れ基準（AC）を定義する。

#### AC-1: features フィールドのLLM自動生成

- `runCreateWorkflow()` 内の `features` フィールドが、空配列 `[]` ではなく LLM で生成された文字列配列になること
- 生成される features の各要素はスキルの機能を表す日本語または英語の短文であること
- features の件数は最低1件以上であること（LLM 失敗時のフォールバックを除く）

#### AC-2: generateSkillMd() への反映

- 生成された features が `generateSkillMd()` 経由で SKILL.md の機能一覧セクションに正しく反映されること
- SKILL.md 内の features セクションが空でないこと（LLM 失敗時のフォールバックを除く）

#### AC-3: エラー時のフォールバック

- features 生成に失敗した場合（LLM タイムアウト、ネットワークエラー、不正なレスポンス等）、空配列 `[]` でフォールバックすること
- フォールバック時にエラーがログ出力されること
- フォールバック時でも全体のワークフローが正常に完了すること（エラーで中断しないこと）

#### AC-4: 既存ワークフローの回帰なし

- 既存の create ワークフロー全体が回帰なしに動作すること
- 既存の update ワークフロー全体が回帰なしに動作すること
- 既存のユニットテストがすべてパスすること

### 3. 依存タスクの確認

TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存関係を明確にする。

- TASK-SW-LLM-PURPOSE-AUTO-EXTRACT は `loadAgent("extract-purpose")` を活用して purpose フィールドをLLMで自動生成するタスク
- TASK-SW-STRUCT-LLM-002 は `loadAgent("plan-structure")` を活用して features フィールドをLLMで自動生成するタスク
- 両タスクは概念的に関連しているが、実装上は独立したエージェントを使用するため並列実装が可能
- ただし、TASK-SW-LLM-PURPOSE-AUTO-EXTRACT の完了後に実施することが望ましい（コード構造・パターンの一貫性確保のため）

---

## 統合テスト連携

- `SkillCreatorService` の create ワークフロー全体の統合テストが存在する場合、features が非空配列であることをアサーションに追加する
- LLM モックを使用した features 生成の正常系テスト
- LLM 失敗時のフォールバック動作の異常系テスト
- `generateSkillMd()` 出力に features が反映されていることの検証

---

## 多角的チェック観点（AIが判断）

| 観点              | 確認内容                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------- |
| 機能的正確性      | features が実際のスキルの機能を表す内容になっているか（LLM プロンプト設計の妥当性）      |
| パフォーマンス    | features 生成のためのLLM呼び出しが全体の処理時間に与える影響（タイムアウト設定の妥当性） |
| 後方互換性        | update ワークフローや既存の SKILL.md への影響がないか                                    |
| エラー耐性        | LLM 呼び出し失敗時にユーザー体験を損なわないフォールバック設計になっているか             |
| 依存関係の整合性  | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT のパターンと一貫性があるか（コードの統一性）            |
| テスト可能性      | LLM 呼び出し部分が適切に抽象化・モック化できる設計になっているか                         |
| SKILL.md 品質向上 | 自動生成された features が手動記述と遜色ない品質になるか                                 |

---

## サブタスク管理

| No. | サブタスク内容                                    | 状態        |
| --- | ------------------------------------------------- | ----------- |
| 1   | `runCreateWorkflow` 現状コードの grep 調査        | not_started |
| 2   | `StructurePlanJson` の型定義確認                  | not_started |
| 3   | `generateSkillMd()` の features 参照箇所確認      | not_started |
| 4   | `plan-structure` エージェントの仕様確認           | not_started |
| 5   | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存関係整理 | not_started |
| 6   | 受け入れ基準 AC-1〜AC-4 の確定                    | not_started |
| 7   | 既存テストの影響範囲確認                          | not_started |

---

## 成果物

| 成果物             | パス                                                               | 説明           |
| ------------------ | ------------------------------------------------------------------ | -------------- |
| Phase 1 要件定義書 | `docs/30-workflows/TASK-SW-STRUCT-LLM-002/phase-1-requirements.md` | 本ドキュメント |

---

## 完了条件

- [ ] P50チェックコマンドの実行と結果確認が完了している
- [ ] `runCreateWorkflow` 内の `features: []` 固定箇所が特定されている
- [ ] `StructurePlanJson` 型における features フィールドの型が確認されている
- [ ] `generateSkillMd()` が features をどう利用しているか確認されている
- [ ] `loadAgent("plan-structure")` の仕様と呼び出しパターンが確認されている
- [ ] TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存関係が明記されている
- [ ] 受け入れ基準 AC-1〜AC-4 が定義されている
- [ ] 既存の create/update ワークフローへの影響範囲が調査されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

---

## 次Phase

Phase 2（設計）へ
