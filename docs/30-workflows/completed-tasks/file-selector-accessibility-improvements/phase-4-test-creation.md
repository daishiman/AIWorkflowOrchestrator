# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 4                                                    |
| Phase名    | テスト作成（TDD: Red）                               |
| 前提Phase  | Phase 3                                              |
| 後続Phase  | Phase 5                                              |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。受け入れ基準に基づいたテストを作成し、全てのテストが失敗状態であることを確認する。

## 背景

TDD（テスト駆動開発）のRedフェーズとして、以下のテストを作成する:

- フォーカストラップのユニットテスト
- aria属性のユニットテスト
- キーボードナビゲーションのテスト
- スクリーンリーダー通知のテスト

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: useFocusTrapテスト作成

**目的**: フォーカストラップカスタムフックのユニットテストを作成する

**実行手順**:

1. テストファイルを作成:
   - `apps/desktop/src/renderer/hooks/__tests__/useFocusTrap.test.ts`

2. テストケースを実装:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useFocusTrap } from "../useFocusTrap";

describe("useFocusTrap", () => {
  describe("アクティベーション", () => {
    it("アクティブ化時にコンテナ内の最初のフォーカス可能要素にフォーカスが移動する", () => {
      // Red: テストが失敗することを確認
    });

    it("initialFocusSelectorで指定した要素に最初のフォーカスが移動する", () => {
      // Red: テストが失敗することを確認
    });

    it("前回のアクティブ要素が保存される", () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("フォーカス循環", () => {
    it("Tabキーで最後の要素から最初の要素にフォーカスが循環する", () => {
      // Red: テストが失敗することを確認
    });

    it("Shift+Tabキーで最初の要素から最後の要素にフォーカスが循環する", () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("非アクティブ化", () => {
    it("非アクティブ化時に前回のアクティブ要素にフォーカスが戻る", () => {
      // Red: テストが失敗することを確認
    });

    it("escapeDeactivates=trueの場合、Escapeキーで非アクティブ化される", () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("エッジケース", () => {
    it("フォーカス可能要素がない場合でもエラーが発生しない", () => {
      // Red: テストが失敗することを確認
    });

    it("動的に追加された要素もフォーカス対象に含まれる", () => {
      // Red: テストが失敗することを確認
    });
  });
});
```

**期待される成果物**:

- useFocusTrapテストファイル

---

### タスク2: FileSelectorModalアクセシビリティテスト作成

**目的**: FileSelectorModalのaria属性とフォーカス管理のテストを作成する

**実行手順**:

1. テストファイルを作成または更新:
   - `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorModal.accessibility.test.tsx`

2. テストケースを実装:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelectorModal } from "../FileSelectorModal";

describe("FileSelectorModal アクセシビリティ", () => {
  describe("aria属性", () => {
    it('role="dialog"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it('aria-modal="true"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it("aria-labelledbyでタイトルを参照している", () => {
      // Red: テストが失敗することを確認
    });

    it("aria-describedbyで説明を参照している", () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("フォーカス管理", () => {
    it("モーダル表示時にフォーカスがモーダル内に移動する", async () => {
      // AC-1: モーダル表示時にフォーカスがモーダル内に自動移動する
      // Red: テストが失敗することを確認
    });

    it("Tabキーでフォーカスがモーダル内で循環する", async () => {
      // AC-2: Tabキー押下でフォーカスがモーダル内で循環する
      // Red: テストが失敗することを確認
    });

    it("Shift+Tabキーで逆順にフォーカスが移動する", async () => {
      // AC-3: Shift+Tabキーで逆順にフォーカスが移動する
      // Red: テストが失敗することを確認
    });

    it("モーダル閉じた後、トリガーボタンにフォーカスが戻る", async () => {
      // AC-4: モーダル閉じた後、トリガーボタンにフォーカスが戻る
      // Red: テストが失敗することを確認
    });

    it("Escapeキーでモーダルが閉じる", async () => {
      // AC-5: Escapeキーでモーダルが閉じる
      // Red: テストが失敗することを確認
    });
  });
});
```

**期待される成果物**:

- FileSelectorModalアクセシビリティテストファイル

---

### タスク3: FileSelectorTriggerアクセシビリティテスト作成

**目的**: FileSelectorTriggerのaria属性テストを作成する

**実行手順**:

1. テストファイルを作成または更新:
   - `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorTrigger.accessibility.test.tsx`

2. テストケースを実装:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelectorTrigger } from "../FileSelectorTrigger";

describe("FileSelectorTrigger アクセシビリティ", () => {
  describe("aria属性", () => {
    it('モーダル閉じた状態でaria-expanded="false"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it('モーダル開いた状態でaria-expanded="true"が設定されている', () => {
      // AC-6: トリガーボタンのaria-expandedがモーダル開閉状態と同期する
      // Red: テストが失敗することを確認
    });

    it('aria-haspopup="dialog"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it("ファイル未選択時に適切なaria-labelが設定されている", () => {
      // Red: テストが失敗することを確認
    });

    it("ファイル選択時に選択ファイル名を含むaria-labelが設定されている", () => {
      // Red: テストが失敗することを確認
    });

    it("aria-controlsでモーダルIDを参照している", () => {
      // Red: テストが失敗することを確認
    });
  });
});
```

**期待される成果物**:

- FileSelectorTriggerアクセシビリティテストファイル

---

### タスク4: FileSelectorFileListアクセシビリティテスト作成

**目的**: FileSelectorFileListのaria属性とキーボードナビゲーションテストを作成する

**実行手順**:

1. テストファイルを作成または更新:
   - `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorFileList.accessibility.test.tsx`

2. テストケースを実装:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelectorFileList } from "../FileSelectorFileList";

describe("FileSelectorFileList アクセシビリティ", () => {
  describe("aria属性", () => {
    it('role="listbox"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it("aria-labelが設定されている", () => {
      // Red: テストが失敗することを確認
    });

    it('各項目にrole="option"が設定されている', () => {
      // Red: テストが失敗することを確認
    });

    it('選択された項目にaria-selected="true"が設定されている', () => {
      // AC-7: リスト項目のaria-selectedが選択状態と同期する
      // Red: テストが失敗することを確認
    });

    it('未選択の項目にaria-selected="false"が設定されている', () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("キーボードナビゲーション", () => {
    it("↓キーで次の項目にフォーカスが移動する", async () => {
      // Red: テストが失敗することを確認
    });

    it("↑キーで前の項目にフォーカスが移動する", async () => {
      // Red: テストが失敗することを確認
    });

    it("Homeキーで先頭の項目にフォーカスが移動する", async () => {
      // Red: テストが失敗することを確認
    });

    it("Endキーで末尾の項目にフォーカスが移動する", async () => {
      // Red: テストが失敗することを確認
    });

    it("Enterキーで項目が選択される", async () => {
      // Red: テストが失敗することを確認
    });

    it("Spaceキーで項目が選択される", async () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("aria-live通知", () => {
    it("ファイル選択時にaria-live領域に通知が表示される", async () => {
      // AC-9: ファイル選択時にスクリーンリーダーで読み上げられる
      // Red: テストが失敗することを確認
    });

    it("ファイル選択解除時にaria-live領域に通知が表示される", async () => {
      // Red: テストが失敗することを確認
    });
  });
});
```

**期待される成果物**:

- FileSelectorFileListアクセシビリティテストファイル

---

### タスク5: 統合テストシナリオ作成

**目的**: コンポーネント間のアクセシビリティ統合テストを作成する

**実行手順**:

1. テストファイルを作成:
   - `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelector.integration.test.tsx`

2. 統合テストシナリオを実装:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelector } from "../index";

describe("FileSelector 統合アクセシビリティテスト", () => {
  describe("完全な操作フロー", () => {
    it("トリガークリック → モーダル表示 → ファイル選択 → モーダル閉じる の完全なフローが動作する", async () => {
      // Red: テストが失敗することを確認
    });

    it("キーボードのみで完全な操作ができる", async () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("フォーカスフロー", () => {
    it("モーダル開閉時のフォーカス遷移が正しい", async () => {
      // Red: テストが失敗することを確認
    });
  });

  describe("スクリーンリーダー対応", () => {
    it("スクリーンリーダーで「ダイアログ」として認識される", () => {
      // AC-8: スクリーンリーダーで「ダイアログ」として認識される
      // Red: テストが失敗することを確認
    });
  });
});
```

**期待される成果物**:

- FileSelector統合テストファイル

---

### タスク6: Red状態確認

**目的**: 全てのテストが失敗状態（Red）であることを確認する

**実行手順**:

1. テストを実行:

```bash
pnpm --filter @repo/desktop test:run -- --grep "アクセシビリティ"
```

2. 全てのテストが失敗することを確認

3. 失敗理由を記録:
   - useFocusTrap: フックが未実装
   - FileSelectorModal: aria属性が未設定、フォーカストラップが未実装
   - FileSelectorTrigger: aria-expanded等が未設定
   - FileSelectorFileList: role属性が未設定、aria-live通知が未実装

**期待される成果物**:

- Red状態確認レポート（outputs/phase-4/red-state-verification.md）

---

## 参照資料

| 参照資料             | パス                                                          | 内容                             |
| -------------------- | ------------------------------------------------------------- | -------------------------------- |
| Phase 1受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`                      | テストケースのベース             |
| Phase 2設計書        | `outputs/phase-2/`                                            | 実装仕様の参考                   |
| Testing Library docs | https://testing-library.com/docs/react-testing-library/intro/ | テスト実装ガイド                 |
| jest-axe             | https://github.com/nickcolley/jest-axe                        | アクセシビリティテストライブラリ |

---

## 成果物

| 成果物                     | パス                                                                                                                | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| useFocusTrapテスト         | `apps/desktop/src/renderer/hooks/__tests__/useFocusTrap.test.ts`                                                    | フックのユニットテスト |
| FileSelectorModalテスト    | `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorModal.accessibility.test.tsx`    | モーダルのa11yテスト   |
| FileSelectorTriggerテスト  | `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorTrigger.accessibility.test.tsx`  | トリガーのa11yテスト   |
| FileSelectorFileListテスト | `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelectorFileList.accessibility.test.tsx` | リストのa11yテスト     |
| 統合テスト                 | `apps/desktop/src/renderer/components/organisms/FileSelector/__tests__/FileSelector.integration.test.tsx`           | 統合a11yテスト         |
| Red状態確認レポート        | `outputs/phase-4/red-state-verification.md`                                                                         | テスト失敗状態の確認   |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 4での統合テスト連携アクション

- [ ] 統合テストシナリオを作成（API/データフロー/エラー/認証/状態同期）
- [ ] コンポーネント間のフォーカス遷移シナリオを作成
- [ ] aria属性の動的更新シナリオを作成

---

## 完了条件

- [ ] useFocusTrapテストが作成されている
- [ ] FileSelectorModalアクセシビリティテストが作成されている
- [ ] FileSelectorTriggerアクセシビリティテストが作成されている
- [ ] FileSelectorFileListアクセシビリティテストが作成されている
- [ ] 統合テストが作成されている
- [ ] 全てのテストが失敗状態（Red）である
- [ ] Red状態確認レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- --grep "アクセシビリティ"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-5-implementation.md`
