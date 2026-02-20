# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-REMOVE-INTERFACE-001                           |
| Phase      | 8                                                           |
| Phase名    | リファクタリング                                            |
| 前提Phase  | Phase 7（カバレッジ確認完了）                               |
| 後続Phase  | Phase 9（品質検証）                                         |
| ステータス | 未実施                                                      |
| 作成日     | 2026-02-20                                                  |
| 機能名     | skill:remove IPCハンドラ・Preloadインターフェース不整合修正 |

---

## 目的

TDD Refactor フェーズとして、Phase 5で実装したskill:removeハンドラ修正コードの内部品質を改善する。テストを壊さずに、コードの一貫性・保守性を向上させる。

## 背景

Phase 5でskill:removeハンドラの引数を `{ skillId: string }` から `skillName: string` に変更し、P42準拠の3段バリデーションを適用した。同一パターンの修正がskill:import（P44で修正済み）にも存在するため、バリデーションロジックの共通化可否を判断し、コード品質を改善する。

---

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7

| 参照資料              | パス                                                                                 | 内容                               |
| --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 修正対象ハンドラ      | `apps/desktop/src/main/ipc/skillHandlers.ts`（行140-155）                            | skill:removeハンドラ               |
| テストファイル        | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行746-819）             | 対応テスト                         |
| skill:importハンドラ  | `apps/desktop/src/main/ipc/skillHandlers.ts`（行120-138）                            | 同一パターン修正済みハンドラ       |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`（行265）                                     | Preload側呼び出し                  |
| P42記録               | `.claude/rules/06-known-pitfalls.md`（P42セクション）                                | 3段バリデーション標準              |
| P44記録               | `.claude/rules/06-known-pitfalls.md`（P44セクション）                                | skill:importインターフェース不整合 |
| Phase 7カバレッジ結果 | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-7/coverage-report.md` | カバレッジ基準充足確認             |

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

### Task 1: バリデーションロジック共通化の可否判断

**目的**: skill:importとskill:removeで同一の3段バリデーションパターンが存在するため、ヘルパー関数への抽出が有効かを判断する。

**判断基準**:

- 同一バリデーションパターンが **2箇所以上** で使用されている場合 → 共通化する
- **1箇所のみ** の場合 → 共通化しない

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開く
2. skill:importハンドラ（行120-138）のバリデーションロジックを確認する
3. skill:removeハンドラ（行140-155）のバリデーションロジックを確認する
4. 以下の観点で共通化の可否を判断する:
   - 両ハンドラのバリデーションパターンが「typeof チェック → 空文字列チェック → trim空文字列チェック」の3段構成で同一か
   - 引数名が異なるだけで（skillName vs skillName）ロジックは同一か
   - エラーメッセージが統一可能か
5. 判断結果を `outputs/phase-8/refactoring-log.md` に記録する

**共通化する場合の実装**:

```typescript
// skillHandlers.ts 内にヘルパー関数を追加
function validateStringArg(
  value: unknown,
  argName: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
}
```

**共通化しない場合**: 現状のインラインバリデーションを維持し、理由を記録する。

### Task 2: エラーメッセージの一貫性確認

**目的**: skill:\*ハンドラ全体でエラーメッセージの形式を統一する。

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開く
2. 以下のハンドラのバリデーションエラーメッセージを一覧化する:
   - `skill:import` のエラーメッセージ
   - `skill:remove` のエラーメッセージ
   - `skill:get-detail` のエラーメッセージ
   - `skill:get-content` のエラーメッセージ
   - `skill:save` のエラーメッセージ
3. メッセージ形式が統一されているか確認する（例: `"${argName} must be a non-empty string"` の形式）
4. 不統一がある場合:
   - 他のハンドラへの変更は本タスクのスコープ外（新規未タスクとして記録）
   - skill:removeのメッセージのみ修正対象
5. 確認結果を `outputs/phase-8/refactoring-log.md` に記録する

### Task 3: 不要コードの確認・削除

**目的**: 修正に伴い不要となったコード（コメント、未使用import）を確認・削除する。

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のskill:removeハンドラ周辺を確認する
2. 以下の観点でチェックする:
   - 不要なコメント（例: 旧引数形式に関するコメント）がないか
   - 未使用のimportがないか
   - 不要な型定義が残っていないか
3. 不要なコードがあれば削除する
4. 変更内容を `outputs/phase-8/refactoring-log.md` に記録する

### Task 4: リファクタリング後のテスト実行

**目的**: リファクタリングによりテストが壊れていないことを確認する。

**実行手順**:

```bash
# skillHandlersテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# Preloadテスト実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api

# TypeScript型チェック
pnpm typecheck
```

**判定基準**:

- 全テストがPASSすること
- 新規テストの追加・変更がないこと（リファクタリングフェーズのため）
- TypeScript型エラーが0件であること

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

| 成果物               | パス                                                                                 | 内容                             |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| リファクタリング記録 | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-8/refactoring-log.md` | 改善内容・共通化判断結果・変更点 |

---

## 完了条件

- [ ] Task 1: バリデーションロジック共通化の可否を判断し、結果を記録済み
- [ ] Task 2: エラーメッセージの一貫性を確認し、結果を記録済み
- [ ] Task 3: 不要コードの確認・削除を完了済み
- [ ] Task 4: リファクタリング後もテスト全件PASS
- [ ] Task 4: `pnpm typecheck` がエラー0件で通過
- [ ] Task 4: 新規テストの追加・変更がないこと（リファクタリングのため）
- [ ] リファクタリング記録（`refactoring-log.md`）が作成済み

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質検証）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### リファクタリング内容

- 共通化判断: {{共通化した / 共通化しなかった（理由）}}
- エラーメッセージ統一: {{統一済み / 不統一箇所を記録}}
- 不要コード削除: {{削除件数}}

### テスト結果

- skillHandlersテスト: {{PASS / FAIL（件数）}}
- skill-apiテスト: {{PASS / FAIL（件数）}}
- TypeScript型チェック: {{エラー0件 / エラーN件}}

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

`docs/30-workflows/ut-fix-skill-remove-interface/phase-9-quality-assurance.md`
