# テストケース一覧

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 4               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. Old Channel Removal

### TC-001: SKILL_LIST_AVAILABLE定数の削除

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_LIST_AVAILABLE`にアクセス
- **期待結果**: `undefined`

### TC-002: skill:list-availableのホワイトリスト削除

- **前提条件**: ALLOWED_INVOKE_CHANNELSがインポートされている
- **操作**: `ALLOWED_INVOKE_CHANNELS.includes("skill:list-available")`
- **期待結果**: `false`

### TC-003: SKILL_LIST_IMPORTED定数の削除

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_LIST_IMPORTED`にアクセス
- **期待結果**: `undefined`

### TC-004: skill:list-importedのホワイトリスト削除

- **前提条件**: ALLOWED_INVOKE_CHANNELSがインポートされている
- **操作**: `ALLOWED_INVOKE_CHANNELS.includes("skill:list-imported")`
- **期待結果**: `false`

---

## 2. Channel Unification

### TC-005: SKILL_LISTの定義確認

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_LIST`
- **期待結果**: `"skill:list"`

### TC-006: SKILL_LISTのホワイトリスト登録確認

- **前提条件**: ALLOWED_INVOKE_CHANNELSがインポートされている
- **操作**: `ALLOWED_INVOKE_CHANNELS.includes(IPC_CHANNELS.SKILL_LIST)`
- **期待結果**: `true`

### TC-007: SKILL_GET_IMPORTEDの定義確認

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_GET_IMPORTED`
- **期待結果**: `"skill:getImported"`

### TC-008: SKILL_GET_IMPORTEDのホワイトリスト登録確認

- **前提条件**: ALLOWED_INVOKE_CHANNELSがインポートされている
- **操作**: `ALLOWED_INVOKE_CHANNELS.includes(IPC_CHANNELS.SKILL_GET_IMPORTED)`
- **期待結果**: `true`

---

## 3. Hardcoded String Tests

### TC-009: SKILL_COMPLETEの定義確認

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_COMPLETE`
- **期待結果**: `"skill:complete"`

### TC-010: SKILL_ERRORの定義確認

- **前提条件**: IPC_CHANNELSがインポートされている
- **操作**: `IPC_CHANNELS.SKILL_ERROR`
- **期待結果**: `"skill:error"`

### TC-011: SKILL_COMPLETEのALLOWED_ON_CHANNELS登録確認

- **前提条件**: ALLOWED_ON_CHANNELSがインポートされている
- **操作**: `ALLOWED_ON_CHANNELS.includes(IPC_CHANNELS.SKILL_COMPLETE)`
- **期待結果**: `true`

### TC-012: SKILL_ERRORのALLOWED_ON_CHANNELS登録確認

- **前提条件**: ALLOWED_ON_CHANNELSがインポートされている
- **操作**: `ALLOWED_ON_CHANNELS.includes(IPC_CHANNELS.SKILL_ERROR)`
- **期待結果**: `true`

---

## 4. Spec Compliance

### TC-013〜TC-020: Invokeチャンネル完全性

| TC ID  | チャンネル                | 確認項目   |
| ------ | ------------------------- | ---------- |
| TC-013 | SKILL_LIST                | 定義・登録 |
| TC-014 | SKILL_SCAN                | 定義・登録 |
| TC-015 | SKILL_GET_IMPORTED        | 定義・登録 |
| TC-016 | SKILL_UPDATE              | 定義・登録 |
| TC-017 | SKILL_EXECUTE             | 定義・登録 |
| TC-018 | SKILL_ABORT               | 定義・登録 |
| TC-019 | SKILL_GET_STATUS          | 定義・登録 |
| TC-020 | SKILL_PERMISSION_RESPONSE | 定義・登録 |

### TC-021〜TC-024: Onチャンネル完全性

| TC ID  | チャンネル               | 確認項目   |
| ------ | ------------------------ | ---------- |
| TC-021 | SKILL_COMPLETE           | 定義・登録 |
| TC-022 | SKILL_ERROR              | 定義・登録 |
| TC-023 | SKILL_STREAM             | 定義・登録 |
| TC-024 | SKILL_PERMISSION_REQUEST | 定義・登録 |

---

## 5. テスト実行結果記録

| TC ID  | 結果 | 備考          |
| ------ | ---- | ------------- |
| TC-001 | -    | Phase 5で確認 |
| TC-002 | -    | Phase 5で確認 |
| TC-003 | -    | Phase 5で確認 |
| TC-004 | -    | Phase 5で確認 |
| ...    | ...  | ...           |

※ Phase 5実装後に結果を記録
