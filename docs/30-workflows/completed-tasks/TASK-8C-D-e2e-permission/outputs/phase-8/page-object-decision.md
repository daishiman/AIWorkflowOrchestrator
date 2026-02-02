# Phase 8: Page Object パターン適用判断結果

## 実行日時

2026-02-02

---

## 1. 適用判断

### 1.1 判断結果

**Page Object パターン: 適用しない（現時点では不要）**

### 1.2 評価基準と結果

| 観点               | 評価基準                      | 現状                   | 判定   |
| ------------------ | ----------------------------- | ---------------------- | ------ |
| テスト数           | 10件以上で検討                | 13件                   | 境界線 |
| セレクター重複     | 3回以上の重複で検討           | ヘルパー関数で対応済み | 不要   |
| 将来の拡張         | E2Eテスト大幅増加予定があれば | なし                   | 不要   |
| メンテナンスコスト | 高いと見積もられる場合        | 低〜中                 | 不要   |
| チーム規模         | 複数人開発の場合              | 小規模                 | 不要   |

---

## 2. 現在の構造分析

### 2.1 セレクター管理

```typescript
const SELECTORS = {
  chatInput: '[data-testid="chat-input"]',
  skillSelector: '[aria-label="スキルを選択"]',
  dialogContainer: '[role="alertdialog"]',
} as const;
```

**評価**: 定数オブジェクトで一元管理されており、変更時の影響範囲が限定的。

### 2.2 ヘルパー関数

| 関数名                    | 責務                 | 再利用性 |
| ------------------------- | -------------------- | -------- |
| `selectSkill`             | スキル選択           | 高       |
| `triggerPermissionDialog` | ダイアログトリガー   | 高       |
| `waitForPermissionDialog` | ダイアログ表示待機   | 高       |
| `approvePermission`       | 許可クリック         | 高       |
| `denyPermission`          | 拒否クリック         | 高       |
| `checkRememberChoice`     | チェックボックス操作 | 高       |

**評価**: ヘルパー関数がPage Objectの責務を十分にカバーしている。

---

## 3. Page Object 適用時の設計（参考）

### 3.1 適用する場合のクラス設計

```typescript
// 適用しない判断のため、参考として記載

class PermissionDialogPage {
  constructor(private page: Page) {}

  // ロケーター
  get dialogTitle() {
    return this.page.getByText(DIALOG_TITLE_TEXT);
  }

  get approveButton() {
    return this.page.getByRole("button", { name: APPROVE_BUTTON_TEXT });
  }

  get denyButton() {
    return this.page.getByRole("button", { name: DENY_BUTTON_TEXT });
  }

  get rememberCheckbox() {
    return this.page.locator('[type="checkbox"]');
  }

  // アクション
  async waitForDialog(timeout = 10000) {
    await this.page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { timeout });
  }

  async approve() {
    await this.approveButton.click();
    await this.page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
      state: "hidden",
    });
  }

  async deny() {
    await this.denyButton.click();
    await this.page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
      state: "hidden",
    });
  }

  async checkRemember() {
    await this.rememberCheckbox.click();
  }
}
```

### 3.2 適用の閾値

| 条件                       | 閾値       | 現状      |
| -------------------------- | ---------- | --------- |
| E2Eテスト数                | ≥20件      | 13件      |
| セレクター重複             | ≥5箇所     | 0箇所     |
| 複数テストファイル         | ≥3ファイル | 1ファイル |
| 権限ダイアログ機能拡張計画 | あり       | なし      |

**結論**: 閾値に達していないため、現時点ではPage Objectパターンを適用しない。

---

## 4. 代替アプローチ（現在の構造）

### 4.1 定数 + ヘルパー関数パターン

```
├── 定数定義 (SELECTORS, テストデータ)
├── ヘルパー関数 (selectSkill, triggerPermissionDialog, etc.)
└── テストケース (test.describe / test)
```

**メリット**:

1. シンプルで理解しやすい
2. 追加のクラス設計不要
3. 関数単位での再利用が可能
4. テストファイル内で完結

**デメリット**:

1. 大規模化時にヘルパー関数が増加
2. テストファイル間での共有が困難（現時点では問題なし）

---

## 5. 将来の適用検討条件

### 5.1 Page Object 適用を検討するタイミング

| 条件                         | 対応                               |
| ---------------------------- | ---------------------------------- |
| E2Eテストが20件以上に増加    | Page Object クラス化を検討         |
| 複数ファイルでセレクター共有 | 共通Page Objectの抽出を検討        |
| 権限ダイアログの機能拡張     | PermissionDialogPage クラス作成    |
| チーム規模拡大               | 標準化のためPage Object 導入を検討 |

---

## 6. 判定

**Page Object パターン: 適用しない**

- 現在のヘルパー関数パターンで十分
- 将来の拡張時に再検討
