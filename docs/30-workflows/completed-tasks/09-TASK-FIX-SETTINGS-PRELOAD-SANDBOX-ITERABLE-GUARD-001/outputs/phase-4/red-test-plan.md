# Phase 4: RED テストケース一覧

## タスク ID: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## テストファイル

`apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`

## 追加テストケース

### describe: Preload Sandbox Guard（防御的レンダリング）

| ID      | テストケース名                                                                        | 目的                             | 期待結果                                             |
| ------- | ------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------- |
| RED-01  | `window.electronAPI` が undefined の場合、クラッシュせずエラー表示する                | sandbox/preload 未初期化時の防御 | 「APIキー機能が利用できません」を表示                |
| RED-01b | `window.electronAPI.apiKey` が undefined の場合、クラッシュせずエラー表示する         | apiKey namespace 欠損時の防御    | 「APIキー機能が利用できません」を表示                |
| RED-02  | `apiKey.list()` が undefined を返した場合、エラーメッセージにフォールバックする       | IPC 応答が非オブジェクトの場合   | 「Failed to load API keys」を表示                    |
| RED-02b | `apiKey.list()` が null を返した場合、エラーメッセージにフォールバックする            | IPC 応答が null の場合           | 「Failed to load API keys」を表示                    |
| RED-03  | `result.data.providers` が配列でない場合、空のプロバイダー一覧にフォールバックする    | providers フィールド型異常       | プロバイダーカードが表示されない（クラッシュしない） |
| RED-03b | `result.data.providers` が undefined の場合、空のプロバイダー一覧にフォールバックする | providers フィールド欠損         | プロバイダーカードが表示されない（クラッシュしない） |

## テスト技法

- `Object.defineProperty(window, "electronAPI", { value: ..., writable: true })` で window.electronAPI をテストごとに上書き
- `afterEach` で元の mockElectronAPI を復元し、他テストへの影響を防止
- happy-dom 環境のため `fireEvent` パターンを使用（P39 準拠）

## テスト実行結果

- 全 39 テスト PASS（既存 33 + 新規 6）
