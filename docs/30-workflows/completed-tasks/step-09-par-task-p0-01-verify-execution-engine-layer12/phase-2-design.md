# Phase 2: 設計

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

`SkillCreatorVerificationEngine` のクラス設計、Layer1Validator / Layer2Validator の責務分離、結果集約方式、Facade injection 方式を設計する。

## 実行タスク

- `SkillCreatorVerificationEngine` の public interface を設計する
- Layer1Validator / Layer2Validator の内部構造を設計する
- 結果集約と `RuntimeSkillCreatorVerifyCheck[]` への変換を設計する
- Facade injection point を設計する

## 参照資料

| 資料名         | パス                                                                   | 説明                                |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                                              | Layer 1/2 チェック項目              |
| WorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `buildVerifyDetail()` の現状        |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | injection target                    |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                            | `RuntimeSkillCreatorVerifyCheck` 型 |
| P0 是正パック  | `../p0-verify-manifest-remediation-pack.md`                            | 独立モジュール分離の設計原則        |

### 現行コードアンカー

| ファイル                                                               | 設計観点                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `buildVerifyDetail()` が返す `RuntimeSkillCreatorVerifyDetail` の構造 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | constructor injection パターンの既存踏襲方式                          |
| `packages/shared/src/types/skillCreator.ts`                            | `layer` union type の拡張点                                           |

## 実行手順

### ステップ1: SkillCreatorVerificationEngine の public interface を設計する

```typescript
class SkillCreatorVerificationEngine {
  verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

- `verify()` は Layer 1/2 の全チェックを実行し、結果配列を返す。
- 個別 Layer の実行は内部の validator に委譲する。
- 戻り値は全チェック結果のフラット配列。status 集約は呼び出し側の責務。

### ステップ2: Layer1Validator / Layer2Validator を設計する

**Layer1Validator（構造検証）**:

```typescript
class Layer1Validator {
  validate(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

チェック項目:

- `L1-001`: `SKILL.md` ファイル存在 — severity: error
- `L1-002`: `agents/` ディレクトリ存在 — severity: error
- `L1-003`: `agents/` 配下に少なくとも 1 ファイル存在 — severity: error
- `L1-004`: `references/` ディレクトリ存在 — severity: warning
- `L1-005`: `output-schema.json` 存在 — severity: warning

**Layer2Validator（コンテンツルール検証）**:

```typescript
class Layer2Validator {
  validate(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

チェック項目:

- `L2-001`: `SKILL.md` に `# スキル名` heading 存在 — severity: error
- `L2-002`: `SKILL.md` に `## 概要` セクション存在 — severity: error
- `L2-003`: `SKILL.md` に `## Trigger` セクション存在 — severity: error
- `L2-004`: `SKILL.md` に `## Anchors` セクション存在 — severity: warning
- `L2-005`: agents/ 配下のファイルに `# エージェント名` heading 存在 — severity: error
- `L2-006`: agents/ 配下のファイルに `## 責務` セクション存在 — severity: warning
- `L2-007`: `output-schema.json` が存在する場合の JSON 構文妥当性 — severity: error

### ステップ3: 結果集約を設計する

- 各 validator が `RuntimeSkillCreatorVerifyCheck[]` を返す。
- engine は両 validator の結果を concat して返す。
- 各 check の `id` は `L1-001`、`L2-001` 形式で一意。
- `layer` フィールドは `"layer1"` または `"layer2"` を設定。

### ステップ4: Facade injection を設計する

- `RuntimeSkillCreatorFacade` の constructor に optional parameter として `SkillCreatorVerificationEngine` を追加する。
- `verifySkill(skillDir: string)` メソッドを Facade に追加する。
- Facade は engine の `verify()` を呼び出し、結果を `buildVerifyDetail()` へ渡す橋渡しを行う。

## 統合テスト連携

- Phase 4 で `L1-001`〜`L1-005` と `L2-001`〜`L2-007` を test case へ変換する。
- Phase 6 で空ディレクトリ、破損ファイル、権限不足の edge case を追加する。
- Phase 9 で既存 Layer 3/4 チェックとの型互換性を監査する。

## 成果物

| 成果物                   | パス                                            | 説明                           |
| ------------------------ | ----------------------------------------------- | ------------------------------ |
| 設計書                   | `phase-2-design.md`                             | engine / validator / injection |
| verification engine 設計 | `outputs/phase-2/verification-engine-design.md` | クラス図と責務分離             |
| layer check catalog      | `outputs/phase-2/layer-check-catalog.md`        | L1/L2 チェック項目一覧         |

## 完了条件

- [ ] `SkillCreatorVerificationEngine` の public interface が定義されている
- [ ] Layer1Validator / Layer2Validator のチェック項目が ID 付きで列挙されている
- [ ] 結果集約方式が `RuntimeSkillCreatorVerifyCheck[]` で統一されている
- [ ] Facade injection 方式が既存パターンと整合している
- [ ] **本Phase内の全タスクを100%実行完了**
