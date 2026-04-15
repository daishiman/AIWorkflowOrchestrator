# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| 前提Phase  | Phase 2: 設計                   |
| 後続Phase  | Phase 4: テスト設計             |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`collaborative` モードとの整合性、タスクA依存関係の妥当性、型変更の影響範囲を重点的に確認する。

---

## 実行タスク

### タスク1: 設計整合性チェック

**目的**: Phase 2 設計が受入条件（AC-1〜AC-5）を全て満たすか確認する

**実行手順**:

1. AC-1「loadAgent が呼ばれる」— loadAgent 呼び出しが設計に含まれていることを確認
2. AC-2「後続処理が正常に続く」— createSkill() フローが中断しない設計になっているか確認
3. AC-3「フォールバック」— try/catch + null 返却が設計されていることを確認
4. AC-4「void options 削除」— options.description が使用される設計になっているか確認
5. AC-5「collaborative テスト回帰」— collaborative モードのコードに変更が及ばないことを確認

**期待される成果物**:

- AC 対応チェックリスト

---

### タスク2: collaborative モードとの整合性確認

**目的**: 既存の collaborative モードワークフローへの影響がないことを確認する

**実行手順**:

1. `runCollaborativeWorkflow` の実装を確認
2. `runCreateWorkflow` の型変更（void → StructurePlanJson | null）が collaborative モードに波及しないことを確認
3. `createSkill()` の switch 文で collaborative ケースが影響を受けないことを確認
4. 既存テスト（collaborative モード）が型変更により失敗しないことを評価

**期待される成果物**:

- collaborative モード影響評価

---

### タスク3: リスク評価

**目的**: 実装リスクを洗い出し、対策を策定する

**実行手順**:

1. agentファイル不在リスク（extract-purpose.md / plan-structure.md が存在しない場合）を評価
2. 型変更（void → StructurePlanJson | null）による TypeScript コンパイルエラーリスクを評価
3. タスクA未完了のまま実装着手した場合のリスクを評価
4. 各リスクに対する対策を策定

**期待される成果物**:

- リスク台帳

---

## レビュー結果

### ゲート判定

| 判定     | 条件                     | 結果                                        |
| -------- | ------------------------ | ------------------------------------------- |
| PASS     | 全レビュー観点で問題なし | **PASS** — 設計に重大な問題なし             |
| MINOR    | 軽微な指摘あり           | 下記 MINOR 指摘事項を対応後、Phase 4 へ進む |
| MAJOR    | 重大な問題あり           | Phase 2 へ戻る                              |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認                  |

**判定**: PASS（MINOR 指摘あり、Phase 4 進行可）

---

### AC 対応チェックリスト

| AC   | 設計での対応                                                             | 評価 |
| ---- | ------------------------------------------------------------------------ | ---- |
| AC-1 | `resourceLoader.loadAgent("extract-purpose")` の呼び出しが設計されている | OK   |
| AC-2 | `try/catch` + 後続フロー継続設計が明記されている                         | OK   |
| AC-3 | `loadAgent` 失敗時に `null` を返すフォールバックが設計されている         | OK   |
| AC-4 | `options.description` を `StructurePlanJson.description` に使用          | OK   |
| AC-5 | `runCollaborativeWorkflow` に変更なし、既存テストへの影響なし            | OK   |

---

### collaborative モードとの整合性

**評価結果**: 問題なし

- `runCollaborativeWorkflow` は独立して `Promise<void>` のまま変更しない
- `runCreateWorkflow` の戻り型変更は `createSkill()` 内の `case "create":` ブロックにのみ影響
- 既存の `collaborative` テストは `runCollaborativeWorkflow` のみを検証するため、型変更の影響なし
- `createSkill()` のシグネチャ（`Promise<string>` 返却）は変更しないため外部 API に破壊的変更なし

---

### リスク台帳

| ID   | リスク                                               | 影響度 | 発生確率 | 対策                                                            |
| ---- | ---------------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| R-01 | `extract-purpose.md` が不在                          | 中     | 低       | `try/catch` でキャッチ → `null` 返却（フォールバック設計済み）  |
| R-02 | `plan-structure.md` が不在                           | 中     | 低       | 同上（R-01 と同じフォールバックで対応）                         |
| R-03 | `StructurePlanJson` 型が `@repo/shared/types` に不在 | 低     | 高       | SkillCreatorService.ts 内ローカル型として定義（後でshared昇格） |
| R-04 | タスクA未完了のまま `void structurePlan` が残存      | 低     | 高       | Phase 5 実装計画でタスクA完了確認を前提条件として明記           |
| R-05 | `createSkill()` の switch 文変更で他ケースに影響     | 低     | 低       | `case "create":` ブロックのみ変更、他ケース（update等）は無変更 |

---

### MINOR 指摘事項

1. **StructurePlanJson の `purpose` フィールド型**: 現設計では `extractPurposeAgent`（string）を
   そのまま格納しているが、将来の LLM 統合時に型が変わる可能性がある。
   → 対策: コメントに「将来 LLM 呼び出しに置換」と明記する（Phase 2 設計書に記載済み）

2. **`void structurePlan` の暫定コード**: タスクA完了前の暫定措置として `void structurePlan` を
   使用するが、これは技術的負債になる可能性がある。
   → 対策: TODO コメントを付与し、タスクA完了後に接続することを明記する

---

## 参照資料

| 参照資料               | パス                                                          | 内容         |
| ---------------------- | ------------------------------------------------------------- | ------------ |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                   | レビュー対象 |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                             | AC 確認基準  |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 実装対象     |

---

## 成果物

| 成果物    | パス                        | 内容                           |
| --------- | --------------------------- | ------------------------------ |
| review.md | `outputs/phase-3/review.md` | 本ファイル（設計レビュー結果） |

---

## 統合テスト連携

- 統合テスト観点のレビュー: `StructurePlanJson | null` → `generateSkillMd()` のデータフロー契約が
  タスクAのスクリプト仕様と整合しているかを Phase 4 テスト設計で検証する

---

## 完了条件

- [x] 全 AC（AC-1〜AC-5）が設計でカバーされていることを確認
- [x] collaborative モードへの影響がないことを確認
- [x] リスク台帳（R-01〜R-05）が作成されている
- [x] MINOR 指摘事項に対する対策が明記されている
- [x] ゲート判定（PASS）が下されている

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4: テスト設計 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`outputs/phase-4/test-design.md`
