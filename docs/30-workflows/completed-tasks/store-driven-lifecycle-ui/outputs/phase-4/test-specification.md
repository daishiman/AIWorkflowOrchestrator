# Phase 4 テスト仕様書: Store駆動ライフサイクルUI統合

## タスク情報

| 項目       | 値         |
| ---------- | ---------- |
| タスクID   | TASK-10A-F |
| Phase      | 4          |
| テスト総数 | 73         |
| 新規テスト | 21         |
| 更新テスト | 52         |
| 結果       | 全パス     |

## テスト対象

### 対象ファイル

| ファイル              | 変更種別               | テストファイル                                                                         |
| --------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| SkillCreateWizard.tsx | Store action経由に移行 | SkillCreateWizard.test.tsx (更新), SkillCreateWizard.store-integration.test.tsx (新規) |
| useSkillAnalysis.ts   | Store action経由に移行 | SkillAnalysisView.test.tsx (更新), SkillAnalysisView.store-integration.test.tsx (新規) |

### 排除した直接IPC呼び出し

| ファイル              | 旧呼び出し                                                        | 新呼び出し                                                   |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| SkillCreateWizard.tsx | `window.electronAPI.skill.create({description, options})`         | `createSkill(description, options)` (store action)           |
| useSkillAnalysis.ts   | `window.electronAPI.skill.analyze(skillName)`                     | `analyzeSkill(skillName)` (store action)                     |
| useSkillAnalysis.ts   | `window.electronAPI.skill.applyImprovements(skillName, selected)` | `applySkillImprovements(skillName, selected)` (store action) |
| useSkillAnalysis.ts   | `window.electronAPI.skill.autoImprove(skillName)`                 | `autoImproveSkill(skillName)` (store action)                 |

## テスト方針

### モック戦略: Store セレクタモック方式

`vi.mock("../../../store")` で Store セレクタをモックし、以下の変数でState/Actionを制御する。

```typescript
// State モック変数
let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;

// Action モック関数
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockCreateSkill = vi.fn();
```

### Store統合テスト固有の検証

Store統合テスト (.store-integration.test.tsx) では、`window.electronAPI` のスパイを設置し、store action が呼ばれて直接IPC呼び出しが発生しないことを保証する。

```typescript
// window.electronAPI スパイ
const spySkillCreate = vi.fn();
(window as Record<string, unknown>).electronAPI = {
  skill: { create: spySkillCreate },
};
// 検証: store action呼び出し + electronAPI未呼び出し
expect(mockCreateSkill).toHaveBeenCalledTimes(1);
expect(spySkillCreate).not.toHaveBeenCalled();
```

### 準拠ルール

- P31対策: 個別セレクタで取得（合成Hook使用禁止）
- P39対策: fireEvent使用、userEvent禁止（happy-dom環境）
- P40対策: テスト実行は apps/desktop ディレクトリから
- P9対策: beforeEachで状態リセット
- P48対策: スカラー値セレクタのみ使用、useShallow不要
