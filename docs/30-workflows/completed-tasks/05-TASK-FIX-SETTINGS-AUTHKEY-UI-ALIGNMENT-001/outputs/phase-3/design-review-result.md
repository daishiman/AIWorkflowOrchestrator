# Phase 3 設計レビュー結果

## メタ情報

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| Phase        | 3 - 設計レビュー                           |
| レビュー日   | 2026-03-06                                 |
| レビュー対象 | Phase 2 設計成果物                         |
| 対象スコープ | Renderer のみ（Preload/Main 変更なし）     |

---

## レビュー観点と判定

### 1. 責務分離: PASS

- `AuthKeySection` は authKey 専用の入力・状態表示コンポーネントとして設計されており、汎用プロバイダー用の `ApiKeysSection` とは明確に責務が分離されている
- `AuthKeySection` は `authMode === 'api-key'` 時のみ表示される条件付きレンダリングで、他のモード時に不要なUIが混入しない
- ファイル配置も `settings/AuthKeySection/index.tsx` として独立しており、既存の `ApiKeysSection` と物理的にも分離されている

### 2. 契約整合: PASS

- `auth-key:status` IPC の戻り値 `hasCredentials` と `auth-key:exists` IPC の戻り値 `exists` の組み合わせにより、以下の4状態を明示的にマッピングする設計:
  - **保存済み（緑）**: `hasCredentials === true && exists === true`
  - **環境変数fallback（黄）**: `hasCredentials === true && exists === false`
  - **未設定（赤）**: `hasCredentials === false && exists === false`
  - **確認失敗（灰）**: IPC呼び出しエラー時
- 先行タスク 03-TASK（契約整合）が完了済みであり、IPC契約は安定している。本タスクはその契約に基づくUI導線追加のみであるため、契約ドリフトリスクは低い

### 3. UX: PASS

- `authMode` の切り替え時に `AuthKeySection` の表示/非表示が適切に切り替わる設計
- mode 切替後のセクション再表示時に状態を再取得する設計により、古い状態が残存しない
- 保存成功/失敗のフィードバックは `AuthKeySection` 内で完結し、他のセクション（LLM選択、スキル選択等）に影響しない
- 削除操作は確認ダイアログで保護され、破壊的操作の誤実行を防止

### 4. セキュリティ: PASS

- 生の API キーはローカル `useState` のみで保持し、Zustand Store や永続ストレージには格納しない
- `type="password"` とマスクトグルにより画面上での漏洩を防止
- submit（保存IPC呼び出し）後に即座に `setRawKey('')` で state をクリアし、メモリ上の保持時間を最小化
- Renderer から Main への送信は既存の IPC チャネル（`auth-key:save`）を使用し、新規チャネル追加なし

### 5. P31回避: PASS

- `useAuthMode()` 等の個別セレクタを使用する設計であり、合成Store Hook（`useAuthModeStore()`）の戻り値を `useEffect` 依存配列に含めるパターンは回避されている
- Zustand アクション参照は個別セレクタ経由で取得するため、参照安定性が保証される

### 6. P39回避: PASS

- テスト設計において happy-dom 環境での `fireEvent` 使用を明記
- `userEvent.setup()` は使用せず、非同期ハンドラは `await act(async () => { fireEvent.click(el) })` パターンで包む方針

### 7. 先行タスクとの境界: PASS

- 03-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001（契約整合ガード）は完了済み
- 本タスクは既存の IPC 契約を変更せず、Renderer 側の UI 導線追加のみ
- Preload/Main の変更がないため、IPC契約チェックリスト（Phase 1-6）の再実施は不要

---

## 指摘事項

なし。全レビュー観点が PASS。

---

## 総合判定

| 判定 | 結果     |
| ---- | -------- |
| 総合 | **PASS** |

Phase 4（テスト作成）に進行可能。
