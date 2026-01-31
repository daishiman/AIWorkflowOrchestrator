# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 3                                   |
| フェーズ名   | 設計レビューゲート                  |
| カテゴリ     | ゲート                              |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 2で作成した設計書の品質を検証し、実装可能性・完全性・整合性を確認する。PASS/MINOR/MAJOR/CRITICAL のいずれかで判定する。

---

## タスク

- Task 1: 設計完全性レビュー
  - Phase 1の要件が全て設計に反映されているか確認する
  - 10種類以上のツール説明テンプレートが設計されているか確認する
  - デフォルトテンプレートが設計されているか確認する
  - UI配置設計・折りたたみUI設計が完全か確認する

- Task 2: アーキテクチャ整合性レビュー
  - Renderer層への配置が適切か確認する（`architecture-patterns.md`準拠）
  - 既存PermissionDialog.tsxとの統合方針が妥当か確認する
  - モジュール分離（permissionDescriptions.ts）が単一責務原則に沿っているか確認する

- Task 3: セキュリティレビュー
  - XSS防止設計が適切か確認する（`security-input-validation.md`準拠）
  - ユーザー由来データ（ツール引数）の安全な表示方針を確認する
  - Reactの自動エスケープに依存する部分と追加対策が必要な部分を区別する

- Task 4: アクセシビリティレビュー
  - ARIA属性設計が`ui-ux-design-principles.md`のアクセシビリティ基準に準拠しているか確認する
  - キーボード操作設計がApple HIG準拠か確認する
  - スクリーンリーダー対応が考慮されているか確認する

- Task 5: テスト戦略レビュー
  - テストケースがカバレッジ基準（Line 80%, Branch 60%, Function 80%）を達成可能か確認する
  - 既存テストとの整合性を確認する
  - エッジケース（空引数、特殊文字、長文）が網羅されているか確認する

- Task 6: 技術的実現可能性レビュー
  - 既存コードベースとの整合性を確認する
  - 変更の影響範囲が限定的であることを確認する
  - 既存テストへの影響がないことを確認する

- Task 7: 仕様参照チェック
  - 設計書が参照すべき仕様書を全て参照しているか確認する
  - 仕様書の要件が設計に正しく反映されているか確認する

---

## 参照資料

| ドキュメント           | パス                                                                             | 説明                 |
| ---------------------- | -------------------------------------------------------------------------------- | -------------------- |
| Phase 2成果物          | `outputs/phase-2/design-document.md`                                             | レビュー対象の設計書 |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                     | 要件定義書（基準）   |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | 設計パターン基準     |
| セキュリティ入力検証   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | セキュリティ基準     |
| UI/UXデザイン原則      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`   | アクセシビリティ基準 |
| カバレッジ基準         | `coverage-standards.md` (task-specification-creator)                             | テストカバレッジ基準 |

---

## 手順

### Task 1 実行手順

1. Phase 1の要件定義書を読み込む
2. Phase 2の設計書を読み込む
3. 以下のチェックリストで完全性を検証する：
   - [ ] 全要件が設計に反映されている
   - [ ] 型定義・インターフェースが明確
   - [ ] ツール説明テンプレートが10種類以上
   - [ ] デフォルトテンプレートが定義されている
   - [ ] UI配置が明確
   - [ ] 折りたたみUI仕様が完全
   - [ ] 状態管理設計が明確

### Task 2 実行手順

1. `architecture-patterns.md` を参照し、Renderer層への配置が正しいか確認する
2. 既存コンポーネントとの結合度を評価する
3. permissionDescriptions.tsが純粋関数モジュール（副作用なし）として設計されているか確認する

### Task 3 実行手順

1. `security-input-validation.md` を参照する
2. Reactの`{}`式展開が自動的にHTMLエスケープすることを確認する
3. `dangerouslySetInnerHTML`が使用されていないことを確認する
4. 追加のサニタイズが必要なケースがないか確認する

### Task 4 実行手順

1. `ui-ux-design-principles.md` のアクセシビリティセクションを参照する
2. 以下のARIA属性が設計に含まれているか確認する：
   - `aria-expanded` on toggle button
   - `aria-controls` pointing to detail container
   - `role="region"` on detail container
3. キーボードナビゲーション設計を確認する

### Task 5 実行手順

1. テストケース一覧を確認する
2. カバレッジ達成可能性を評価する
3. 不足テストケースがあれば指摘する

### Task 6 実行手順

1. 既存コードベースの構成を確認する：
   - `PermissionDialog.tsx` の現在のインターフェースと内部構造
   - 既存テストファイルの構造と依存関係
2. 変更の影響範囲を検証する：
   - 新規ファイル（`permissionDescriptions.ts`）追加による副作用がないこと
   - `PermissionDialog.tsx` の変更が既存のprops・外部インターフェースを破壊しないこと
3. 既存テスト（`PermissionDialog.test.tsx`）が変更後も全てPASSする見込みであることを確認する

### Task 7 実行手順

1. 以下の仕様参照チェックテーブルに基づき確認する：

| 仕様書                         | 参照すべきセクション            | 設計への反映状況 |
| ------------------------------ | ------------------------------- | ---------------- |
| `architecture-patterns.md`     | Renderer層パターン              | 確認             |
| `security-input-validation.md` | XSS防止・入力検証               | 確認             |
| `ui-ux-design-principles.md`   | アクセシビリティ・Apple HIG     | 確認             |
| `ui-ux-design-system.md`       | 8pxグリッド・カラーコントラスト | 確認             |
| `security-implementation.md`   | 多層防御・注入防止              | 確認             |
| `security-electron-ipc.md`     | CSP・Renderer層セキュリティ     | 確認             |

---

## レビューゲート判定基準

| 判定     | 条件                                                       | 対応                 |
| -------- | ---------------------------------------------------------- | -------------------- |
| PASS     | 全チェック項目を満たしている                               | Phase 4へ進む        |
| MINOR    | 軽微な改善点がある（進行に影響なし）                       | 指摘事項を記録し進む |
| MAJOR    | 重要な設計変更が必要                                       | Phase 2に差し戻し    |
| CRITICAL | 根本的な設計見直しが必要（セキュリティ、アーキテクチャ等） | Phase 1から再検討    |

---

## 統合テストアクション

| カテゴリ           | 確認内容                           |
| ------------------ | ---------------------------------- |
| データフロー       | 設計書のデータフロー図が正確か確認 |
| エラーハンドリング | フォールバック設計の妥当性を検証   |
| 状態同期           | 状態管理設計の妥当性を検証         |

---

## 成果物

| 成果物名             | パス                                      | 種別     | 説明               |
| -------------------- | ----------------------------------------- | -------- | ------------------ |
| 設計レビューレポート | `outputs/phase-3/design-review-report.md` | document | レビュー結果と判定 |

---

## 完了条件

- [ ] 設計完全性レビューが実施されている
- [ ] アーキテクチャ整合性レビューが実施されている
- [ ] セキュリティレビューが実施されている
- [ ] アクセシビリティレビューが実施されている
- [ ] テスト戦略レビューが実施されている
- [ ] 技術的実現可能性レビューが実施されている
- [ ] 仕様参照チェックが実施されている
- [ ] PASS/MINOR/MAJOR/CRITICALのいずれかで判定されている
- [ ] 判定結果がPASSまたはMINOR（MAJOR/CRITICALの場合は差し戻し）
- [ ] 成果物 `outputs/phase-3/design-review-report.md` が生成されている

---

## 次のフェーズ

Phase 4: テスト作成 → TDD Red（テスト先行）
