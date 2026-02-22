# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 12                                                                           |
| Phase名    | ドキュメント更新                                                             |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 前提Phase  | Phase 11（手動テスト検証）                                                   |
| 後続Phase  | Phase 13（完了・PR準備）                                                     |
| ステータス | 完了                                                                         |
| 作成日     | 2026-02-21                                                                   |

---

## 目的

実装内容のドキュメント化、システム仕様書の更新、未タスク検出、スキルフィードバック記録を行う。Phase 12は漏れが最も発生しやすいPhaseであるため、全項目を逐次確認する。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1: 概念的説明 + Part 2: 技術的詳細）
- Task 2: システム仕様書更新（spec-update-workflow.md準拠）
- Task 3: documentation-changelog.md作成
- Task 4: 未タスク検出

## 参照資料

| 資料名                    | パス                                                                                        | 説明                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                                                   | 要件情報                               |
| Phase 2 設計              | `phase-2-design.md`                                                                         | 設計情報                               |
| Phase 5 実装              | `phase-5-implementation.md`                                                                 | 実装情報                               |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`                                                                 | テスト拡充結果                         |
| Phase 7 カバレッジ確認    | `phase-7-coverage-verification.md`                                                          | カバレッジ結果                         |
| Phase 8 リファクタリング  | `phase-8-refactoring.md`                                                                    | リファクタ結果                         |
| Phase 9 品質検証          | `phase-9-quality-assurance.md`                                                              | 品質検証結果                           |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                   | レビュー指摘事項                       |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                    | テスト結果                             |
| Electron Service仕様書    | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | `skill:import` IPC契約（引数・戻り値） |
| SDK Skill型仕様書         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill/ImportResult定義         |
| Skill IPCセキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` の入力検証・sender検証  |
| 実装パターン集            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P32/P44パターン                    |
| 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P42/P44/P45                    |
| spec-update-workflow.md   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | 仕様書更新ワークフロー                 |
| task-workflow.md          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | タスクワークフロー管理                 |
| 06-known-pitfalls.md      | `.claude/rules/06-known-pitfalls.md`                                                        | 既知の落とし穴（P1-P4防止）            |

---

## 成果物

| 成果物                       | パス                                          | 内容                          |
| ---------------------------- | --------------------------------------------- | ----------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    | 概念的説明・技術的詳細        |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md` | 更新した仕様書の変更一覧      |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`  | 検出された未タスク（0件含む） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   | スキル実行結果・改善提案      |

---

## Task 1: 実装ガイド作成

### Part 1: 概念的説明（中学生レベル — 日常例え必須）

**アナロジー: お店の注文と商品受け取り**

| 概念                  | アナロジー                                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| `ImportResult`        | 「注文が完了しました」という注文確認メモ（注文枚数、エラー有無が書いてある） |
| `ImportedSkill`       | 商品の実物情報（商品名、説明、棚の場所、入荷日、状態「販売中」）             |
| 戻り値型の不整合      | お客さんが商品の実物を期待しているのに、店員が注文確認メモだけ渡してしまう   |
| 修正（2ステップ処理） | 店員が①注文処理→②棚から商品の実物を取り出してお客さんに渡す                  |
| `getSkillByName()`    | 棚から商品の実物情報を探し出す作業                                           |

**ストーリー:**

> あなたはお店のお客さんで、「このスキルをください」と注文します。
>
> **修正前**: 店員さんは「注文受付しました！1件処理しました、エラーなし！」とメモだけ渡します。
> でもあなたが欲しいのは**商品の実物情報**（名前、説明、入荷日...）です。メモだけもらっても商品棚に並べられません。
>
> **修正後**: 店員さんは注文処理した後、ちゃんと棚から商品を取り出して「はい、これが商品です」と実物情報を渡します。
> これでお客さん（Renderer）は商品棚（UIのスキル一覧）に正しく並べることができます。

### Part 2: 開発者向け実装詳細

以下の内容を記載すること:

- **変換ロジック**: `importSkills()` → `getSkillByName()` の2ステップ処理フロー
- **型定義**: `ImportResult`型と`ImportedSkill`型の差異
- **エラーハンドリング**: 各ステップでの失敗ケースと対応
- **IPC通信でのDate型シリアライゼーション**: `importedAt`のJSON変換挙動
- **関連パターン**: P23（API二重定義）、P32（型定義二箇所更新）、P44（IPCインターフェース不整合）

#### ドキュメント要件

| セクション       | 必須 | 内容                                     |
| ---------------- | ---- | ---------------------------------------- |
| 概念的な説明     | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 変換ロジック図解 | ✅   | ASCII図解付きのデータフロー説明          |
| コード変更箇所   | ✅   | Before/After コード例                    |
| 型定義の差異     | ✅   | ImportResult vs ImportedSkill の対照表   |
| 用語集           | ✅   | 専門用語の読み方・意味・コンテキスト     |

---

## Task 2: システム仕様書更新（spec-update-workflow.md準拠）

> **最重要**: 全Stepを逐次確認。P1/P2/P25/P26/P27パターンの再発防止。

### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
  - `interfaces-agent-sdk-skill.md`: skill:import戻り値型の修正を記録
  - `arch-electron-services.md`: `skill:import` IPCチャネル契約（引数・戻り値）の更新を記録
  - `security-skill-ipc.md`: `skill:import` 検証要件（skillName/skillIds整合）の更新を記録
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25防止）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `arch-electron-services.md` / `interfaces-agent-sdk-skill.md` 等の実装ステータス更新（該当する場合）

### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-FIX-SKILL-IMPORT-RETURN-TYPE-001" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新
- [ ] `grep -rn "UT-FIX-SKILL-IMPORT-INTERFACE-001" .claude/skills/aiworkflow-requirements/references/` で関連タスク参照を確認

### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成（P2/P27防止）

### Step 2: システム仕様更新

以下の仕様書を更新すること:

| 対象仕様書                      | 更新内容                                              |
| ------------------------------- | ----------------------------------------------------- |
| `interfaces-agent-sdk-skill.md` | skill:importの戻り値型仕様を`ImportedSkill`に更新     |
| `arch-electron-services.md`     | `skill:import` の引数・戻り値契約を実装に合わせて更新 |
| `security-skill-ipc.md`         | `skill:import` の検証要件（skillName/skillIds）を更新 |
| `06-known-pitfalls.md` P44      | P44の「解決済み」ステータスに戻り値型修正の情報を追記 |

---

## Task 3: documentation-changelog.md

> **P4パターン防止**: 全Step確認前に「完了」と記載しない。

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各Stepの完了結果を詳細に記録（漏れの可視化）
- [ ] Step 1-A完了: {{完了/未完了}}
- [ ] Step 1-B完了: {{完了/該当なし}}
- [ ] Step 1-C完了: {{完了/未完了}}
- [ ] Step 1-D完了: {{完了/未完了}}
- [ ] Step 2完了: {{完了/未完了}}

---

## Task 4: 未タスク検出

> **0件でも出力必須**（unassigned-task-report.md）

### 検出ソース

| ソース                 | 確認項目                      | Grepパターン例                                                                 | 必須 |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------ | ---- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                                             | ✅   |
| Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                                            | ✅   |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                                            | ✅   |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                                     | ✅   |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/skillHandlers.ts` | ✅   |

### 検出された未タスクの処理手順（3ステップ — P3防止）

検出された未タスクは以下の3ステップを**全て**完了すること:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

### 品質基準（Why/What/How）

| カテゴリ | 項目                       | 基準                                         |
| -------- | -------------------------- | -------------------------------------------- |
| Why      | 背景が明確                 | このタスクが必要になった経緯が説明されている |
| Why      | 問題点が具体的             | 現状の問題が定量的/定性的に説明されている    |
| What     | 目的が具体的               | 達成すべきことが一意に解釈できる             |
| What     | スコープが明確             | 含む/含まないが明記されている                |
| How      | 使用スキルが選定されている | タスクに適したスキルが選定されている         |
| How      | 完了条件が検証可能         | チェックリスト形式で確認可能                 |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録（documentation-changelog.md）が出力されている
- [ ] **システム仕様書が更新されている**（interfaces-agent-sdk-skill.md、arch-electron-services.md、security-skill-ipc.md）
- [ ] **LOGS.md が2ファイル両方更新されている**（P1/P25防止）
- [ ] **topic-map.md が再生成されている**（P2/P27防止）
- [ ] 未タスク検出レポートが出力されている（0件でも必須）
- [ ] 検出された未タスクに対して3ステップが全て完了している（該当する場合）
- [ ] スキルフィードバックが記録されている
- [ ] **本Phase内の全作業を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] Task 1〜Task 4の全出力が確認されている
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10, 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 成果物

- 実装ガイド: {{作成/未作成}}
- ドキュメント変更履歴: {{作成/未作成}}
- 未タスク検出レポート: {{作成/未作成}}（検出件数: {{数}}件）
- スキルフィードバックレポート: {{作成/未作成}}
- システム仕様更新: {{実施/不要}}

### Step完了状況

- Step 1-A（タスク完了記録）: {{完了/未完了}}
- Step 1-B（実装状況テーブル）: {{完了/該当なし}}
- Step 1-C（関連タスクテーブル）: {{完了/未完了}}
- Step 1-D（topic-map.md再生成）: {{完了/未完了}}
- Step 2（システム仕様更新）: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-return-type-001/phase-13-completion.md`
