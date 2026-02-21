# Phase 8: リファクタリング — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 8（リファクタリング）                |
| 機能名   | skill:import IPCインターフェース修正 |
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| 作成日   | 2026-02-21                           |

## 目的

TDDのRefactor段階として、Phase 5（実装）で作成したコードの品質を改善する。テストが全件PASSする状態を維持しながら、可読性・保守性・一貫性を向上させる。本タスクは変更箇所が小規模のため、最小限のリファクタリングに留める。

## 実行タスク

- 候補評価: リファクタリング候補の妥当性を評価する
- 実施判断: 影響範囲を踏まえて実施可否を決定する
- 退行確認: テスト全件を再実行して副作用がないことを確認する
- 結果記録: リファクタリングレポートを作成する

## 参照資料

| 資料                                     | パス                                                                            | 用途                       |
| ---------------------------------------- | ------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義                         | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-1-requirements.md`   | 受入基準の再確認           |
| Phase 2 設計                             | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-2-design.md`         | 設計意図との整合確認       |
| Phase 5 実装                             | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-5-implementation.md` | リファクタリング対象の確認 |
| Phase 6 テスト拡充                       | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-6-test-expansion.md` | 境界値/異常系テスト観点    |
| Phase 7 カバレッジ確認                   | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-7-coverage-check.md` | カバレッジ維持の確認       |
| skill:remove修正済みコード               | `apps/desktop/src/main/ipc/skillHandlers.ts`（remove部分）                      | パターン統一の参考         |
| P44: import/removeインターフェース不整合 | `.claude/rules/06-known-pitfalls.md#P44`                                        | 統一パターンの基準         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容                   |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 重複排除・一貫性改善   |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload責務維持   |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill API契約維持      |
| セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | バリデーション退行防止 |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約ドリフト再発防止   |

## 実行手順

### Step 1: リファクタリング候補の評価

以下の3つのリファクタリング候補を評価する:

#### 候補1: skill:importとskill:removeのバリデーションパターン共通化

**内容**: 両ハンドラで重複するP42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）を共通関数 `validateSkillName(skillName: unknown)` として抽出する。

**評価基準**:

- 重複コード量: バリデーション部分は3〜5行程度
- 使用箇所: skill:importとskill:removeの2箇所
- 将来の拡張性: 他のskill系ハンドラ（skill:list, skill:get等）でも同じバリデーションが必要になる可能性がある

**判断**: 2箇所の重複であり、将来の拡張を考慮すると共通化の価値がある。ただし、本タスクのスコープは最小限に留めるため、以下の条件で実施を判断する:

- 共通化により既存テストが壊れない場合 → 実施する
- 共通化により大規模なテスト修正が必要な場合 → 未タスク化して見送る

#### 候補2: エラーメッセージの一貫性確認

**内容**: skill:importとskill:removeのエラーメッセージが同一フォーマットであることを確認する。

**評価基準**:

- skill:import: `"skillName must be a non-empty string"`
- skill:remove: `"skillName must be a non-empty string"`
- 一致している場合は変更不要

**判断**: メッセージが一致していれば変更不要。不一致の場合は統一する。

#### 候補3: コードの可読性改善

**内容**: 変数名・コメントの明確化。

**評価基準**:

- `skillName` パラメータ名が一貫しているか
- P45準拠（引数命名の契約ドリフト防止）が維持されているか
- 不要なコメントや冗長な記述がないか

**判断**: 命名が一貫していれば変更不要。

### Step 2: リファクタリング実施判断

リファクタリング判断マトリクス:

| 候補 | 内容                   | 実施判断 | 理由                           |
| ---- | ---------------------- | -------- | ------------------------------ |
| 1    | バリデーション共通化   | 条件付き | テスト影響が小さい場合のみ実施 |
| 2    | エラーメッセージ一貫性 | 確認のみ | 不一致の場合のみ修正           |
| 3    | 可読性改善             | 確認のみ | 命名不一致の場合のみ修正       |

### Step 3: リファクタリング実行（候補1を実施する場合）

共通バリデーション関数の抽出:

```typescript
/**
 * スキル名の3段バリデーション（P42準拠）
 * 1. 型チェック: typeof !== "string"
 * 2. 空文字列チェック: === ""
 * 3. トリム空文字列チェック: .trim() === ""
 *
 * @param skillName - バリデーション対象の値
 * @returns バリデーション結果。失敗時はエラーオブジェクトを返す
 */
function validateSkillName(
  skillName: unknown,
):
  | { isValid: true; value: string }
  | { isValid: false; error: { code: string; message: string } } {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    return {
      isValid: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      },
    };
  }
  return { isValid: true, value: skillName };
}
```

### Step 4: テスト全件再実行

リファクタリング後、テスト全件を再実行して退行がないことを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

全テストがPASSすることを確認する。1件でも失敗した場合はリファクタリングを取り消す。

### Step 5: リファクタリングレポートの作成

以下の内容を含むレポートを作成する:

- 評価した候補の一覧と判断結果
- 実施したリファクタリングの内容
- テスト再実行結果（全件PASS確認）
- 見送った候補の理由と未タスク化の要否

## 統合テスト連携

- リファクタリングによりskill:removeのテストが影響を受けないことを確認する
- 共通関数を抽出した場合、skill:removeハンドラも同じ関数を使用するように修正する
- 修正後はskill:removeのテストも含めて全件再実行する

## 多角的チェック観点

| 観点                 | 確認内容                                               |
| -------------------- | ------------------------------------------------------ |
| 退行テスト           | リファクタリング後に全テストがPASSするか               |
| カバレッジ維持       | Phase 7で達成したカバレッジが低下していないか          |
| 一貫性               | skill:importとskill:removeのパターンが統一されているか |
| P42準拠              | 3段バリデーションが共通化後も正しく動作するか          |
| P45準拠              | 引数命名（skillName）が全レイヤーで統一されているか    |
| 過剰リファクタリング | 本タスクのスコープを超えた変更がないか                 |

## 成果物

| 成果物                   | パス                                 |
| ------------------------ | ------------------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-log.md` |

## 完了条件

- [ ] リファクタリング候補3件の評価が完了している
- [ ] 実施したリファクタリング内容が記録されている
- [ ] テスト全件再実行でPASSを確認している
- [ ] カバレッジがPhase 7の水準を維持している
- [ ] skill:removeのテストにも退行がないことを確認している
- [ ] 見送った候補について理由が記録されている
- [ ] リファクタリングレポートが作成されている

## 次のPhase

Phase 9（品質検証）へ進む。
