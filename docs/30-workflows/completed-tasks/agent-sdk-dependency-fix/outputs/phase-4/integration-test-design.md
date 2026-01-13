# 統合テスト設計 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 4 - テスト作成（TDD: Red）              |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 統合テストシナリオ

### シナリオ1: SDK初期化テスト

| 項目           | 内容                                                             |
| -------------- | ---------------------------------------------------------------- |
| シナリオID     | INT-SDK-01                                                       |
| カテゴリ       | SDK初期化                                                        |
| 検証内容       | SDK モジュールが正常に解決され初期化される                       |
| 前提条件       | packages/shared に SDK 依存が追加済み                            |
| テストファイル | 既存: `packages/shared/src/agent/__tests__/agent-client.test.ts` |

**検証項目**:

1. ClaudeSDK インスタンスが生成される
2. ステータスが `initialized` に更新される
3. getStatus() が正しい値を返す

**既存テストとの関係**:
既存の AgentClient テストでカバー済み。修正により実SDKが解決可能になる。

---

### シナリオ2: IPC通信テスト

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| シナリオID     | INT-IPC-01                                                          |
| カテゴリ       | IPC通信                                                             |
| 検証内容       | agent:\* チャンネルが正常に機能する                                 |
| 前提条件       | SDK 初期化成功                                                      |
| テストファイル | 既存: `apps/desktop/src/main/agent/__tests__/agent-handler.test.ts` |

**検証項目**:

1. agent:query が正常応答
2. agent:getStatus が正常応答
3. agent:createSession が正常応答
4. agent:message がRenderer に送信される

**既存テストとの関係**:
既存の AgentHandler テストでカバー済み。IPC層のテストはモック使用のため変更不要。

---

### シナリオ3: エラーハンドリングテスト

| 項目           | 内容                                                             |
| -------------- | ---------------------------------------------------------------- |
| シナリオID     | INT-ERR-01                                                       |
| カテゴリ       | エラーハンドリング                                               |
| 検証内容       | SDK 初期化失敗時の適切なエラー伝播                               |
| 前提条件       | 無効なAPIキー等                                                  |
| テストファイル | 既存: `packages/shared/src/agent/__tests__/agent-client.test.ts` |

**検証項目**:

1. AgentInitializationError が発生
2. ステータスが `error` に更新
3. エラーメッセージが適切

**既存テストとの関係**:
既存テストでカバー済み。

---

### シナリオ4: フォールバックテスト

| 項目           | 内容                                         |
| -------------- | -------------------------------------------- |
| シナリオID     | INT-FALLBACK-01                              |
| カテゴリ       | フォールバック                               |
| 検証内容       | SDK 未初期化時のグレースフルデグラデーション |
| 前提条件       | SDK 初期化失敗                               |
| テストファイル | 既存テストでカバー                           |

**検証項目**:

1. アプリが起動可能（Agent機能なし）
2. エラー状態が UI に表示
3. 他機能は正常動作

---

## 依存関係検証スクリプト

修正の検証用スクリプト。Phase 5 実装後に実行。

```bash
#!/bin/bash
# verify-sdk-dependency.sh

echo "=== Agent SDK 依存関係検証 ==="

# DEP-01: node_modules 確認
echo -n "DEP-01: SDK in node_modules... "
if test -d "node_modules/@anthropic-ai/claude-agent-sdk"; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

# DEP-02: pnpm ls 確認
echo -n "DEP-02: pnpm ls SDK... "
if pnpm ls @anthropic-ai/claude-agent-sdk 2>/dev/null | grep -q "@anthropic-ai/claude-agent-sdk"; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

# DEP-03: package.json 確認
echo -n "DEP-03: SDK in packages/shared/package.json... "
if grep -q "@anthropic-ai/claude-agent-sdk" packages/shared/package.json; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

echo ""
echo "=== 全検証 PASS ==="
```

---

## テスト実行フロー

```
1. 修正前状態確認（Red）
   ↓
2. Phase 5 で package.json 修正
   ↓
3. pnpm install 実行
   ↓
4. 依存関係検証スクリプト実行
   ↓
5. 既存テスト実行（Green）
   ↓
6. ビルド検証
   ↓
7. 手動起動確認
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
