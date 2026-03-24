# Phase 11: 手動テスト

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 11             |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

自動テストでは検証できない動作を手動で確認する。本タスクは UI 変更を伴わない（バックエンド/IPC/型定義のみ）ため、スクリーンショットは不要。

## 適用判断

| タスク種別                  | スクリーンショット | 判断基準                            |
| --------------------------- | ------------------ | ----------------------------------- |
| UI/UX変更あり               | 必須               | Renderer コンポーネントの追加・変更 |
| IPC/API変更のみ             | 推奨               | DevTools 動作確認エビデンスとして   |
| **バックエンド/型定義のみ** | **不要**           | **本タスク: UI 変更を伴わない**     |

> **P53 注記**: CLI 環境では Electron アプリの実画面キャプチャができない場合がある。
> その場合は以下の代替手段で対応する:
>
> 1. `webContents.capturePage()` をスクリプト化して取得
> 2. DevTools ログまたはテスト実行結果をエビデンスとして記録
> 3. `outputs/phase-11/screenshots/NOTE.txt` に理由を記載

## 実行タスク

### Task 1: IPC handler 動作確認

DevTools Console から以下を実行して動作を確認:

```javascript
// 正常系: 有効な sessionId
const result =
  await window.electronAPI.slideApi.getCapability("test-session-123");
console.log(result);
// 期待: { success: true, data: { lane: "...", apiKeySource: "...", uiStatus: "..." } }

// 異常系: 空文字列
const error1 = await window.electronAPI.slideApi.getCapability("");
console.log(error1);
// 期待: { success: false, error: { code: "VALIDATION_ERROR", ... } }

// 異常系: スペースのみ
const error2 = await window.electronAPI.slideApi.getCapability("   ");
console.log(error2);
// 期待: { success: false, error: { code: "VALIDATION_ERROR", ... } }
```

### Task 2: Agent SDK adapter 動作確認

- Electron アプリを起動
- Slide Modifier 機能を使用して LLM 呼び出しが Agent SDK adapter 経由で行われることを確認
- Main Process のログで `AgentSDKAdapter` 経由の呼び出しが確認できること

### Task 3: 後方互換性確認

- 既存の Slide Modifier 機能が正常動作することを確認
- `fallback_reason` / `suggested_action` が undefined の場合（通常フロー）で問題が起きないことを確認
- 既存テストの回帰がないことを確認

### Task 4: P62 動作確認

- API key が未設定の状態で Agent SDK adapter を呼び出した場合にエラーが発生することを確認
- fallback 動作が発生しないことを確認（ログに DEFAULT_CONFIG 参照がないこと）

## テストケース一覧

| TC   | カテゴリ   | テスト内容                                | 期待結果                         | 証跡      |
| ---- | ---------- | ----------------------------------------- | -------------------------------- | --------- |
| TC-1 | IPC 正常系 | `getCapability("valid-session")` 呼び出し | `{ success: true, data: ... }`   | ログ出力  |
| TC-2 | IPC 異常系 | `getCapability("")` 呼び出し              | `{ success: false, error: ... }` | ログ出力  |
| TC-3 | IPC 異常系 | `getCapability("   ")` 呼び出し           | `{ success: false, error: ... }` | ログ出力  |
| TC-4 | Agent SDK  | Slide Modifier で LLM 呼び出し            | adapter 経由で動作               | Main ログ |
| TC-5 | 後方互換   | 既存 Slide 機能の正常動作                 | 回帰なし                         | 動作確認  |
| TC-6 | P62        | API key 未設定時のエラー動作              | 即エラー、fallback なし          | ログ出力  |

## 参照資料

| 資料名            | パス                                      | 内容             |
| ----------------- | ----------------------------------------- | ---------------- |
| Phase 10 レビュー | `outputs/phase-10/final-review-result.md` | 最終レビュー結果 |
| Phase 2 設計      | `phase-2-design.md`                       | IPC 契約設計     |

## 統合テスト連携

- 手動テスト結果をレポートに記録。
- 自動テストでカバーできない IPC end-to-end 動作を確認。

## 成果物

| 成果物         | パス                                     | 説明                        |
| -------------- | ---------------------------------------- | --------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テスト結果レポート          |
| 発見課題一覧   | `outputs/phase-11/discovered-issues.md`  | 発見した課題（0件でも出力） |

## 完了条件

- [x] IPC handler の正常系・異常系を DevTools から確認した
- [x] Agent SDK adapter 経由の LLM 呼び出しを確認した
- [x] 後方互換性（既存機能の回帰なし）を確認した
- [x] P62 対策（fallback なし）を確認した
- [x] 全テストケース（TC-1〜TC-6）の結果を記録した
- [x] 発見課題一覧が出力されている（0件でも出力必須）
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 12: ドキュメント
