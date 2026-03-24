# Phase 6: テスト拡充 - 回帰拡張計画

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase      | 6                                              |
| 作成日     | 2026-03-24                                     |
| 依存Phase  | Phase 4-5                                      |
| 成果物種別 | regression-expansion-plan                      |

## 目的

Phase 4-5 で作成した Route / CTA / Label / Negative テストに対して、境界値と回帰ガードを追加する。以下の 5 つの拡充軸でカバレッジを強化する。

---

## 1. Repeated Open: 連続クリックで二重遷移しない

### 背景

`openExecutionConsole()` は `useAppStore.getState().setCurrentView("executionConsole")` を呼ぶ。ユーザーが CTA を高速で連続クリックした場合、`setCurrentView` が複数回呼ばれることで viewHistory が汚染される、または不要な再レンダーが発生する可能性がある。

### テスト方針

| テストケース                             | 検証内容                                                              | 優先度 |
| ---------------------------------------- | --------------------------------------------------------------------- | ------ |
| 同一 surface で CTA を 2 回連続クリック  | `setCurrentView` の呼び出し回数が 2 回だが、view 状態は 1 遷移分      | 高     |
| 異なる surface から同時に CTA をトリガー | `openExecutionConsole()` の reentrant 耐性                            | 中     |
| 既に `executionConsole` 表示中に CTA     | `currentView` が既に `executionConsole` なら viewHistory を汚染しない | 高     |

### 実装方針

```typescript
// テスト例: 同一 view への二重遷移防御
it("should not duplicate viewHistory when openExecutionConsole is called twice", () => {
  const store = useAppStore.getState();
  store.setCurrentView("dashboard");

  openExecutionConsole();
  openExecutionConsole();

  const history = useAppStore.getState().viewHistory;
  const consecutiveDuplicates = history.filter(
    (v, i) => i > 0 && v === history[i - 1],
  );
  expect(consecutiveDuplicates).toHaveLength(0);
});
```

---

## 2. Unavailable State: CTA が disabled + tooltip 表示

### 背景

CTA Mapping（Phase 2）で「unavailable 状態での disabled 表示は許可パターン」と定義されている。`executionConsole` が利用不可能な場合（後続タスクでの依存サービス未起動など）、CTA は disabled 状態になり、理由を tooltip で表示する必要がある。

### テスト方針

| テストケース                             | 検証内容                                        | 優先度 |
| ---------------------------------------- | ----------------------------------------------- | ------ |
| unavailable 状態で CTA ボタンが disabled | `aria-disabled="true"` かつ click で遷移しない  | 高     |
| disabled 時に tooltip が表示される       | `title` 属性または tooltip component が存在する | 中     |
| unavailable から available に復帰        | 復帰後に CTA が enabled になり遷移が動作する    | 中     |
| 全 4 surface で disabled 挙動が一致      | App Shell / Chat / Workspace / Skill Creator    | 高     |

### 実装方針

```typescript
// テスト例: unavailable 時の disabled 検証
it("should show disabled CTA with tooltip when executionConsole is unavailable", () => {
  // unavailable 条件を mock で設定
  const button = screen.getByRole("button", { name: /実行コンソール/ });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute(
    "title",
    expect.stringContaining("利用できません"),
  );
});
```

### 補足

本タスクでは stub View のため、unavailable 判定ロジックは後続タスク（Task02/03）で実装される。Phase 6 では「unavailable 状態が存在する場合の CTA 挙動」をテストインターフェースとして定義し、実装は後続で接続する。

---

## 3. Compact / Narrow Width: CTA ラベル省略時の機能維持

### 背景

navContract.ts の設計で `mobileLabel: "実行"` が定義されている。mobile / tablet 幅ではラベルが省略されるが、CTA の click handler は同一の `openExecutionConsole()` を呼ぶ必要がある。

### テスト方針

| テストケース                          | 検証内容                                       | 優先度 |
| ------------------------------------- | ---------------------------------------------- | ------ |
| narrow width でラベルが `実行` に省略 | mobileLabel が表示され、full label が非表示    | 中     |
| 省略ラベルでも click で正常に遷移     | `openExecutionConsole()` が呼ばれる            | 高     |
| icon-only 表示で `aria-label` が正確  | アクセシビリティ: ラベル非表示時の代替テキスト | 中     |
| resize 時にラベル切替が正しく動作     | width 変更で full / mobile ラベルが切り替わる  | 低     |

### 実装方針

```typescript
// テスト例: narrow width でも CTA 機能が維持される
it("should call openExecutionConsole even when compact label is shown", () => {
  // viewport width を narrow に設定
  // CTA をクリック
  expect(mockOpenExecutionConsole).toHaveBeenCalledTimes(1);
});
```

---

## 4. Stale Handler Guard: React StrictMode でリスナー二重登録しない（P5 準拠）

### 背景

P5（リスナー二重登録）によると、React StrictMode では `useEffect` が 2 回実行される。CTA の handler 登録やイベントリスナーが二重に登録されると、`openExecutionConsole()` が 1 クリックで 2 回呼ばれる問題が発生する。

### テスト方針

| テストケース                                  | 検証内容                                 | 優先度 |
| --------------------------------------------- | ---------------------------------------- | ------ |
| StrictMode で CTA click が 1 回だけ発火       | handler が二重登録されていない           | 高     |
| unmount / remount で stale handler が残らない | cleanup 関数でリスナーが正しく解除される | 高     |
| createGuidanceActionDispatcher の二重呼び出し | dispatcher map が重複登録されない        | 中     |

### 実装方針

```typescript
// テスト例: StrictMode 二重実行でも handler は 1 回
it("should not register duplicate handlers in StrictMode", () => {
  const spy = vi.fn();
  // StrictMode をシミュレート: effect を 2 回実行
  const { unmount, rerender } = renderHook(() => {
    useEffect(() => {
      // handler 登録
      return () => {
        // cleanup
      };
    }, []);
  });

  // CTA click
  // spy が 1 回だけ呼ばれることを検証
  expect(spy).toHaveBeenCalledTimes(1);
});
```

### 関連 Pitfall

- P5: リスナー二重登録（Renderer / Main 両プロセス）
- P31: Zustand Store Hooks 無限ループ（合成 Hook の依存配列問題）

---

## 5. Label Regression Guard: `terminal` front 露出の自動検出

### 背景

AC-1 / FR-4 / NFR-4 で「`terminal` を front の主導線ラベルにしない」と定義されている。将来のコード変更で `terminal` / `ターミナル` が front の UI テキストに再侵入するリスクがある。

### テスト方針

| テストケース                                      | 検証内容                                                         | 優先度 |
| ------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| `grep -rn "terminal" renderer/` で UI 露出を検出  | JSX テキスト・label 定数に `terminal` が残存しないことを自動検証 | 高     |
| `ターミナルを開く` がコンポーネント内に存在しない | 日本語ラベルの回帰チェック                                       | 高     |
| `terminal を開く` がコンポーネント内に存在しない  | 英語混合ラベルの回帰チェック                                     | 高     |
| 内部識別子（IPC channel, test helper）は許可      | `terminal` が内部識別子として使われるケースは false positive     | 中     |

### 実装方針

```typescript
// テスト例: label regression guard
describe("Label Regression Guard", () => {
  it("should not expose 'terminal' as primary UI label", () => {
    // 対象: CTA ラベル、nav item ラベル、heading テキスト
    const primaryLabels = [
      // 各 surface の CTA ラベルを収集
    ];

    primaryLabels.forEach((label) => {
      expect(label.toLowerCase()).not.toContain("terminal");
      expect(label).not.toContain("ターミナルを開く");
      expect(label).not.toContain("terminal を開く");
    });
  });

  it("should pass AC-1 grep validation", () => {
    // Phase 9 品質検証でも使用可能な grep ベースの検証
    // grep -rn "ターミナルを開く|terminal を開く" apps/desktop/src/renderer
    // 結果が 0 件であることを検証
  });
});
```

### 許容される `terminal` 使用

以下の用途は false positive として除外する:

| 用途             | 例                            | 除外理由                             |
| ---------------- | ----------------------------- | ------------------------------------ |
| IPC channel 名   | `terminal.open`               | 内部プロトコル（front 非露出）       |
| テスト内の識別子 | `mockTerminalService`         | テストコード内のみ                   |
| コメント / JSDoc | `// terminal fallback`        | ユーザー非表示                       |
| ファイル名       | `TerminalHandoffCard/`        | ファイルシステム上の命名（検討対象） |
| `高度な表示` 内  | `Terminal` (raw command 表示) | advanced label 管轄下での使用        |

---

## 拡充テスト数の見積もり

| 拡充軸              | 新規テスト数 | 既存テスト修正数 |
| ------------------- | ------------ | ---------------- |
| Repeated Open       | 3            | 0                |
| Unavailable State   | 4            | 0                |
| Compact / Narrow    | 3            | 0                |
| Stale Handler Guard | 3            | 0                |
| Label Regression    | 3            | 0                |
| **合計**            | **16**       | **0**            |

## Phase 7 への引継ぎ

- 上記 16 テストを Phase 7 の coverage targets に含める
- Repeated Open / Stale Handler は Route coverage に分類
- Unavailable / Compact は Surface coverage に分類
- Label Regression は Negative path coverage に分類
