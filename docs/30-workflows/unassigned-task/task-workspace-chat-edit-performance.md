# Workspace Chat Edit Performance - タスク指示書

## メタ情報

```yaml
issue_number: 493
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-WCE-PERF-001                                        |
| タスク名     | Workspace Chat Edit Performance Improvements           |
| 分類         | パフォーマンス                                         |
| 対象機能     | workspace-chat-edit（Main Process）                    |
| 優先度       | 低                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | Phase 11（workspace-chat-edit-main-process手動テスト） |
| 発見日       | 2026-01-25                                             |
| 関連Issue    | #469（Main Process完了）                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit-main-process実装のPhase 11手動テストにおいて、将来的なパフォーマンス改善項目として以下が特定された:

- FUT-01: LCSアルゴリズムによる詳細な差分計算の実装
- FUT-03: ファイル読み取り結果のキャッシュ実装

現状の実装は機能的には完全だが、大きなファイルや頻繁な操作時にパフォーマンス最適化の余地がある。

### 1.2 問題点・課題

- **差分計算**: 現在は単純な文字列比較。LCSアルゴリズムを使えば、より精密な差分表示（行単位・文字単位）が可能
- **ファイルキャッシュ**: 同一ファイルを繰り返し読み込む際、毎回ディスクI/Oが発生している

### 1.3 放置した場合の影響

- 大きなファイル（1000行以上）で差分表示が遅くなる可能性
- 同一ファイルの繰り返し編集時にレスポンスが遅延
- ただし、現時点では顕著なパフォーマンス問題は報告されていない

---

## 2. 何を達成するか（What）

### 2.1 目的

workspace-chat-edit機能のレスポンス時間を改善し、大きなファイルでも快適に操作できるようにする。

### 2.2 最終ゴール

- LCSアルゴリズムによる差分計算で、行単位の精密な差分が生成される
- ファイルキャッシュにより、同一ファイルの2回目以降の読み込みが高速化
- 1000行のファイルでも差分計算が100ms以内に完了

### 2.3 スコープ

#### 含むもの

- FUT-01: LCSアルゴリズムによる差分計算
  - 行単位のLCS実装
  - 差分結果の構造化（追加/削除/変更行の識別）
- FUT-03: ファイル読み取りキャッシュ
  - LRUキャッシュ実装（最大100ファイル）
  - キャッシュ有効期限（5分）
  - ファイル変更検知によるキャッシュ無効化

#### 含まないもの

- UI側のパフォーマンス改善
- ストリーミング応答の最適化
- データベースキャッシュ

### 2.4 成果物

| 成果物             | 配置先                                                |
| ------------------ | ----------------------------------------------------- |
| lcs-diff.ts        | `apps/desktop/src/main/services/chat-edit/utils/`     |
| file-cache.ts      | `apps/desktop/src/main/services/chat-edit/utils/`     |
| ユニットテスト     | `apps/desktop/src/main/services/chat-edit/__tests__/` |
| ベンチマークテスト | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-edit-main-process タスク完了（✅ 2026-01-25完了）
- Node.js 20.x / pnpm 9.x 環境

### 3.2 依存タスク

| タスク                           | ステータス | 備考         |
| -------------------------------- | ---------- | ------------ |
| workspace-chat-edit-main-process | ✅ 完了    | 基盤実装完了 |

### 3.3 必要な知識

- LCS（Longest Common Subsequence）アルゴリズム
- LRUキャッシュ実装パターン
- Node.js fs.watch API
- Vitest / ベンチマークテスト

### 3.4 推奨アプローチ

1. LCSアルゴリズム実装 → 2. キャッシュ実装 → 3. ベンチマーク検証 → 4. 既存サービスへの統合

---

## 4. 実行手順

### Phase構成

本タスクは小規模のため、簡略化したPhase構成を採用:

| Phase | 名称         | 概要                   |
| ----- | ------------ | ---------------------- |
| 1-3   | 要件〜設計   | インターフェース設計   |
| 4-5   | テスト〜実装 | TDD方式で実装          |
| 6-7   | テスト拡充   | ベンチマークテスト追加 |
| 8-10  | 品質保証     | パフォーマンス検証     |
| 11-13 | 検証〜PR     | 統合・ドキュメント・PR |

### Phase 5: 実装

#### 目的

LCS差分計算とファイルキャッシュをTDD方式で実装する。

#### 手順

1. **LCS差分計算（lcs-diff.ts）**

   ```typescript
   interface DiffLine {
     type: "add" | "remove" | "unchanged";
     lineNumber: number;
     content: string;
   }

   function computeDiff(original: string, modified: string): DiffLine[];
   ```

2. **ファイルキャッシュ（file-cache.ts）**

   ```typescript
   interface CachedFile {
     content: string;
     language: string;
     cachedAt: number;
     fileHash: string;
   }

   class FileCache {
     get(filePath: string): CachedFile | null;
     set(filePath: string, data: CachedFile): void;
     invalidate(filePath: string): void;
     clear(): void;
   }
   ```

3. **既存サービスへの統合**
   - ChatEditService.parseResponseでLCS差分を使用
   - FileService.readFileでキャッシュを活用

#### 成果物

- lcs-diff.ts + テスト
- file-cache.ts + テスト
- ベンチマークテスト

#### 完了条件

- 1000行ファイルの差分計算が100ms以内
- キャッシュヒット時の読み込みが1ms以内

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] LCSアルゴリズムで行単位の差分が計算される
- [ ] 差分結果にadd/remove/unchanged情報が含まれる
- [ ] ファイルキャッシュがLRU方式で動作する
- [ ] キャッシュ有効期限（5分）が機能する
- [ ] ファイル変更時にキャッシュが無効化される

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### パフォーマンス要件

- [ ] 1000行ファイルの差分計算 ≤ 100ms
- [ ] キャッシュヒット時の読み込み ≤ 1ms
- [ ] キャッシュミス時の読み込み ≤ 50ms

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] ベンチマーク結果が記録されている

---

## 6. 検証方法

### テストケース

| TC-ID      | 機能             | 期待結果                        |
| ---------- | ---------------- | ------------------------------- |
| TC-PERF-01 | LCS差分（小）    | 10行ファイルの差分が正確に計算  |
| TC-PERF-02 | LCS差分（大）    | 1000行ファイルの差分が100ms以内 |
| TC-PERF-03 | キャッシュヒット | 2回目読み込みが1ms以内          |
| TC-PERF-04 | キャッシュ期限   | 5分後にキャッシュが無効化       |
| TC-PERF-05 | ファイル変更検知 | 変更後のキャッシュが無効化      |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテスト実行
2. `pnpm --filter @repo/desktop test:bench` でベンチマーク実行
3. 結果をベンチマークレポートに記録

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                |
| ------------------------ | ------ | -------- | ----------------------------------- |
| LCSアルゴリズムの計算量  | 中     | 低       | メモ化・最適化実装                  |
| キャッシュメモリ使用量   | 低     | 低       | LRU制限（100ファイル）              |
| ファイル変更検知の信頼性 | 低     | 中       | fs.watch + ポーリングフォールバック |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Main Process実装ガイド | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |
| 手動テスト結果         | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-11/manual-test-result.md`   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                        | 内容                        |
| ----------------------- | --------------------------------------------------------------------------- | --------------------------- |
| インターフェース（LLM） | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`       | FileService/ChatEditService |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | パフォーマンス基準          |

### 参考資料

- LCS Algorithm: https://en.wikipedia.org/wiki/Longest_common_subsequence
- diff-match-patch: https://github.com/google/diff-match-patch
- lru-cache: https://github.com/isaacs/node-lru-cache

---

## 9. 備考

### Phase 11検出時の記録

```
将来対応項目（優先度: 低〜中）

| ID     | ソース           | 内容                                         | 優先度 | 推奨対応             |
| ------ | ---------------- | -------------------------------------------- | ------ | -------------------- |
| FUT-01 | Phase 11発見課題 | LCSアルゴリズムによる詳細な差分計算の実装    | 中     | 将来タスク           |
| FUT-03 | Phase 11発見課題 | ファイル読み取り結果のキャッシュ実装         | 低     | パフォーマンス改善時 |
```

### 補足事項

- 現時点で顕著なパフォーマンス問題は報告されていない
- ユーザー数増加・大規模ファイル利用時に優先度を再評価
- diff-match-patchライブラリの活用も検討可能
