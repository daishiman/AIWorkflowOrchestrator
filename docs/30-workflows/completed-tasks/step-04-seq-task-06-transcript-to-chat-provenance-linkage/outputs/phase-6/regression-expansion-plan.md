# Phase 6: 回帰テスト拡張計画

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

Phase 4（基本テスト）で定義した V-C/V-I テストケースを補完する回帰テストを定義する。
error / blocked / fallback / permission の境界ケース、再レンダー / 二重登録 / 重複handoff の観点を追加する。

---

## 1. 回帰テスト追加の方針

Phase 4 で定義したテストは「正常系」中心。Phase 6 では以下の観点で境界ケースを追加する。

| 観点           | 説明                                             | 対応ファイル                          |
| -------------- | ------------------------------------------------ | ------------------------------------- |
| Error境界      | 入力値が不正・不完全な場合                       | `useTranscriptShare.test.ts`          |
| Blocked境界    | Store/IPC が失敗した場合                         | `transcriptShare.integration.test.ts` |
| Fallback境界   | optional フィールドが欠損した場合                | `TranscriptProvenanceChip.test.tsx`   |
| Permission境界 | 共有操作が権限不足で拒否された場合               | `useTranscriptShare.test.ts`          |
| 再レンダー     | 同一Provenanceで再レンダーが発生した場合         | `TranscriptProvenanceChip.test.tsx`   |
| 二重登録       | 同じメッセージに二重でProvenanceをセットした場合 | `workspaceSlice.test.ts`              |
| 重複handoff    | Task05（Terminal Handoff）と同時に操作した場合   | `transcriptShare.integration.test.ts` |

---

## 2. Error境界ケース

### 2-A: `useTranscriptShare` の入力値エラー

追加するテストケース（`useTranscriptShare.test.ts`）:

```typescript
describe("useTranscriptShare - Error境界", () => {
  it("[RG-E1] shareSelectedRange with empty content throws validation error");
  it(
    "[RG-E2] shareSelectedRange with startLine > endLine throws validation error",
  );
  it("[RG-E3] shareSelectedRange with startLine <= 0 throws validation error");
  it("[RG-E4] shareLastOutput with empty content throws validation error");
  it(
    "[RG-E5] pasteSession with content exceeding 50,000 chars returns truncation warning",
  );
  it(
    "[RG-E6] pasteSession with empty sessionTitle uses fallback title (current session)",
  );
});
```

**検証の焦点**:

- `startLine > endLine` の場合はエラーを上位に伝播させる（`Result<T, E>` パターン）
- `content: ""` は Validation Error（コード範囲 1000-1999）として分類
- silent fallback（黙示的補完）は禁止。エラーは明示的に返す

---

### 2-B: `TranscriptProvenance` 型の境界値

追加するテストケース（`TranscriptProvenance.types.test.ts`）:

```typescript
describe("TranscriptProvenance type boundary", () => {
  it(
    "[RG-E7] messageRange is undefined when sourceType is 'last-output' (型レベル)",
  );
  it(
    "[RG-E8] messageRange is undefined when sourceType is 'session' (型レベル)",
  );
  it(
    "[RG-E9] messageRange.startLine and endLine must be positive integers (型レベル)",
  );
});
```

---

## 3. Blocked境界ケース

Store / IPC のエラー時の動作を検証する。

### 3-A: Store アクションが例外を送出した場合

追加するテストケース（`transcriptShare.integration.test.ts`）:

```typescript
describe("transcriptShare integration - Blocked境界", () => {
  it("[RG-B1] setTranscriptProvenance失敗時にエラーがUIに伝播する");
  it(
    "[RG-B2] IPC (conversationAPI.appendProvenance) 失敗時に pending状態が維持される",
  );
  it("[RG-B3] IPC失敗後にリトライしてもauto-sendが発生しない");
});
```

**検証の焦点**:

- IPC失敗（External Service Error: 3000-3999）はリトライ可能として扱う
- リトライ中もユーザー操作（手動送信）は可能であること
- IPC失敗時に `pendingTranscriptProvenance` が消えないこと（データ保全）

---

### 3-B: Store が初期化未完了の場合

```typescript
describe("Store未初期化", () => {
  it("[RG-B4] Storeが初期化前にshareSelectedRangeを呼んでもクラッシュしない");
});
```

---

## 4. Fallback境界ケース

optional フィールドが欠損した場合の表示を検証する。

### 4-A: `TranscriptProvenanceChip` のフィールド欠損

追加するテストケース（`TranscriptProvenanceChip.test.tsx`）:

```typescript
describe("TranscriptProvenanceChip - Fallback境界", () => {
  it(
    "[RG-F1] messageRange が undefined でも range タイプでエラーなく表示される",
  );
  it("[RG-F2] sessionTitle が空文字の場合に空表示（デフォルト補完しない）");
  it("[RG-F3] sharedAt が不正な日時文字列でも表示エラーにならない");
  it(
    "[RG-F4] transcriptProvenance が undefined の場合は何も表示しない（null return）",
  );
  it(
    "[RG-F5] originalContent が空文字でも Chip は表示される（contentは表示しない）",
  );
});
```

**検証の焦点**:

- `messageRange` が欠損した `range` タイプは表示エラーにしない（防御的UI）
- `sessionTitle: ""` をデフォルト文字列で補完しない（P62: silent fallback禁止）
- `transcriptProvenance: undefined` はChipを表示しない（V-I5の後方互換確認）

---

## 5. Permission境界ケース

共有操作が権限不足の場合を検証する（将来的なアクセス制御の追加を見越した設計）。

```typescript
describe("useTranscriptShare - Permission境界", () => {
  it(
    "[RG-P1] 共有操作が許可されていない場合にエラーが返る（将来拡張用スタブ）",
  );
});
```

**注意**: 現時点では権限制御の実装はスコープ外。テストは `it.skip` でスタブ化し、TODO コメントで未タスク候補として記録する。

---

## 6. 再レンダー観点

再レンダー時の安定性を検証する（P5: 二重登録対策 / P31: 無限ループ対策）。

```typescript
describe("TranscriptProvenanceChip - 再レンダー", () => {
  it("[RG-R1] 同じprovenanceで再レンダーが発生してもChipが二重表示されない");
  it(
    "[RG-R2] pendingTranscriptProvenanceが更新されるたびにChipが正しく更新される",
  );
  it("[RG-R3] clearPendingTranscriptProvenance後にChipが消える");
});

describe("useTranscriptShare - 再レンダー", () => {
  it("[RG-R4] Hookが再レンダー後も同じ関数参照を返す（useCallback準拠）");
});
```

**検証の焦点**:

- `TranscriptProvenanceChip` は pure component として実装し、同一 props では再レンダーしない
- Hook の返す関数は `useCallback` でメモ化し、再レンダーで参照が変わらないこと（P48対策）

---

## 7. 二重登録観点

同じメッセージに二重でProvenanceをセットした場合の動作を検証する（P5対策）。

```typescript
describe("workspaceSlice - 二重登録", () => {
  it("[RG-D1] setPendingTranscriptProvenanceを2回呼ぶと最後の値で上書きされる");
  it("[RG-D2] OP-1実行中にOP-2を実行すると前のprovenanceが正しく上書きされる");
  it(
    "[RG-D3] clearPendingTranscriptProvenance後にsetを呼ぶと正しくセットされる",
  );
});
```

**検証の焦点**:

- 上書きポリシー: 後勝ち（最後にセットされた Provenance が有効）
- 上書き時に前の Provenance は完全に消去される（部分的なマージは禁止）

---

## 8. 重複handoff観点

Task05（Terminal Handoff）と本タスク（Transcript Copy）が同時に発生した場合を検証する。

```typescript
describe("Terminal Handoff と Transcript Copy の同時発生", () => {
  it(
    "[RG-H1] Terminal Handoff 中に Transcript Copy 操作を行ってもクラッシュしない",
  );
  it("[RG-H2] Handoff完了後に pending Provenance が消えない");
  it(
    "[RG-H3] Transcript Copy 中に Handoff が発生しても pending Provenance が消えない",
  );
});
```

**検証の焦点**:

- 両タスクの Store 状態が競合しないこと
- IPC チャンネルが分離されている（`terminal:handoff` vs `conversation:appendProvenance`）こと
- 一方の操作が他方の状態を上書き・消去しないこと

---

## 9. 回帰テストID一覧

| テストID  | 観点                | 優先度          | 対応ファイル                          |
| --------- | ------------------- | --------------- | ------------------------------------- |
| RG-E1〜E6 | Error境界（入力値） | High            | `useTranscriptShare.test.ts`          |
| RG-E7〜E9 | Error境界（型）     | Medium          | `TranscriptProvenance.types.test.ts`  |
| RG-B1〜B4 | Blocked境界         | High            | `transcriptShare.integration.test.ts` |
| RG-F1〜F5 | Fallback境界        | High            | `TranscriptProvenanceChip.test.tsx`   |
| RG-P1     | Permission境界      | Low（スキップ） | `useTranscriptShare.test.ts`          |
| RG-R1〜R4 | 再レンダー          | Medium          | 各テストファイル                      |
| RG-D1〜D3 | 二重登録            | High            | `workspaceSlice.test.ts`              |
| RG-H1〜H3 | 重複handoff         | Medium          | `transcriptShare.integration.test.ts` |

合計: 26ケース（うちスキップ 1ケース）

---

## 10. Phase 7 カバレッジへの貢献

Phase 6 の回帰テスト追加により、以下の Branch Coverage を重点的に改善する。

| ブランチ                                   | Phase 4 後の推定カバレッジ | Phase 6 後の目標 |
| ------------------------------------------ | -------------------------- | ---------------- |
| `sourceType` の条件分岐                    | 90%                        | 100%             |
| `messageRange` の有無                      | 70%                        | 90%              |
| IPC成功/失敗                               | 50%                        | 80%              |
| `pendingTranscriptProvenance` の null 分岐 | 80%                        | 95%              |
