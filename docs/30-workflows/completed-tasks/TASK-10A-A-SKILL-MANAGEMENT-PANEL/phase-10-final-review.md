# Phase 10: 最終レビュー

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 10                                                                                   |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 9（品質検証）                                                                  |
| 次 Phase       | Phase 11（手動テスト）                                                               |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

5 つの観点（要件充足・設計準拠・セキュリティ・アクセシビリティ・コード品質）から多角的に品質と整合性を検証し、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

---

## 実行タスク

- 要件充足レビュー: Phase 1 の受け入れ基準との一致を確認する
- 設計準拠レビュー: Phase 2 の設計決定事項との差分を検証する
- セキュリティ/アクセシビリティレビュー: IPC境界とWCAG観点を監査する
- コード品質レビュー: lint/type/test/coverage の結果を再確認する
- 総合判定と後続アクション決定: PASS/MINOR/MAJOR/CRITICAL を決定する

---

## 参照資料

| 参照資料              | パス                                                                                        | 内容                     |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義      | `phase-1-requirements.md`                                                                   | 受け入れ基準の照合       |
| Phase 2 設計          | `phase-2-design.md`                                                                         | 設計準拠の確認           |
| Phase 5 実装          | `phase-5-implementation.md`                                                                 | 実装内容の確認           |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI 仕様                  |
| UI 機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能仕様の照合           |
| UI デザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | HIGトークン整合の照合    |
| IPC API契約           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC契約の整合確認        |
| コード品質            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準                 |
| セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ         |
| スキルIPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作の防御観点     |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集           |
| 開発ガイドライン      | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約         |
| タスク運用台帳        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録先の正本確認 |
| レビューゲート基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | レビュー判定基準         |

---

## 判定基準

| 判定     | 条件                                         | 対応                                                            |
| -------- | -------------------------------------------- | --------------------------------------------------------------- |
| PASS     | 5 観点の全チェック項目で問題なし             | Phase 11 へ進行                                                 |
| MINOR    | 機能影響のない軽微な問題が 1-3 件            | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行（**省略不可**） |
| MAJOR    | 機能影響のある問題（設計レベルの修正が必要） | 問題の影響範囲に応じて Phase 2-5 へ戻る                         |
| CRITICAL | 要件未充足またはセキュリティ上の重大な問題   | Phase 1 へ戻り要件を再確認                                      |

---

## 実行手順

### 観点 1: 要件充足

Phase 1 で定義した全受入基準が実装に反映されていることを確認する。

| #   | 受入基準                                                                           | 確認方法                                                                                   | 結果 |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| 1   | スキル一覧表示: インポート済みスキルがカード形式で一覧表示される                   | テストファイルで「スキル一覧」「カード」「表示」に関するテストケースが PASS していること   | ✓/✗  |
| 2   | 検索フィルタリング: テキスト入力でスキル名による絞り込みが動作する                 | テストファイルで検索入力後にフィルタ結果が変わるテストケースが PASS していること           | ✓/✗  |
| 3   | 編集ボタン: 各スキルカードに編集ボタンが存在し、クリックでスキルエディタに遷移する | テストファイルで編集ボタンのクリックハンドラが呼ばれるテストケースが PASS していること     | ✓/✗  |
| 4   | 分析ボタン: 各スキルカードに分析ボタンが存在し、クリックで分析ビューに遷移する     | テストファイルで分析ボタンのクリックハンドラが呼ばれるテストケースが PASS していること     | ✓/✗  |
| 5   | 削除ボタン: 各スキルカードに削除ボタンが存在し、クリックで削除処理が実行される     | テストファイルで削除ボタンのクリックハンドラが呼ばれるテストケースが PASS していること     | ✓/✗  |
| 6   | 新規作成画面遷移: 「新規作成」ボタンが存在し、クリックで作成画面に遷移する         | テストファイルで新規作成ボタンのクリックハンドラが呼ばれるテストケースが PASS していること | ✓/✗  |
| 7   | ローディング状態表示: スキル読み込み中にローディング表示が出る                     | テストファイルでローディング状態のテストケースが PASS していること                         | ✓/✗  |

### 観点 2: 設計準拠

Phase 2 の設計に沿った実装であることを確認する。

| #   | 設計要件                                                                                                  | 確認方法                                                                                                                                                                              | 結果 |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | Atomic Design 階層: SkillManagementPanel は organisms 層に配置されている                                  | ファイルパスが `components/skill/` 配下にあり、atoms/molecules を組み合わせた構成であること                                                                                           | ✓/✗  |
| 2   | 個別セレクタ使用: Zustand Store からの状態取得に個別セレクタを使用している（P31 対策）                    | `grep -n "useSkill\|useImported\|useSetSkill" SkillManagementPanel.tsx` で個別セレクタの使用を確認する。`useSkillStore()` のような合成 Hook を `useEffect` 依存配列に含めていないこと | ✓/✗  |
| 3   | Apple HIG カラーパレット使用: CSS 変数またはデザイントークン経由で Apple HIG システムカラーを使用している | コンポーネント内で `#007AFF` 等のハードコード色値ではなく、CSS 変数（`var(--accent-primary)` 等）またはデザイントークンを使用していること                                             | ✓/✗  |
| 4   | コンポーネント Props 型定義: Props インターフェースが明確に定義されている                                 | `grep -n "interface\|type.*Props" SkillManagementPanel.tsx` で型定義を確認する                                                                                                        | ✓/✗  |

### 観点 3: セキュリティ

IPC 通信の P42 準拠 3 段バリデーション（型チェック → 空文字列 → trim 空文字列）と validateIpcSender による送信元検証が実装されていることを確認する。

| #   | セキュリティ要件                                                                          | 確認方法                                                                                                                                                                                                      | 結果 |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | removeSkill が `skill.name` を使用している（P44/P45 対策）                                | `grep -n "removeSkill\|SKILL_REMOVE" SkillManagementPanel.tsx` で引数が `skill.name` であることを確認する。`skill.id`（ハッシュ値）を渡していないこと                                                         | ✓/✗  |
| 2   | IPC チャンネル名が定数で参照されている（P27 対策）                                        | `grep -n "safeInvoke\|safeOn" SkillManagementPanel.tsx` で文字列リテラルではなく `IPC_CHANNELS` 定数が使用されていること（Renderer 側は Zustand Store 経由のため直接 IPC を呼ばない場合は「該当なし」と記録） | ✓/✗  |
| 3   | ユーザー入力のサニタイズ: 検索クエリが XSS を引き起こす文字列を含まない形で処理されている | 検索クエリが `dangerouslySetInnerHTML` に渡されていないこと。`textContent` ベースの比較であること                                                                                                             | ✓/✗  |

### 観点 4: アクセシビリティ（WCAG 2.1 AA）

| #   | アクセシビリティ要件                                                                                  | 確認方法                                                                                                                                                                       | 結果 |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | キーボード操作: 全てのインタラクティブ要素（ボタン、入力フィールド）に Tab キーでフォーカスが移動する | テストファイルで `role="button"` または `<button>` タグが使用されていること。`<div onClick>` のようなアクセシビリティ非対応のパターンがないこと                                | ✓/✗  |
| 2   | ARIA 属性: 検索入力フィールドに `aria-label` または `<label>` が紐付いている                          | `grep -n "aria-label\|htmlFor\|role=" SkillManagementPanel.tsx` で確認する                                                                                                     | ✓/✗  |
| 3   | コントラスト比: テキストと背景のコントラスト比が 4.5:1 以上である                                     | Apple HIG システムカラー（`#000000` on `#FFFFFF`、`#FFFFFF` on `#000000`）を使用している場合は自動的に基準を満たす。カスタムカラーを使用している場合はコントラスト比を計算する | ✓/✗  |
| 4   | 色だけで情報を伝えていない: ステータスや状態がテキストまたはアイコンと色の併用で表現されている        | ローディング状態、エラー状態の表示がテキスト（「読み込み中...」等）を含むこと                                                                                                  | ✓/✗  |

### 観点 5: コード品質

| #   | 品質要件                                                     | 確認方法                                                             | 結果 |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ---- |
| 1   | 全テスト PASS                                                | Phase 9 の Gate 4 結果を参照する                                     | ✓/✗  |
| 2   | カバレッジ基準達成: Line ≥ 80%, Branch ≥ 60%, Function ≥ 80% | Phase 9 の Gate 5 結果を参照する                                     | ✓/✗  |
| 3   | ESLint エラー 0 件                                           | Phase 9 の Gate 1 結果を参照する                                     | ✓/✗  |
| 4   | TypeScript 型エラー 0 件                                     | Phase 9 の Gate 2 結果を参照する                                     | ✓/✗  |
| 5   | `any` 型不使用                                               | `grep -n ": any\|as any" SkillManagementPanel.tsx` で 0 件であること | ✓/✗  |

### Step 6: 総合判定

5 観点の全チェック結果を集計し、以下のルールで判定する:

- **全項目 ✓**: PASS
- **✗ が 1-3 件かつ全て機能影響なし**: MINOR → 全指摘を未タスク仕様書に変換後 Phase 11 へ
- **✗ が機能影響あり**: MAJOR → 影響範囲に応じて Phase 2-5 へ戻る
- **要件未充足またはセキュリティ問題**: CRITICAL → Phase 1 へ戻る

### Step 7: MINOR 指摘の未タスク化（判定が MINOR の場合のみ）

MINOR 指摘が 1 件でもある場合、以下の 3 ステップを全て完了する:

1. `docs/30-workflows/unassigned-task/` に指摘ごとの指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

### Step 8: 最終レビューレポートの作成

`outputs/phase-10/final-review-report.md` に以下を記録する:

```markdown
# Phase 10 最終レビューレポート

## 総合判定: [PASS / MINOR / MAJOR / CRITICAL]

## 観点別結果サマリ

| #   | 観点             | チェック項目数 | ✓   | ✗   | 判定      |
| --- | ---------------- | -------------- | --- | --- | --------- |
| 1   | 要件充足         | 7              |     |     | PASS/FAIL |
| 2   | 設計準拠         | 4              |     |     | PASS/FAIL |
| 3   | セキュリティ     | 3              |     |     | PASS/FAIL |
| 4   | アクセシビリティ | 4              |     |     | PASS/FAIL |
| 5   | コード品質       | 5              |     |     | PASS/FAIL |

## 指摘事項一覧（✗ の項目）

| #                                    | 観点 | 項目 | 重大度 | 詳細 | 対応 |
| ------------------------------------ | ---- | ---- | ------ | ---- | ---- |
| （✗ がない場合は「指摘なし」と記載） |

## MINOR 未タスク化（該当する場合）

| #                                      | 指摘内容 | 指示書パス | task-workflow登録 | 関連仕様書リンク |
| -------------------------------------- | -------- | ---------- | ----------------- | ---------------- |
| （該当なしの場合は「該当なし」と記載） |

## 次の Phase

[Phase 11 / Phase X（差し戻しの場合）]
```

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物               | パス                                      | 説明                       |
| -------------------- | ----------------------------------------- | -------------------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md` | 5 観点の検証結果と総合判定 |

---

## 完了条件

- [ ] 観点 1（要件充足）の全 7 項目を確認した
- [ ] 観点 2（設計準拠）の全 4 項目を確認した
- [ ] 観点 3（セキュリティ）の全 3 項目を確認した
- [ ] 観点 4（アクセシビリティ）の全 4 項目を確認した
- [ ] 観点 5（コード品質）の全 5 項目を確認した
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）を明記した
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換した（3 ステップ完了）
- [ ] `outputs/phase-10/final-review-report.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 11: 手動テスト
