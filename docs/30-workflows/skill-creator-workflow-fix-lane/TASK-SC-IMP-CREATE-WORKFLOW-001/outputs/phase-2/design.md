# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 前提Phase  | Phase 1: 要件定義               |
| 後続Phase  | Phase 3: 設計レビューゲート     |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 目的

`runCreateWorkflow` の詳細設計を行い、`resourceLoader.loadAgent` パターンを用いた
構造計画 JSON 生成ロジックと、タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）との接続点を設計する。

---

## 実行タスク

### タスク1: runCreateWorkflow のシグネチャ変更設計

**目的**: `void` から `StructurePlanJson | null` への戻り型変更を設計する

**実行手順**:

1. 現在の `runCreateWorkflow` シグネチャを確認
2. `StructurePlanJson` 型の定義方針を策定
3. `createSkill()` 内での戻り値受け取り設計を検討
4. 型変更による影響範囲を評価

**期待される成果物**:

- シグネチャ変更設計書
- StructurePlanJson 型定義

---

### タスク2: agentファイル読み込みフロー設計

**目的**: `loadAgent` を用いた構造計画 JSON 組み立てフローを設計する

**実行手順**:

1. `collaborative` モードの `runCollaborativeWorkflow` 実装を参照
2. `extract-purpose` / `plan-structure` エージェントの読み込み順序を設計
3. `options.description` の活用方法を設計
4. エージェント出力から構造計画 JSON への変換ロジックを設計

**期待される成果物**:

- agentファイル読み込みフロー図
- StructurePlanJson 組み立てロジック

---

### タスク3: フォールバック設計

**目的**: `loadAgent` 失敗時の安全な継続動作を設計する

**実行手順**:

1. `loadAgent` が例外をスローするケースを列挙
2. `try/catch` による例外捕捉戦略を設計
3. フォールバック時（`null` 返却）の `createSkill()` 継続フローを設計
4. ログ出力設計（デバッグ用）

**期待される成果物**:

- フォールバック設計書

---

### タスク4: タスクAとの接続点設計

**目的**: タスクAが実装する `generate_skill_md.js --plan <json>` との接続インターフェースを設計する

**実行手順**:

1. タスクAの仕様書（TASK-SC-FIX-GENERATE-SKILL-MD-001）を参照
2. `runCreateWorkflow` の戻り値（StructurePlanJson）が `generateSkillMd()` に渡るフローを設計
3. `createSkill()` 内の処理順序（runCreateWorkflow → generateSkillMd）を設計
4. null 時のフォールバック（既存の `ensureSkillMdExists` パスを継続）を確認

**期待される成果物**:

- 接続点設計書
- createSkill() 処理フロー更新案

---

## 設計詳細

### StructurePlanJson 型定義

```typescript
// packages/shared/types または SkillCreatorService.ts 内部型として定義
export interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: string[];
}
```

型定義の配置方針:

- まず `SkillCreatorService.ts` 内部の `type` として定義（スコープ最小化）
- 将来的に `@repo/shared/types` に昇格させる（Phase 8 リファクタリング対象）

---

### runCreateWorkflow 変更後シグネチャ

**変更前**:

```typescript
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void>
```

**変更後**:

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null>
```

---

### runCreateWorkflow 実装設計

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    // AC-1: loadAgent を呼び出す（collaborative パターン踏襲）
    const extractPurposeAgent = await this.resourceLoader.loadAgent(
      "extract-purpose",
    );

    // AC-4: options.description を使用（void options を削除）
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    // 構造計画 JSON を組み立て
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent,   // エージェント出力をそのまま格納（将来LLM呼び出しに置換）
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };

    return structurePlan;
  } catch (error) {
    // AC-3: loadAgent 失敗時はフォールバック（null 返却）
    // createSkill() 後続処理を継続させる
    return null;
  }
}
```

**注意**: 実際のLLM呼び出しはサービス層外に委ねる。現時点では `loadAgent` の返却値（プロンプト文字列）を
`purpose` フィールドに格納するシンプルな実装とする。LLM統合はタスクAの `generate_skill_md.js` 側で行う。

---

### createSkill() の戻り値受け取り設計

`createSkill()` 内の `runCreateWorkflow` 呼び出し箇所を以下のように変更する：

**変更前**:

```typescript
case "create":
  await this.runCreateWorkflow(options);
  break;
```

**変更後**:

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  default:
    break;
}
```

**タスクA完了後の最終形** (Phase 5 実装時):

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    break;
  case "collaborative":
    await this.runCollaborativeWorkflow(options);
    break;
}

const generateResult = await this.generateSkillMd(skillDir, structurePlan);
```

---

### タスクAとの接続点

```
runCreateWorkflow()
  └─ returns StructurePlanJson | null
       └─ createSkill() の local variable が受け取る
            └─ generateSkillMd(skillDir, structurePlan) へ明示引数で handoff
                 └─ generate_skill_md.js（タスクAで修正済み）が受け取る
```

タスクAの修正（TASK-SC-FIX-GENERATE-SKILL-MD-001）:

- `generate_skill_md.js` の引数を `--plan <json>` / `--output <path>` に修正
- `runCreateWorkflow` からの structurePlan をこの `--plan` に渡すことで完全な SKILL.md を生成可能になる

---

## 参照資料

| 参照資料                     | パス                                                                                   | 内容                   |
| ---------------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| SkillCreatorService.ts       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                          | 実装対象               |
| extract-purpose エージェント | `.agents/skills/skill-creator/agents/extract-purpose.md`                               | 目的抽出エージェント   |
| plan-structure エージェント  | `.agents/skills/skill-creator/agents/plan-structure.md`                                | 構造計画エージェント   |
| タスクA仕様書                | `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-FIX-GENERATE-SKILL-MD-001/` | 先行タスク             |
| Phase 1 要件定義             | `outputs/phase-1/requirements.md`                                                      | 受入条件（AC-1〜AC-5） |

---

## 成果物

| 成果物    | パス                        | 内容                 |
| --------- | --------------------------- | -------------------- |
| design.md | `outputs/phase-2/design.md` | 本ファイル（設計書） |

---

## 統合テスト連携

- 統合ポイント: `runCreateWorkflow` → `createSkill()` → `generateSkillMd()` のデータフロー
- 契約: `StructurePlanJson | null` 型の戻り値インターフェース
- タスクA接続: `--plan` 引数の JSON スキーマを `StructurePlanJson` と整合させる

---

## 完了条件

- [x] `runCreateWorkflow` のシグネチャ変更設計が完了している（`void` → `StructurePlanJson | null`）
- [x] `StructurePlanJson` 型定義の方針が確定している
- [x] `loadAgent` フォールバック設計が完了している
- [x] タスクAとの接続点設計が完了している
- [x] `createSkill()` の変更箇所が特定されている

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3: 設計レビューゲート へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`outputs/phase-3/review.md`
