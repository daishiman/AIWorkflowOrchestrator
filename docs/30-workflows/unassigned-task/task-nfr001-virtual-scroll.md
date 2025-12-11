# 仮想スクロール対応 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-NFR001                                          |
| タスク名         | 仮想スクロール対応(大量ファイル最適化)                  |
| 分類             | パフォーマンス                                          |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 高                                                      |
| 見積もり規模     | 中規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (非機能要件定義) - NFR-WS-001                   |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | @req-analyst                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

NFR-001で「ファイルツリー読み込み時間: 10000ファイル以下で3秒以内」という目標が設定されています。現在の実装では、すべてのファイルノードをDOMに描画するため、大量ファイル時にパフォーマンスが劣化します。設計レビュー(DR-WS-001)でも「仮想スクロール対応」がSuggestionとして提案されました。

### 1.2 問題点・課題

- 10000ファイル超のフォルダで描画が遅延する(3秒超過の可能性)
- すべてのDOMノードを保持するためメモリ使用量が増加
- スクロールパフォーマンスが劣化
- 企業ユーザーの大規模プロジェクト対応ができない

### 1.3 放置した場合の影響

- **パフォーマンス**: NFR-001の目標値を達成できず、ユーザー体験が悪化
- **スケーラビリティ**: 大規模プロジェクトで使用不可能になる
- **メモリ効率**: メモリ使用量が肥大化し、Electronアプリの限界に達する
- **影響度**: 高(Critical Path として優先実装推奨)

---

## 2. 何を達成するか(What)

### 2.1 目的

ファイルツリーに仮想スクロールを導入し、10万件のファイルでも1秒以内のレンダリングとスムーズなスクロールを実現する。

### 2.2 最終ゴール

1. 10万件のファイルでも1秒以内にファイルツリーが表示される
2. スクロール時のフレームレート60fps以上を維持
3. メモリ使用量がファイル数に比例せず、一定範囲(+50MB以内)に収まる
4. 既存のUIとの互換性を維持(視覚的な変化なし)

### 2.3 スコープ

#### 含むもの

- `@tanstack/react-virtual`の導入
- `FolderEntry`コンポーネントの仮想化
- `FileTree`コンポーネントの仮想化
- 10万件ファイルでのパフォーマンステスト
- メモリ使用量の測定と最適化

#### 含まないもの

- 検索結果の仮想スクロール(ファイル検索機能実装後に対応)
- 横方向の仮想スクロール(現状不要)
- 無限スクロール(ファイルツリーは有限)

### 2.4 成果物

| 成果物                | パス                                                                 | 完了時の配置先     |
| --------------------- | -------------------------------------------------------------------- | ------------------ |
| パフォーマンス要件書  | docs/30-workflows/workspace-manager-enhancements/task-step00-perf.md | (完了後も同じ場所) |
| パフォーマンス設計書  | docs/30-workflows/workspace-manager-enhancements/task-step01-perf.md | (完了後も同じ場所) |
| 最適化済みFolderEntry | apps/desktop/src/renderer/components/molecules/FolderEntry/index.tsx | (実装済み)         |
| 最適化済みFileTree    | apps/desktop/src/renderer/components/organisms/FileTree/index.tsx    | (実装済み)         |
| パフォーマンステスト  | apps/desktop/src/test/performance/virtualScroll.perf.test.ts         | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- Phase 6の品質ゲートをすべて通過していること

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- React 仮想スクロールの原理
- `@tanstack/react-virtual`の使用経験
- パフォーマンス計測(Chrome DevTools Performance)
- メモリプロファイリング

### 3.4 推奨アプローチ

**技術選定**: @tanstack/react-virtual

- 理由: react-window/react-virtualizedより軽量、フック中心の API、TypeScript 完全対応

**実装戦略**:

1. `useVirtualizer`フックを使用してファイルツリーを仮想化
2. 可視領域のDOMノードのみをレンダリング
3. スクロール時の動的な要素追加/削除
4. パフォーマンステストで目標値達成を確認

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義(パフォーマンス要件)
Phase 1: 設計(仮想スクロールアーキテクチャ)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証(パフォーマンステスト)
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証(大規模データ)
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements virtual-scroll-performance
```

#### 使用エージェント

- **エージェント**: @sre-observer
- **選定理由**: パフォーマンス要件の定義に精通

#### 完了条件

- [ ] パフォーマンス目標値が定義されている(10万件で1秒以内)
- [ ] メモリ使用量の目標値が定義されている(+50MB以内)
- [ ] 測定方法が明確化されている

---

### Phase 1: 設計

#### Claude Code スラッシュコマンド

```
/ai:design-architecture virtual-scroll-pattern
```

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: Reactパフォーマンス最適化の専門家

#### 活用スキル

| スキル名           | 活用方法                   |
| ------------------ | -------------------------- |
| web-performance    | 仮想スクロールパターン設計 |
| react-optimization | メモ化、useMemo活用        |

---

### Phase 3: テスト作成 (TDD: Red)

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests virtual-scroll
```

#### パフォーマンステスト

```typescript
describe('VirtualScroll Performance', () => {
  it('should render 100k files within 1 second', async () => {
    const startTime = performance.now();
    render(<FileTree files={create100kFiles()} />);
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
```

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency @tanstack/react-virtual
```

---

#### T-04-2: FolderEntry仮想化

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/molecules/FolderEntry/index.tsx virtual-scroll
```

##### 使用エージェント

- **エージェント**: @frontend-tester

---

#### T-04-3: FileTree仮想化

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileTree/index.tsx virtual-scroll
```

---

### Phase 6: 品質保証

#### Claude Code スラッシュコマンド

```
/ai:analyze-performance workspace-sidebar
```

#### パフォーマンス測定項目

- [ ] 10万件ファイルのレンダリング時間: 1秒以内
- [ ] スクロール時のFPS: 60fps以上
- [ ] メモリ使用量増加: +50MB以内
- [ ] CPU使用率: スクロール時50%以下

---

### Phase 7: 最終レビューゲート

#### レビュー参加エージェント

| エージェント     | レビュー観点   | 選定理由                       |
| ---------------- | -------------- | ------------------------------ |
| @sre-observer    | パフォーマンス | 目標値達成確認                 |
| @frontend-tester | 実装品質       | 仮想スクロール実装の妥当性確認 |

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ       | テスト項目         | 前提条件                 | 操作手順                            | 期待結果                     |
| --- | -------------- | ------------------ | ------------------------ | ----------------------------------- | ---------------------------- |
| 1   | パフォーマンス | 10万件レンダリング | 10万件ファイルのフォルダ | 1.フォルダを展開                    | 1秒以内に表示される          |
| 2   | パフォーマンス | スクロール滑らかさ | ファイルツリー表示中     | 1.高速スクロール                    | カクつきなく滑らかに動作する |
| 3   | 機能           | 選択状態の維持     | ファイルを選択済み       | 1.スクロールして見えなくする 2.戻る | 選択状態が維持されている     |
| 4   | メモリ         | メモリ使用量       | 10万件ファイルのフォルダ | 1.フォルダを展開                    | メモリ増加が+50MB以内        |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 仮想スクロールが実装されている
- [ ] 既存のUI/UXとの互換性が維持されている
- [ ] すべての既存機能が動作する

### 品質要件

- [ ] NFR-001の目標値を達成(10万件で1秒以内)
- [ ] NFR-004の目標値を達成(メモリ+50MB以内)
- [ ] ユニットテストカバレッジ80%以上
- [ ] パフォーマンステストが成功

### ドキュメント要件

- [ ] パフォーマンス要件書が作成されている
- [ ] パフォーマンス測定結果が記録されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### パフォーマンステスト

```typescript
import { renderHook } from "@testing-library/react";
import { useVirtualizer } from "@tanstack/react-virtual";

describe("Virtual Scroll Performance", () => {
  it("should handle 100k items efficiently", () => {
    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      name: `file${i}`,
    }));

    const { result } = renderHook(() =>
      useVirtualizer({
        count: items.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 32,
      }),
    );

    expect(result.current.getVirtualItems().length).toBeLessThan(100);
  });
});
```

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                   |
| --------------------------------- | ------ | -------- | -------------------------------------- |
| 既存UIとの互換性破壊              | 高     | 中       | 段階的導入、フィーチャーフラグ         |
| スクロール位置の復元問題          | 中     | 中       | scrollToIndex APIの活用                |
| 動的な高さ計算の複雑化            | 中     | 低       | estimateSize を固定値で開始            |
| @tanstack/react-virtualの学習曲線 | 低     | 高       | 公式ドキュメント、サンプルコードを参照 |

---

## 8. 参照情報

### 関連ドキュメント

- [NFR-WS-001: 非機能要件定義書](../workspace-manager/task-step00-2-non-functional-requirements.md) - NFR-001
- [DR-WS-001: 設計レビュー報告書](../workspace-manager/task-step02-1-design-review.md) - Suggestion #1

### 参考資料

- @tanstack/react-virtual: https://tanstack.com/virtual/latest
- React Performance Optimization: https://react.dev/learn/render-and-commit

---

## 9. 備考

### 補足事項

**Critical Path として優先実装推奨**:

- 大規模プロジェクト対応の基盤
- パフォーマンス問題の根本解決
- メモリ効率の大幅改善

**実装時の注意**:

- 初期実装は固定高さ(`estimateSize: 32`)で開始
- 動的高さは将来の拡張として残す
- スクロール位置の復元は`scrollToIndex`を使用

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                    |
| ---------- | ---------- | ------------ | --------------------------- |
| 1.0.0      | 2025-12-11 | @req-analyst | 初版作成(NFR-001単一タスク) |
