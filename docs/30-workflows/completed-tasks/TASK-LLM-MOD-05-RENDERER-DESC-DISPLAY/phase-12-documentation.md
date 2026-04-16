# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| Phase名    | ドキュメント更新                      |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 11: 手動テスト                  |
| 次Phase    | Phase 13: PR作成                      |
| ステータス | completed                             |
| 作成日     | 2026-04-16                            |

## 目的

実装ガイド作成（2パート）・システム仕様書更新・変更履歴作成・未タスク検出・スキルフィードバックの 5 タスクを、`InlineModelSelector` の単一責務に揃えて完了する。

## 実行タスク（5タスク - 全て完了必須）

### Task 1: 実装ガイド作成（2パート構成）

#### Part 1: 中学生レベルの概念説明

**日常生活での例え話**:

本のタイトルだけでは「どんな内容か」がわかりにくいことがあります。そこで、棚札の近くに短いメモを添えると選びやすくなります。このタスクは、`InlineModelSelector` に並ぶ名前のそばへ、必要なときだけ説明メモを見せる改善です。

**なぜ必要か**:

- 名前だけだと、似たモデルの違いが一目でわからない
- 説明メモがあれば、選ぶ前に役割や得意分野を判断しやすい
- ただし、メモを増やしすぎると画面が重くなるので、最小の見せ方に絞る

#### Part 2: 技術的詳細

**インターフェース/型定義**:

```typescript
// packages/shared/src/types/llm/schemas/provider.ts
const LLMModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  contextWindow: z.number().optional(),
});
```

**実装の考え方**:

```tsx
const hasDescription =
  typeof model.description === "string" && model.description.trim().length > 0;
const descriptionId = hasDescription
  ? `inline-model-${model.id}-description`
  : undefined;

return (
  <button
    title={hasDescription ? model.description : undefined}
    aria-describedby={descriptionId}
  >
    {model.name}
    {hasDescription ? (
      <span id={descriptionId} className="sr-only">
        {model.description}
      </span>
    ) : null}
  </button>
);
```

**エラーハンドリングとエッジケース**:

- `undefined` / `null`: 補助表示を出さない
- `""` / 空白のみ: `trim()` で除外する
- 長文: DOM を増やさず、`title` と `sr-only` の最小構成で扱う
- HTML 風の文字列: エスケープ済みテキストとして表示する

**設定可能なパラメータと定数**:

| 項目             | 役割                             |
| ---------------- | -------------------------------- |
| `hasDescription` | 表示可否の判定                   |
| `descriptionId`  | `aria-describedby` の参照先 ID   |
| `title`          | ネイティブ tooltip の補助        |
| `sr-only`        | アクセシビリティ用の隠し説明要素 |

**Phase 11 スクリーンショット参照**:

- `outputs/phase-11/screenshots/TC-11-02-inline-model-selector-tooltip-overlay.png`
- `outputs/phase-11/screenshots/TC-11-01-inline-model-selector-closed.png`
- `outputs/phase-11/phase11-capture-metadata.json`

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

以下を same-wave で更新する:

- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/index.md` のステータスを `completed` に更新
- `docs/30-workflows/unassigned-task/task-llm-mod-05-renderer-desc-display.md` のステータスを `completed` に更新
- `docs/30-workflows/issues/issue-1782.md` の status を `完了` に更新
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/artifacts.json` の Phase 11 / 12 成果物を同期
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-11/manual-test-result.md` をスクリーンショット実体と整合させる
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-11/phase11-capture-metadata.json` を実測値で更新する
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-12/implementation-guide.md` をスクリーンショット参照込みで更新する
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-12/system-spec-update-summary.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` を current facts に合わせる
- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-12/unassigned-task-detection.md` / `skill-feedback-report.md` を 0件前提で整備する

#### Step 1-B: 実装状況テーブル更新

`docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/artifacts.json` の Phase 状態を `completed` に更新する。

#### Step 1-C: 関連タスクテーブル更新

`docs/30-workflows/llm-provider-model-modernization/index.md` の TASK-LLM-MOD-05 行を「完了」に更新する。

#### Step 2: システム仕様更新（条件付き）

本タスクは既存の `description: z.string().optional()` フィールドを利用するのみで、新規インターフェース追加はないため、Step 2 は N/A とする。

### Task 3: ドキュメント変更履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY
```

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

Phase 11 で検出された HIGH/MEDIUM 問題を記録する。0件の場合でも `outputs/phase-12/unassigned-task-detection.md` を出力する。

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

task-specification-creator skill への改善提案を記録する。改善点がない場合でも `outputs/phase-12/skill-feedback-report.md` を出力する。

## 参照資料

| 資料名         | パス                                                | 説明                   |
| -------------- | --------------------------------------------------- | ---------------------- |
| 手動テスト結果 | `phase-11-manual-test.md`                           | スクリーンショット証跡 |
| 型定義         | `packages/shared/src/types/llm/schemas/provider.ts` | description フィールド |
| 証跡メタデータ | `outputs/phase-11/phase11-capture-metadata.json`    | 取得条件・画面状態     |

## 成果物

| 成果物               | パス                                                     | 説明                   |
| -------------------- | -------------------------------------------------------- | ---------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2        |
| 仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | 更新内容記録           |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`            | 変更履歴               |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須        |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須 |
| Phase12準拠チェック  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 5タスク完了確認        |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] Task 2: システム仕様書更新（Step 1-A/B/C）が完了している
- [ ] Task 3: ドキュメント変更履歴が作成されている
- [ ] Task 4: 未タスク検出レポートが作成されている（0件でも出力）
- [ ] Task 5: スキルフィードバックレポートが作成されている（改善点なしでも出力）
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
