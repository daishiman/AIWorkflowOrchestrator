# Phase 1: 要件定義書

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 1. 機能要件（FR）

### FR-1: Transcript -> Chat の 3 操作フロー

| ID     | 操作                     | ユーザーアクション                                  | 結果                                                   |
| ------ | ------------------------ | --------------------------------------------------- | ------------------------------------------------------ |
| FR-1.1 | 選択範囲をチャットへ送る | Transcript 内テキストを選択 -> Share CTA をクリック | 選択テキストが Chat composer に挿入される              |
| FR-1.2 | 直近出力を添付           | 直近出力の Attach CTA をクリック                    | 直近出力が Chat の attachment chip として表示される    |
| FR-1.3 | セッションを貼り付ける   | Session 全体の Paste CTA をクリック                 | Session 内容が Chat composer / attachment に挿入される |

### FR-2: Provenance Chip 表示

| ID     | 要件               | 詳細                                                                                   |
| ------ | ------------------ | -------------------------------------------------------------------------------------- |
| FR-2.1 | 表示条件           | 3 操作のいずれかが実行された後、Chat 側に provenance chip を表示する                   |
| FR-2.2 | 表示内容           | source type（range / last-output / session）、sharedAt（ISO 8601）、元の session title |
| FR-2.3 | dismiss アクション | ユーザーが chip を閉じると非表示になる（metadata は保持される）                        |
| FR-2.4 | inspect アクション | chip クリックで元の Transcript 位置へナビゲートする                                    |

### FR-3: Metadata Contract

| ID     | 要件     | 詳細                                                                                       |
| ------ | -------- | ------------------------------------------------------------------------------------------ |
| FR-3.1 | 構造定義 | `TranscriptProvenance` 型として source / sharedAt / sessionTitle / messageRange を定義する |
| FR-3.2 | 永続化   | ChatMessage.metadata に `transcriptProvenance` キーで保存する（DB スキーマ変更不要）       |
| FR-3.3 | 復元     | Chat 履歴読み込み時に metadata から provenance chip を復元表示する                         |

### FR-4: 状態遷移

```
TranscriptVisible
    -> RangeSelected（テキスト選択時）
    -> ShareReady（CTA が有効化）
    -> ChatAttached / ChatPasted（操作実行後）
    -> ProvenanceVisible（Chat 側に chip 表示）
```

## 2. 非機能要件（NFR）

| ID    | カテゴリ       | 要件                                                                               |
| ----- | -------------- | ---------------------------------------------------------------------------------- |
| NFR-1 | 禁止事項       | Transcript の自動要約、hidden parsing、自動 message 化を行わない                   |
| NFR-2 | 禁止事項       | auto-send boundary を厳守する。ユーザーの明示的操作なしに Chat へ送信しない        |
| NFR-3 | CTA 制約       | 各 surface で primary CTA 1 個 + secondary CTA 1 個を上限とする                    |
| NFR-4 | 責務分離       | Terminal handoff（Task 05）と transcript copy（本タスク）の CTA が競合しない       |
| NFR-5 | Auditability   | 手動操作の全てに provenance metadata を付与し、操作履歴を追跡可能にする            |
| NFR-6 | パフォーマンス | Provenance chip の表示は 200ms 以内に完了する                                      |
| NFR-7 | 安定性         | P31（無限ループ）/ P48（non-null assertion）/ P5（リスナー二重登録）を回避する設計 |

## 3. 受入基準（AC）の検証可能化

### AC-1: transcript から chat への 3 操作フローが明文化されている

**検証方法**: 以下の 3 つが全て定義されていること

- [ ] OP-1（選択範囲をチャットへ送る）の入力・出力・状態遷移が定義されている
- [ ] OP-2（直近出力を添付）の入力・出力・状態遷移が定義されている
- [ ] OP-3（セッションを貼り付ける）の入力・出力・状態遷移が定義されている

### AC-2: provenance chip の表示条件と copy 後の状態が定義されている

**検証方法**: 以下が全て定義されていること

- [ ] 表示トリガー条件（どの操作後に表示されるか）
- [ ] 表示内容（source / sharedAt / sessionTitle）
- [ ] dismiss 後の振る舞い（metadata 保持 / chip 非表示）
- [ ] 履歴復元時の chip 再表示ロジック

### AC-3: terminal handoff と transcript copy が競合しない責務分離になっている

**検証方法**: 以下が全て成立すること

- [ ] Terminal Handoff Card（Task 05）と Transcript Share CTA の表示領域が重複しない
- [ ] copy command（Task 05）と copy transcript（本タスク）の clipboard 操作が競合しない
- [ ] CTA の i18n key が両タスク間で重複しない

### AC-4: manual path の auditability を失わない metadata contract が設計されている

**検証方法**: 以下が全て成立すること

- [ ] `TranscriptProvenance` 型が定義されている
- [ ] ChatMessage.metadata への保存パスが定義されている
- [ ] 保存時に source type / sharedAt / sessionTitle が必須フィールドである
- [ ] 履歴表示時に provenance chip が復元可能である

## 4. ガバナンス要件

| ID    | 要件                                                                                        |
| ----- | ------------------------------------------------------------------------------------------- |
| GOV-1 | Terminal surface は user-operated workspace であり、hidden automation lane として使用しない |
| GOV-2 | 3 操作は全て copy-based の手動連携に限定する                                                |
| GOV-3 | Provenance metadata は削除不可（dismiss は UI 非表示のみ、metadata は永続保持）             |
| GOV-4 | 操作履歴は Chat session に紐付けて保存し、session 削除時のみ cascade で削除される           |

## 5. Phase 2 への未確定事項

| #   | 論点                  | Phase 2 での決定事項                                                      |
| --- | --------------------- | ------------------------------------------------------------------------- |
| C-1 | Renderer metadata gap | WorkspaceChatMessage に provenance を追加する方法（型拡張 vs 別 context） |
| C-2 | Copy contract 形式    | 各操作の clipboard 形式（Markdown / Plain text / structured）             |
| C-3 | State ownership       | Transcript selection state の所有者（Hook vs Store vs Props）             |
