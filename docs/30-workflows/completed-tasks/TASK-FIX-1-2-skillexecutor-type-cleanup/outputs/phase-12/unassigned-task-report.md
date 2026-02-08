# TASK-FIX-1-2: 未タスクレポート

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-FIX-1-2-skillexecutor-type-cleanup |
| Phase    | 12 - ドキュメント作成                   |
| 作成日   | 2026-02-08                              |
| 検出件数 | 3件                                     |

---

## 検出された未タスク

### 1. TASK-FIX-1-3: SkillExecutionRequest/Response の型統一

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-FIX-1-3                            |
| タスク名 | SkillExecutionRequest/Response の型統一 |
| 優先度   | 中                                      |
| 発見元   | TASK-FIX-1-2 Phase 10 レビュー          |
| 発見理由 | SkillExecutor.ts に独自定義が残存       |

#### 説明

`SkillExecutionRequest` と `SkillExecutionResponse` は SkillExecutor.ts に独自定義が残っています。
`@repo/shared/src/types/skill.ts` にも同名の型が存在するため、統一が必要です。

#### 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `packages/shared/src/types/skill.ts`

#### 影響範囲

- リトライ設定（`retryConfig`）の扱い
- IPC ハンドラーでの型整合性

---

### 2. TASK-FIX-1-4: SkillStreamMessage の Discriminated Union 移行

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-FIX-1-4                                   |
| タスク名 | SkillStreamMessage の Discriminated Union 移行 |
| 優先度   | 中                                             |
| 発見元   | TASK-FIX-1-2 Phase 10 レビュー                 |
| 発見理由 | 型安全性向上の余地                             |

#### 説明

現在の `SkillStreamMessage` は `type` フィールドで分岐するが、各 `type` に応じた `content` の型が明確ではありません。
Discriminated Union パターンを適用することで、型安全性を向上できます。

#### 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `packages/shared/src/types/skill.ts`

#### 期待される改善

```typescript
// 現状
interface SkillStreamMessage {
  type: SkillStreamMessageType;
  content: string; // 全タイプで string
}

// 改善後（Discriminated Union）
type SkillStreamMessage =
  | { type: "text"; content: string }
  | { type: "tool_use"; content: ToolUseContent }
  | { type: "error"; content: ErrorContent };
// ...
```

---

### 3. TASK-FIX-1-5: SkillMetadata の型統一

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | TASK-FIX-1-5                   |
| タスク名 | SkillMetadata の型統一         |
| 優先度   | 低                             |
| 発見元   | TASK-FIX-1-2 Phase 10 レビュー |
| 発見理由 | 複数箇所で類似定義             |

#### 説明

`SkillMetadata` は SkillExecutor.ts で `Omit<Skill, "lastModified">` として定義されています。
`@repo/shared/src/types/skill.ts` にも `SkillMetadata` の定義が存在するため、統一が望ましい。

#### 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `packages/shared/src/types/skill.ts`

#### 注意事項

- 両者の定義内容に差異がないか確認が必要
- 影響範囲が広い可能性あり

---

## 対応方針

| タスクID     | 推奨対応時期 | 備考                                  |
| ------------ | ------------ | ------------------------------------- |
| TASK-FIX-1-3 | 次スプリント | SkillExecutor関連の変更と合わせて実施 |
| TASK-FIX-1-4 | 次スプリント | 型安全性向上のため優先度高め          |
| TASK-FIX-1-5 | 余裕時       | 影響範囲調査後に判断                  |

---

## 関連ドキュメント

- Phase 10 レビュー結果: `outputs/phase-10/final-review-result.md`
- 設計ドキュメント: `phase-02-design.md`
