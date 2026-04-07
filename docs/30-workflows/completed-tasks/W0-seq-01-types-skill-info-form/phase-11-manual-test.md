# Phase 11: 手動テスト

## メタ情報

- Phase: 11
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

型定義の追加は純粋な TypeScript 型レベルの変更であり、ランタイム動作を変えない。ただし、追加型を実際に利用する後続コンポーネントやサービスがある場合は、インポート解決・型推論が正常に機能することをエディタ（VSCode）および CLI で手動確認する。

## 実行タスク

- [ ] VSCode で `skillCreator.ts` を開き、追加型に型エラーがないことを確認する
- [ ] VSCode で追加型をインポートしたファイルを作成し、型補完が動作することを確認する
- [ ] CLI で型チェック・テスト・ビルドが全てパスすることを最終確認する
- [ ] `@repo/shared/types/skillCreator` からのインポートパスが正常に解決されることを確認する

## 参照資料

| 資料名           | パス                                                              | 説明         |
| ---------------- | ----------------------------------------------------------------- | ------------ |
| 追記済みファイル | `packages/shared/src/types/skillCreator.ts`                       | 手動確認対象 |
| テストファイル   | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | 手動確認対象 |

## 実行手順

### Step 1: VSCode での型確認

1. `packages/shared/src/types/skillCreator.ts` をエディタで開く
2. 追加したセクション（`// Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)`）を目視確認する
3. 各型定義にエラー波線（赤・黄）が表示されていないことを確認する
4. `SkillInfoFormData`、`ConversationAnswers`、`SmartDefaultResult` にカーソルを合わせ、hover で型情報が表示されることを確認する

### Step 2: インポート補完の確認

任意の一時ファイル（例: `tmp-check.ts`）を作成し、以下を記述して補完が動作することを確認する。

```typescript
import type {
  ConversationAnswers,
  SkillCategory,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";

const category: SkillCategory = "automation"; // 補完で選択できること

const formData: SkillInfoFormData = {
  skillName: "",
  purpose: "テスト",
  category,
};

const schedule: SkillWizardScheduleConfig = {
  cronExpression: "0 9 * * 1-5",
  timezone: "Asia/Tokyo",
};

const answers: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: "定期実行", freeText: "", scheduleConfig: schedule },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

const defaults: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
  inferenceLog: [],
};
```

確認後、一時ファイルは削除する。

### Step 3: CLI 最終確認

```bash
# 1. 型チェック
pnpm --filter @repo/shared typecheck
echo "型チェック: OK"

# 2. リント
pnpm --filter @repo/shared lint
echo "リント: OK"

# 3. テスト
pnpm --filter @repo/shared test
echo "テスト: OK"

# 4. ビルド（エクスポート確認）
pnpm --filter @repo/shared build
echo "ビルド: OK"
```

### Step 4: 後続タスクへの影響確認

Wave 0 完了後に開始される後続タスク（Wave 1 以降）のファイルが存在する場合、それらのファイルで追加型をインポートして型エラーが発生しないことを確認する。

```bash
# 後続タスクが参照するファイルがあれば型チェックを実行
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/web typecheck
```

## 成果物

- 手動テスト結果の確認（成果物ファイルなし。確認記録のみ）

## 完了条件

- [ ] VSCode で追加型にエラー波線が表示されていない
- [ ] `SkillCategory` の union メンバーが VSCode の補完で提示される
- [ ] `SkillInfoFormData` / `ConversationAnswers` / `SmartDefaultResult` のフィールドが VSCode の補完で提示される
- [ ] CLI での型チェック・リント・テスト・ビルドが全てパスする
- [ ] 一時ファイル（`tmp-check.ts` 等）を削除している
