# テスト戦略

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 2                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## スナップショット戦略: file snapshot

### 選択根拠

| 方式            | メリット                         | デメリット                          | 採用 |
| --------------- | -------------------------------- | ----------------------------------- | ---- |
| inline snapshot | テストコードと同じファイルで管理 | 19 件のチャンネル名でコードが肥大化 | ✗    |
| file snapshot   | 専用ファイルで管理、更新が容易   | 別ファイルでの管理が必要            | ✓    |

**理由**: 19 チャンネルのリストを inline で管理するとテストコードが読みにくくなるため、`__snapshots__/` ディレクトリ配下のファイルスナップショットを採用する。

### スナップショット更新フロー

```
開発者がチャンネルを追加・変更
↓
pnpm --filter @repo/desktop test  # CI では失敗
↓
スナップショット差分を確認
↓
pnpm --filter @repo/desktop test -- --updateSnapshot  # 意図的な更新
↓
スナップショットファイルをコミット
```

### Vitest バージョン互換性

- `toMatchSnapshot()`: Vitest 0.x から利用可能 ✅
- `vi.mock()` / `mockImplementation()`: 既存 Electron mock と整合 ✅
- `vi.restoreAllMocks()`: Vitest 0.x から利用可能 ✅

## CI テスト戦略

### CI での実行コマンド

既存の CI ワークフローで `pnpm --filter @repo/desktop test` が実行されることで新規テストも自動実行される。`--updateSnapshot` フラグなしで実行されるため、スナップショット差分が出た場合は CI が失敗する。

### スナップショット不一致の検出フロー

```
CI: pnpm --filter @repo/desktop test
↓
REG-SNAP-01: expect(handles).toMatchSnapshot() が失敗
↓
差分: 追加/削除されたチャンネル名が出力される
↓
CI ジョブが失敗 → PR マージがブロックされる
```
