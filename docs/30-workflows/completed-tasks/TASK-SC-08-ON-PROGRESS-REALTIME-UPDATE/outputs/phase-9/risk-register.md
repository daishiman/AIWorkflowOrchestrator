# Phase 9 成果物: リスク台帳

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスク     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE |
| Phase      | 9                                      |
| 作成日     | 2026-04-19                             |
| ステータス | 完了                                   |

## リスク台帳

| リスクID | リスク内容                                                                  | 影響度 | 発生頻度 | リスクスコア | 対策                                                                        | 対策状態 |
| -------- | --------------------------------------------------------------------------- | ------ | -------- | ------------ | --------------------------------------------------------------------------- | -------- |
| R-01     | isGeneratingガードとonProgress競合（useEffect cleanup前にコールバック着信） | 高     | 中       | 高           | useEffect cleanupで必ずリスナーを解除。isGenerating=true間のみ受付          | 実装済み |
| R-02     | mode-specific phaseメッセージの国際化未対応（将来リスク）                   | 低     | 低       | 低           | 現時点はi18nキー化を見送り。将来タスクとしてunassigned-taskに記録           | 記録済み |
| R-03     | pnpm typecheckタイムアウト（CLAUDE_TYPECHECK_TIMEOUT不足）                  | 中     | 低       | 低           | `export CLAUDE_TYPECHECK_TIMEOUT=120` でタイムアウト延長対応                | 対応済み |
| R-04     | PHASE_TO_STAGEマップへの重複キー追加（将来の誤操作リスク）                  | 中     | 低       | 低           | TypeScriptのオブジェクトリテラル重複キー警告（ESLint `no-dupe-keys`）で防止 | 設定済み |
| R-05     | 二重リスナー登録（isGenerating切り替え時の古いリスナーが残存）              | 高     | 低       | 中           | cleanup関数内で確実にremoveListenerを呼び出す実装で防止。TC-09で確認済み    | 確認済み |

## P5（二重登録リスク）詳細確認

R-05として記録した二重リスナー登録リスクは「P5」として個別分析を実施した。

### 問題シナリオ

```
1. isGenerating = true  → onProgressリスナー登録（リスナーA）
2. isGenerating = false → cleanup実行 → リスナーA解除 ✅
3. isGenerating = true  → onProgressリスナー登録（リスナーB）
4. アンマウント直前 + onProgress着信 → リスナーBが処理 ✅
```

**正常シナリオ**: cleanup → 再登録の順序が保証されており、二重登録は発生しない。

### エッジケース: cleanup前に再登録が起きた場合

```
1. isGenerating = true  → リスナーA登録
2. isGenerating = false → [cleanup未実行]
3. isGenerating = true  → リスナーB登録（A+B二重登録の危険）
```

**対策**: useEffectの依存配列に`isGenerating`を含め、React の cleanup → effect 実行順序保証を利用。
Reactは旧effectのcleanupを新effectの実行前に必ず呼び出すため、二重登録は構造上発生しない。

**判定**: P5リスクは実装上回避済み。追加対応不要。

## 残存リスクサマリー

| リスクID | 残存状態 | 次アクション                                       |
| -------- | -------- | -------------------------------------------------- |
| R-01     | 対策済み | なし（useEffect cleanup実装確認済み）              |
| R-02     | 許容     | unassigned-task-detection.mdに将来タスクとして記録 |
| R-03     | 対策済み | なし（タイムアウト設定対応済み）                   |
| R-04     | 対策済み | なし（ESLint no-dupe-keys設定済み）                |
| R-05     | 確認済み | なし（React useEffect cleanup順序保証で解決）      |

**未対策リスク: 0件**

## 結論

全リスクに対策または許容判定を実施済み。未対策リスクなし。
Phase 10（最終レビュー）への移行可。
