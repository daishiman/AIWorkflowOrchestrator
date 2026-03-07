---
task_id: UT-IMP-PHASE11-HARNESS-FALLBACK-STANDARDIZATION-001
task_name: Phase 11 画面検証の harness fallback 標準化
category: 改善
target_feature: Phase 11 手動テスト運用
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-06
dependencies: []
---

# Phase 11 画面検証の harness fallback 標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-IMP-PHASE11-HARNESS-FALLBACK-STANDARDIZATION-001 |
| タスク名     | Phase 11 画面検証の harness fallback 標準化         |
| 分類         | 改善                                                |
| 対象機能     | Phase 11 手動テスト運用                             |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模（2-4時間）                                   |
| ステータス   | 未実施                                              |
| 発見元       | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 Phase 12 |
| 発見日       | 2026-03-06                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 の Phase 11（手動テスト検証）で、worktree環境の esbuild platform 不整合によりデスクトップアプリを起動できず、スクリーンショット取得が不可能だった。代替手段としてテストベース検証（41テスト全PASS）とコードレビューでのApple HIG準拠確認を実施したが、視覚的な検証エビデンスが欠落した。

### 1.2 問題点・課題

1. Phase 11 仕様書には「スクリーンショット取得」が必須と記載されているが、worktree環境での代替手段が標準化されていない
2. `manual-test-matrix.md` に「テストベース検証で代替」と記載したが、この判断基準が曖昧
3. TC記法（`TC-11-01` 等）の証跡フォーマットが統一されていない

### 1.3 放置した場合の影響

- Phase 11 の品質基準がタスクごとに異なる
- worktree環境での開発が増えると、Phase 11 スキップが常態化するリスク
- UI/UXの視覚的な回帰テストが形骸化

---

## 2. 何を達成するか（What）

### 2.1 目的

worktree環境でアプリ起動不可の場合の Phase 11 代替検証フロー（harness fallback）を標準化し、テンプレート化する。

### 2.2 最終ゴール

Phase 11 仕様書に以下の判断フローを追加：

```
アプリ起動可能？
  → YES: 通常フロー（スクリーンショット + 目視確認）
  → NO:  harness fallback フロー
          1. テスト実行結果のスクリーンショット
          2. Storybook/コンポーネント単体レンダリング（利用可能な場合）
          3. コードレビューでのスタイル検証チェックリスト
          4. 「harness fallback」タグを manual-test-result.md に記載
```

### 2.3 スコープ

#### 含むもの

- Phase 11 テンプレートに harness fallback フロー追加
- TC記法のフォーマット標準化
- `manual-test-result.md` テンプレート更新

#### 含まないもの

- worktree の esbuild 問題自体の修正（UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 で対応）
- Storybook の導入
- E2Eテストの自動化

### 2.4 成果物

- 更新済み Phase 11 テンプレート
- harness fallback チェックリスト
- TC記法フォーマットガイド

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし

### 3.2 依存タスク

- なし（UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 とは並列実行可能）

### 3.3 必要な知識

- Phase 11 手動テスト仕様書のフォーマット
- task-specification-creator のテンプレート構造

### 3.4 推奨アプローチ

1. `/.claude/skills/task-specification-creator/` の Phase 11 テンプレートを確認
2. harness fallback フローを追加
3. TC記法の標準フォーマットを定義
4. `manual-test-result.md` テンプレートに「fallback」セクションを追加

---

## 4. 苦戦箇所と解決のヒント

### 4.1 TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 での苦戦

| 課題                       | 原因                             | 解決のヒント                              |
| -------------------------- | -------------------------------- | ----------------------------------------- |
| スクリーンショット取得不可 | worktree esbuild platform不整合  | harness fallback フローで代替基準を明確化 |
| 代替検証の判断基準が曖昧   | Phase 11仕様にfallbackが未定義   | 「アプリ起動不可」を明示的な分岐条件に    |
| TC記法の不統一             | テンプレートにフォーマット未定義 | `TC-{Phase}-{SEQ}: {概要}` 形式を標準化   |

### 4.2 参照すべき仕様書

| 仕様書                     | 内容                                                 |
| -------------------------- | ---------------------------------------------------- |
| `06-known-pitfalls.md`     | P48（worktreeバイナリ不整合）                        |
| `lessons-learned.md`       | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 苦戦箇所1 |
| task-specification-creator | Phase 11 テンプレート                                |

---

## 5. 受入基準

- [ ] Phase 11 テンプレートに harness fallback フローが追加されている
- [ ] アプリ起動不可時の代替検証手順が明確に定義されている
- [ ] TC記法のフォーマットが標準化されている
- [ ] `manual-test-result.md` テンプレートに fallback セクションがある
