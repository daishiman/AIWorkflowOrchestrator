# Phase 10: 最終レビュー

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase番号 | 10                             |
| 機能名    | skill-create-wizard            |
| タスクID  | TASK-10A-C                     |
| 作成日    | 2026-03-03                     |
| 前Phase   | Phase 9: 品質保証              |
| 次Phase   | Phase 11: 手動テスト（PASS時） |

## 目的

多角的な観点から `SkillCreateWizard` 実装の品質・整合性を検証し、
**レビューゲート判定**（PASS / MINOR / MAJOR / CRITICAL）を下す。

MINOR 以上の指摘は未タスク仕様書に変換して Phase 11 へ進む。
MAJOR / CRITICAL の場合は影響範囲に応じて前 Phase へ戻る。

## 実行タスク

- 最終レビュータスク: 全観点レビューとゲート判定、MINOR未タスク化を実施する。

| No  | タスク                  | 優先度 |
| --- | ----------------------- | ------ |
| 1   | 要件充足確認            | 最高   |
| 2   | コード品質レビュー      | 高     |
| 3   | セキュリティ検証        | 高     |
| 4   | パフォーマンス確認      | 中     |
| 5   | アクセシビリティ検証    | 中     |
| 6   | デザイン準拠確認        | 中     |
| 7   | テスト品質確認          | 高     |
| 8   | 既存パターン準拠確認    | 高     |
| 9   | レビューゲート判定      | 最高   |
| 10  | MINOR指摘の未タスク変換 | 高     |

## 参照資料

| 資料                     | パス                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-1-requirements.md`                                                   |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-2-design.md`                                                         |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-5-implementation.md`                                                 |
| Phase 9 品質レポート     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-9/quality-report.md`                                         |
| タスク定義書             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041c-task-10a-c-create-wizard.md` |
| UI/UXコンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                           |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                      |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                       |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                 |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                              |
| API 設計原則             | `.claude/skills/aiworkflow-requirements/references/api-core.md`                                                                   |
| API エンドポイント一覧   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                                                              |
| タスクワークフロールール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                                        |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                                                              |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                                                                                |

## 実行手順

### Step 1: 要件充足確認

Phase 1 の受入基準と実装を照合する。

**確認コマンド:**

```bash
# 実装ファイルの存在確認
ls apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
ls apps/desktop/src/renderer/components/skill/wizard/
ls apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
ls apps/desktop/src/main/ipc/skillHandlers.ts

# skill:create ハンドラーの存在確認
grep -n "skill:create" apps/desktop/src/main/ipc/skillHandlers.ts
grep -n "skill:create" apps/desktop/src/preload/skill-api.ts

# ウィザード4ステップの実装確認
grep -n "describe\|configure\|generate\|complete" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

**受入基準チェックリスト（Phase 1 定義との照合）:**

| 受入基準                          | 確認方法                    | 判定 |
| --------------------------------- | --------------------------- | ---- |
| 4ステップウィザードが表示される   | コードレビュー + テスト確認 | □    |
| describe ステップで説明入力可能   | コードレビュー + テスト確認 | □    |
| configure ステップで設定選択可能  | コードレビュー + テスト確認 | □    |
| generate ステップでスキル生成開始 | コードレビュー + テスト確認 | □    |
| complete ステップで完了表示       | コードレビュー + テスト確認 | □    |
| `skill:create` IPC 経由で生成     | IPC ハンドラー確認          | □    |
| エラー時のユーザーフィードバック  | エラーハンドリング確認      | □    |
| ウィザードキャンセル機能          | コードレビュー + テスト確認 | □    |

### Step 2: コード品質レビュー

**確認観点:**

#### 単一責務原則（SRP）

```bash
# 大きすぎるファイルの検出（200行超は要注意）
wc -l apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
wc -l apps/desktop/src/renderer/components/skill/wizard/*.tsx
```

- [ ] `SkillCreateWizard.tsx` が オーケストレーションのみを担当している
- [ ] 各ステップコンポーネントが単一の責務を持っている
- [ ] UI ロジックとビジネスロジックが分離されている
- [ ] カスタムフック（`useWizardStep`）が副作用管理を担当している

#### 型安全性

```bash
# any型の残存確認
grep -rn ": any\|as any\|<any>" apps/desktop/src/renderer/components/skill/

# @ts-ignore/@ts-expect-errorの確認
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/components/skill/
```

- [ ] `any` 型が使用されていない（または理由コメント付き）
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない（または理由コメント付き）
- [ ] 型アサーション（`as`）が最小限

#### コーディング規約

```bash
# boolean変数プレフィックス確認
grep -rn "const [a-z][a-z]" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  | grep -v "is\|has\|can\|should\|on\|handle"
```

- [ ] boolean 変数が `is` / `has` / `can` / `should` プレフィックスを持つ
- [ ] 未使用 import が残っていない
- [ ] 曖昧なコメントがない（条件・基準が明示されている）

### Step 3: セキュリティ検証

#### IPC 入力バリデーション（P42: 3段バリデーション）

```bash
# skillHandlers.ts の skill:create バリデーション確認
grep -A 15 "skill:create" apps/desktop/src/main/ipc/skillHandlers.ts
```

- [ ] 文字列引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）実装済み
- [ ] エラーレスポンスに内部情報が含まれていない（サニタイズ済み）
- [ ] IPC チャンネル名が `IPC_CHANNELS` 定数で管理されている（ハードコード禁止）

```bash
# IPC_CHANNELS定数使用確認
grep -n "IPC_CHANNELS" apps/desktop/src/main/ipc/skillHandlers.ts
grep -n "IPC_CHANNELS" apps/desktop/src/preload/skill-api.ts

# ハードコード文字列確認（P27対策）
grep -rn '"skill:create"' apps/desktop/src/
```

#### XSS 防止

```bash
# dangerouslySetInnerHTML の使用確認
grep -rn "dangerouslySetInnerHTML" apps/desktop/src/renderer/components/skill/
```

- [ ] `dangerouslySetInnerHTML` が使用されていない（使用時は DOMPurify でサニタイズ済み）
- [ ] ユーザー入力がそのまま DOM に反映されていない

### Step 4: パフォーマンス確認

```bash
# React.memo / useMemo / useCallback の適切な使用確認
grep -rn "React.memo\|useMemo\|useCallback" apps/desktop/src/renderer/components/skill/
```

**確認観点:**

- [ ] 不要な再レンダーが発生しないように `React.memo` / `useMemo` / `useCallback` が明示基準どおりに使われている
- [ ] 大きなリストがある場合は仮想スクロールまたはページネーションを検討
- [ ] 生成処理（非同期）がローディング状態を欠落なく管理している

### Step 5: アクセシビリティ検証（WCAG 2.1 AA）

```bash
# ARIA属性の確認
grep -rn "aria-" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
grep -rn "role=" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# フォームラベルの確認
grep -rn "<label\|htmlFor\|aria-label" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

- [ ] ウィザードナビゲーションにキーボード操作（Tab, Enter, Escape）が実装されている
- [ ] ステップインジケーターに適切な ARIA ラベルが付与されている
- [ ] フォーム要素に `<label>` または `aria-label` が設定されている
- [ ] エラーメッセージが `role="alert"` または `aria-live` で通知される
- [ ] コントラスト比: テキスト 4.5:1 以上、UI 部品 3:1 以上

### Step 6: デザイン準拠確認（Apple HIG）

```bash
# CSS変数使用確認（ハードコード色値の排除）
grep -rn "#[0-9A-Fa-f]\{3,6\}\|rgb\|rgba" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/wizard/
```

- [ ] ハードコード色値が残っていない（すべて `var(--...)` CSS変数を使用）
- [ ] スペーシングが 8px グリッドに準拠している
- [ ] 角丸が `8px` 〜 `12px` の範囲で統一されている
- [ ] アニメーションが 200-300ms、目的を持ったものだけ
- [ ] ライト/ダーク両モードで Apple HIG システムカラーを使用している
- [ ] Tailwind Slate（青みがかった灰色）を使用していない

### Step 7: テスト品質確認

```bash
# テストファイルの構成確認
ls apps/desktop/src/renderer/components/skill/__tests__/

# テストの記述パターン確認
grep -n "userEvent\|fireEvent" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

- [ ] `userEvent` が使用されていない（happy-dom 環境では `fireEvent` を使用）
- [ ] `beforeEach` でテスト間の状態がリセットされている
- [ ] ネットワーク / IPC 呼び出しがテストケースごとにモックされている
- [ ] 境界値・異常系（バリデーションエラー、IPC エラー）がテストされている
- [ ] カバレッジ基準（Line 80%、Function 80%、Branch 60%）をクリアしている

### Step 8: 既存パターン準拠確認

```bash
# Atomic Design配置確認
ls apps/desktop/src/renderer/components/skill/wizard/

# Zustand個別セレクタ確認（P31対策）
grep -rn "useXxxStore()\." apps/desktop/src/renderer/components/skill/
grep -rn "useAgent\|useLLM\|useAuth" apps/desktop/src/renderer/components/skill/

# IPC_CHANNELS定数確認
grep -rn '"skill:' apps/desktop/src/renderer/components/skill/
```

- [ ] Atomic Design（atoms/molecules/organisms）の階層に正しく配置されている
- [ ] Zustand 個別セレクタを使用している（合成 Hook の戻り値関数を `useEffect` 依存配列に含めていない）
- [ ] IPC チャンネル名がハードコードされていない（`IPC_CHANNELS` 定数を使用）
- [ ] P44/P45: IPC ハンドラーの引数名と実態が一致している

### Step 9: レビューゲート判定

**判定基準:**

| 判定     | 条件                                                       | 対応                                      |
| -------- | ---------------------------------------------------------- | ----------------------------------------- |
| PASS     | 全観点で問題なし、指摘なし                                 | Phase 11 へ進む                           |
| MINOR    | 機能に影響しない軽微な問題あり（スタイル改善、コメント等） | 未タスク化後、Phase 11 へ進む（省略不可） |
| MAJOR    | 機能に影響する問題あり                                     | 影響範囲に応じて Phase 1-8 へ戻る         |
| CRITICAL | 要件との整合性に重大な問題あり、またはセキュリティ問題あり | Phase 1 へ戻り要件再確認                  |

**MINOR 判定の例:**

- CSS変数の一部がハードコードのまま残っている
- ARIA ラベルの記述が不完全
- テストのコメントが不明瞭

**MAJOR 判定の例:**

- ウィザードステップの一部が動作しない
- IPC バリデーションが不完全（P42 未準拠）
- カバレッジ基準未達

**CRITICAL 判定の例:**

- `skill:create` IPC ハンドラーがセキュリティ上の脆弱性を持つ
- Phase 1 受入基準の重要な項目が未実装

### Step 10: MINOR 指摘の未タスク変換（必須）

**MINOR 以上の指摘が1件でもあった場合、全て未タスク仕様書に変換する（「機能影響なし」でも省略不可）。**

**未タスク変換の3ステップ:**

1. `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-10/unassigned-tasks/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**指示書のファイル名規則:**

```
TASK-10A-C-MINOR-NNN-[説明].md
```

例:

```
TASK-10A-C-MINOR-001-css-variable-cleanup.md
TASK-10A-C-MINOR-002-aria-label-improvement.md
```

## 統合テスト連携

- TASK-10A-D（ライフサイクル管理統合）との連携観点も確認する
- `SkillManagementPanel`（TASK-10A-A）からウィザードが呼び出される際のインターフェースが適切か確認

## 多角的チェック観点サマリー

| 観点             | 確認コマンド / 方法                                      | 基準                                |
| ---------------- | -------------------------------------------------------- | ----------------------------------- |
| 要件充足         | Phase 1 受入基準との照合                                 | 全基準クリア                        |
| コード品質       | コードレビュー、`wc -l`, `grep`                          | SRP準拠、型安全、規約準拠           |
| セキュリティ     | P42チェック、IPC_CHANNELS確認、XSS確認                   | バリデーション3段、ハードコードなし |
| パフォーマンス   | `React.memo` / `useMemo` 確認                            | 不要な再レンダーなし                |
| アクセシビリティ | ARIA属性確認、キーボード操作確認                         | WCAG 2.1 AA                         |
| デザイン         | CSS変数確認、グリッド確認                                | Apple HIG、8pxグリッド              |
| テスト           | `userEvent` 不使用確認、カバレッジ確認                   | カバレッジ基準クリア                |
| 既存パターン     | Atomic Design配置、Zustand個別セレクタ、IPC_CHANNELS確認 | 全パターン準拠                      |

## 成果物

| 成果物                      | パス                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 最終レビュー結果            | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-10/final-review-result.md`                     |
| 未タスク指示書（MINORあり） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-10/unassigned-tasks/TASK-10A-C-MINOR-NNN-*.md` |

### `final-review-result.md` の構成

```markdown
# Phase 10 最終レビュー結果

## 実施日時

2026-XX-XX HH:MM

## レビュー結果サマリー

| 観点             | 判定  | 指摘件数 |
| ---------------- | ----- | -------- |
| 要件充足         | PASS  | 0        |
| コード品質       | PASS  | 0        |
| セキュリティ     | PASS  | 0        |
| パフォーマンス   | PASS  | 0        |
| アクセシビリティ | MINOR | 1        |
| デザイン準拠     | PASS  | 0        |
| テスト品質       | PASS  | 0        |
| 既存パターン     | PASS  | 0        |

## 総合判定

**MINOR** （PASS / MINOR / MAJOR / CRITICALいずれかを記載）

## 指摘事項

### MINOR 指摘

1. [指摘内容]
   - 対象ファイル: `XXX.tsx`
   - 内容: [詳細]
   - 対応: [未タスク化 → TASK-10A-C-MINOR-001-xxx.md]

## 次フェーズへの引き継ぎ

- 未タスク一覧: [ファイルパス]
- Phase 11 での確認事項: [あれば記載]
```

## 完了条件

- [ ] 全8観点でのレビューが完了している
- [ ] レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）が下されている
- [ ] `outputs/phase-10/final-review-result.md` が作成されている
- [ ] MINOR 以上の指摘が全て未タスク仕様書に変換されている（0件の場合は不要）
- [ ] 未タスクの3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク）が完了している
- [ ] MAJOR / CRITICAL の場合は前 Phase への差し戻し方針が決定されている

## サブタスク管理

| No  | サブタスク                  | ステータス |
| --- | --------------------------- | ---------- |
| 1   | 要件充足確認                | pending    |
| 2   | コード品質レビュー          | pending    |
| 3   | セキュリティ検証            | pending    |
| 4   | パフォーマンス確認          | pending    |
| 5   | アクセシビリティ検証        | pending    |
| 6   | デザイン準拠確認            | pending    |
| 7   | テスト品質確認              | pending    |
| 8   | 既存パターン準拠確認        | pending    |
| 9   | レビューゲート判定          | pending    |
| 10  | MINOR指摘の未タスク変換     | pending    |
| 11  | final-review-result.md 作成 | pending    |

## タスク100%実行確認【必須】

Phase 10 完了前に以下を全項目確認すること:

- [ ] 全8観点でレビューが完了したことを確認した
- [ ] レビューゲート判定を下した
- [ ] `outputs/phase-10/final-review-result.md` を作成した
- [ ] MINOR 以上の指摘があった場合、全て3ステップで未タスク化した
  - Step 1: `unassigned-tasks/` に指示書作成
  - Step 2: `task-workflow.md` 残課題テーブルに登録
  - Step 3: 関連仕様書に参照リンク追加
- [ ] P4 パターン回避: 全 Step 完了前に「完了」と記載していない

## 次のPhase

### 判定別の次のアクション

| 判定     | 次のアクション                                                       |
| -------- | -------------------------------------------------------------------- |
| PASS     | Phase 11（手動テスト）へ進む                                         |
| MINOR    | 未タスク化完了後、Phase 11（手動テスト）へ進む                       |
| MAJOR    | 影響範囲に応じて Phase 5（実装）〜 Phase 8（リファクタリング）へ戻る |
| CRITICAL | Phase 1（要件定義）へ戻り要件を再確認                                |

**PASS / MINOR の場合:**
仕様書: `docs/30-workflows/completed-tasks/skill-create-wizard/phase-11-manual-test.md`
