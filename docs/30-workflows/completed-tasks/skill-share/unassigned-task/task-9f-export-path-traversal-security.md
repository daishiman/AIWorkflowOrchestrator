# TASK-9F export パストラバーサル対策 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-9F-EXPORT-PATH-TRAVERSAL-001            |
| タスク名     | `exportToLocal` のパストラバーサル検証追加 |
| 分類         | セキュリティ                               |
| 対象機能     | TASK-9F スキル共有・インポート機能         |
| 優先度       | 高                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 10 MINOR-05                          |
| 発見日       | 2026-02-27                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`importFromLocal()` はパストラバーサルチェック済みだが、`exportToLocal()` は未適用だった。

### 1.2 問題点・課題

`../../` を含む出力先指定を許すと、意図しない場所への書き込みが起こり得る。

### 1.3 放置した場合の影響

高リスクのセキュリティ欠陥として運用停止につながる可能性がある。

---

## 2. 何を達成するか（What）

### 2.1 目的

`exportToLocal()` でも `hasPathTraversal()` を必須化し、入力を拒否する。

### 2.2 最終ゴール

- `destination.localPath` の traversal を拒否
- エラーコード 1003 を一貫返却

### 2.3 スコープ

#### 含むもの

- `exportToLocal()` へのチェック追加
- エラー処理とテスト追加

#### 含まないもの

- OS依存の高度パス正規化拡張

### 2.4 成果物

- セキュリティチェック実装
- 失敗ケーステスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存 `hasPathTraversal()` の仕様を確認済み

### 3.2 依存タスク

- 依存なし

### 3.3 必要な知識

- パストラバーサル脅威モデル
- エラーコード運用

### 3.4 推奨アプローチ

`importFromLocal` と同一の防御パターンを適用して差分を最小化する。

---

## 4. 実行手順

### Phase構成

- Phase A: 実装
- Phase B: テスト

### Phase A: 実装

#### 目的

`exportToLocal` の入力を防御する。

#### 手順

1. `destination.localPath` を検証する。
2. traversal 検出時に `PATH_TRAVERSAL` エラーを返却する。
3. 既存処理との分岐順序を確認する。

#### 成果物

`SkillShareManager.ts` の更新。

#### 完了条件

検出時に処理が中断される。

### Phase B: テスト

#### 目的

セキュリティ回帰を防ぐ。

#### 手順

1. `../../` 入力の拒否テスト追加。
2. 正常パスでの既存動作維持を確認。

#### 成果物

テスト追加・ログ。

#### 完了条件

全テスト PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `exportToLocal()` で traversal 検出が実装されている
- [ ] エラーコード 1003 が返る

### 品質要件

- [ ] 正常系の既存挙動が維持される
- [ ] import/export で同一防御レベルを満たす

### ドキュメント要件

- [ ] セキュリティ仕様書へ反映される

---

## 6. 検証方法

### テストケース

- `destination.localPath = ../../etc`
- 通常ローカルパス

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillShareManager.test.ts`
2. `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                         |
| ---------------- | ------ | -------- | ---------------------------- |
| チェック漏れ再発 | 高     | 中       | import/export 共通ヘルパー化 |
| 正常パス誤検出   | 中     | 低       | 正常系回帰テストを同時追加   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `docs/30-workflows/skill-share/outputs/phase-10/final-review-result.md`

### 参考資料

- NFR-1-3（パストラバーサル防止）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`MINOR-05: exportToLocal にパストラバーサルチェック欠落`

### 補足事項

優先度高のため、TASK-9F 関連未タスクの中で最優先で実施する。
