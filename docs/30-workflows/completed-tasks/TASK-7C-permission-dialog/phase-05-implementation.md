# Phase 5: 実装（TDD: Green） - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 5                                       |
| Phase名   | 実装                                    |
| カテゴリ  | TDD-Green                               |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 4（テスト作成）                   |
| 次Phase   | Phase 6（テスト拡充）                   |
| TDD状態   | Green（テスト通過を目指す）             |
| 作成日    | 2026-01-30                              |

## 目的

Phase 4で作成したテストを全て通過させるため、PermissionDialogコンポーネントとヘルパー関数を実装する。最小限の実装でテストを通すことを優先する。

## 実行タスク

### Task 1: PermissionDialog コンポーネントの実装

**目的**: メインコンポーネントファイルを作成する

**手順**:

1. `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` を作成する
2. Phase 2の設計に基づき、以下の構造で実装する:

```typescript
// apps/desktop/src/renderer/components/skill/PermissionDialog.tsx

import React, { useState, useEffect, useRef, useId } from "react";
import { useAppStore } from "../../store";

export const PermissionDialog: React.FC = () => {
  const { pendingPermission, respondToSkillPermission } = useAppStore();
  const [rememberChoice, setRememberChoice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const approveButtonRef = useRef<HTMLButtonElement>(null);
  const uniqueId = useId();

  // FR-001: pendingPermission が null の場合は表示しない
  if (!pendingPermission) return null;

  // アクションハンドラ
  const handleApprove = () => {
    respondToSkillPermission(true, rememberChoice);
    setRememberChoice(false);
  };

  const handleApproveOnce = () => {
    respondToSkillPermission(true, false);
    setRememberChoice(false);
  };

  const handleDeny = () => {
    respondToSkillPermission(false, false);
    setRememberChoice(false);
  };

  // NFR-005: Escapeキーハンドリング
  // NFR-004: フォーカストラップ
  // （キーボードイベントの実装）

  return (
    // NFR-009: オーバーレイ
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uniqueId}-title`}
        aria-describedby={`${uniqueId}-description`}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* ヘッダー */}
        {/* コンテンツ（ツール情報、引数、理由、チェックボックス） */}
        {/* フッター（拒否、1回許可、許可ボタン） */}
      </div>
    </div>
  );
};
```

3. **実装対象の全セクション**:

| セクション       | 対応要件       | 実装内容                               |
| ---------------- | -------------- | -------------------------------------- |
| ヘッダー         | FR-014         | 警告アイコン + タイトル + 閉じるボタン |
| 説明テキスト     | FR-002         | 「エージェントが以下の操作を...」      |
| ツール情報       | FR-003         | ツール名のバッジ表示                   |
| 引数表示         | FR-004〜FR-007 | formatArgs による適切なフォーマット    |
| 理由表示         | FR-008         | 条件付きレンダリング                   |
| チェックボックス | FR-012, FR-013 | rememberChoice 状態管理                |
| 拒否ボタン       | FR-009         | handleDeny 呼び出し                    |
| 1回許可ボタン    | FR-010         | handleApproveOnce 呼び出し             |
| 許可ボタン       | FR-011         | handleApprove 呼び出し                 |

### Task 2: formatArgs ヘルパー関数の実装

**目的**: ツール引数のフォーマット関数を実装する

**手順**:

1. `PermissionDialog.tsx` 内にヘルパー関数を実装する:

```typescript
function formatArgs(args: Record<string, unknown>): string {
  // FR-005: Bashコマンドの場合
  if (args.command && typeof args.command === "string") {
    return args.command;
  }

  // FR-006: ファイルパスの場合
  if (args.path && typeof args.path === "string") {
    return args.path;
  }

  // FR-007: その他はJSON
  return JSON.stringify(args, null, 2);
}
```

### Task 3: アクセシビリティ実装

**目的**: WCAG 2.1 AA準拠のアクセシビリティ機能を実装する

**手順**:

1. ARIA属性を設定する（NFR-001〜NFR-003）
2. フォーカストラップを実装する（NFR-004）:
   - ダイアログ表示時に「許可」ボタンへ初期フォーカス
   - Tab/Shift+Tab でダイアログ内要素を循環
3. Escapeキーハンドラを実装する（NFR-005）:
   - `useEffect` でキーボードイベントリスナーを設定
   - Escape → `handleDeny()` 呼び出し
4. `useId()` フックでユニークID生成（`aria-labelledby`/`aria-describedby`用）

### Task 4: エクスポートの追加

**目的**: コンポーネントのエクスポートを設定する

**手順**:

1. `apps/desktop/src/renderer/components/skill/index.ts` を確認する
2. `PermissionDialog` のエクスポートを追加する:

```typescript
// 既存のエクスポートに追加
export { PermissionDialog } from "./PermissionDialog";
```

### Task 5: テスト実行（全通過の確認）

**目的**: Phase 4で作成した全テストが通過することを確認する（TDD Green確認）

**手順**:

1. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```
2. 全テストが PASS であることを確認する
3. 失敗するテストがある場合は、実装を修正して再実行する
4. `pnpm --filter @repo/desktop typecheck` で型チェックを実行する
5. `pnpm --filter @repo/desktop lint` でリントチェックを実行する

## Electron層別実装ガイド

| 層               | 本タスクでの実装内容                                           |
| ---------------- | -------------------------------------------------------------- |
| Renderer Process | PermissionDialog コンポーネント（React + Tailwind CSS）        |
| Store (Zustand)  | `useAppStore()` からの状態取得とアクション呼び出し（既存利用） |
| IPC通信          | 直接関与なし（Store経由で間接的に利用）                        |

## 統合テスト連携

| カテゴリ     | 確認内容                                                    |
| ------------ | ----------------------------------------------------------- |
| 状態同期     | `useAppStore()` の `pendingPermission` が正しく取得される   |
| データフロー | `respondToSkillPermission` 呼び出しが正しい引数で実行される |
| エラー処理   | `pendingPermission` が null の場合に安全に null を返す      |

## 成果物

| 成果物名                        | パス                                                              | タイプ   |
| ------------------------------- | ----------------------------------------------------------------- | -------- |
| PermissionDialog コンポーネント | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` | code     |
| エクスポート更新                | `apps/desktop/src/renderer/components/skill/index.ts`             | code     |
| 実装サマリー                    | `outputs/phase-5/implementation-summary.md`                       | document |

## 完了条件

- [ ] `PermissionDialog.tsx` が作成されている
- [ ] `formatArgs` ヘルパー関数が実装されている
- [ ] ARIA属性（role, aria-modal, aria-labelledby, aria-describedby）が設定されている
- [ ] フォーカストラップが実装されている
- [ ] Escapeキーハンドラが実装されている
- [ ] `skill/index.ts` にエクスポートが追加されている
- [ ] Phase 4の全テストがPASSしている
- [ ] TypeScriptの型チェックが通過している
- [ ] ESLintのリントチェックが通過している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 5
```

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-06-test-enhancement.md`

## 参照資料

| 参照資料             | パス                                                                   | 説明                   |
| -------------------- | ---------------------------------------------------------------------- | ---------------------- |
| Phase 2成果物        | `outputs/phase-2/`                                                     | 設計書                 |
| Phase 4成果物        | `outputs/phase-4/`                                                     | テスト仕様書           |
| タスク定義           | `../task-7c-permission-dialog.md`                                      | 実装詳細               |
| 既存PermissionDialog | `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 参考実装               |
| SkillSlice           | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                 | Store定義              |
| 共有型定義           | `packages/shared/src/types/skill.ts`                                   | SkillPermissionRequest |
