# 要件定義書: TASK-FIX-1-1-TYPE-ALIGNMENT

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日     | 2026-02-04                  |
| 作成者     | Claude Code                 |
| バージョン | 1.0                         |

---

## 1. 背景

無限ループ問題の調査中に、スキル関連の型定義が複数箇所で重複・矛盾していることが発見された。

### 1.1 発見された矛盾

| 型名                     | skill.ts                                          | skill-execution.ts                    | 問題               |
| ------------------------ | ------------------------------------------------- | ------------------------------------- | ------------------ |
| `SkillStreamMessage`     | Discriminated Union（5種類）                      | Interface形式（4種類）                | 構造が完全に異なる |
| `SkillStreamMessageType` | `assistant\|tool_use\|tool_result\|status\|error` | `text\|tool_use\|error\|complete`     | 値が異なる         |
| `SkillExecutionRequest`  | `skillName`, `prompt`, `workingDirectory`         | `prompt`, `skillId`, `skillName`, etc | フィールドが異なる |
| `SkillExecutionResponse` | 一貫した定義                                      | `error`フィールドの型が異なる         | 互換性なし         |

---

## 2. 機能要件（FR）

| ID    | 要件                              | 詳細                                                                       | 優先度 |
| ----- | --------------------------------- | -------------------------------------------------------------------------- | ------ |
| FR-01 | `SkillStreamMessage`が単一定義    | `skill.ts`のみに定義が存在し、Discriminated Union形式を維持                | 高     |
| FR-02 | `SkillExecutionRequest`が単一定義 | `skill.ts`のみに定義が存在し、必要なフィールドを統合                       | 高     |
| FR-03 | 呼び出し元が正しいimportを使用    | すべての呼び出し元が`@repo/shared`または`@repo/shared/types/skill`から取得 | 中     |
| FR-04 | 仕様書準拠の型構造                | `specification.md §5.1`の型定義と一致                                      | 中     |

---

## 3. 非機能要件（NFR）

| ID     | 要件               | 詳細                     | 優先度 |
| ------ | ------------------ | ------------------------ | ------ |
| NFR-01 | TypeScript型安全性 | `pnpm typecheck` エラー0 | 高     |
| NFR-02 | 既存テストの維持   | 全既存テストがPASS       | 高     |
| NFR-03 | 後方互換性         | ランタイムエラーなし     | 低     |
| NFR-04 | コード品質         | ESLint/Prettierエラー0   | 中     |

---

## 4. 統合テスト連携要件

| 接続要件カテゴリ | 記載内容                                        |
| ---------------- | ----------------------------------------------- |
| IPC通信          | Main-Renderer間のSkillStreamMessage型の一貫性   |
| 状態管理         | Zustand storeでのSkillExecutionStatus型の整合性 |
| SDK連携          | Claude Agent SDKとの型互換性維持                |

---

## 5. アーキテクチャ層別要件

| 層                     | 確認観点                            |
| ---------------------- | ----------------------------------- |
| Shared（@repo/shared） | 型定義の単一化、エクスポートの整理  |
| Main Process           | IPC ハンドラーでの型使用箇所        |
| Renderer Process       | コンポーネント・Hooksでの型使用箇所 |
| IPC通信                | チャンネル型定義の整合性            |

---

## 6. 影響範囲

### 6.1 修正対象ファイル（実装コード）

| ファイル                                                                | 変更内容                   |
| ----------------------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/skill-execution.ts`                          | 削除（型をskill.tsへ移行） |
| `packages/shared/src/types/skill.ts`                                    | 型追加・統合               |
| `packages/shared/src/types/index.ts`                                    | re-export整理              |
| `apps/desktop/src/preload/skill-api.ts`                                 | import修正                 |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | import修正                 |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | import修正                 |

### 6.2 修正対象ファイル（テストコード）

| ファイル                                                                            | 変更内容   |
| ----------------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`               | import修正 |
| `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.*.tsx` | import修正 |
| `apps/desktop/src/__tests__/skill-stream-integration.test.ts`                       | import修正 |

---

## 7. 制約事項

1. **新機能追加なし**: 本タスクは型統合のみ、新機能は追加しない
2. **ビジネスロジック変更なし**: 動作に影響を与えない
3. **UI変更なし**: ユーザーインターフェースは変更しない

---

## 8. 完了条件

- [x] 全ての型定義矛盾が特定されている
- [x] 各要件に受け入れ基準がある（acceptance-criteria.md参照）
- [x] FR/NFRが分類されている
- [x] 型棚卸しリストが作成されている（type-inventory.md参照）
- [x] 接続要件（IPC/状態管理/SDK）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
