# 統合テスト設計

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 4               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. 統合テストシナリオ

### 1.1 IPC通信テスト

| シナリオ | 内容                              | 検証項目               |
| -------- | --------------------------------- | ---------------------- |
| IT-001   | Renderer→MainでSKILL_LIST呼び出し | safeInvokeが正常に動作 |
| IT-002   | Main→RendererでSKILL_COMPLETE通知 | safeOnが正常に動作     |
| IT-003   | 旧チャンネルでの呼び出し拒否      | エラーが発生すること   |

### 1.2 セキュリティテスト

| シナリオ | 内容                           | 検証項目                    |
| -------- | ------------------------------ | --------------------------- |
| IT-004   | ホワイトリスト外チャンネル拒否 | Promise.rejectが発生        |
| IT-005   | sender検証の継続               | validateIpcSenderが呼ばれる |

---

## 2. テストファイル配置

| カテゴリ       | テストファイル                                         |
| -------------- | ------------------------------------------------------ |
| チャンネル定義 | `preload/__tests__/channels.ipc-consolidation.test.ts` |
| 既存テスト     | `preload/__tests__/channels.skill-import.test.ts`      |

---

## 3. 統合テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# IPC統合テストのみ
pnpm --filter @repo/desktop test -- --grep "TASK-FIX-4-1"

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage
```

---

## 4. 期待される統合テスト結果

### Phase 4（Red状態）

- 旧チャンネル削除テスト → **失敗**（まだ旧チャンネルが存在）
- チャンネル統一テスト → **成功**（既に新チャンネルは定義済み）

### Phase 5（Green状態）

- 全テスト → **成功**
