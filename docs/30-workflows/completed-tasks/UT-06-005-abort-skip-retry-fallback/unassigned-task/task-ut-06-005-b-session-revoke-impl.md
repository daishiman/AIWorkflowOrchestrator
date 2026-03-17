# UT-06-005-B: revokeSessionEntries セッション別本格実装 - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | UT-06-005-B                               |
| タスク名     | revokeSessionEntries セッション別本格実装 |
| 分類         | 機能追加                                  |
| 対象機能     | SkillExecutor Permission Fallback         |
| 優先度       | 中                                        |
| 見積もり規模 | 中規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | Phase 12（UT-06-005 レビュー GAP-04）     |
| 発見日       | 2026-03-16                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の `revokeSessionEntries` は全エントリクリアのスタブ実装になっている。`AllowedToolEntry` に `sessionId` フィールドを追加し、セッション別フィルタリングを実装する必要がある。

### 1.2 問題点・課題

- revokeSessionEntries が全エントリをクリアするスタブ実装のため、abort 時に他セッションの正当な許可まで剥奪される
- AllowedToolEntry に sessionId フィールドがなく、セッション別のエントリ管理ができない
- 複数スキルの並行実行時に、一方の abort が他方の許可に影響する

### 1.3 放置した場合の影響

- revokeSessionEntries が全セッション一括クリアのまま残り、他セッションの正当な許可が剥奪される
- マルチセッション環境での権限管理の信頼性が低下する
- 複数スキル並行実行時に予期しない Permission 拒否が発生し、ユーザー体験が悪化する

---

## 2. 何を達成するか（What）

### 2.1 目的

- abort 時に現在のセッションのエントリのみを revoke し、他のセッションの許可が影響を受けないようにする
- セッション分離により、複数スキルの並行実行時に誤った許可剥奪が起きないようにする

### 2.2 最終ゴール

revokeSessionEntries(sessionId) が指定されたセッションのエントリのみを削除し、他セッションのエントリが保持される状態。sessionId 未設定エントリの後方互換性が維持されていること。

### 2.3 スコープ

#### 含むもの

- AllowedToolEntry への sessionId フィールド追加
- PermissionStore.revokeSessionEntries のフィルタリング実装
- sessionId 未設定エントリの後方互換性処理
- セッション分離のテスト

#### 含まないもの

- PreToolUse Hook への統合（UT-06-005-A で対応）
- Renderer 側の UI 変更（UT-06-005-C で対応）
- sessionId の生成ロジック（SkillExecutor 側で生成済みの前提）

### 2.4 成果物

- 修正済み `packages/shared/src/types/permission-store.ts`（AllowedToolEntry 型拡張）
- 修正済み `apps/desktop/src/main/services/skill/PermissionStore.ts`（フィルタリング実装）
- セッション分離テストファイル
- Phase 1〜12 の成果物一式（`docs/30-workflows/` 配下）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-06-005 が完了済みであること（revokeSessionEntries スタブ実装済み）
- AllowedToolEntry の型定義ファイルの場所が特定されていること

### 3.2 依存タスク

- UT-06-005（完了済み: revokeSessionEntries スタブ実装）

### 3.3 必要な知識

- PermissionStore の内部データ構造と AllowedToolEntry の型定義
- Zustand Store または Map ベースのフィルタリングパターン
- TypeScript のオプショナルフィールドの後方互換性設計
- P48（useShallow 未適用による派生セレクタ無限ループ）の回避策

### 3.4 推奨アプローチ

PermissionStore に sessionId フィールドを追加し、filter ベースの revoke 実装を行う。具体的には:

1. AllowedToolEntry に `sessionId?: string` オプショナルフィールドを追加する
2. revokeSessionEntries(sessionId) で `entries.filter(e => e.sessionId !== sessionId)` のフィルタリングを実装する
3. sessionId が undefined のエントリは revoke 対象外とする（後方互換性）

---

## 4. 実行手順

### Phase構成

標準 Phase 1〜12 構成に従う。本タスクは中規模のため、Phase 2（設計）で型定義の影響範囲調査が重要となる。

### Phase 1: 要件定義

#### 目的

sessionId フィールド追加の詳細要件と後方互換性ルールを確定する。

#### 手順

1. AllowedToolEntry の現在の型定義と使用箇所を `grep -rn "AllowedToolEntry"` で全数調査する
2. sessionId 未設定時のふるまいを定義する
3. 既存の revokeSessionEntries 呼び出し箇所を特定する

#### 成果物

- phase-1-requirements.md

#### 完了条件

- 型変更の影響範囲が特定され、後方互換性ルールが明文化されていること

### Phase 2-3: 設計・設計レビュー

#### 目的

AllowedToolEntry 型拡張とフィルタリングロジックの設計を行い、レビューする。

#### 手順

1. AllowedToolEntry に sessionId フィールドを追加する型定義を設計する
2. revokeSessionEntries のフィルタリングロジックを設計する
3. P32（型定義の二箇所同時更新）に留意し、shared 型と desktop 型の同時更新計画を立てる

#### 成果物

- phase-2-design.md, phase-3-design-review.md

#### 完了条件

- 設計レビューが PASS または MINOR であること

### Phase 4: テスト作成

#### 目的

セッション分離のテストケースを作成する。

#### 手順

1. セッション A の abort がセッション B のエントリに影響しないテストを作成する
2. sessionId 未設定エントリが revoke 対象外となるテストを作成する
3. 空の sessionId での revokeSessionEntries のテストを作成する

#### 成果物

- セッション分離テストファイル

#### 完了条件

- テストケースが Red 状態であること（実装前）

### Phase 5: 実装

#### 目的

AllowedToolEntry 型拡張とフィルタリング実装を行う。

#### 手順

1. AllowedToolEntry に `sessionId?: string` フィールドを追加する
2. PermissionStore.revokeSessionEntries で sessionId に基づくフィルタリングを実装する
3. 後方互換性処理（sessionId undefined のエントリは revoke 対象外）を実装する

#### 成果物

- 修正済み型定義ファイル、修正済み PermissionStore.ts

#### 完了条件

- Phase 4 のテストが全 PASS であること

### Phase 6-12: テスト拡充〜完了

標準フェーズに従い、カバレッジ確認・リファクタリング・品質検証・最終レビュー・手動テスト・ドキュメント更新・PR 作成を実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AllowedToolEntry に `sessionId?: string` フィールドが追加されていること
- [ ] `revokeSessionEntries(sessionId)` が当該 sessionId のエントリのみを削除すること
- [ ] セッション A の abort がセッション B のエントリに影響しないこと
- [ ] sessionId 未設定時の後方互換性が維持されていること

### 品質要件

- [ ] 既存テストが全 PASS であること
- [ ] セッション分離テストが追加されていること
- [ ] Line Coverage 80% 以上、Branch Coverage 60% 以上
- [ ] `pnpm typecheck` が PASS すること

### ドキュメント要件

- [ ] sessionId 未設定時の後方互換性が文書化されていること
- [ ] implementation-guide.md（Part 1: 概念説明、Part 2: 実装詳細）が作成されていること
- [ ] Phase 12 の全チェックリストが完了していること

---

## 6. 検証方法

### テストケース

| #   | テストケース                                          | 期待結果                                          |
| --- | ----------------------------------------------------- | ------------------------------------------------- |
| 1   | セッション A のエントリのみ revoke される             | セッション B のエントリが残存すること             |
| 2   | sessionId 未設定エントリが revoke 対象外              | sessionId が undefined のエントリが保持されること |
| 3   | 存在しない sessionId で revoke しても例外が発生しない | エントリ数が変化しないこと                        |
| 4   | 全エントリが同一 sessionId の場合、全件削除される     | エントリ数が 0 になること                         |
| 5   | 既存テストが全 PASS                                   | テスト結果に failure がないこと                   |

### 検証手順

1. `pnpm --filter @repo/desktop test` で全テスト実行
2. `pnpm typecheck` で型整合性を確認（P32 対策）
3. カバレッジレポートで基準達成を確認

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                                          |
| ----------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| 型定義変更の影響範囲が広い（P32）               | 高     | 中       | 事前に `grep -rn "AllowedToolEntry"` で全使用箇所を特定し、影響範囲を限定する |
| マルチセッション環境での権限管理の信頼性低下    | 高     | 中       | セッション分離テストで並行実行シナリオを検証する                              |
| sessionId 未設定エントリの後方互換性問題        | 中     | 低       | オプショナルフィールドとし、未設定時は revoke 対象外とする                    |
| shared 型と desktop 型の同時更新漏れ（P23/P32） | 中     | 中       | 両ファイルを1つのコミットで同時更新し、typecheck で検証する                   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/` （親タスクの完了成果物）
- `.claude/rules/06-known-pitfalls.md` - P23（API 二重定義の型管理）、P32（型定義の二箇所同時更新）

### 参考資料

- `apps/desktop/src/main/services/skill/PermissionStore.ts`
- `packages/shared/src/types/permission-store.ts`（または AllowedToolEntry 型定義ファイル）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-06-005 Phase 12 レビューにて GAP-04 として検出:
revokeSessionEntries が全エントリクリアのスタブ実装のまま。
AllowedToolEntry に sessionId フィールドがなく、
セッション別のフィルタリングが未実装。
```

### 補足事項

- 発見元: UT-06-005 Phase 10/12 レビュー
- 関連 GAP: GAP-04（セッション固有 revoke 未実装）
