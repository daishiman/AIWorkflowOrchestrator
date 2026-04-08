# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | -                                         |
| 次Phase    | Phase 2: 設計                             |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

CompleteStep.tsx の現行実装の問題点を洗い出し、「スキル作成の起点画面」として再設計するための要件を確定する。

## 先行レビュー

### Task 0: skill準拠の事前整理

- 真の論点: CompleteStep を単なる終了画面ではなく、次の行動を決める起点画面へ変えること
- 依存関係・責務境界: 生成結果コンテキストは親側が保持し、CompleteStep は表示と通知だけを担うこと
- 価値とコスト: フィードバック、再実行、次アクション提示で迷いを減らす価値が高く、実装コストは props 境界の追加に収めること
- 改善優先順位: 1. canonical path と命名の整合 2. 責務境界 3. UI 4. docs parity
- 4条件: 価値性 / 実現性 / 整合性 / 運用性 をすべて満たすこと

### Task 0-B: タスク分類と命名規則の記録

- タスク分類: 仕様書作成（ドキュメント中心）
- 現在の canonical workflow dir: `docs/30-workflows/W1-par-02c-complete-step-2/`
- 旧パス `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/` は legacy alias としてのみ扱い、新規記述では使用しない
- Phase ファイルは `phase-N-*.md`、成果物は `outputs/phase-N/*.md` に統一する
- 命名規則は、フォルダ/ファイルは kebab-case、コンポーネント名と Props は PascalCase/camelCase を使い分ける

## 実行タスク

### Task 1: 現行実装の確認

現在の `CompleteStep.tsx` の実装状態を確認する。

```bash
# 現行ファイルの確認
cat apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx

# テストファイルの確認
find apps/desktop/src -name "CompleteStep*" -type f
```

### Task 2: 問題点の洗い出し

現行実装の問題点を列挙する:

| 問題点                  | 影響                                     |
| ----------------------- | ---------------------------------------- |
| 「閉じる」ボタン1つのみ | ユーザーの次のアクションが不明確         |
| スキルパス表示のみ      | 生成品質のフィードバック収集ができない   |
| リカバリーフロー未実装  | 生成結果が期待と違った場合の対処がない   |
| 外部連携の設定誘導なし  | 外部ツール連携時の設定漏れが発生しやすい |

### Task 3: 要件定義

**機能要件**:

| ID    | 要件                                                             | 優先度 |
| ----- | ---------------------------------------------------------------- | ------ |
| FR-01 | 完了ヘッダー「✓ スキルの骨格を生成しました」を表示する           | 必須   |
| FR-02 | 「この骨格は期待通りでしたか？」の👍/👎フィードバックを実装する  | 必須   |
| FR-03 | ネクストアクション3カードを表示する                              | 必須   |
| FR-04 | 👎クリックでStep 0に戻るリカバリーフローを実装する               | 必須   |
| FR-05 | W2-seq-03a統合後に Step 0 で前回入力がプリフィルされる前提を作る | 必須   |
| FR-06 | hasExternalIntegration=trueの場合に動作確認チェックを表示する    | 必須   |
| FR-07 | 「▶ 今すぐ実行する」カードでonExecuteNowを呼び出す               | 必須   |
| FR-08 | 「✏ エディタで開く」カードでonOpenInEditorを呼び出す             | 必須   |
| FR-09 | 「＋ 別のスキルを作る」カードでonCreateAnotherを呼び出す         | 必須   |

**非機能要件**:

| ID     | 要件                                           | 優先度 |
| ------ | ---------------------------------------------- | ------ |
| NFR-01 | アクセシビリティ: ボタンにaria-labelを付与する | 必須   |
| NFR-02 | data-testidを全インタラクティブ要素に付与する  | 必須   |
| NFR-03 | Tailwind CSSのデザイントークンを使用する       | 必須   |
| NFR-04 | TypeScript strict modeに対応する               | 必須   |

### Task 4: スコープ境界の確定

- **含む**: CompleteStep.tsx の全面改修、Propsインターフェース更新、関連テストの追加
- **含まない**: SkillCreateWizard.tsx の状態管理（W2-seq-03aのスコープ）、Step 0のプリフィル受け取りロジック（W2-seq-03aのスコープ）

> 境界メモ: W1-par-02c は `onRetry` を通じて再実行要求と文脈を渡すまでを担当し、前回入力の再表示そのものは W2-seq-03a が担当する。

## 参照資料

| 資料名            | パス                                                                      | 説明               |
| ----------------- | ------------------------------------------------------------------------- | ------------------ |
| 現行CompleteStep  | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`      | 改修対象ファイル   |
| SkillCreateWizard | `apps/desktop/src/renderer/components/skill/wizard/SkillCreateWizard.tsx` | 親コンポーネント   |
| W0-seq-01型定義   | `docs/30-workflows/W0-seq-01-types-skill-info-form/`                      | 依存する型定義     |
| レーンindex       | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                   | 設計根拠・全体方針 |

## 成果物

| 成果物     | パス                              | 説明                           |
| ---------- | --------------------------------- | ------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能要件・非機能要件の確定一覧 |

## 完了条件

- [ ] 現行実装の問題点が列挙されている
- [ ] 機能要件FR-01〜FR-09が全て記載されている
- [ ] 非機能要件NFR-01〜NFR-04が全て記載されている
- [ ] スコープ境界（含む/含まない）が明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
