# Phase 1 成果物: 受け入れ基準

## タスクID: TASK-SW-FIX-MODE-MGMT-001

| ID   | 基準内容                                                                      | 検証方法               | 判定 |
| ---- | ----------------------------------------------------------------------------- | ---------------------- | ---- |
| AC-1 | Step 0からラジオボタン（テンプレートから作成/LLMで生成）が削除されている      | 自動テスト・DOM検査    | 未   |
| AC-2 | `generationMode` stateと`hasActivatedLlmMode` stateが廃止されている           | コード検索・型チェック | 未   |
| AC-3 | LLMモードでStep 0→Step 1→Step 2の正規フローを通る                             | 自動テスト・手動確認   | 未   |
| AC-4 | Step 1（Q1〜Q6）がLLMモードでもスキップされない                               | 自動テスト・手動確認   | 未   |
| AC-5 | 既存のテンプレートモードのテストが全件PASS（またはLLM専用化に伴い適切に更新） | テスト実行結果         | 未   |

## AC検証コマンド

```bash
# コード残骸チェック
rg -n "generationMode|hasActivatedLlmMode|テンプレートから作成|LLMで生成" \
  apps/desktop/src/renderer/components/skill/

# テスト実行
pnpm --filter @repo/desktop test
```

## 判定基準

- AC-1〜AC-5が全てPASSで実装完了とする
- 1件でもFAILの場合はPhase 5（実装）に差し戻す
