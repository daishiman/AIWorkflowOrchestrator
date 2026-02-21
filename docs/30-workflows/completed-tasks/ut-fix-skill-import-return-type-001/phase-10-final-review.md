# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| Phase名    | 最終レビューゲート                         |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001        |
| 前提Phase  | Phase 9（品質検証）                        |
| 後続Phase  | Phase 11（手動テスト検証）                 |
| ステータス | 完了                                       |
| 作成日     | 2026-02-21                                 |
| 機能名     | skill:import IPCハンドラ戻り値型不整合修正 |

---

## 目的

全体品質・整合性を最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能要件・型定義整合性・セキュリティ・テストカバレッジ・エラーハンドリング・IPC契約の6観点で確認する。

## 背景

本タスクは P44（skill:import/remove IPCインターフェース不整合）の戻り値型側の修正であり、UT-FIX-SKILL-IMPORT-INTERFACE-001（引数側修正）との組み合わせで P44 パターンの完全解決を目指す。
最終レビューでは、引数側（修正済み）と戻り値側（本タスク）の両方が整合していることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件充足レビュー

**目的**: skill:import ハンドラが ImportedSkill 型を正しく返すことを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. skill:import ハンドラの戻り値が ImportedSkill 型であることを確認する
3. 以下の要件を満たしていることを検証する

**機能要件チェックリスト**:

| 要件                      | 確認内容                                                   | 結果 |
| ------------------------- | ---------------------------------------------------------- | ---- |
| 戻り値型が ImportedSkill  | ハンドラが ImportedSkill オブジェクトを返す                | -    |
| importSkills() 実行       | SkillService.importSkills([skillName]) が呼ばれる          | -    |
| getSkillByName() 実行     | importSkills 成功後に getSkillByName(skillName) が呼ばれる | -    |
| null ハンドリング         | getSkillByName が null を返した場合にエラーを返す          | -    |
| P42準拠3段バリデーション  | typeof → === "" → .trim() === "" の3段チェック             | -    |
| Preload側の期待型との一致 | safeInvoke の戻り値型が ImportedSkill と一致               | -    |

**期待される成果物**:

- `outputs/phase-10/functional-review.md`

---

### タスク2: 型定義整合性レビュー

**目的**: ハンドラ・Preload・Renderer の3レイヤーで型が完全に整合していることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のハンドラ戻り値型を確認する
2. `apps/desktop/src/preload/types.ts` の importSkill メソッド戻り値型を確認する
3. `apps/desktop/src/renderer/store/slices/agentSlice.ts` での使用型を確認する
4. 3レイヤー間で型の不整合がないことを検証する

**型整合性マトリクス**:

| レイヤー | ファイル           | 型                     | 一致 |
| -------- | ------------------ | ---------------------- | ---- |
| Main     | `skillHandlers.ts` | ハンドラ戻り値型       | -    |
| Preload  | `preload/types.ts` | importSkill 戻り値型   | -    |
| Renderer | `agentSlice.ts`    | importSkill 呼び出し型 | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                                     | 更新状況 |
| -------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | -        |
| `apps/desktop/src/preload/types.ts`          | -        |

**期待される成果物**:

- `outputs/phase-10/type-safety-review.md`

---

### タスク3: セキュリティレビュー

**目的**: skill:import ハンドラがセキュリティ要件を全て満たしていることを確認する

**実行手順**:

1. skill:import ハンドラの全セキュリティチェック項目を検証する
2. テストでセキュリティシナリオがカバーされていることを確認する

**セキュリティレビューマトリクス**:

| チェック項目                 | 確認内容                                     | テスト有無 | 結果 |
| ---------------------------- | -------------------------------------------- | ---------- | ---- |
| validateIpcSender            | skill:import ハンドラで呼び出されている      | -          | -    |
| getAllowedWindows            | mainWindow のみ許可                          | -          | -    |
| 3段バリデーション（P42準拠） | typeof → === "" → .trim() === ""             | -          | -    |
| エラーサニタイズ             | 内部情報（スタックトレース、パス）を返さない | -          | -    |
| IPC_CHANNELS 定数参照        | ハードコード文字列でないこと                 | -          | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク4: テストカバレッジ・品質レビュー

**目的**: テストカバレッジ基準を達成し、テストケースが十分に網羅的であることを確認する

**実行手順**:

1. Phase 9 の品質ゲート結果を読み込む
2. カバレッジ基準との照合を行う
3. テストケースの網羅性を確認する（正常系・異常系・セキュリティ）

**テストカバレッジサマリー**:

| 指標              | 目標 | 実績 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | -    | -    |
| Branch Coverage   | 60%  | -    | -    |
| Function Coverage | 80%  | -    | -    |

**テストケース分類確認**:

| テスト分類         | テストケース数 | 全PASS |
| ------------------ | -------------- | ------ |
| 正常系テスト       | -              | -      |
| 異常系テスト       | -              | -      |
| セキュリティテスト | -              | -      |
| 統合テスト         | -              | -      |

**期待される成果物**:

- `outputs/phase-10/quality-coverage-review.md`

---

### タスク5: IPC契約チェック・P44完全解決確認

**目的**: IPC契約（引数・戻り値・エラー）の3軸で整合性を確認し、P44パターンの完全解決を検証する

**実行手順**:

1. skill:import ハンドラのIPC契約を引数・戻り値・エラーの3軸で確認する
2. UT-FIX-SKILL-IMPORT-INTERFACE-001（引数側修正）の結果と組み合わせて P44 が完全に解決されているか確認する
3. Preload側（skill-api.ts）の呼び出しとハンドラ側の期待が全軸で一致していることを確認する

**IPC契約チェックリスト**:

| 契約軸 | Preload側（呼び出し）                 | Main側（ハンドラ）           | 一致 |
| ------ | ------------------------------------- | ---------------------------- | ---- |
| 引数   | `safeInvoke(SKILL_IMPORT, skillName)` | `(event, skillName: string)` | -    |
| 戻り値 | `Promise<IpcResult<ImportedSkill>>`   | ImportedSkill を返す         | -    |
| エラー | IpcResult の error フィールド         | `{ code, message }` 形式     | -    |

**P44パターン完全解決チェック**:

| 修正項目                      | タスクID                            | ステータス | 結果 |
| ----------------------------- | ----------------------------------- | ---------- | ---- |
| 引数型修正（string化）        | UT-FIX-SKILL-IMPORT-INTERFACE-001   | 完了       | -    |
| 戻り値型修正（ImportedSkill） | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 本タスク   | -    |
| P42準拠3段バリデーション      | 本タスクに含まれる                  | -          | -    |
| P45引数命名統一（skillName）  | UT-FIX-SKILL-IMPORT-INTERFACE-001   | 完了       | -    |

**期待される成果物**:

- `outputs/phase-10/ipc-contract-review.md`

---

### タスク6: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                     | 次のアクション                                      |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・型不整合） | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩リスク）     | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                    | 戻り先                |
| ----------------------------- | --------------------- |
| セキュリティ要件の未充足      | Phase 1（要件定義）   |
| IPCインターフェース設計の問題 | Phase 2（設計）       |
| テスト設計の不足              | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー）  | Phase 5（実装）       |
| コード品質の問題              | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| レビュー観点          | 結果 | 指摘事項 |
| --------------------- | ---- | -------- |
| 機能要件充足          | -    | -        |
| 型定義整合性          | -    | -        |
| セキュリティ          | -    | -        |
| テストカバレッジ/品質 | -    | -        |
| IPC契約/P44完全解決   | -    | -        |
| **最終判定**          | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                                                    | 内容                   |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| IPCハンドラー実装     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | Main Processハンドラー |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                                                     | 型定義                 |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                                                 | Preload API実装        |
| ハンドラーテスト      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | ユニットテスト         |
| 統合テスト            | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | Store統合テスト        |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-gate-result.md`                                                | 品質検証結果           |
| Phase 1要件仕様       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`         | 要件                   |
| Phase 2設計           | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-2-design.md`               | 設計                   |
| Phase 5実装仕様       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md`       | 実装                   |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                  |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------- |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ       |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体構成              |
| スキルIPC仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキルIPC型定義       |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23, P32, P44パターン |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                        | P42, P44, P45参照     |

---

## 成果物

| 成果物                   | パス                                          | 内容                   |
| ------------------------ | --------------------------------------------- | ---------------------- |
| 機能要件レビュー         | `outputs/phase-10/functional-review.md`       | 機能要件充足確認       |
| 型安全性レビュー         | `outputs/phase-10/type-safety-review.md`      | 型整合性確認結果       |
| セキュリティレビュー     | `outputs/phase-10/security-review.md`         | セキュリティ検証結果   |
| 品質・カバレッジレビュー | `outputs/phase-10/quality-coverage-review.md` | コード品質・テスト結果 |
| IPC契約レビュー          | `outputs/phase-10/ipc-contract-review.md`     | IPC契約・P44解決確認   |
| 最終判定                 | `outputs/phase-10/final-review-result.md`     | 判定結果               |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目                    | 基準                                    |
| --------------------------- | --------------------------------------- |
| skillHandlersユニットテスト | 全テストケースPASS                      |
| agentSlice統合テスト        | 全テストケースPASS                      |
| セキュリティテスト          | バリデーション・sender検証確認済み      |
| IPC契約整合                 | 引数・戻り値・エラーの3軸で整合確認済み |

---

## 多角的チェック観点

| 観点         | 確認ポイント                                                                  |
| ------------ | ----------------------------------------------------------------------------- |
| 機能要件充足 | ハンドラが ImportedSkill を返し、Preload/Renderer の期待型と一致              |
| セキュリティ | validateIpcSender, P42準拠3段バリデーション, エラーサニタイズ                 |
| 型安全性     | Main・Preload・Renderer の3レイヤー型整合                                     |
| IPC契約      | 引数・戻り値・エラーの3軸で Preload-Main 間の契約一致                         |
| P44完全解決  | 引数側（UT-FIX-SKILL-IMPORT-INTERFACE-001）+ 戻り値側（本タスク）の両方が修正 |
| テスト網羅性 | 正常系・異常系・セキュリティ・統合テスト全カバー                              |
| コード品質   | 命名規則、重複排除、可読性                                                    |

---

## 完了条件

- [ ] 機能要件レビューでハンドラが ImportedSkill を返すことを確認している
- [ ] 型定義整合性レビューで3レイヤー間の型不整合がない
- [ ] セキュリティレビューで全チェック項目をパスしている
- [ ] テストカバレッジ目標を達成している
- [ ] IPC契約の3軸（引数・戻り値・エラー）が整合している
- [ ] P44パターンの完全解決（引数+戻り値）が確認されている
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-return-type-001/phase-11-manual-testing.md`
