# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 8                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.25h                              |

## 目的

コメントの改善と定数化の検討を行い、コードの可読性・保守性を向上させる。

## 実行タスク

1. コメント改善: `if` ブロックの意図を明示するコメントの確認・改善
2. 定数化の検討: `'failed'` リテラルを定数として管理するか、型から参照するか判断する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: コメント改善

**修正後コードのコメント確認**:

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  if (snapshot.phase !== "failed") {
    setWorkflowError(null); // 'failed' 以外のフェーズでのみエラーをクリア
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

コメント `// 'failed' 以外のフェーズでのみエラーをクリア` は意図を明示できているため、基本的に追加変更不要。

必要に応じて以下のより詳しいコメントへの変更も検討する:

```typescript
// phase: 'failed' 時はエラーを保持する（ユーザーにエラーを表示し続けるため）
if (snapshot.phase !== "failed") {
  setWorkflowError(null);
}
```

### ステップ 2: 定数化の検討

`'failed'` リテラルを直接使用するか、型から参照するかを判断する。

#### 選択肢 A: リテラルをそのまま使用（推奨）

```typescript
if (snapshot.phase !== "failed") {
  setWorkflowError(null);
}
```

**メリット**: シンプル、追加 import 不要
**デメリット**: `'failed'` の定義が型定義と乖離した場合に気づきにくい

#### 選択肢 B: 型定義から参照する

```typescript
// WorkflowPhase 型のリテラルを使用する場合
import type { WorkflowPhase } from "@/shared/types/skill-workflow";

const FAILED_PHASE: WorkflowPhase = "failed";

if (snapshot.phase !== FAILED_PHASE) {
  setWorkflowError(null);
}
```

**メリット**: 型安全性が高い（`'failed'` が `WorkflowPhase` に含まれることをコンパイル時に検証）
**デメリット**: 定数導入で複雑度が増す

#### 推奨判定

本タスクは small（2-3 行の条件分岐追加）であるため、**選択肢 A のリテラル直接使用を推奨**する。

理由:

- `WorkflowPhase` 型が `'failed'` を含む設計は安定しており変更リスクが低い
- 定数化による恩恵よりも、コードのシンプルさを優先する
- `snapshot.phase` の型が `WorkflowPhase` であれば、TypeScript が不正な文字列との比較を警告する

### ステップ 3: 変更の最小性確認

リファクタリングで新たなロジック変更が発生していないことを確認する:

```bash
# 変更差分を確認する
git diff apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

変更は `setWorkflowError(null)` を `if` ブロックで囲む 2 行追加のみであること。

## 多角的チェック観点

- コメント変更がコードの意図を正確に説明しているか確認したか
- 定数化の選択肢 B を採用する場合、`WorkflowPhase` 型の import が既に存在するか確認したか（不要な import 追加を避ける）
- リファクタリングでテストが壊れていないことを確認したか

## 成果物

| 成果物               | パス                                   | 説明                                     |
| -------------------- | -------------------------------------- | ---------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-notes.md` | 定数化判断結果、コメント改善の有無の記録 |

## 完了条件

- [ ] コメントの改善要否が検討されている
- [ ] 定数化（`'failed'` リテラルの扱い）の方針が決定されている（採用/不採用の理由も記録）
- [ ] リファクタリング後もテストが全 PASS している
- [ ] リファクタリングによる新たなロジック変更が発生していない

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-8/refactoring-notes.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 9: 品質保証 へ進む
