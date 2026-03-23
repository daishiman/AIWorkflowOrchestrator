# Phase 4: テストマトリクス

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

Phase 1-3 で確定した検証ID（V-C1〜V-C8 / V-I1〜V-I5 / V-M1〜V-M9 / V-Q1〜V-Q7 / V-D1〜V-D5）をテストケースとして分類・整理したマトリクス。

---

## 1. ユニットテスト（V-C: Contract検証）

対象: 個別コンポーネント・Hook・型定義の契約整合性

| 検証ID | テストファイルパス                             | テストケース概要                                                                                                | カテゴリ  |
| ------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------- |
| V-C1   | `__tests__/TranscriptProvenanceChip.test.tsx`  | TranscriptProvenanceChip が `transcriptProvenance` を受け取りメタ情報を表示する                                 | Component |
| V-C2   | `__tests__/TranscriptProvenanceChip.test.tsx`  | sourceType が `range` の場合に messageRange の行範囲を表示する                                                  | Component |
| V-C3   | `__tests__/TranscriptProvenanceChip.test.tsx`  | sourceType が `last-output` の場合に "直近出力" ラベルを表示する                                                | Component |
| V-C4   | `__tests__/TranscriptProvenanceChip.test.tsx`  | sourceType が `session` の場合に sessionTitle を表示する                                                        | Component |
| V-C5   | `__tests__/useTranscriptShare.test.ts`         | OP-1（選択範囲）で shareSelectedRange を呼ぶと transcriptProvenance が生成される                                | Hook      |
| V-C6   | `__tests__/useTranscriptShare.test.ts`         | OP-2（直近出力）で shareLastOutput を呼ぶと sourceType: "last-output" の provenance が生成される                | Hook      |
| V-C7   | `__tests__/useTranscriptShare.test.ts`         | OP-3（セッション）で pasteSession を呼ぶと sourceType: "session" の provenance が生成される                     | Hook      |
| V-C8   | `__tests__/TranscriptProvenance.types.test.ts` | TranscriptProvenance 型の必須フィールド（sourceType, sharedAt, sessionTitle）が欠損するとコンパイルエラーになる | Type      |

### ユニットテスト詳細

#### `__tests__/TranscriptProvenanceChip.test.tsx`

```
describe("TranscriptProvenanceChip", () => {
  it("[V-C1] renders provenance metadata from transcriptProvenance prop")
  it("[V-C2] displays messageRange when sourceType is 'range'")
  it("[V-C3] displays '直近出力' label when sourceType is 'last-output'")
  it("[V-C4] displays sessionTitle when sourceType is 'session'")
  it("[V-C1] does not render if transcriptProvenance is undefined")
})
```

#### `__tests__/useTranscriptShare.test.ts`

```
describe("useTranscriptShare", () => {
  it("[V-C5] shareSelectedRange creates provenance with sourceType 'range'")
  it("[V-C5] shareSelectedRange includes messageRange in provenance")
  it("[V-C6] shareLastOutput creates provenance with sourceType 'last-output'")
  it("[V-C7] pasteSession creates provenance with sourceType 'session'")
  it("[V-C7] pasteSession includes sessionTitle in provenance")
  it("[V-C5] shareSelectedRange does NOT auto-send to chat (禁止事項)")
  it("[V-C6] shareLastOutput does NOT auto-send to chat (禁止事項)")
})
```

#### `__tests__/TranscriptProvenance.types.test.ts`

型レベルのコンパイル検証のみ（実行時テストなし）。
`@ts-expect-error` アノテーションで不正な型が拒否されることを確認。

```
// V-C8: 必須フィールド欠損がコンパイルエラーになること
const invalid: TranscriptProvenance = {
  // @ts-expect-error sourceType is required
  sharedAt: new Date().toISOString(),
  sessionTitle: "title",
  originalContent: "content",
}
```

---

## 2. インテグレーションテスト（V-I: Integration検証）

対象: IPC / Store / Component の結合動作

| 検証ID | テストファイルパス                                          | テストケース概要                                                                       | カテゴリ  |
| ------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------- |
| V-I1   | `__tests__/integration/transcriptShare.integration.test.ts` | OP-1 実行後に WorkspaceChatMessage.transcriptProvenance が Store に格納される          | Store統合 |
| V-I2   | `__tests__/integration/transcriptShare.integration.test.ts` | OP-2 実行後に WorkspaceChatMessage.transcriptProvenance が Store に格納される          | Store統合 |
| V-I3   | `__tests__/integration/transcriptShare.integration.test.ts` | OP-3 実行後に WorkspaceChatMessage.transcriptProvenance が Store に格納される          | Store統合 |
| V-I4   | `__tests__/integration/transcriptShare.integration.test.ts` | ProvenanceVisible 状態でチャットメッセージ一覧に TranscriptProvenanceChip が表示される | UI統合    |
| V-I5   | `__tests__/integration/transcriptShare.integration.test.ts` | 既存の WorkspaceChatMessage（provenance なし）に ProvenanceChip が表示されない         | 後方互換  |

### インテグレーションテスト詳細

```
describe("Transcript -> Chat Provenance Integration", () => {
  it("[V-I1] OP-1: shareSelectedRange -> Store -> transcriptProvenance persisted")
  it("[V-I2] OP-2: shareLastOutput -> Store -> transcriptProvenance persisted")
  it("[V-I3] OP-3: pasteSession -> Store -> transcriptProvenance persisted")
  it("[V-I4] ProvenanceChip renders in chat list when transcriptProvenance exists")
  it("[V-I5] No ProvenanceChip when message has no transcriptProvenance (backward compat)")
})
```

---

## 3. 手動テスト（V-M: Manual検証）

対象: 実際の UI/UX フロー（Phase 11 で実施）

| 検証ID | シナリオ概要                               | 確認観点                                 | 優先度   |
| ------ | ------------------------------------------ | ---------------------------------------- | -------- |
| V-M1   | Terminal画面で範囲選択 → "チャットへ送る"  | 選択内容がチャット入力欄に挿入される     | High     |
| V-M2   | チャット入力欄にProvenanceChipが表示される | Chip内に範囲情報（行番号等）が表示される | High     |
| V-M3   | 直近出力を添付 → チャット入力欄確認        | "直近出力" ラベルのChipが表示される      | High     |
| V-M4   | セッションを貼り付け → チャット入力欄確認  | セッションタイトルのChipが表示される     | High     |
| V-M5   | 送信後のチャット履歴確認                   | Provenanceメタ情報が履歴に残る           | Medium   |
| V-M6   | 自動送信が発生しないことを確認             | 操作後にメッセージが自動送信されない     | Critical |
| V-M7   | 要約・変換が行われないことを確認           | originalContentがそのまま挿入される      | Critical |
| V-M8   | Terminal Handoff（Task05）との責務分離確認 | Handoff操作がProvenanceと混在しない      | High     |
| V-M9   | ProvenanceChipの削除・編集UX確認           | Chip削除後はprovenanceなしで送信できる   | Medium   |

---

## 4. QAテスト（V-Q: Quality Assurance）

対象: 品質・セキュリティ・パフォーマンス

| 検証ID | 確認観点                                                                                | 担当           |
| ------ | --------------------------------------------------------------------------------------- | -------------- |
| V-Q1   | originalContent に PII が含まれる場合にログ出力しない                                   | セキュリティ   |
| V-Q2   | 大量文字列（10,000文字以上）のセッション貼り付けでメモリリークしない                    | パフォーマンス |
| V-Q3   | transcriptProvenance が IPC 経由でシリアライズ/デシリアライズされても型整合が維持される | IPC安全性      |
| V-Q4   | ProvenanceChipが再レンダー時に二重表示されない（P5: 二重登録対策）                      | 安定性         |
| V-Q5   | ProvenanceChipのアクセシビリティ（WCAG 2.1 AA: コントラスト比 4.5:1以上）               | A11y           |
| V-Q6   | ProvenanceChipにARIAラベルが付与されている                                              | A11y           |
| V-Q7   | transcriptProvenance未定義時にコンソールエラーが発生しない                              | 安定性         |

---

## 5. ドキュメント検証（V-D）

| 検証ID | 確認観点                                                                           |
| ------ | ---------------------------------------------------------------------------------- |
| V-D1   | TranscriptProvenance 型の JSDoc コメントが全フィールドに存在する                   |
| V-D2   | useTranscriptShare Hook の JSDoc に各操作の禁止事項が明記されている                |
| V-D3   | TASK05（Terminal Handoff）との責務分離がコメントで明記されている                   |
| V-D4   | implementation-guide.md（Phase 12成果物）に概念説明と実装詳細が含まれる            |
| V-D5   | 状態遷移図（TranscriptVisible -> ChatAttached/ChatPasted）がドキュメントに含まれる |

---

## テストファイルパス一覧

| ファイルパス                                                                 | テスト種別  | カバーする検証ID             |
| ---------------------------------------------------------------------------- | ----------- | ---------------------------- |
| `apps/desktop/src/__tests__/TranscriptProvenanceChip.test.tsx`               | Unit        | V-C1, V-C2, V-C3, V-C4       |
| `apps/desktop/src/__tests__/useTranscriptShare.test.ts`                      | Unit        | V-C5, V-C6, V-C7             |
| `apps/desktop/src/__tests__/TranscriptProvenance.types.test.ts`              | Type        | V-C8                         |
| `apps/desktop/src/__tests__/integration/transcriptShare.integration.test.ts` | Integration | V-I1, V-I2, V-I3, V-I4, V-I5 |

---

## 注意事項

- P39（happy-dom環境: `userEvent` 禁止 → `fireEvent` 使用）を全テストに適用すること
- P40（モノレポ実行: `cd apps/desktop && pnpm vitest run`）を遵守すること
- 禁止事項（auto-send / hidden parsing / 自動要約）は V-C5〜V-C7 で明示的にアサートすること
