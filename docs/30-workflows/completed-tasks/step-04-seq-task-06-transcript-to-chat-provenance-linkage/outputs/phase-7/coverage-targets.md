# Phase 7: カバレッジ目標

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

プロジェクトルール（02-code-quality.md）に従い、Line / Branch / Function / Scenario の各カバレッジ目標を定義する。
Phase 4（基本テスト）+ Phase 6（回帰テスト）完了後に達成すべき基準を示す。

---

## 1. カバレッジ基準テーブル

| 指標              | 最低基準 | 推奨基準 | 根拠                                   |
| ----------------- | -------- | -------- | -------------------------------------- |
| Line Coverage     | 80%      | 90%      | プロジェクト標準（02-code-quality.md） |
| Branch Coverage   | 60%      | 70%      | プロジェクト標準（02-code-quality.md） |
| Function Coverage | 80%      | 90%      | プロジェクト標準（02-code-quality.md） |
| Scenario Coverage | 70%      | 85%      | 本タスク固有（V-C/V-I/V-M の充足率）   |

---

## 2. ファイルごとのカバレッジ目標

### 2-A: 新規作成ファイル（高基準）

新規作成ファイルは既存コードへの配慮が不要なため、より高い基準を設定する。

| ファイルパス                                                              | Line | Branch | Function | 備考                         |
| ------------------------------------------------------------------------- | ---- | ------ | -------- | ---------------------------- |
| `packages/shared/src/types/transcriptProvenance.ts`                       | N/A  | N/A    | N/A      | 型定義のみ（実行コードなし） |
| `apps/desktop/src/renderer/hooks/useTranscriptShare.ts`                   | 90%  | 80%    | 95%      | OP-1/2/3 の全操作をテスト    |
| `apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx` | 90%  | 85%    | 90%      | 全 sourceType 分岐をカバー   |

### 2-B: 既存拡張ファイル（標準基準）

既存ファイルの追加部分のみを対象とする（既存コードは対象外）。

| ファイルパス                                                         | Line（追加部分） | Branch（追加部分） | Function（追加部分） | 備考                         |
| -------------------------------------------------------------------- | ---------------- | ------------------ | -------------------- | ---------------------------- |
| `packages/shared/src/types/workspaceChat.ts`                         | N/A              | N/A                | N/A                  | 型定義のみ                   |
| `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`           | 85%              | 75%                | 90%                  | set/clear/get の全アクション |
| `apps/desktop/src/renderer/components/organisms/ChatInputArea.tsx`   | 80%              | 70%                | 80%                  | Chip条件表示ロジック         |
| `apps/desktop/src/renderer/components/molecules/ChatMessageItem.tsx` | 80%              | 70%                | 80%                  | Chip条件表示ロジック         |

---

## 3. Branch Coverage の重点ブランチ

Branch Coverage の目標達成に向けて、以下のブランチを優先的にカバーする。

| ブランチ                               | 対応テストケース           | 最低到達ライン |
| -------------------------------------- | -------------------------- | -------------- |
| `sourceType === "range"`               | V-C2, EC-CHP-02, EC-CHP-03 | 必須（100%）   |
| `sourceType === "last-output"`         | V-C3, EC-OP2-08            | 必須（100%）   |
| `sourceType === "session"`             | V-C4, EC-OP3-06            | 必須（100%）   |
| `messageRange !== undefined` の分岐    | V-C2, RG-F1                | 必須（100%）   |
| `transcriptProvenance === undefined`   | V-C1, RG-F4, V-I5          | 必須（100%）   |
| `pendingTranscriptProvenance !== null` | RG-R3, EC-ST-03            | 必須（100%）   |
| IPC 成功 / 失敗                        | V-I1, RG-B1                | 推奨（80%）    |
| `onDismiss` が undefined の場合        | EC-CHP-08                  | 推奨（80%）    |

---

## 4. Function Coverage の対象関数一覧

`useTranscriptShare` の全エクスポート関数を Function Coverage の対象とする。

| 関数名               | 呼び出しテスト     | 必須 |
| -------------------- | ------------------ | ---- |
| `shareSelectedRange` | V-C5, RG-E1〜E3    | Yes  |
| `shareLastOutput`    | V-C6, RG-E4        | Yes  |
| `pasteSession`       | V-C7, RG-E6, RG-E8 | Yes  |

`workspaceSlice` の追加アクション:

| 関数名                                | 呼び出しテスト     | 必須 |
| ------------------------------------- | ------------------ | ---- |
| `setPendingTranscriptProvenance`      | V-C5〜V-C7, RG-D1  | Yes  |
| `clearPendingTranscriptProvenance`    | V-M9, RG-D3, RG-R3 | Yes  |
| `usePendingTranscriptProvenance`      | V-I1〜V-I4         | Yes  |
| `useSetPendingTranscriptProvenance`   | V-C5〜V-C7         | Yes  |
| `useClearPendingTranscriptProvenance` | V-M9               | Yes  |

---

## 5. Scenario Coverage の算出方法

Scenario Coverage は V-C / V-I / V-M の検証IDを母数として算出する。

```
Scenario Coverage = PASSした検証ID数 / 全検証ID数 × 100
```

**目標値の根拠**:

- V-C1〜V-C8（8件）: 全件 PASS が必要（最低 100%）
- V-I1〜V-I5（5件）: 全件 PASS が必要（最低 100%）
- V-M1〜V-M9（9件）: Phase 11 手動テストで確認（最低 7/9 = 78%）
- V-Q1〜V-Q7（7件）: 最低 5/7 = 71%
- V-D1〜V-D5（5件）: Phase 12 で全件確認（最低 100%）

| カテゴリ           | 全件数 | 最低PASS数 | 最低カバレッジ | 推奨PASS数 | 推奨カバレッジ |
| ------------------ | ------ | ---------- | -------------- | ---------- | -------------- |
| V-C（Contract）    | 8      | 8          | 100%           | 8          | 100%           |
| V-I（Integration） | 5      | 5          | 100%           | 5          | 100%           |
| V-M（Manual）      | 9      | 7          | 78%            | 9          | 100%           |
| V-Q（QA）          | 7      | 5          | 71%            | 7          | 100%           |
| V-D（Doc）         | 5      | 5          | 100%           | 5          | 100%           |
| **合計**           | **34** | **30**     | **88%**        | **34**     | **100%**       |

---

## 6. カバレッジ計測コマンド

```bash
# apps/desktop ディレクトリから実行すること（P40対策）
cd apps/desktop

# カバレッジレポート生成
pnpm vitest run --coverage \
  src/__tests__/TranscriptProvenanceChip.test.tsx \
  src/__tests__/useTranscriptShare.test.ts \
  src/__tests__/TranscriptProvenance.types.test.ts \
  src/__tests__/integration/transcriptShare.integration.test.ts

# カバレッジしきい値チェック（CI向け）
pnpm vitest run --coverage \
  --coverage.thresholds.lines 80 \
  --coverage.thresholds.branches 60 \
  --coverage.thresholds.functions 80
```

---

## 7. カバレッジ不達時の対応

| 状況                    | 対応                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| Line Coverage < 80%     | Phase 6 に戻り追加テストを実装                                     |
| Branch Coverage < 60%   | `sourceType` / `messageRange` 分岐の未テストブランチを特定して追加 |
| Function Coverage < 80% | 未呼び出し関数を特定し、対応するテストケースを追加                 |
| Scenario Coverage < 70% | 未実施の V-C / V-I に対してテストを追加                            |

**注意**: カバレッジ未達を `/* c8 ignore */` や `/* istanbul ignore */` で回避することは禁止。
実際のテストケース追加でカバレッジを向上させること。

---

## 8. v8 カバレッジプロバイダの注意事項（P41対策）

Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。
以下のパターンに注意すること。

```typescript
// P41: インライン arrow function がカバレッジ対象になる
const shouldShowChip = (message: WorkspaceChatMessage): boolean =>
  message.transcriptProvenance !== undefined; // <- この arrow function 自体が Function Coverage に計上される
```

**対策**: `TranscriptProvenanceChip.tsx` のオプションオブジェクト内のコールバックは、テストで明示的に呼び出して Function Coverage を確保すること。
