# 要件定義書 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 調査結果

### 呼び出しサイト

- **ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- **対象行**: 126行目 `void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）`
- **前後コード**:
  ```typescript
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  ...
  void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
  ```

### 型定義

- `structurePlan` の型: `StructurePlanJson | null`
- `StructurePlanJson` interface（35〜43行）:
  ```typescript
  interface StructurePlanJson {
    skillName: string;
    description: string;
    purpose: string;
    features: string[];
    agents: string[];
    triggers?: string[];
    anchors?: string[];
  }
  ```

### `generateSkillMd` の現状

- **現状**: `generateSkillMd` という private メソッドは存在しない
- SKILL.md 生成はインライン処理（173〜218行）として実装されている
- インライン処理は `structurePlan` を使用せず、独自の `plan` オブジェクトを生成している

## 機能要件

| ID   | 要件                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| FR-1 | `structurePlan` が non-null の場合、`generateSkillMd(skillDir, structurePlan)` を呼ぶ             |
| FR-2 | `structurePlan` が null の場合（create モード）、エラーログを出力して SKILL.md 生成をスキップする |
| FR-3 | `generateSkillMd(skillDir, structurePlan)` private メソッドを追加する                             |
| FR-4 | `generateSkillMd` は `structurePlan` のデータを使って `generate_skill_md.js` を呼ぶ               |
| FR-5 | `generateSkillMd` が成功した場合、既存のインラインSKILL.md生成処理はスキップする                  |

## 非機能要件

| ID    | 要件                                                             |
| ----- | ---------------------------------------------------------------- |
| NFR-1 | 型安全: TypeScript コンパイルエラーなし                          |
| NFR-2 | 既存テスト全件 PASS を維持                                       |
| NFR-3 | 統合テスト追加: runCreateWorkflow → generateSkillMd パイプライン |
| NFR-4 | null パスのカバレッジ 100%                                       |
| NFR-5 | create 以外のモードには影響を与えない                            |
