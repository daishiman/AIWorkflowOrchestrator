# Phase 4: 詳細テストケース

## テストケース一覧

### TC-001: setup-native-modules.sh実行

**前提条件**:

- Node.js v22.21.1がインストールされている
- pnpmがインストールされている

**手順**:

1. `bash scripts/setup-native-modules.sh` を実行

**期待結果**:

- 「🔧 ネイティブモジュールのセットアップを開始...」が表示される
- アーキテクチャが正しく検出される（arm64またはx86_64）
- 必要に応じてリビルドが実行される
- 「🎉 ネイティブモジュールのセットアップ完了」で終了
- exit code: 0

---

### TC-002: workflow-repository.test.ts実行

**前提条件**:

- TC-001が成功している
- better-sqlite3が正しくビルドされている

**手順**:

1. `pnpm --filter @repo/shared test workflow-repository.test.ts --run` を実行

**期待結果**:

- 10個のテストが全て成功
- 出力例:
  ```
  ✓ WorkflowRepository > save > ワークフローを保存できる
  ✓ WorkflowRepository > findById > 存在する ID でワークフローを取得できる
  ... (全10テスト)
  Tests: 10 passed
  ```

---

### TC-003: better-sqlite3互換性テスト

**前提条件**:

- TC-001が成功している

**手順**:

1. `node -e "try { require('better-sqlite3'); console.log('OK'); } catch(e) { console.log(e.message); }"` を実行

**期待結果**:

- "OK" が出力される
- NODE_MODULE_VERSIONエラーが発生しない
- アーキテクチャ不一致エラーが発生しない

---

### TC-004: アーキテクチャ検出テスト

**前提条件**:

- Apple Silicon Mac（arm64）

**手順**:

1. `node -p "process.arch"` を実行

**期待結果**:

- "arm64" が出力される

---

### TC-005: package.json engines確認

**前提条件**:

- なし

**手順**:

1. `cat package.json | grep -A 4 '"engines"'` を実行

**期待結果**:

```json
"engines": {
  "node": ">=22.21.1 <23.0.0",
  "pnpm": ">=10.0.0"
}
```

---

### TC-006: .nvmrc確認

**前提条件**:

- なし

**手順**:

1. `cat .nvmrc` を実行

**期待結果**:

- "22.21.1" が出力される

---

### TC-007: volta設定確認

**前提条件**:

- なし

**手順**:

1. `cat package.json | grep -A 3 '"volta"'` を実行

**期待結果**:

```json
"volta": {
  "node": "22.21.1"
}
```

---

## テスト結果記録テンプレート

| テストケース | 結果 | 備考 |
| ------------ | ---- | ---- |
| TC-001       |      |      |
| TC-002       |      |      |
| TC-003       |      |      |
| TC-004       |      |      |
| TC-005       |      |      |
| TC-006       |      |      |
| TC-007       |      |      |
