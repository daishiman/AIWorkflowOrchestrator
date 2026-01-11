# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 9                   |
| Phase名    | 品質保証            |
| 前提Phase  | Phase 8             |
| 後続Phase  | Phase 10            |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

リファクタリング完了後、Lint、型チェック、セキュリティ検査を実施し、コード品質を保証する。

## 背景

Phase 8（リファクタリング）完了後、自動化された品質チェックを実施し、本番環境へのリリースに向けた品質基準を満たすことを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ESLint検査

**目的**: コーディング規約違反を検出し、修正する

**実行手順**:

1. ESLintを実行:

```bash
pnpm --filter @repo/desktop lint
```

2. 自動修正可能な問題を修正:

```bash
pnpm --filter @repo/desktop lint:fix
```

3. スキル管理UI関連ファイルの検査結果を確認:

| ファイル                    | エラー数 | 警告数 | 対応状況 |
| --------------------------- | -------- | ------ | -------- |
| components/skills/\*.tsx    |          |        |          |
| hooks/useSkillManagement.ts |          |        |          |
| store/slices/agentSlice.ts  |          |        |          |
| utils/skillFilters.ts       |          |        |          |

4. 以下のルールを特に確認:

| ESLintルール                       | 確認項目               |
| ---------------------------------- | ---------------------- |
| @typescript-eslint/no-explicit-any | any型の使用禁止        |
| @typescript-eslint/no-unused-vars  | 未使用変数の削除       |
| react-hooks/rules-of-hooks         | Hooks使用ルール        |
| react-hooks/exhaustive-deps        | 依存配列の完全性       |
| jsx-a11y/\*                        | アクセシビリティルール |

**期待される成果物**:

- ESLint検査結果（`outputs/phase-9/eslint-report.md`）

---

### タスク2: TypeScript型チェック

**目的**: 型安全性を検証し、型エラーを解消する

**実行手順**:

1. 型チェックを実行:

```bash
pnpm --filter @repo/desktop typecheck
```

2. strictモード設定を確認:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

3. スキル管理UI関連ファイルの型エラーを確認:

| ファイル                   | エラー数 | 内容 | 対応状況 |
| -------------------------- | -------- | ---- | -------- |
| types/skill.ts             |          |      |          |
| components/skills/\*.tsx   |          |      |          |
| store/slices/agentSlice.ts |          |      |          |

4. 全ての型エラーを解消

**期待される成果物**:

- 型チェック結果（`outputs/phase-9/typecheck-report.md`）

---

### タスク3: セキュリティ検査

**目的**: セキュリティ上の脆弱性を検出し、対処する

**実行手順**:

1. 依存パッケージの脆弱性検査:

```bash
pnpm audit
```

2. スキル管理UI固有のセキュリティチェック:

| #   | チェック項目                                   | 確認結果 | 対応状況 |
| --- | ---------------------------------------------- | -------- | -------- |
| 1   | IPC通信でのデータ検証（zod/io-ts）             | [ ]      |          |
| 2   | ファイルパスのサニタイズ（path traversal防止） | [ ]      |          |
| 3   | ユーザー入力のエスケープ（XSS対策）            | [ ]      |          |
| 4   | 機密情報のログ出力禁止                         | [ ]      |          |

3. IPCハンドラーのバリデーション確認:

```typescript
// main/ipc/skillHandlers.ts
import { z } from "zod";

// スキルインポートリクエストのスキーマ
const ImportSkillSchema = z.object({
  path: z
    .string()
    .min(1)
    .refine((p) => !p.includes(".."), { message: "Path traversal detected" }),
  config: z
    .object({
      overwrite: z.boolean().optional(),
    })
    .optional(),
});

ipcMain.handle("skill:import", async (event, data) => {
  // バリデーション
  const result = ImportSkillSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  // ... 処理
});
```

4. 検索入力のサニタイズ確認:

```typescript
// 検索クエリのサニタイズ
const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .slice(0, 100) // 最大長制限
    .replace(/[<>]/g, ""); // HTML特殊文字除去
};
```

**期待される成果物**:

- セキュリティ検査結果（`outputs/phase-9/security-report.md`）

---

### タスク4: Prettier フォーマット検査

**目的**: コードフォーマットの一貫性を確認する

**実行手順**:

1. Prettierでフォーマットチェック:

```bash
pnpm --filter @repo/desktop format:check
```

2. フォーマット違反があれば修正:

```bash
pnpm --filter @repo/desktop format
```

3. Prettier設定を確認:

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

**期待される成果物**:

- フォーマット検査結果（`outputs/phase-9/format-report.md`）

---

### タスク5: Bundle サイズ分析

**目的**: バンドルサイズを分析し、肥大化を防ぐ

**実行手順**:

1. バンドルを生成:

```bash
pnpm --filter @repo/desktop build
```

2. バンドルサイズを分析:

```bash
pnpm --filter @repo/desktop analyze
```

3. スキル管理UI関連モジュールのサイズを確認:

| モジュール                  | サイズ | 許容範囲 | 判定 |
| --------------------------- | ------ | -------- | ---- |
| components/skills/\*        |        | < 50KB   |      |
| hooks/useSkillManagement.ts |        | < 5KB    |      |
| store/slices/agentSlice.ts  |        | < 10KB   |      |

4. Tree shakingの確認（未使用コードが除去されているか）

5. 必要に応じてコード分割を検討:

```typescript
// 遅延ロードの例
const SkillImportDialog = React.lazy(() => import("./SkillImportDialog"));
```

**期待される成果物**:

- バンドル分析結果（`outputs/phase-9/bundle-analysis.md`）

---

### タスク6: 品質保証判定

**目的**: 全品質チェックの結果を集約し、次のアクションを決定する

**実行手順**:

1. 全チェック結果を集約:

| チェック項目         | 結果 | 残課題 |
| -------------------- | ---- | ------ |
| ESLint               |      |        |
| TypeScript型チェック |      |        |
| セキュリティ検査     |      |        |
| Prettierフォーマット |      |        |
| バンドルサイズ       |      |        |

2. 判定基準:

| 判定     | 条件                   | 次のアクション |
| -------- | ---------------------- | -------------- |
| PASS     | 全チェックがエラーなし | Phase 10へ進行 |
| MINOR    | 警告のみ（エラーなし） | 対応後Phase 10 |
| MAJOR    | エラーあり             | 問題解決が必要 |
| CRITICAL | セキュリティ脆弱性あり | 即時対応必須   |

3. 品質保証結果を文書化

**期待される成果物**:

- 品質保証判定結果（`outputs/phase-9/quality-judgment.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容                 |
| ---------------- | ------------------------------------------------------------------------------ | -------------------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ基準     |
| Phase 8成果物    | `outputs/phase-8/`                                                             | リファクタリング結果 |

---

## 成果物

| 成果物               | パス                                  | 内容             |
| -------------------- | ------------------------------------- | ---------------- |
| ESLint検査結果       | `outputs/phase-9/eslint-report.md`    | Lint結果         |
| 型チェック結果       | `outputs/phase-9/typecheck-report.md` | 型検査結果       |
| セキュリティ検査結果 | `outputs/phase-9/security-report.md`  | セキュリティ結果 |
| フォーマット検査結果 | `outputs/phase-9/format-report.md`    | フォーマット結果 |
| バンドル分析結果     | `outputs/phase-9/bundle-analysis.md`  | サイズ分析       |
| 品質保証判定結果     | `outputs/phase-9/quality-judgment.md` | 総合判定         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 9での統合テスト連携アクション

- セキュリティ検査でIPC通信の安全性確認
- 型チェックでインターフェース整合性確認
- バンドル分析でモジュール依存関係確認

---

## 完了条件

- [ ] ESLint検査でエラーがゼロである
- [ ] TypeScript型チェックでエラーがゼロである
- [ ] セキュリティ検査で脆弱性がない
- [ ] Prettierフォーマットが適用されている
- [ ] バンドルサイズが許容範囲内である
- [ ] 品質保証判定がPASSまたはMINOR（対応完了）である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート判定

### 判定基準

| 判定     | 条件                       | 次のアクション |
| -------- | -------------------------- | -------------- |
| PASS     | 全品質チェックがエラーなし | Phase 10へ進行 |
| MINOR    | 警告のみ（エラーなし）     | 対応後Phase 10 |
| MAJOR    | エラーあり                 | 問題解決が必要 |
| CRITICAL | セキュリティ脆弱性あり     | 即時対応必須   |

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビュー）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-10-final-review.md`
