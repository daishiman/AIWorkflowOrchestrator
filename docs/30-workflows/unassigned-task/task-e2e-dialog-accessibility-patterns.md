# E2Eダイアログアクセシビリティテストパターン拡充 - タスク指示書

## メタ情報

```yaml
issue_number: 672
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-e2e-dialog-accessibility-patterns-001      |
| タスク名     | E2Eダイアログアクセシビリティテストパターン拡充 |
| 分類         | 改善                                            |
| 対象機能     | E2Eテスト / アクセシビリティ                    |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 12 システム仕様書更新                     |
| 発見日       | 2026-02-02                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-D（E2E権限ダイアログテスト）の実装により、testing-dialog-patterns.mdが新規作成された。現在5件のアクセシビリティテスト（ARIA属性、Escapeキー、Enterキー、Tabキー、aria-modal）が実装されているが、WCAG 2.1 AA完全準拠には追加パターンが必要。

### 1.2 問題点・課題

| 項目                       | 現状                          | 課題                         |
| -------------------------- | ----------------------------- | ---------------------------- |
| フォーカストラップ検証     | Tab連打で留まることの確認のみ | 逆方向（Shift+Tab）未検証    |
| スクリーンリーダー対応     | ARIA属性の存在確認のみ        | 読み上げ順序・内容の検証なし |
| ダイアログ開閉時フォーカス | 未検証                        | 開閉時のフォーカス移動未検証 |
| 高コントラストモード       | 未検証                        | 視認性検証なし               |

### 1.3 放置した場合の影響

- WCAG 2.1 AA準拠を主張できない
- スクリーンリーダー利用者がダイアログを適切に操作できない可能性
- アクセシビリティ監査で指摘を受けるリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

権限ダイアログのアクセシビリティテストを拡充し、WCAG 2.1 AA準拠レベルの検証を実現する。

### 2.2 最終ゴール

- アクセシビリティテストケース追加（6件→12件以上）
- testing-dialog-patterns.mdのAccessibilityセクション拡充
- testing-accessibility.mdへのダイアログ固有パターン追加

### 2.3 スコープ

#### 含むもの

- Shift+Tabによる逆方向フォーカス移動テスト
- ダイアログ開閉時のフォーカス管理テスト
- aria-describedby属性検証
- ダイアログ外クリック時の動作テスト
- フォーカス可視性（outline）テスト

#### 含まないもの

- スクリーンリーダー実機テスト（自動化困難）
- 高コントラストモードテスト（別タスク）
- 他のダイアログ種別（確認ダイアログ、エラーダイアログ等）

### 2.4 成果物

| 成果物                           | 配置先                                             |
| -------------------------------- | -------------------------------------------------- |
| アクセシビリティテストケース追加 | apps/desktop/e2e/skill-permission.spec.ts          |
| testing-dialog-patterns.md更新   | .claude/skills/aiworkflow-requirements/references/ |
| testing-accessibility.md更新     | .claude/skills/aiworkflow-requirements/references/ |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-D（E2E権限ダイアログテスト）が完了していること
- testing-dialog-patterns.md v1.0.0が存在すること
- apps/desktop/e2e/skill-permission.spec.tsが存在すること

### 3.2 依存タスク

| タスクID  | タスク名                         | 状態 |
| --------- | -------------------------------- | ---- |
| TASK-8C-D | E2Eテスト - 権限ダイアログフロー | 完了 |

### 3.3 必要な知識

- Playwright E2Eテスト
- WCAG 2.1 ガイドライン
- WAI-ARIA仕様（ダイアログ関連）
- フォーカス管理パターン

### 3.4 システム仕様書参照

| 仕様書                     | 参照セクション                     |
| -------------------------- | ---------------------------------- |
| testing-dialog-patterns.md | Accessibilityパターン              |
| testing-accessibility.md   | ARIA属性、キーボードナビゲーション |
| testing-playwright-e2e.md  | セレクター戦略、待機パターン       |
| quality-e2e-testing.md     | TASK-8C-D完了記録                  |

### 3.5 推奨アプローチ

1. 既存テストをベースに新規テストケースを追加
2. Playwright公式のアクセシビリティテストパターンを参照
3. WAI-ARIAダイアログパターンに準拠

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容               |
| ----- | ---------------- | ------------------ |
| 1     | 要件定義         | テストケース設計   |
| 4     | テスト作成       | テストコード実装   |
| 9     | 品質保証         | 全テスト実行・検証 |
| 12    | ドキュメント更新 | 仕様書更新         |

### Phase 1: 要件定義

#### 目的

追加するアクセシビリティテストケースを設計する

#### 手順

1. WCAG 2.1 AAのダイアログ関連ガイドラインを確認
2. 現状のテストカバレッジをマッピング
3. 不足しているテストケースをリストアップ

#### 成果物

- テストケース設計書

#### 完了条件

- 追加テストケース一覧が定義されている

### Phase 4: テスト作成

#### 目的

設計に基づきテストコードを実装する

#### 手順

1. skill-permission.spec.tsに新規テストケースを追加
2. 各テストケースの実装
3. ローカルで全テスト実行・PASS確認

#### 成果物

- 更新されたskill-permission.spec.ts

#### 完了条件

- 全テストがPASSすること
- ESLintエラーがないこと

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Shift+Tabによる逆方向フォーカス移動テスト追加
- [ ] ダイアログ開閉時のフォーカス管理テスト追加
- [ ] aria-describedby属性検証テスト追加
- [ ] フォーカス可視性（outline）テスト追加

### 品質要件

- [ ] 全テストがPASS
- [ ] ESLintエラーなし
- [ ] TypeScriptコンパイルエラーなし

### ドキュメント要件

- [ ] testing-dialog-patterns.md Accessibilityセクション更新
- [ ] testing-accessibility.md ダイアログ固有パターン追加
- [ ] quality-e2e-testing.md テスト数更新

---

## 6. 検証方法

### テストケース

| TC    | 検証内容                 | 期待結果                               |
| ----- | ------------------------ | -------------------------------------- |
| TC-A1 | Shift+Tab逆方向移動      | ダイアログ内要素を逆順で移動           |
| TC-A2 | ダイアログ開時フォーカス | 最初のインタラクティブ要素にフォーカス |
| TC-A3 | ダイアログ閉時フォーカス | トリガー要素にフォーカス戻る           |
| TC-A4 | aria-describedby存在確認 | 説明テキストがリンクされている         |
| TC-A5 | フォーカスリングの視認性 | outline/box-shadowが表示される         |

### 検証手順

1. `pnpm --filter @repo/desktop exec playwright test e2e/skill-permission.spec.ts` 実行
2. 全テストPASS確認
3. Playwright UIモードでアクセシビリティ動作を目視確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                           |
| ------------------------ | ------ | -------- | ------------------------------ |
| フォーカス管理の実装差異 | 中     | 中       | ブラウザ固有の挙動を文書化     |
| テスト実行時間増加       | 低     | 高       | 並列実行設定の見直し           |
| 既存テストへの影響       | 低     | 低       | 独立したdescribeブロックで追加 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| ダイアログテストパターン   | .claude/skills/aiworkflow-requirements/references/testing-dialog-patterns.md |
| アクセシビリティ仕様       | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md   |
| E2Eテスト仕様              | .claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md     |
| Playwright E2E実装パターン | .claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md  |

### 参考資料

| 資料                             | URL                                                     |
| -------------------------------- | ------------------------------------------------------- |
| WAI-ARIA Dialog Pattern          | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/  |
| WCAG 2.1 Success Criterion 2.4.3 | https://www.w3.org/WAI/WCAG21/Understanding/focus-order |
| Playwright Accessibility Testing | https://playwright.dev/docs/accessibility-testing       |

---

## 9. 備考

### 発見経緯

aiworkflow-requirements v8.29.0更新時のギャップ分析で検出。testing-dialog-patterns.mdとtesting-accessibility.mdの間にダイアログ固有のアクセシビリティパターンが不足していることが判明。

### 補足事項

- 本タスクはWCAG 2.1 AA準拠の第一歩
- スクリーンリーダー実機テストは別タスクとして検討
- 高コントラストモード対応も別タスクとして検討
