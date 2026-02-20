# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-REMOVE-INTERFACE-001                           |
| Phase      | 10                                                          |
| Phase名    | 最終レビュー                                                |
| 前提Phase  | Phase 9（品質検証完了）                                     |
| 後続Phase  | Phase 11（手動テスト）                                      |
| ステータス | 未実施                                                      |
| 作成日     | 2026-02-20                                                  |
| 機能名     | skill:remove IPCハンドラ・Preloadインターフェース不整合修正 |

---

## 目的

多角的な品質・整合性検証を行い、手動テスト（Phase 11）に進む前の最終確認を実施する。7つのレビュー観点で検証し、PASS/MINOR/MAJOR/CRITICALの判定を下す。

## 背景

Phase 9で品質検証が完了した状態で、要件との整合性、セキュリティ、型安全性、インターフェース一貫性を最終確認する。skill:import（P44）と同一アプローチ（アプローチA: ハンドラ修正）であることの整合性も確認する。

---

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 5

| 参照資料             | パス                                                                                 | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 修正対象ハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`（行140-155）                            | skill:removeハンドラ               |
| テストファイル       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行746-819）             | 対応テスト                         |
| Preload API          | `apps/desktop/src/preload/skill-api.ts`（行265）                                     | Preload側呼び出し                  |
| Preload型定義        | `apps/desktop/src/preload/types.ts`                                                  | Preload層の型定義                  |
| 品質レポート         | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-9/quality-report.md`  | Phase 9の検証結果                  |
| リファクタリング記録 | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-8/refactoring-log.md` | Phase 8の変更内容                  |
| P23記録              | `.claude/rules/06-known-pitfalls.md`（P23セクション）                                | API二重定義の型管理                |
| P42記録              | `.claude/rules/06-known-pitfalls.md`（P42セクション）                                | .trim()バリデーション漏れ          |
| P44記録              | `.claude/rules/06-known-pitfalls.md`（P44セクション）                                | skill:importインターフェース不整合 |

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

### Task 1: レビュー実施（7観点）

以下の7つの観点で、修正コードを検証する。各観点ごとにPASS/FAILを判定する。

#### 観点1: セキュリティ

**検証項目**:

1. `validateIpcSender()` の呼び出しが skill:remove ハンドラ内に存在すること
2. `validateIpcSender()` に `getAllowedWindows: () => [mainWindow]` オプションが渡されていること
3. バリデーション失敗時に `toIPCValidationError()` でエラーが変換されていること
4. エラーメッセージに内部情報（ファイルパス、スタックトレース）が含まれていないこと
5. パストラバーサル攻撃に対する防御が SkillService 層に委譲されていること（ハンドラ層はバリデーションのみ）

**判定基準**: 5項目すべてを満たす → PASS

#### 観点2: 型安全性

**検証項目**:

1. `pnpm typecheck` がエラー0件で通過すること（Phase 9で確認済み）
2. ハンドラ引数に `any` 型が使用されていないこと
3. ハンドラの引数型が `skillName: string` であること（オブジェクト形式 `{ skillId: string }` ではないこと）
4. `skillService.removeSkill()` への引数が `string` 型であること

**判定基準**: 4項目すべてを満たす → PASS

#### 観点3: インターフェース一貫性

**検証項目**:

1. skill:removeのアプローチがskill:import（P44修正済み）と同一のアプローチA（ハンドラ修正）であること
2. skill:removeハンドラの引数形式が `skillName: string`（単一文字列）であること
3. Preload側（`skill-api.ts`行265）の `safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName)` と引数形式が一致すること
4. 引数名が `skillName` で統一されていること（`skillId` ではないこと）

**判定基準**: 4項目すべてを満たす → PASS

#### 観点4: P23準拠（API二重定義の型管理）

**検証項目**:

1. `apps/desktop/src/preload/types.ts` の skill remove 関連の型定義を確認する
2. ハンドラの引数型とPreload型定義が一致していること
3. 型定義の変更がある場合、Preload型定義とハンドラ引数の両方が同時に更新されていること

**判定基準**: 型定義の一貫性が確保されている → PASS

#### 観点5: P42準拠（3段バリデーション）

**検証項目**:

1. `typeof skillName !== "string"` による型チェックが存在すること
2. `skillName.trim() === ""` によるトリム空文字列チェックが存在すること
3. 上記2つのチェックが同一の条件式内で行われていること（例: `typeof skillName !== "string" || skillName.trim() === ""`）
4. チェック失敗時に `VALIDATION_ERROR` コードのエラーがthrowされること

**判定基準**: 4項目すべてを満たす → PASS

#### 観点6: テスト品質

**検証項目**:

1. 正常系テスト: 有効なスキル名でのスキル削除が検証されていること
2. 異常系テスト: 文字列以外の引数（null, undefined, 数値, オブジェクト）でバリデーションエラーが検証されていること
3. 異常系テスト: 空文字列 `""` でバリデーションエラーが検証されていること
4. 境界値テスト: スペースのみの文字列 `"   "` でバリデーションエラーが検証されていること（P42準拠）
5. validateIpcSender の呼び出し検証がテストに含まれていること

**判定基準**: 5項目すべてを満たす → PASS

#### 観点7: コード品質

**検証項目**:

1. 不要なコメント（旧引数形式に関するコメント等）が残っていないこと
2. 未使用のimportが存在しないこと
3. 変数名・関数名が命名規則（boolean: `is`/`has`/`can`/`should` プレフィックス）に準拠していること
4. ESLint警告が0件であること（Phase 9で確認済み）

**判定基準**: 4項目すべてを満たす → PASS

### Task 2: レビュー結果記録

**実行手順**:

1. `outputs/phase-10/final-review-result.md` を作成する
2. 以下のテンプレートに結果を記入する:

```markdown
# Phase 10 最終レビュー結果

## レビュー日時

{{YYYY-MM-DD HH:mm}}

## レビュー結果

| 観点                      | 判定      | 詳細               |
| ------------------------- | --------- | ------------------ |
| 1. セキュリティ           | PASS/FAIL | {{検証結果の要約}} |
| 2. 型安全性               | PASS/FAIL | {{検証結果の要約}} |
| 3. インターフェース一貫性 | PASS/FAIL | {{検証結果の要約}} |
| 4. P23準拠                | PASS/FAIL | {{検証結果の要約}} |
| 5. P42準拠                | PASS/FAIL | {{検証結果の要約}} |
| 6. テスト品質             | PASS/FAIL | {{検証結果の要約}} |
| 7. コード品質             | PASS/FAIL | {{検証結果の要約}} |

## 総合判定: {{PASS / MINOR / MAJOR / CRITICAL}}

## 指摘事項（ある場合）

### MINOR指摘

{{指摘内容と未タスク仕様書への変換結果}}

### MAJOR指摘

{{指摘内容と戻り先Phase}}

### CRITICAL指摘

{{指摘内容と戻り先Phase}}
```

### Task 3: MINOR指摘の未タスク仕様書変換（該当する場合のみ）

**前提条件**: 総合判定がMINORの場合にのみ実行する。

**実行手順**:

1. MINOR指摘を1件ずつ未タスク仕様書に変換する
2. 未タスク仕様書の3ステップを完了する（P3準拠）:
   - `unassigned-task/` に指示書を作成する
   - `task-workflow.md` の残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する
3. 変換結果を `outputs/phase-10/final-review-result.md` に追記する

**注意**: MINOR指摘は「機能影響なし」であっても省略不可。全件を未タスク仕様書に変換すること。

---

## 判定基準

| 判定     | 条件                                    | 次のアクション                       |
| -------- | --------------------------------------- | ------------------------------------ |
| PASS     | 全7観点でPASS                           | Phase 11（手動テスト）へ進行         |
| MINOR    | 全観点PASS + 軽微な改善点あり           | 未タスク仕様書に変換後Phase 11へ進行 |
| MAJOR    | 1つ以上の観点でFAIL（設計レベルの問題） | 影響範囲に応じてPhase 1-5へ戻る      |
| CRITICAL | 要件レベルの重大な問題                  | Phase 1へ戻り要件再確認              |

### 戻り先決定基準

| 問題の種類                         | 戻り先                      |
| ---------------------------------- | --------------------------- |
| 要件の問題（スコープ不足等）       | Phase 1（要件定義）         |
| 設計の問題（アプローチ選択誤り等） | Phase 2（設計）             |
| 実装の問題（バリデーション漏れ等） | Phase 5（実装）             |
| テストの問題（テストケース不足等） | Phase 4（テスト作成）       |
| 品質の問題（コード品質不足等）     | Phase 8（リファクタリング） |

---

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物           | パス                                                                                      | 内容                   |
| ---------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-10/final-review-result.md` | レビュー判定・指摘事項 |

---

## 完了条件

- [ ] Task 1: 全7レビュー観点を検証済み
- [ ] Task 2: レビュー結果を `final-review-result.md` に記録済み
- [ ] Task 2: 判定結果（PASS/MINOR/MAJOR/CRITICAL）を記録済み
- [ ] Task 3: MINOR指摘がある場合、全件を未タスク仕様書に変換済み（P3準拠の3ステップ完了）
- [ ] 次Phaseへの進行可否を判定済み

---

## 依存関係

- **前提**: Phase 9（品質検証）が完了していること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR判定の場合）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### レビュー結果

- 総合判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- PASS観点数: {{N}}/7
- 指摘事項数: {{N件}}

### 観点別結果

| 観点                   | 判定     |
| ---------------------- | -------- |
| セキュリティ           | {{PASS}} |
| 型安全性               | {{PASS}} |
| インターフェース一貫性 | {{PASS}} |
| P23準拠                | {{PASS}} |
| P42準拠                | {{PASS}} |
| テスト品質             | {{PASS}} |
| コード品質             | {{PASS}} |

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

`docs/30-workflows/ut-fix-skill-remove-interface/phase-11-manual-test.md`
