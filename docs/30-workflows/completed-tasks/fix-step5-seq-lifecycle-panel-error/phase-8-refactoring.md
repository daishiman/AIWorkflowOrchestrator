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
2. 定数化の検討: `'handoff'` リテラルを定数として管理するか、型から参照するか判断する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 1 の成果物 spec-extraction-map.md、Phase 2 の成果物 design-topology.md、Phase 5 の修正結果、Phase 6 の拡張テスト結果、Phase 7 のカバレッジ確認結果を前提に、リファクタリング方針を決める。

## 実行手順

### ステップ 1: コメント改善

**修正後コードのコメント確認**:

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  if (snapshot.currentPhase !== "handoff") {
    setWorkflowError(null); // 'handoff' 以外のフェーズでのみエラーをクリア
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

コメント `// 'handoff' 以外のフェーズでのみエラーをクリア` は意図を明示できているため、基本的に追加変更不要。

以下のより詳しいコメントに変更する案もある:

```typescript
// currentPhase: 'handoff' 時はエラーを保持する（ユーザーにエラーを表示し続けるため）
if (snapshot.currentPhase !== "handoff") {
  setWorkflowError(null);
}
```

### ステップ 2: 定数化の検討

`'handoff'` リテラルを直接使用するか、型から参照するかを判断する。

#### 選択肢 A: リテラルをそのまま使用（推奨）

```typescript
if (snapshot.currentPhase !== "handoff") {
  setWorkflowError(null);
}
```

**メリット**: シンプル、追加 import 不要
**デメリット**: `'handoff'` の定義が型定義と乖離した場合に気づきにくい

#### 選択肢 B: 型定義から参照する

```typescript
// SkillCreatorWorkflowPhase 型のリテラルを使用する場合
import type { SkillCreatorWorkflowPhase } from "@/shared/types/skill-workflow";

const HANDOFF_PHASE: SkillCreatorWorkflowPhase = "handoff";

if (snapshot.currentPhase !== HANDOFF_PHASE) {
  setWorkflowError(null);
}
```

**メリット**: 型安全性が高い（`'handoff'` が `SkillCreatorWorkflowPhase` に含まれることをコンパイル時に検証）
**デメリット**: 定数導入で複雑度が増す

#### 推奨判定

本タスクは small（2-3 行の条件分岐追加）であるため、**選択肢 A のリテラル直接使用を推奨**する。

理由:

- `SkillCreatorWorkflowPhase` 型が `'handoff'` を含む設計は安定しており変更リスクが低い
- 定数化による恩恵よりも、コードのシンプルさを優先する
- `snapshot.currentPhase` の型が `SkillCreatorWorkflowPhase` であれば、TypeScript が不正な文字列との比較を警告する

### ステップ 3: 変更の最小性確認

リファクタリングで新たなロジック変更が発生していないことを確認する:

```bash
# 変更差分を確認する
git diff apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

変更は `setWorkflowError(null)` を `if` ブロックで囲む 2 行追加のみであること。

## 多角的チェック観点

- コメント変更がコードの意図を正確に説明しているか確認したか
- 定数化の選択肢 B を採用する場合、`SkillCreatorWorkflowPhase` 型の import が既に存在するか確認したか（不要な import 追加を避ける）
- リファクタリングでテストが壊れていないことを確認したか

## 成果物

| 成果物               | パス                                   | 説明                                     |
| -------------------- | -------------------------------------- | ---------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-notes.md` | 定数化判断結果、コメント改善の有無の記録 |

## 完了条件

- [ ] コメントの改善要否が検討されている
- [ ] 定数化（`'handoff'` リテラルの扱い）の方針が決定されている（採用/不採用の理由も記録）
- [ ] リファクタリング後もテストが全 PASS している
- [ ] リファクタリングによる新たなロジック変更が発生していない

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-8/refactoring-notes.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 9: 品質保証 へ進む
