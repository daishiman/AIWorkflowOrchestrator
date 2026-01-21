# 履歴UI改善タスク一覧 - タスク指示書

## メタ情報

```yaml
issue_number: 331
```

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | task-history-improvements-001    |
| タスク名   | 履歴UI改善タスク一覧（低優先度） |
| 分類       | 改善                             |
| 対象機能   | 履歴/ログ表示UI                  |
| 優先度     | 低                               |
| ステータス | 未実施                           |
| 発見元     | Phase 3, 10, 11                  |
| 発見日     | 2026-01-10                       |

---

## 概要

本ドキュメントは、CONV-05-03（履歴/ログ表示UIコンポーネント）のレビューで検出された低優先度の改善タスクをまとめたものです。これらは将来の要件やユーザーフィードバックに応じて実施を検討します。

---

## タスク一覧

| タスクID                      | 分類             | 概要                                   | 発見元   | 対応タイミング             |
| ----------------------------- | ---------------- | -------------------------------------- | -------- | -------------------------- |
| task-imp-history-progress-001 | 改善             | 長時間復元時のプログレス表示機能追加   | Phase 3  | ユーザーフィードバック後   |
| task-perf-history-scroll-001  | パフォーマンス   | 履歴件数が多い場合の仮想スクロール導入 | Phase 3  | 大量データで性能問題発生時 |
| task-ref-history-utils-001    | リファクタリング | formatDate/formatSizeの共通化          | Phase 10 | 他機能で同様関数が必要時   |
| task-imp-history-react18-001  | 改善             | React 18 concurrent mode対応           | Phase 10 | Reactバージョンアップ時    |

---

## 1. task-imp-history-progress-001: プログレス表示機能

### メタ情報

| 項目         | 値                            |
| ------------ | ----------------------------- |
| タスクID     | task-imp-history-progress-001 |
| 分類         | 改善                          |
| 優先度       | Low                           |
| 見積もり規模 | S（小規模）                   |
| 発見元       | Phase 3                       |

### Why（なぜ必要か）

大きなファイルの復元処理には時間がかかる場合がある。現在は復元中に「復元中...」とだけ表示されるが、進捗状況が不明でユーザーが不安になる可能性がある。

### What（何を達成するか）

- 復元処理中にプログレスバーを表示
- 進捗率（%）を表示
- キャンセル機能を追加

### How（どのように実行するか）

1. RestoreDialogにプログレスバーコンポーネントを追加
2. useRestoreフックに進捗状態を追加
3. IPCで進捗情報を受け取るリスナーを追加
4. HistoryServiceで進捗を報告する仕組みを実装

### 対応タイミング

- ユーザーから「復元が終わったかわからない」等のフィードバックがあった場合
- 大容量ファイル対応が必要になった場合

---

## 2. task-perf-history-scroll-001: 仮想スクロール導入

### メタ情報

| 項目         | 値                           |
| ------------ | ---------------------------- |
| タスクID     | task-perf-history-scroll-001 |
| 分類         | パフォーマンス               |
| 優先度       | Low                          |
| 見積もり規模 | M（中規模）                  |
| 発見元       | Phase 3                      |

### Why（なぜ必要か）

履歴件数が数百件を超えると、すべてのDOMノードをレンダリングするとパフォーマンスが低下する可能性がある。現在のページネーション（20件ずつ）で対応しているが、すべて読み込んだ場合の対策が必要。

### What（何を達成するか）

- react-window または react-virtualized を導入
- 可視領域のみをレンダリング
- スクロール時のパフォーマンスを改善

### How（どのように実行するか）

1. react-windowをインストール
2. VersionHistoryコンポーネントをVariableSizeListでラップ
3. アイテムの高さを動的に計算
4. パフォーマンステストで効果を検証

### 対応タイミング

- 履歴件数が100件を超えるユースケースが発生した場合
- パフォーマンス問題が報告された場合

### システム仕様参照

```
.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md
- パフォーマンス > 最適化戦略 > 仮想スクロール（将来対応）
```

---

## 3. task-ref-history-utils-001: ユーティリティ関数の共通化

### メタ情報

| 項目         | 値                         |
| ------------ | -------------------------- |
| タスクID     | task-ref-history-utils-001 |
| 分類         | リファクタリング           |
| 優先度       | Low                        |
| 見積もり規模 | XS（極小規模）             |
| 発見元       | Phase 10                   |

### Why（なぜ必要か）

VersionHistory.tsxで定義しているformatDate/formatSize関数は、他のコンポーネントでも使用される可能性がある。現在はコンポーネント内に定義されているため再利用しにくい。

### What（何を達成するか）

- formatDate関数を共通ユーティリティに移動
- formatSize関数を共通ユーティリティに移動
- 既存コンポーネントからの参照を更新

### How（どのように実行するか）

1. `apps/desktop/src/renderer/utils/format.ts`を作成
2. formatDate, formatSize関数を移動
3. テストを追加
4. VersionHistory.tsxからインポートするよう変更

### 対応タイミング

- 他の機能で同様のフォーマット関数が必要になった場合
- 日時/サイズ表示の一貫性を保証する必要が出た場合

### 現在の実装

```typescript
// apps/desktop/src/renderer/components/history/VersionHistory.tsx 内

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## 4. task-imp-history-react18-001: React 18 concurrent mode対応

### メタ情報

| 項目         | 値                           |
| ------------ | ---------------------------- |
| タスクID     | task-imp-history-react18-001 |
| 分類         | 改善                         |
| 優先度       | Low                          |
| 見積もり規模 | S（小規模）                  |
| 発見元       | Phase 10                     |

### Why（なぜ必要か）

React 18のconcurrent modeでは、レンダリングが中断される可能性がある。非同期処理後の状態更新でコンポーネントがアンマウント済みの場合、警告が発生する可能性がある。

### What（何を達成するか）

- useEffect内での状態更新にマウント状態チェックを追加
- AbortControllerによるフェッチキャンセル対応
- React 18のStrictModeでの二重実行への対応

### How（どのように実行するか）

1. 各フックにAbortController対応を追加
2. クリーンアップ関数でアボートを実行
3. 状態更新前にマウント状態を確認
4. StrictModeで動作を検証

### 対応タイミング

- Reactバージョンを18以上にアップグレードする場合
- Concurrent featuresを使用する場合

### 実装例

```typescript
function useVersionHistory(fileId: string) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const result = await window.historyAPI?.getFileHistory(fileId);
        if (isMounted && result?.success) {
          setHistory(result.data.items);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [fileId]);
}
```

---

## 参照情報

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` |

### 関連ドキュメント

| ドキュメント         | パス                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| 実装ガイド           | `docs/30-workflows/history-ui-components/outputs/phase-12/implementation-guide.md`   |
| 未タスク検出レポート | `docs/30-workflows/history-ui-components/outputs/phase-12/unassigned-task-report.md` |

---

## 備考

### 優先度の基準

| 優先度 | 基準                                 |
| ------ | ------------------------------------ |
| High   | 機能が動作しない、セキュリティリスク |
| Medium | ユーザー体験に影響、テストでの発見   |
| Low    | 将来的な改善、コード品質向上         |

### 対応判断のフロー

```
ユーザーフィードバック or パフォーマンス問題発生
    ↓
該当タスクを確認
    ↓
優先度を High に昇格
    ↓
task-specification-creator で仕様書を作成
    ↓
Phase 1〜13 で実装
```
