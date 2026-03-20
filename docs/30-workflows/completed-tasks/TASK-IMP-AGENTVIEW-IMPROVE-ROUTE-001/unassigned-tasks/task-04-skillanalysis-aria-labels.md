# UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003 SkillAnalysisView アクションボタン aria-label 未設定修正 - タスク指示書

## メタ情報

```yaml
task_id: UT-FIX-SKILLANALYSIS-ARIA-LABEL-001
task_id_alias:
  [UT-FIX-SKILLANALYSIS-ARIA-LABEL-002, UT-FIX-SKILLANALYSIS-ARIA-LABEL-003]
task_name: SkillAnalysisView アクションボタン aria-label 未設定修正
category: アクセシビリティ修正
target_feature: SkillAnalysisView（アクションボタン）
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 10/11 最終レビュー・手動テスト
created_date: 2026-03-20
dependencies: [TASK-04]
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003              |
| タスク名     | SkillAnalysisView アクションボタン aria-label 未設定修正 |
| 分類         | アクセシビリティ修正                                     |
| 対象機能     | SkillAnalysisView（アクションボタン）                    |
| 優先度       | 中                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | Phase 10/11 最終レビュー・手動テスト                     |
| 発見日       | 2026-03-20                                               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 10/11 レビューにて SkillAnalysisView の以下3つのボタンに `aria-label` が未設定であることが検出された。

- 「選択を適用」ボタン（UT-FIX-SKILLANALYSIS-ARIA-LABEL-001）
- 「全自動改善」ボタン（UT-FIX-SKILLANALYSIS-ARIA-LABEL-002）
- 「再試行」ボタン（UT-FIX-SKILLANALYSIS-ARIA-LABEL-003）

### 1.2 問題点・課題

- スクリーンリーダーがボタンの意味を正確に読み上げられない。
- WCAG 2.1 AA 基準のアクセシビリティ要件を満たしていない。
- `aria-label` がないボタンはテストでも `getByRole('button', { name: '...' })` による特定が困難になる。

### 1.3 放置した場合の影響

- アクセシビリティ違反としてリリース審査に引っかかる可能性がある。
- スクリーンリーダーユーザーが3つのアクションを区別できない。

## 2. 何を達成するか（What）

### 2.1 目的

SkillAnalysisView の3つのアクションボタンに適切な `aria-label` を付与し、WCAG 2.1 AA 準拠のアクセシビリティを確保する。

### 2.2 最終ゴール

1. 「選択を適用」「全自動改善」「再試行」の各ボタンに `aria-label` が設定されている。
2. `getByRole('button', { name: 'xxx' })` でテストから特定できる。
3. スクリーンリーダーで各ボタンの意図が正確に読み上げられる。

### 2.3 スコープ

#### 含むもの

- `SkillAnalysisView.tsx` 内の3ボタンへの `aria-label` 追加
- 関連テストの `aria-label` アサーション追加

#### 含まないもの

- ボタンのロジックや表示テキストの変更
- 他コンポーネントのアクセシビリティ修正

### 2.4 成果物

- 実装差分（`SkillAnalysisView.tsx` の `aria-label` 追加）
- テスト更新（aria-label アサーション）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` が存在すること
- 関連テストが実行可能であること

### 3.2 依存タスク

- TASK-04（完了）

### 3.3 必要な知識

- React/JSX の aria 属性
- WCAG 2.1 AA のボタンアクセシビリティ基準
- React Testing Library の `getByRole` クエリ

### 3.4 推奨アプローチ

各ボタンに以下の `aria-label` を追加する：

| ボタン表示テキスト | 推奨 aria-label          |
| ------------------ | ------------------------ |
| 選択を適用         | `選択したスキルを適用`   |
| 全自動改善         | `全スキルを自動改善する` |
| 再試行             | `分析を再試行する`       |

## 4. 実行手順

### Phase 構成

- Phase A: 対象ボタンの特定と aria-label 付与
- Phase B: テスト更新
- Phase C: 仕様同期

### Phase A: 対象ボタンへの aria-label 付与

#### 目的

3つのボタンにアクセシビリティ属性を追加する。

#### 手順

1. `SkillAnalysisView.tsx` を開き、「選択を適用」「全自動改善」「再試行」ボタンを特定する。
2. 各ボタン要素に `aria-label` 属性を追加する。
3. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView` でテストが通ることを確認する。

#### 成果物

- `SkillAnalysisView.tsx` の差分

#### 完了条件

- 3つのボタン全てに `aria-label` が設定されている

### Phase B: テスト更新

#### 目的

aria-label を利用したアサーションをテストに追加する。

#### 手順

1. 対応するテストファイルを開く。
2. 各ボタンを `getByRole('button', { name: '...' })` で取得するアサーションを追加または更新する。
3. テストを実行して PASS を確認する。

#### 成果物

- テスト差分

#### 完了条件

- 全テスト PASS

### Phase C: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルに本タスクを登録する。
2. `ui-ux-feature-components.md` の関連未タスク表に登録する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 台帳への登録完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 「選択を適用」ボタンに aria-label が設定されている
- [ ] 「全自動改善」ボタンに aria-label が設定されている
- [ ] 「再試行」ボタンに aria-label が設定されている

### 品質要件

- [ ] 全関連テストが PASS
- [ ] `getByRole('button', { name: '...' })` でボタンが特定できる

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルに登録済み
- [ ] `ui-ux-feature-components.md` に参照リンク追加済み

## 6. 検証方法

### テストケース

- Case 1: 「選択を適用」ボタンが `getByRole('button', { name: '選択したスキルを適用' })` で取得できる
- Case 2: 「全自動改善」ボタンが `getByRole('button', { name: '全スキルを自動改善する' })` で取得できる
- Case 3: 「再試行」ボタンが `getByRole('button', { name: '分析を再試行する' })` で取得できる

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView
```

## 7. リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                          |
| ------------------------------------------- | ------ | -------- | --------------------------------------------- |
| aria-label テキストが UI テキストと乖離する | 低     | 低       | aria-label はボタンの意図を説明する文言にする |
| 既存テストの取得クエリが変わる              | 低     | 中       | テスト更新時に getByRole への統一を確認する   |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `.claude/rules/01-architecture.md`（アクセシビリティ WCAG 2.1 AA 基準）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### task-workflow への登録候補

```
| UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003 | SkillAnalysisView アクションボタン aria-label 未設定修正 | アクセシビリティ修正 | 中 | 未実施 | docs/30-workflows/unassigned-task/task-04-skillanalysis-aria-labels.md |
```

### 関連仕様書への参照リンク追加候補

- `ui-ux-feature-components.md` の SkillAnalysisView セクションに本ファイルへのリンクを追加する。

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-SKILLANALYSIS-ARIA-LABEL-001: SkillAnalysisView の「選択を適用」ボタンに aria-label が未設定
UT-FIX-SKILLANALYSIS-ARIA-LABEL-002: SkillAnalysisView の「全自動改善」ボタンに aria-label が未設定
UT-FIX-SKILLANALYSIS-ARIA-LABEL-003: SkillAnalysisView の「再試行」ボタンに aria-label が未設定
```

### 補足事項

3件は同一ファイル（SkillAnalysisView.tsx）内の同種修正のため、1つのタスクとして統合する。

## 実装時の注意（苦戦箇所からの教訓）

> TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で得た教訓。同様の課題を簡潔に解決するための参考情報。

### P40: テスト実行ディレクトリ依存

- テスト実行は `cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView` で行うこと
- プロジェクトルートからの実行では `vitest.config.ts` の happy-dom 設定が読み込まれずテストが失敗する場合がある
- 参照: `.claude/rules/06-known-pitfalls.md` P40

### aria-label とテストクエリの整合

- `aria-label` を付与したら、対応するテストで `getByRole('button', { name: '...' })` クエリを使ってボタンを取得するアサーションも同時に追加・更新すること
- aria-label テキストは UI 表示テキストより意図を説明する文言にすること（例: 「再試行」→「分析を再試行する」）
