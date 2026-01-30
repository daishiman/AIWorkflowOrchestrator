# task-ref-act-warning-elimination-001

## メタ情報

```yaml
issue_number: 590
```

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | task-ref-act-warning-elimination-001 |
| タスク名 | SkillStreamDisplay act()警告完全解消 |
| カテゴリ | ref（リファクタリング）              |
| 優先度   | LOW                                  |
| 推定規模 | MEDIUM（2-3日）                      |
| 状態     | 未着手                               |
| 検出元   | TASK-3-2-F Phase 10                  |
| 作成日   | 2026-01-30                           |

---

## Why（背景）

### 背景

SkillStreamDisplayコンポーネントのテスト実行時に、React Testing Libraryからact()警告が出力される。TASK-3-2-F（テスト環境改善）完了後も、以下の3コンポーネントで警告が残存している。

### 問題

- **警告発生箇所**:
  - TimestampProvider（setInterval由来の定期更新）
  - CopyButton2（コピー後のフィードバック状態更新）
  - SkillStreamDisplayInner（言語切替時のUI再レンダリング）
- **根本原因**: React 18の並行モードとsetInterval/非同期状態更新のタイミング不整合

### 未対応時の影響

- テスト実行時のコンソールノイズ増加
- テスト結果の視認性低下
- 将来的なReactバージョンアップ時のリスク（警告→エラー昇格の可能性）
- コードレビュー時の指摘事項化

### 優先度判定根拠

**LOW**: テスト自体は全162件PASSしており、テスト信頼性への影響なし

---

## What（目的）

### 目的

SkillStreamDisplay関連テストからact()警告を完全に除去する

### 最終ゴール

- テスト実行時にact()警告が0件になること
- テストの信頼性と可読性を向上させること

### スコープ

| 含む                                   | 含まない                           |
| -------------------------------------- | ---------------------------------- |
| TimestampProviderのact()警告対策       | 他コンポーネントのact()警告        |
| CopyButton2のact()警告対策             | パフォーマンス最適化               |
| SkillStreamDisplayInnerのact()警告対策 | 新機能追加                         |
| テストコードの修正                     | 本番コードの大規模リファクタリング |

### 成果物

- 修正されたテストファイル（3ファイル程度）
- 必要に応じて修正された本番コード
- テスト実行結果（警告0件の証跡）

---

## How（実行方法）

### 前提条件

- TASK-3-2-Fが完了していること（✅ 完了済み）
- jsdom環境でテストが実行可能なこと（✅ 確認済み）

### 依存関係

- React Testing Library act()の仕様理解
- React 18 並行モード（Concurrent Mode）の理解
- Vitestのタイマーモック（fakeTimers）の使用経験

### 推奨アプローチ

| コンポーネント          | 推奨対策                                                     | 難易度 |
| ----------------------- | ------------------------------------------------------------ | ------ |
| TimestampProvider       | テスト時のみintervalを無効化、またはuseEffect内でact()ラップ | 中     |
| CopyButton2             | waitFor/findBy系クエリで状態更新を待機                       | 低     |
| SkillStreamDisplayInner | 言語切替をact()でラップ、またはi18n.changeLanguageをawait    | 低     |

---

## 実行フェーズ

### Phase 1: 調査（0.5日）

- [ ] 警告の詳細スタックトレース取得
- [ ] 各コンポーネントの状態更新タイミング特定
- [ ] 既存の対策パターン調査

### Phase 2: 設計（0.25日）

- [ ] 各コンポーネントの対策方針決定
- [ ] テストコード vs 本番コード修正の判断

### Phase 3: 実装（1日）

- [ ] TimestampProvider対策実装
- [ ] CopyButton2対策実装
- [ ] SkillStreamDisplayInner対策実装

### Phase 4: テスト（0.25日）

- [ ] 全テスト実行・警告0件確認
- [ ] カバレッジ維持確認
- [ ] 回帰テスト

### Phase 5: ドキュメント（0.25日）

- [ ] 実装ガイドに対策パターン追記
- [ ] 完了報告作成

---

## 完了チェックリスト

### 機能要件

- [ ] TimestampProviderのact()警告が解消されている
- [ ] CopyButton2のact()警告が解消されている
- [ ] SkillStreamDisplayInnerのact()警告が解消されている
- [ ] 全162テストがPASSしている

### 品質要件

- [ ] カバレッジ80%以上を維持している
- [ ] 新たなテスト不安定性が発生していない
- [ ] テスト実行時間が大幅に増加していない（+10%以内）

### ドキュメント要件

- [ ] 実装ガイドに対策パターンを追記

---

## 検証方法

### テストコマンド

```bash
# act()警告カウント
pnpm vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay 2>&1 | grep -c "act()"
# 期待結果: 0

# 全テスト実行
pnpm vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay
# 期待結果: 162 passed, 1 skipped
```

### 成功基準

- act()を含む警告メッセージが0件
- 全テストがPASS
- カバレッジ閾値達成

---

## リスクと対策

| リスク                          | 影響 | 確率 | 対策                                          |
| ------------------------------- | ---- | ---- | --------------------------------------------- |
| 本番コード変更による副作用      | 中   | 低   | テスト網羅性確認、段階的変更                  |
| fakeTimers適用による不安定化    | 中   | 低   | 既存パターンの流用、afterEachでのリセット徹底 |
| 対策工数が想定超過              | 低   | 中   | 警告を許容する判断も選択肢として残す          |
| React将来バージョンでの挙動変化 | 低   | 低   | RTL公式ドキュメントの推奨パターンに準拠       |

---

## 参考資料

- [React Testing Library - act() warnings](https://testing-library.com/docs/react-testing-library/api/#act)
- [Vitest - Fake Timers](https://vitest.dev/guide/mocking.html#timers)
- [React 18 - Concurrent Features](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- TASK-3-2-F 実装ガイド
- TASK-3-2-F Phase 10 最終レビューゲート

---

## レビューコメント

_（レビュー時に記入）_
