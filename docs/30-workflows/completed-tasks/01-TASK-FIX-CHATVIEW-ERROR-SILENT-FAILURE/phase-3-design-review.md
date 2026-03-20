# Phase 3: 設計レビュー

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 3                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-2-design.md`                     |

## 目的

Phase 2 の設計内容を多角的に検証し、実装前に問題を検出する。レイヤー依存方向・型安全性・P31対策・国際化考慮・エラーコード設計の5軸で評価し、PASS/MINOR/MAJORを判定する。

## 実行タスク

### Task 1: レイヤー依存方向の確認

**チェック項目:**

```
[確認] callLLMAPI (chatSlice内部) → ChatSlice state → 個別セレクタ → ChatView
       この方向で一方向依存が維持されているか
```

| 観点               | 設計内容                                         | 判定基準                        |
| ------------------ | ------------------------------------------------ | ------------------------------- |
| Renderer→Store依存 | ChatViewがuseChatError/useClearChatErrorのみ使用 | OK: Storeの抽象化層を通している |
| 循環依存           | chatSlice内でChatViewを参照していない            | OK: 循環なし                    |
| レイヤー越え       | ChatViewがchatSlice内部関数を直接呼ばない        | OK: セレクタ経由のみ            |

### Task 2: 型安全性の検証

**チェック項目:**

| 設計箇所                         | 型安全リスク                           | 対策                                                        |
| -------------------------------- | -------------------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| `callLLMAPI` の `error?: string` | `response.error` が `unknown` 型の場合 | `typeof response.error === "string"` チェックを実装時に追加 |
| `ERROR_MESSAGES[code]`           | 未定義キーのアクセス                   | `?? ERROR_MESSAGES.UNKNOWN_ERROR` でフォールバック済み      |
| `chatError: string               | null`                                  | null チェック漏れ                                           | `{chatError && ...}` のJSXガードで対処 |
| `clearChatError` の型            | `() => void` で安定                    | P31準拠                                                     |

**`any` 型使用:**
設計内に `any` 型の使用なし。全て明示的な型で設計されている。

### Task 3: P31/P48パターン準拠確認

| パターン                          | 設計での対応                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| P31: 個別セレクタ使用             | `useChatError()` / `useClearChatError()` を個別に定義している ✅              |
| P31: `useEffect` 依存配列         | `[chatError, clearChatError]` — `clearChatError` はZustandアクションで安定 ✅ |
| P48: 配列セレクタへの`useShallow` | `chatError` は `string                                                        | null` のプリミティブ、`useShallow` 不要 ✅ |
| P5: リスナー二重登録              | エラータイマーは `useEffect` のクリーンアップで `clearTimeout` している ✅    |

### Task 4: エラーコード設計の妥当性確認

**チェック項目:**

| エラーコード          | 発生元                      | 日本語メッセージ | 判定 |
| --------------------- | --------------------------- | ---------------- | ---- |
| `AI_UNAVAILABLE`      | `window.electronAPI` 未定義 | 適切             | OK   |
| `API_CALL_FAILED`     | `catch` ブロック            | 適切             | OK   |
| `API_KEY_MISSING`     | IPC経由（Main Process）     | 適切             | OK   |
| `RATE_LIMIT_EXCEEDED` | IPC経由                     | 適切             | OK   |
| `UNKNOWN_ERROR`       | フォールバック              | 適切             | OK   |

**確認事項:** `window.electronAPI.ai.chat` のレスポンスが返す実際のエラーコード一覧を実装時に確認し、マッピングに追加が必要な場合は実装時に対応する。

### Task 5: 国際化考慮

**現状:** エラーメッセージを `ERROR_MESSAGES` のRecord定数でハードコードしている。

**評価:**

- プロジェクトは現時点で i18n ライブラリ（i18next等）を使用していない
- エラーメッセージの多言語化は未タスク候補
- 現設計では定数定義を1箇所に集約しており、将来の i18n 移行時の変更は1箇所で完結する

**判定:** i18n 非対応は現時点の設計スコープ内として受容。将来の拡張性は確保されている。

### Task 6: エラー自動消去タイミングの妥当性

**設計:** 5秒後に自動消去 + 次のメッセージ送信時にクリア + ×ボタンで手動クリア

**評価:**

- 5秒: Apple HIG の通知表示時間（3〜5秒）と整合 ✅
- 次送信時クリア: ユーザーが再試行する際に古いエラーが残らない ✅
- ×ボタン: WCAG 2.1 AA準拠（キーボードアクセス可能）の設計にすること（実装時に `aria-label` 付与）

### Task 7: 設計レビュー総合判定

#### 判定基準

| 判定              | 条件                                                            |
| ----------------- | --------------------------------------------------------------- |
| PASS              | 全チェック項目に問題なし                                        |
| MINOR             | 軽微な改善点があるが実装を阻害しない。未タスク化して Phase 4 へ |
| MAJOR（設計問題） | 設計の根本的な問題。Phase 2 へ戻る                              |
| MAJOR（要件問題） | 要件の根本的な問題。Phase 1 へ戻る                              |

#### 判定: PASS（条件付き）

**理由:**

- レイヤー依存方向は Store → View の一方向を維持している
- P31/P48パターンに準拠した個別セレクタ設計になっている
- 型安全性を損なう設計要素がない
- エラーバナーUIはApple HIG準拠のカラー・位置設計

**MINOR指摘（未タスク候補）:**

1. **i18n非対応**: エラーメッセージが日本語ハードコード。将来のi18n移行時の対応が必要
   - 対応: 未タスク化（本タスクのスコープ外）
2. **`window.electronAPI.ai.chat` のエラーレスポンス構造確認**: 実際に返るエラーコード一覧が未確認
   - 対応: Phase 5（実装）で確認し、マッピングを補完する
3. **`×ボタンのアクセシビリティ`**: `aria-label` 付与が設計書に明記されていない
   - 対応: Phase 5（実装）で `aria-label="エラーを閉じる"` を追加する

**Phase 4 への移行:** MINOR指摘は未タスク化し、Phase 4（テスト設計）へ進む。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| エラーハンドリング設計  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| Zustand状態管理設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン（P31/P48） | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 前Phase成果物

| 成果物         | パス                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| Phase 1 仕様書 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md` |
| Phase 2 仕様書 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`       |

## 実行手順

### Step 1: Phase 2 仕様書の読み込み

`phase-2-design.md` を読み込み、設計内容を把握する。

### Step 2: 7軸チェック実施

本Phase仕様書 Task 1〜7 の各チェック項目を順次確認する。

### Step 3: 判定の記録

本Phase仕様書 Task 7「設計レビュー総合判定」に判定結果と理由を記録する。

### Step 4: MINOR指摘の未タスク化（判定がMINOR以上の場合）

MINOR指摘があれば未タスク仕様書を作成し、`docs/30-workflows/unassigned-task/` に配置する（P3・P58対策）。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Phase 3 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-3-design-review.md` |

## 完了条件

- [ ] レイヤー依存方向（Store → View一方向）が設計で保たれていることを確認した
- [ ] 型安全性チェックで `any` 型使用や型アサーション回避が確認された
- [ ] P31/P48パターン準拠確認が完了した
- [ ] エラーコード設計の妥当性を確認した
- [ ] 国際化考慮の評価を記録した
- [ ] PASS/MINOR/MAJORの判定を記録した
- [ ] MINOR指摘がある場合、未タスク化対応の方針を記録した

## 次Phase

判定結果に応じて:

- PASS / MINOR: Phase 4（テスト設計）へ進む
- MAJOR（設計問題）: Phase 2 へ戻る
- MAJOR（要件問題）: Phase 1 へ戻る
