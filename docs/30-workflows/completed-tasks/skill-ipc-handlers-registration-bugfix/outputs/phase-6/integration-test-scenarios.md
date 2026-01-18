# 統合テストシナリオ設計書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 6                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## 概要

preload skillAPI と main プロセス間のIPC通信に関する統合テストシナリオを定義する。
今回の修正（引数形式の変更）が正しく動作することを検証するためのシナリオ。

---

## テストシナリオ一覧

### シナリオ1: スキルインポートフロー

**目的**: スキルの一覧取得からインポート完了までの完全なフローをテスト

**手順**:

1. `listAvailable()` でスキル一覧を取得
2. `import()` で特定のスキルをインポート
3. `listImported()` でインポート結果を確認

**期待結果**:

- 各IPCコールが正しいオブジェクト形式で呼び出される
  - `skill:list-available` - 引数なし
  - `skill:import` - `{ skillIds: string[] }`
  - `skill:list-imported` - 引数なし
- インポートしたスキルが一覧に表示される

**テスト実装**: `skillAPI.test.ts > skillAPI integration scenarios > full skill import flow`

---

### シナリオ2: スキル削除フロー

**目的**: インポート済みスキルの詳細確認から削除完了までのフローをテスト

**手順**:

1. `listImported()` でインポート済みスキル一覧を取得
2. `getDetail()` でスキル詳細を取得
3. `remove()` でスキルを削除
4. `listImported()` で削除結果を確認

**期待結果**:

- 各IPCコールが正しいオブジェクト形式で呼び出される
  - `skill:list-imported` - 引数なし
  - `skill:get-detail` - `{ skillId: string }`
  - `skill:remove` - `{ skillId: string }`
- 削除後、スキルが一覧から消える

**テスト実装**: `skillAPI.test.ts > skillAPI integration scenarios > full skill removal flow`

---

### シナリオ3: バルクインポートと選択的削除

**目的**: 複数スキルの一括インポートと部分的な削除をテスト

**手順**:

1. `import()` で複数スキルを一括インポート
2. `remove()` で一部のスキルのみ削除
3. `listImported()` で残りのスキルを確認

**期待結果**:

- 複数スキルIDがオブジェクト形式で正しく渡される
  - `skill:import` - `{ skillIds: ["skill-1", "skill-2", "skill-3"] }`
- 選択的削除後、残りのスキルのみ表示される

**テスト実装**: `skillAPI.test.ts > skillAPI integration scenarios > bulk import and selective removal`

---

### シナリオ4: エラーリカバリー

**目的**: 一時的なエラー後の再試行が成功することをテスト

**手順**:

1. 一時的なネットワークエラーを発生させる
2. 同じ操作を再試行

**期待結果**:

- 最初の呼び出しはエラーをスロー
- 再試行時は成功
- 引数形式は常にオブジェクト形式

**テスト実装**: `skillAPI.test.ts > skillAPI integration scenarios > error recovery scenario`

---

## エッジケーステストシナリオ

### EC-1: 空配列のインポート

**入力**: `skillAPI.import([])`
**期待IPC**: `{ skillIds: [] }`

### EC-2: 日本語文字を含むスキルID

**入力**: `skillAPI.import(["skill-with-日本語"])`
**期待IPC**: `{ skillIds: ["skill-with-日本語"] }`

### EC-3: 特殊文字を含むスキルID

**入力**: `skillAPI.remove("skill@#$%^&*()")`
**期待IPC**: `{ skillId: "skill@#$%^&*()" }`

### EC-4: 非常に長いスキルID

**入力**: `skillAPI.import(["a".repeat(1000)])`
**期待IPC**: `{ skillIds: ["aaaa..."] }` (1000文字)

### EC-5: 空文字列のスキルID

**入力**: `skillAPI.remove("")`
**期待IPC**: `{ skillId: "" }`

### EC-6: URLライクなスキルID

**入力**: `skillAPI.getDetail("https://example.com/skill")`
**期待IPC**: `{ skillId: "https://example.com/skill" }`

### EC-7: パスライクなスキルID

**入力**: `skillAPI.getDetail("/path/to/skill.json")`
**期待IPC**: `{ skillId: "/path/to/skill.json" }`

### EC-8: 絵文字を含むスキルID

**入力**: `skillAPI.remove("skill-🔧-emoji")`
**期待IPC**: `{ skillId: "skill-🔧-emoji" }`

---

## エラーハンドリングテストシナリオ

### ERR-1: IPCエラーの伝播

**状況**: IPC通信中にエラーが発生
**期待動作**: エラーがそのまま呼び出し元に伝播

### ERR-2: 操作失敗レスポンス

**状況**: `{ success: false, error: "..." }` が返される
**期待動作**: resultオブジェクトがそのまま返される

### ERR-3: タイムアウトエラー

**状況**: IPC呼び出しがタイムアウト
**期待動作**: タイムアウトエラーが伝播

### ERR-4: null データレスポンス

**状況**: `{ success: true, data: null }` が返される
**期待動作**: resultオブジェクトがそのまま返される

---

## 非Electron環境フォールバック

### FB-1: import フォールバック

**状況**: `window.electronAPI` が存在しない
**期待動作**: `{ success: true }` を返す

### FB-2: remove フォールバック

**状況**: `window.electronAPI` が存在しない
**期待動作**: `{ success: true }` を返す

### FB-3: getDetail フォールバック

**状況**: `window.electronAPI` が存在しない
**期待動作**: `{ success: false, error: "Skill not found" }` を返す

---

## テスト実装状況

| シナリオ             | テスト数 | 状態 |
| -------------------- | -------- | ---- |
| 基本引数形式テスト   | 9        | ✅   |
| フォールバックテスト | 3        | ✅   |
| エッジケーステスト   | 12       | ✅   |
| エラーハンドリング   | 13       | ✅   |
| 統合シナリオ         | 4        | ✅   |
| **合計**             | **41**   | ✅   |

---

## 結論

すべての統合テストシナリオがユニットテストレベルで実装され、パスしている。
引数形式の修正が正しく機能していることを確認。
