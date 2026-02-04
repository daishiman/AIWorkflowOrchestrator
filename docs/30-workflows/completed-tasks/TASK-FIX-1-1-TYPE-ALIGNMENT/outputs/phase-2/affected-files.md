# 影響ファイル一覧: TASK-FIX-1-1-TYPE-ALIGNMENT

## 1. 型定義ファイル（packages/shared）

| ファイル                       | 変更種別 | 変更内容                     |
| ------------------------------ | -------- | ---------------------------- |
| `src/types/skill.ts`           | 修正     | 移行対象の型追加             |
| `src/types/skill-execution.ts` | 削除     | 全内容をskill.tsへ移行後削除 |
| `src/types/index.ts`           | 修正     | re-export整理                |

---

## 2. 実装ファイル（apps/desktop）

### 2.1 Preload

| ファイル                   | 変更種別 | import修正内容                                                    |
| -------------------------- | -------- | ----------------------------------------------------------------- |
| `src/preload/skill-api.ts` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

### 2.2 Renderer Hooks

| ファイル                                  | 変更種別 | import修正内容                                                    |
| ----------------------------------------- | -------- | ----------------------------------------------------------------- |
| `src/renderer/hooks/useSkillExecution.ts` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

### 2.3 Renderer Components

| ファイル                                                   | 変更種別 | import修正内容                                                    |
| ---------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

---

## 3. テストファイル（apps/desktop）

### 3.1 Hooks Tests

| ファイル                                                 | 変更種別 | import修正内容                                                    |
| -------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `src/renderer/hooks/__tests__/useSkillExecution.test.ts` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

### 3.2 Component Tests

| ファイル                                                                                   | 変更種別 | import修正内容                                                    |
| ------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |
| `src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |
| `src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |
| `src/renderer/components/AgentView/__tests__/SkillStreamDisplay.permission.test.tsx`       | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

### 3.3 Integration Tests

| ファイル                                         | 変更種別 | import修正内容                                                    |
| ------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `src/__tests__/skill-stream-integration.test.ts` | 修正     | `@repo/shared/types/skill-execution` → `@repo/shared/types/skill` |

---

## 4. 影響サマリー

| カテゴリ       | ファイル数 |
| -------------- | ---------- |
| 型定義ファイル | 3          |
| 実装ファイル   | 3          |
| テストファイル | 6          |
| **合計**       | **12**     |

---

## 5. 修正コマンド（参考）

```bash
# import修正の自動化（sedで一括置換）
find apps/desktop/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's|@repo/shared/types/skill-execution|@repo/shared/types/skill|g'
```

**注意**: 自動置換後は必ず差分確認と型チェックを実行すること。
