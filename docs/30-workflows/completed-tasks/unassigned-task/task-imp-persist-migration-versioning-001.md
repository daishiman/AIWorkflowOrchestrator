# UT-IMP-PERSIST-MIGRATION-VERSIONING-001 - タスク指示書

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | UT-IMP-PERSIST-MIGRATION-VERSIONING-001           |
| タスク名     | persist state バージョン移行機構の導入            |
| 分類         | 改善                                              |
| 対象機能     | Renderer Store 永続化（`knowledge-studio-store`） |
| 優先度       | 中                                                |
| 見積もり規模 | 小規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 12                                          |
| 発見日       | 2026-03-08                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現状は `viewHistory` / `expandedFolders` の破損フォールバックを導入したが、persist データ自体の versioned migration が未実装。

### 1.2 問題点・課題

スキーマ変更時に旧データを安全移行できず、再び復元失敗や想定外初期化が起こりうる。

### 1.3 放置した場合の影響

次回の persist shape 変更で起動時エラーや設定消失リスクが増える。

## 2. 何を達成するか（What）

### 2.1 目的

persist データにバージョン移行の導線を追加し、互換性を維持する。

### 2.2 最終ゴール

旧 version の persisted state を読み込んでも例外なく現行 shape に移行される。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/store/index.ts` の version/migrate 導入
- 旧 version fixture の回帰テスト

#### 含まないもの

- 全 slice の仕様刷新
- DB スキーマ変更

### 2.4 成果物

- persist migration 実装
- migration 回帰テスト
- Phase 12 仕様同期追記

## 3. どのように実行するか（How）

### 3.1 前提条件

現行の persist-hardening 実装（TASK-07）が mainline に反映済みであること。

### 3.2 依存タスク

- 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001

### 3.3 必要な知識

Zustand persist middleware、後方互換 migration、TypeScript 型ガード。

### 3.4 推奨アプローチ

`version` と `migrate` を段階導入し、旧 shape は最小変換で現行 shape へ寄せる。

## 4. 実行手順

### Phase構成

Phase 1: 仕様定義 → Phase 2: 実装 → Phase 3: 検証 → Phase 4: 仕様同期

### Phase 1: 移行仕様定義

#### 目的

version 番号と移行ルールを固定する。

#### 手順

1. 現行 persisted shape を棚卸しする。
2. 旧→新の差分を migration テーブル化する。
3. フォールバック値を定義する。

#### 成果物

migration 仕様メモ。

#### 完了条件

変換ルールが全対象フィールドで定義済み。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 旧 version データが現行 shape へ変換される
- [ ] 非期待型入力でも起動継続する

### 品質要件

- [ ] migration テストが PASS
- [ ] 型チェックが PASS

### ドキュメント要件

- [ ] `task-workflow.md` と `lessons-learned.md` を同一ターン同期

## 6. 検証方法

### テストケース

- 旧 version snapshot の読み込み
- 破損値混在 snapshot の読み込み

### 検証手順

1. unit test 実行
2. 手動で localStorage snapshot 注入
3. Settings 到達確認

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                             |
| ---------------------- | ------ | -------- | -------------------------------- |
| migration 分岐の複雑化 | 中     | 中       | version 単位で最小変換に限定する |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 で persist migration の未実装を未タスクとして抽出。
```

### 補足事項

今回のTASK-07は guard 導入が主目的であり、migration は後続分離が妥当。
