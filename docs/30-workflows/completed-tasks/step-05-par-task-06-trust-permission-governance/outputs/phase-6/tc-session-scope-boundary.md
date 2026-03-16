# テストケース仕様: セッションスコープ境界

## メタ情報

| 項目                   | 値                                                |
| ---------------------- | ------------------------------------------------- |
| タスクID               | TASK-SKILL-LIFECYCLE-06                           |
| Phase                  | 6 - テスト拡充                                    |
| カテゴリ               | TC-ST（セッション・タイムスタンプ系）             |
| 作成日                 | 2026-03-16                                        |
| カバレッジギャップ根拠 | `coverage-gap-analysis.md` 観点3・観点4           |
| 対応 Phase 5 成果物    | `../phase-5/permission-storage-design.md`（予定） |

## 目的

`expiryPolicy: "session"` の許可エントリが、アプリ再起動後に正しくクリアされることを検証する。また `approved_once` 状態がセッション間で分離されることを確認する。

---

## TC-ST-006: session ポリシーのアプリ再起動後削除

### 概要

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| テストID     | TC-ST-006                                    |
| カテゴリ     | TC-ST                                        |
| タイトル     | session ポリシーのアプリ再起動後エントリ削除 |
| 対応ギャップ | `coverage-gap-analysis.md` 観点3             |
| 優先度       | 高                                           |

---

### TC-ST-006a: session 許可後の再起動によるクリア

#### 前提条件（Given）

```
- アプリが起動中である
- PermissionManager が初期化済みである
- electron-store は空（allowedTools エントリなし）
- ツール "Bash" のリスクレベルは "high"
```

#### 操作（When）

```
1. PermissionDialog で "Bash" を expiryPolicy="session" で承認する
2. isToolAllowed("Bash") を呼び出す（再起動前の確認）
3. アプリを再起動する（PermissionManager の初期化を再実行する）
4. isToolAllowed("Bash") を呼び出す（再起動後の確認）
```

#### 期待結果（Then）

```
- 手順2の結果: isToolAllowed("Bash") === true
- 手順4の結果: isToolAllowed("Bash") === false
- PermissionManager の内部状態: "Bash" エントリが sessionStore に存在しない
```

#### 実装上の注意

- `PermissionManager` の初期化時に `sessionStore.clear()` が呼ばれること
- electron-store には session エントリが書き込まれていないため、再起動後に読み込んでも session エントリは存在しない
- テストでは `PermissionManager` のコンストラクタを再度実行することで「再起動」をシミュレートする

#### 対応 Phase 5 成果物

- `../phase-5/permission-storage-design.md`: `sessionStore` の初期化ロジック
- `../phase-5/permission-manager-spec.md`: `isToolAllowed()` の実装仕様

---

### TC-ST-006b: permanent 許可後の再起動による持続性（対比確認）

#### 前提条件（Given）

```
- アプリが起動中である
- PermissionManager が初期化済みである
- electron-store は空（allowedTools エントリなし）
- ツール "Write" のリスクレベルは "medium"
```

#### 操作（When）

```
1. PermissionDialog で "Write" を expiryPolicy="permanent" で承認する
2. isToolAllowed("Write") を呼び出す（再起動前の確認）
3. アプリを再起動する（PermissionManager の初期化を再実行する）
4. isToolAllowed("Write") を呼び出す（再起動後の確認）
```

#### 期待結果（Then）

```
- 手順2の結果: isToolAllowed("Write") === true
- 手順4の結果: isToolAllowed("Write") === true（permanent は再起動後も持続）
- electron-store: "Write" エントリが expiryPolicy="permanent" で存在する
```

#### 実装上の注意

- `permanent` エントリは electron-store に永続化されるため、再起動後も読み込まれる
- TC-ST-006a との対比テストとして、session と permanent の動作差分を明確化する

#### 対応 Phase 5 成果物

- `../phase-5/permission-storage-design.md`: `electron-store` への永続化ロジック
- `../phase-5/permission-manager-spec.md`: 起動時のストア読み込みロジック

---

### TC-ST-006c: session エントリの electron-store 非書き込み確認

#### 前提条件（Given）

```
- アプリが起動中である
- PermissionManager が初期化済みである
- electron-store の "allowedTools" キーは空配列またはundefined
- ツール "Bash" のリスクレベルは "high"
```

#### 操作（When）

```
1. PermissionDialog で "Bash" を expiryPolicy="session" で承認する
2. electron-store.get("allowedTools") を呼び出す
3. 返却された配列から expiryPolicy === "session" のエントリを抽出する
```

#### 期待結果（Then）

```
- 手順3の結果: 抽出件数 === 0
  （session エントリは electron-store に書き込まれない）
- isToolAllowed("Bash") === true はメモリ上の sessionStore で管理されている
```

#### 実装上の注意

- `expiryPolicy: "session"` のエントリは `sessionStore`（メモリ上のMap）にのみ保存される
- electron-store への書き込みは `expiryPolicy: "time_24h"` / `"time_7d"` / `"permanent"` の場合のみ
- このテストは「永続化されないこと」の保証テスト

#### 対応 Phase 5 成果物

- `../phase-5/permission-storage-design.md`: ストレージ分岐ロジック（メモリ vs electron-store）

---

## TC-ST-007: `approved_once` 状態のセッション間分離

### 概要

| 項目         | 値                                       |
| ------------ | ---------------------------------------- |
| テストID     | TC-ST-007                                |
| カテゴリ     | TC-ST                                    |
| タイトル     | `approved_once` 状態のセッション間分離   |
| 対応ギャップ | `coverage-gap-analysis.md` 観点3（派生） |
| 優先度       | 中                                       |

### 前提条件（Given）

```
- セッション A: アプリが起動中であり、PermissionManager が初期化済み
- セッション B: 新しいアプリ起動（PermissionManager を再初期化）
- ツール "Bash" のリスクレベルは "high"
- electron-store は初期状態（"Bash" の許可エントリなし）
```

### 操作（When）

```
セッション A:
1. PermissionDialog で "Bash" を approved_once で承認する
2. セッション A での isToolAllowed("Bash") を呼び出す

セッション B（新しいアプリ起動のシミュレート）:
3. PermissionManager のコンストラクタを再度実行する（sessionStore をリセット）
4. セッション B での isToolAllowed("Bash") を呼び出す
5. "Bash" ツールの呼び出しを試みる（PermissionDialog の表示有無を確認）
```

### 期待結果（Then）

```
- 手順2の結果: isToolAllowed("Bash") === true
  （セッション A では approved_once で許可済み）

- 手順4の結果: isToolAllowed("Bash") === false
  （セッション B では sessionStore が空であるため未許可）

- 手順5の結果: PermissionDialog が表示される
  （セッション B では改めて承認が必要）
```

### 補足: approved_once の定義

`approved_once` は以下の特性を持つ:

| 特性                 | 内容                                             |
| -------------------- | ------------------------------------------------ |
| セッション内有効期間 | 1回の呼び出しに対してのみ有効                    |
| 次回呼び出し         | 同一セッション内でも再度 PermissionDialog を表示 |
| セッション間         | 新しいセッション開始時にクリア                   |
| electron-store       | 書き込みなし（メモリ上のみ）                     |

### テスト設計上の注意

- `approved_once` の「1回のみ」というカウントはセッション内で管理する
- セッション A での承認がセッション B に漏れないことが本テストの核心
- セッション B での PermissionDialog 表示はモックを通じて検証する

### 対応 Phase 5 成果物

- `../phase-5/permission-manager-spec.md`: `approved_once` の状態管理ロジック
- `../phase-5/permission-dialog-spec.md`: PermissionDialog の表示トリガー条件

---

## テストケース一覧

| テストID   | タイトル                                         | 優先度 | 状態             |
| ---------- | ------------------------------------------------ | ------ | ---------------- |
| TC-ST-006a | session 許可後の再起動によるクリア               | 高     | Phase 6 追加予定 |
| TC-ST-006b | permanent 許可後の再起動による持続性             | 高     | Phase 6 追加予定 |
| TC-ST-006c | session エントリの electron-store 非書き込み確認 | 高     | Phase 6 追加予定 |
| TC-ST-007  | `approved_once` 状態のセッション間分離           | 中     | Phase 6 追加予定 |

## 参照

- カバレッジギャップ分析: `coverage-gap-analysis.md`
- 失効×リスク組合せ: `tc-expiry-risk-matrix.md`
- Phase 4 テストケース（既存）: `../phase-4/`
- Phase 5 実装仕様（参照先）: `../phase-5/`
