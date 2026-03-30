# Result Panel 仮想スクロール対応 - タスク指示書

## メタ情報

```yaml
issue_number: 1749
task_id: TASK-RT-03-VIRTUAL-SCROLL-001
task_name: Result Panel 仮想スクロール対応
priority: 低
scale: 小規模
status: 未実施
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-RT-03-VIRTUAL-SCROLL-001                                        |
| タスク名     | Result Panel 仮想スクロール対応（permissionDenials / sdkEvents）     |
| 分類         | パフォーマンス                                                       |
| 対象機能     | ExecuteResultDetailPanel の permissionDenials / sdkEvents セクション |
| 優先度       | LOW                                                                  |
| 見積もり規模 | S（1コンポーネント改修 + 依存パッケージ追加）                        |
| ステータス   | unassigned                                                           |
| 発見元       | TASK-RT-03 Phase 11 未タスク検出                                     |
| 作成日       | 2026-03-30                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-03（Skill Creation Result Panel）の `ExecuteResultDetailPanel.tsx` では、`permissionDenials` と `sdkEvents` のリストを全件 DOM レンダリングする実装になっている。スキル実行のセッションが長期化・複雑化した場合（例: 100件以上の sdkEvents が発生）、DOM ノード数の増大によりレンダリングが重くなる可能性がある。

Phase 11 の手動テスト（AC-NFR: パフォーマンス）では 100件超のリストによるフリーズが懸念として報告されたが、通常ユースケースでは件数が少ないため LOW 優先度の未タスクとして記録された。

既存の仮想スクロールタスク（TASK-WS-NFR001）はワークスペースマネージャーのファイルツリー向けであり、本タスクはスキル実行結果パネルの特定セクションに特化した別タスクである。

### 1.2 問題点・課題

- `PermissionDenialsList` が 100件超の場合、DOM に全件レンダリングされ初期表示が遅延する可能性
- `SdkEventsList` が 100件超の場合、展開時のスクロール操作がカクつく可能性
- 現状は件数制限やページネーションが実装されていないため、大量データ時の UX 保証がない

### 1.3 放置した場合の影響

- **短期**: 通常のスキル実行では 100件超になるケースが稀なため実質影響なし
- **中期**: 複雑なスキル（多数のサブエージェント呼び出し）の実行時にパフォーマンス問題が顕在化する可能性
- **長期**: 仮想スクロールなしのまま verify/improve フェーズのパネルが追加されると、複合的なパフォーマンス問題になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`ExecuteResultDetailPanel` の `PermissionDenialsList` と `SdkEventsList` に仮想スクロール（Virtualization）を導入し、大量データ（100件超）でも初期表示・スクロールが快適に動作する状態を実現する。

### 2.2 最終ゴール

- 100件の permissionDenials を表示した際の初期レンダリングが 100ms 以内であること
- 100件の sdkEvents を展開した際のスクロールが 60fps を維持すること
- 通常件数（10件以下）での表示・動作が現状と変わらないこと

### 2.3 スコープ

| 対象       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| スコープ内 | PermissionDenialsList の仮想スクロール化                            |
| スコープ内 | SdkEventsList の仮想スクロール化                                    |
| スコープ外 | PlanResultDetailPanel の各リスト（件数が少なく不要）                |
| スコープ外 | ワークスペースマネージャーのファイルツリー（TASK-WS-NFR001 が対応） |

---

## 3. どう実装するか（How）

### 3.1 対応方針

`@tanstack/react-virtual` を採用する（`react-window` はメンテナンスが停滞しており、TanStack Virtual v3 は Electron + React 18 に対応済み）。固定高さのリストアイテムには `useVirtualizer` フックを使用し、可変高さの場合は `estimateSize` で推定する。

### 3.2 依存パッケージ追加

```bash
pnpm --filter @repo/desktop add @tanstack/react-virtual
```

### 3.3 実装パターン（コード例）

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function PermissionDenialsList({ items }: { items: PermissionDenial[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // アイテム高さの推定値（px）
  });

  return (
    <div ref={parentRef} className="overflow-y-auto max-h-48">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ position: "absolute", top: virtualItem.start }}
          >
            {/* アイテムレンダリング */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. 関連する苦戦箇所・Pitfall

- **TASK-RT-03 での苦戦**: permissionDenials / sdkEvents の展開状態（useState）の管理が複雑になった。展開/折りたたみの状態と仮想スクロールの高さ計算を組み合わせる場合、展開トリガー後に仮想スクロールの `measureElement` を再実行する必要がある
- **仮想スクロールと CSS アニメーション**: Tailwind の `transition` / `animate-pulse` と仮想スクロールを組み合わせると、スクロール中に要素が一瞬消える（CLS）が発生することがある。`will-change: transform` の付与と `position: absolute` の確実な設定で回避可能
- **テストの課題**: happy-dom 環境では `getBoundingClientRect` が 0 を返すため、TanStack Virtual の表示アイテム計算が機能しない。`vi.mock('@tanstack/react-virtual', ...)` で virtualizer をモックするか、件数が閾値以下の場合に仮想スクロールを無効化する分岐を設けることでテスト可能にする

---

## 5. 受入基準

- [ ] 100件の permissionDenials を表示した際の初期レンダリングが 100ms 以内であること
- [ ] 100件の sdkEvents を展開した際のスクロールが滑らかに動作すること
- [ ] 10件以下の通常件数での表示が現状と変わらないこと（仮想スクロール無効化 or 透過的動作）
- [ ] 既存テスト（ExecuteResultDetailPanel 11件を含む53件）が全て PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` - パフォーマンス最適化パターン

### 6.2 関連タスク

- TASK-WS-NFR001: ワークスペースマネージャー仮想スクロール（別スコープ・参照のみ）

### 6.3 タスク成果物（発見元）

- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-12/unassigned-task-detection.md` - 未タスク #4
