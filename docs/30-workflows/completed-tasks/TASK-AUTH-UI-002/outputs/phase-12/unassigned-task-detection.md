# Phase 12: 未タスク検出レポート - AUTH-UI-002

## メタ情報

| 項目     | 値          |
| -------- | ----------- |
| Phase    | 12          |
| タスクID | AUTH-UI-002 |
| 作成日   | 2026-02-04  |

---

## 1. 検出ソース一覧

| #   | ソース                 | 確認項目                      | 検出数 |
| --- | ---------------------- | ----------------------------- | ------ |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | 2      |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | 2      |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | 0      |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | 0      |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | 0      |

---

## 2. 検出された未タスク候補

### 2.1 Phase 3/8/10から検出

| ID      | タスク名                      | 説明                                   | 優先度 | 発見元         |
| ------- | ----------------------------- | -------------------------------------- | ------ | -------------- |
| TASK-01 | usePortalMenuカスタムHook抽出 | Portal機能をカスタムHookとして切り出し | 低     | Phase 3, 8, 10 |
| TASK-02 | 位置計算ロジックの共通化      | 他のPortalメニューと位置計算を共有     | 低     | Phase 3, 8, 10 |

### 2.2 コードベース検索結果

```bash
$ grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/organisms/AccountSection/
# 結果: 該当なし
```

---

## 3. 未タスク詳細

### TASK-01: usePortalMenuカスタムHook抽出

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| 概要         | Portal機能をusePortalMenu()として切り出し      |
| 対象ファイル | AccountSection/index.tsx                       |
| 期待効果     | 他のコンポーネントでPortalメニューを再利用可能 |
| 優先度       | 低                                             |
| 理由         | 現状、他にPortalメニューを使用する箇所がない   |

**実装候補**:

```typescript
// hooks/usePortalMenu.ts
interface UsePortalMenuOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

interface UsePortalMenuReturn {
  isOpen: boolean;
  position: MenuPosition | null;
  triggerRef: RefObject<HTMLElement>;
  menuRef: RefObject<HTMLElement>;
  open: () => void;
  close: (returnFocus?: boolean) => void;
  toggle: () => void;
}

function usePortalMenu(options?: UsePortalMenuOptions): UsePortalMenuReturn;
```

### TASK-02: 位置計算ロジックの共通化

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| 概要         | getBoundingClientRectを使った位置計算を共通化 |
| 対象ファイル | utils/portalPosition.ts（新規）               |
| 期待効果     | 位置計算ロジックの重複排除                    |
| 優先度       | 低                                            |
| 理由         | 現状、位置計算は1箇所のみ                     |

**実装候補**:

```typescript
// utils/portalPosition.ts
interface PortalPosition {
  top: number;
  left: number;
}

interface CalculatePositionOptions {
  offset?: number;
  placement?: "bottom" | "top" | "left" | "right";
}

function calculatePortalPosition(
  triggerElement: HTMLElement,
  options?: CalculatePositionOptions,
): PortalPosition;
```

---

## 4. 実施判断

### 4.1 判断基準

| 基準                         | TASK-01 | TASK-02 |
| ---------------------------- | ------- | ------- |
| 現在の実装に問題があるか     | いいえ  | いいえ  |
| 複数箇所で再利用されているか | いいえ  | いいえ  |
| 技術的負債となっているか     | いいえ  | いいえ  |

### 4.2 結論

両タスクとも**将来タスクとして記録**し、以下の条件で実施を検討:

- 他のコンポーネントでPortalメニューを実装する際
- リファクタリングスプリントの際
- チームで共通コンポーネントライブラリを整備する際

---

## 5. 未タスク登録状況

| タスクID | 登録先           | 状態      |
| -------- | ---------------- | --------- |
| TASK-01  | 本レポートに記録 | 📋 記録済 |
| TASK-02  | 本レポートに記録 | 📋 記録済 |

---

## 6. 完了条件チェックリスト

- [x] Phase 3レビュー結果を確認
- [x] Phase 10レビュー結果を確認
- [x] Phase 11手動テスト結果を確認
- [x] 各Phase成果物の「将来対応」を確認
- [x] コードベースのTODO/FIXMEを検索
- [x] 未タスク候補を文書化
- [x] 実施判断と優先度を設定
