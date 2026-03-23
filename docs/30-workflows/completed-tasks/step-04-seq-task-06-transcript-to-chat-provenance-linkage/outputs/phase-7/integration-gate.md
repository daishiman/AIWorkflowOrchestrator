# Phase 7: 統合ゲート

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

Phase 5（実装）/ Phase 6（回帰テスト）完了後に実施すべき Smoke / Integration / Walkthrough テストの条件を定義する。
全ゲートを PASS した場合のみ Phase 8（リファクタリング）へ進む。

---

## 1. ゲート全体構造

```
Phase 7 統合ゲート
  |
  +-- Gate A: Smoke（疎通確認）       --> 失敗時: Phase 5 に戻る
  |
  +-- Gate B: Integration（結合確認） --> 失敗時: Phase 5 または Phase 6 に戻る
  |
  +-- Gate C: Walkthrough（E2E確認）  --> 失敗時: Phase 5 に戻る
  |
  +-- Gate D: Coverage（カバレッジ確認）--> 失敗時: Phase 6 に戻る
  |
  全 PASS --> Phase 8（リファクタリング）へ
```

---

## 2. Gate A: Smoke テスト

**目的**: 実装した全ファイルが正常にコンパイル・インポートできることを確認する。

### 実施条件

- Phase 5 の全 Step（1〜6）が完了していること
- `pnpm --filter @repo/shared build` が PASS していること

### Smoke チェックリスト

```bash
# 1. Shared パッケージのビルド確認
pnpm --filter @repo/shared build
# 期待: ERROR なし

# 2. TypeScript 型チェック
cd apps/desktop && pnpm typecheck
# 期待: ERROR なし

# 3. 新規ファイルのインポート確認（型エラーなし）
# 以下のファイルが import 可能であること:
#   - packages/shared/src/types/transcriptProvenance.ts
#   - apps/desktop/src/renderer/hooks/useTranscriptShare.ts
#   - apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx

# 4. ESLint チェック
cd apps/desktop && pnpm lint
# 期待: ERROR なし（WARNING は許容）
```

### Gate A 合格条件

| チェック項目                       | 合格基準    | 失敗時の戻り先         |
| ---------------------------------- | ----------- | ---------------------- |
| `pnpm --filter @repo/shared build` | エラー 0 件 | Phase 5 Step 1         |
| `pnpm typecheck`                   | エラー 0 件 | Phase 5 の該当 Step    |
| `pnpm lint`                        | エラー 0 件 | Phase 5 の該当ファイル |

---

## 3. Gate B: Integration テスト

**目的**: Store / Hook / Component の結合動作が仕様通りであることを自動テストで確認する。

### 実施条件

- Gate A が全 PASS していること
- Phase 4 の基本テスト（V-C1〜V-C8, V-I1〜V-I5）が全 PASS していること

### Integration テスト実行コマンド

```bash
# P40対策: apps/desktop ディレクトリから実行すること
cd apps/desktop

# ユニットテスト（V-C系）
pnpm vitest run \
  src/__tests__/TranscriptProvenanceChip.test.tsx \
  src/__tests__/useTranscriptShare.test.ts \
  src/__tests__/TranscriptProvenance.types.test.ts

# インテグレーションテスト（V-I系）
pnpm vitest run \
  src/__tests__/integration/transcriptShare.integration.test.ts

# 回帰テスト（RG系、Phase 6）
pnpm vitest run \
  src/__tests__/TranscriptProvenanceChip.test.tsx \
  src/__tests__/useTranscriptShare.test.ts \
  src/__tests__/integration/transcriptShare.integration.test.ts \
  src/__tests__/workspaceSlice.test.ts
```

### Gate B 合格条件

| テストスイート              | 合格基準 | 失敗時の戻り先     |
| --------------------------- | -------- | ------------------ |
| V-C1〜V-C8（Contract Unit） | 全 PASS  | Phase 5 の該当実装 |
| V-I1〜V-I5（Integration）   | 全 PASS  | Phase 5 Step 5/6   |
| RG-E1〜E9（Error境界）      | 全 PASS  | Phase 6            |
| RG-B1〜B4（Blocked境界）    | 全 PASS  | Phase 6            |
| RG-F1〜F5（Fallback境界）   | 全 PASS  | Phase 6            |
| RG-D1〜D3（二重登録）       | 全 PASS  | Phase 6            |
| RG-R1〜R4（再レンダー）     | 全 PASS  | Phase 6            |
| RG-H1〜H3（重複handoff）    | 全 PASS  | Phase 6            |

**注意**: `it.skip` は1件（RG-P1: Permission境界スタブ）のみ許容。それ以外のスキップは FAIL 扱い。

---

## 4. Gate C: Walkthrough テスト

**目的**: OP-1/2/3 の全操作フローを「人間が読める形」でトレースし、仕様との整合を確認する。

### 実施条件

- Gate B が全 PASS していること

### Walkthrough シナリオ一覧

#### WLK-01: OP-1 フロー（選択範囲をチャットへ送る）

```
[前提] Terminal セッションが起動している
[Step 1] Terminal 上で任意の範囲（L3〜L7）を選択する
[Step 2] "チャットへ送る" ボタンをクリックする
[期待] useTranscriptShare.shareSelectedRange が呼ばれる
[期待] TranscriptProvenance { sourceType: "range", messageRange: { startLine: 3, endLine: 7 } } が生成される
[期待] pendingTranscriptProvenance が Store にセットされる
[期待] ChatInputArea に TranscriptProvenanceChip が表示される
[期待] チャットに自動送信されない（手動送信を待つ）
[確認観点] V-C5, V-M1, V-M2, V-M6
```

#### WLK-02: OP-2 フロー（直近出力を添付）

```
[前提] Terminal セッションで何かコマンドを実行済み
[Step 1] "直近出力を添付" ボタンをクリックする
[期待] useTranscriptShare.shareLastOutput が呼ばれる
[期待] TranscriptProvenance { sourceType: "last-output" } が生成される
[期待] ChatInputArea に "直近出力" ラベルの Chip が表示される
[期待] チャットに自動送信されない
[確認観点] V-C6, V-M3, V-M6
```

#### WLK-03: OP-3 フロー（セッションを貼り付ける）

```
[前提] Terminal セッションが存在する
[Step 1] "セッションを貼り付け" ボタンをクリックする
[期待] useTranscriptShare.pasteSession が呼ばれる
[期待] TranscriptProvenance { sourceType: "session", sessionTitle: "セッション名" } が生成される
[期待] ChatInputArea にセッションタイトルの Chip が表示される
[期待] チャットに自動送信されない
[確認観点] V-C7, V-M4, V-M6
```

#### WLK-04: Chip 削除フロー

```
[前提] WLK-01〜03 いずれかの Chip が表示されている
[Step 1] Chip の削除ボタン（×）をクリックする
[期待] clearPendingTranscriptProvenance が呼ばれる
[期待] Chip が ChatInputArea から消える
[期待] チャット送信ボタンは引き続き有効（Provenanceなしで送信可能）
[確認観点] V-M9
```

#### WLK-05: 送信後の履歴確認フロー

```
[前提] WLK-01〜03 いずれかの Chip が表示された状態
[Step 1] チャットメッセージを入力する（任意のテキスト）
[Step 2] 送信ボタンをクリックする
[期待] WorkspaceChatMessage に transcriptProvenance が格納される
[期待] チャット履歴に送信済みメッセージの Chip が表示される（読み取り専用）
[期待] 履歴 Chip に削除ボタンが表示されない
[確認観点] V-M5, V-I4, EC-CHP-15
```

#### WLK-06: Task05 責務分離確認フロー

```
[前提] Terminal Handoff（Task05）機能が有効
[Step 1] Terminal Handoff 操作を実行する
[Step 2] 同時または直後に OP-1 を実行する
[期待] 両操作が独立して動作し、互いの状態に干渉しない
[期待] Provenance Chip が Handoff 通知と混在しない
[確認観点] V-M8, RG-H1, RG-H2, RG-H3
```

### Gate C 合格条件

| シナリオ           | 合格基準           | 失敗時の戻り先        |
| ------------------ | ------------------ | --------------------- |
| WLK-01（OP-1）     | 全 Step が期待通り | Phase 5 Step 3/5      |
| WLK-02（OP-2）     | 全 Step が期待通り | Phase 5 Step 3/5      |
| WLK-03（OP-3）     | 全 Step が期待通り | Phase 5 Step 3/5      |
| WLK-04（Chip削除） | 全 Step が期待通り | Phase 5 Step 4/5      |
| WLK-05（履歴確認） | 全 Step が期待通り | Phase 5 Step 6        |
| WLK-06（責務分離） | 全 Step が期待通り | Phase 5（設計確認後） |

---

## 5. Gate D: カバレッジ確認

**目的**: `coverage-targets.md` で定義した基準を達成していることを確認する。

### 実施条件

- Gate B が全 PASS していること

### カバレッジ計測・確認コマンド

```bash
cd apps/desktop

pnpm vitest run --coverage \
  src/__tests__/TranscriptProvenanceChip.test.tsx \
  src/__tests__/useTranscriptShare.test.ts \
  src/__tests__/TranscriptProvenance.types.test.ts \
  src/__tests__/integration/transcriptShare.integration.test.ts
```

### Gate D 合格条件

| 指標                              | 最低基準 | 未達時の戻り先         |
| --------------------------------- | -------- | ---------------------- |
| Line Coverage（新規ファイル）     | 80%      | Phase 6                |
| Branch Coverage（新規ファイル）   | 60%      | Phase 6                |
| Function Coverage（新規ファイル） | 80%      | Phase 6                |
| Scenario Coverage（V-C + V-I）    | 100%     | Phase 4 または Phase 6 |

---

## 6. 再実行トリガー

以下の条件が発生した場合は、該当ゲートから再実行すること。

| トリガー                               | 再実行ゲート | 理由                                     |
| -------------------------------------- | ------------ | ---------------------------------------- |
| `TranscriptProvenance` 型の変更        | Gate A から  | 型変更は全テストに影響する               |
| `workspaceSlice` のアクション変更      | Gate B から  | Store変更は Integration テストに影響する |
| `TranscriptProvenanceChip` のProps変更 | Gate B から  | Props変更は Unit テストに影響する        |
| IPC チャンネル変更                     | Gate A から  | IPC変更はビルドに影響する                |
| Task05（Terminal Handoff）との統合     | Gate C から  | WLK-06 の再確認が必要                    |
| Phase 6 でテストを追加した場合         | Gate B から  | 追加テストの PASS を確認                 |

---

## 7. 統合ゲート判定サマリー

Phase 8 進行の許可条件:

```
Gate A (Smoke)       : 全チェック PASS
Gate B (Integration) : 全テスト PASS（スキップ 1件を除く）
Gate C (Walkthrough) : 全シナリオ 全Step 期待通り
Gate D (Coverage)    : Line 80% / Branch 60% / Function 80% / Scenario 100%
```

いずれかのゲートが FAIL の場合は Phase 8 に進まず、指定の戻り先 Phase で修正を行うこと。
