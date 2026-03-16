# TC-F-007〜009: INS-01〜03 発火条件境界値テスト仕様

## メタ情報

| 項目               | 値                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-F-007a〜e, TC-F-008a〜c, TC-F-009a〜c（合計11件）                                                                               |
| カテゴリ           | フローテスト（TC-F）                                                                                                               |
| 対象コンポーネント | INS-01: `PermissionSummaryBanner`, INS-02: `PermissionPendingIndicator`, INS-03: `PermissionResultSummary`                         |
| 定義フェーズ       | Phase 6                                                                                                                            |
| 関連成果物         | Phase 5: `ins-01-permission-summary-banner.tsx`, `ins-02-permission-pending-indicator.tsx`, `ins-03-permission-result-summary.tsx` |

---

## INS-01〜03 発火条件サマリー

| INS ID | コンポーネント名             | 発火条件                                                         | 表示場面                   |
| ------ | ---------------------------- | ---------------------------------------------------------------- | -------------------------- |
| INS-01 | `PermissionSummaryBanner`    | スキルツール構成の最大 `dialogWidth >= 480`                      | CTA 画面（スキル起動確認） |
| INS-02 | `PermissionPendingIndicator` | `pendingCount > 0`                                               | エージェント実行中         |
| INS-03 | `PermissionResultSummary`    | `sessionPermissionHistory.length > 0` かつ `action !== "denied"` | 実行結果画面               |

---

## dialogWidth 参照値（INS-01 用）

| リスクレベル | dialogWidth |
| ------------ | ----------- |
| `critical`   | 640         |
| `high`       | 480         |
| `medium`     | 400         |
| `low`        | 400         |

INS-01 の発火判定: `Math.max(...tools.map(t => RISK_DIALOG_WIDTH[t.riskLevel])) >= 480`

---

## TC-F-007: INS-01 発火条件の境界テスト（CTA 画面の権限サマリーバナー）

### 発火条件詳細

スキルに含まれる全ツールの `dialogWidth` の最大値が `480` 以上のとき、
`PermissionSummaryBanner` を表示する。

境界値: **480**（等号を含む: `>= 480` で表示）

### テストケース一覧

| テストID  | スキルのツール構成          | 最大 dialogWidth | 期待表示     | 境界判定                     |
| --------- | --------------------------- | ---------------- | ------------ | ---------------------------- |
| TC-F-007a | 全ツールが `low`（各 400）  | 400              | バナー非表示 | 400 < 480                    |
| TC-F-007b | `medium` のみ（400）        | 400              | バナー非表示 | 400 < 480                    |
| TC-F-007c | `high` を1件含む（480）     | 480              | バナー表示   | 480 >= 480（境界等号）       |
| TC-F-007d | `critical` を1件含む（640） | 640              | バナー表示   | 640 >= 480                   |
| TC-F-007e | `high` × 1件 + `low` × 3件  | 480              | バナー表示   | high が1件でも含まれれば表示 |

---

### TC-F-007a: 全ツールが low（dialogWidth=400）→ バナー非表示

#### Given

スキルのツール構成:

```typescript
const skill = {
  id: "skill-007a",
  tools: [
    { name: "read_file", riskLevel: "low" },
    { name: "list_directory", riskLevel: "low" },
  ],
};
// 全ツールの dialogWidth = 400（low）
// max(400, 400) = 400
```

#### When

```typescript
render(<PermissionSummaryBanner skill={skill} />);
```

#### Then

```typescript
// バナー要素が DOM に存在しない
expect(
  screen.queryByTestId("permission-summary-banner"),
).not.toBeInTheDocument();
// または aria-label で確認
expect(
  screen.queryByRole("banner", { name: /permission summary/i }),
).not.toBeInTheDocument();
```

---

### TC-F-007b: medium のみ（dialogWidth=400）→ バナー非表示

#### Given

スキルのツール構成:

```typescript
const skill = {
  id: "skill-007b",
  tools: [{ name: "write_file", riskLevel: "medium" }],
};
// medium の dialogWidth = 400
// max(400) = 400
```

#### When

```typescript
render(<PermissionSummaryBanner skill={skill} />);
```

#### Then

```typescript
// medium は 400 < 480 のため非表示
expect(
  screen.queryByTestId("permission-summary-banner"),
).not.toBeInTheDocument();
```

---

### TC-F-007c: high を1件含む（dialogWidth=480）→ バナー表示（境界等号）

#### Given

スキルのツール構成:

```typescript
const skill = {
  id: "skill-007c",
  tools: [{ name: "execute_command", riskLevel: "high" }],
};
// high の dialogWidth = 480
// max(480) = 480 → 境界値ちょうど
```

#### When

```typescript
render(<PermissionSummaryBanner skill={skill} />);
```

#### Then

```typescript
// 480 >= 480 で表示（等号を含む境界）
expect(screen.getByTestId("permission-summary-banner")).toBeInTheDocument();
// バナーにリスクレベル情報が含まれる
expect(screen.getByTestId("permission-summary-banner")).toHaveTextContent(
  /high/i,
);
```

---

### TC-F-007d: critical を1件含む（dialogWidth=640）→ バナー表示

#### Given

スキルのツール構成:

```typescript
const skill = {
  id: "skill-007d",
  tools: [{ name: "bash", riskLevel: "critical" }],
};
// critical の dialogWidth = 640
// max(640) = 640
```

#### When

```typescript
render(<PermissionSummaryBanner skill={skill} />);
```

#### Then

```typescript
// 640 >= 480 で表示
expect(screen.getByTestId("permission-summary-banner")).toBeInTheDocument();
// critical リスクの警告表示を確認
expect(screen.getByTestId("permission-summary-banner")).toHaveTextContent(
  /critical/i,
);
```

---

### TC-F-007e: high × 1件 + low × 3件 → バナー表示

#### Given

スキルのツール構成:

```typescript
const skill = {
  id: "skill-007e",
  tools: [
    { name: "execute_command", riskLevel: "high" },
    { name: "read_file", riskLevel: "low" },
    { name: "list_directory", riskLevel: "low" },
    { name: "get_env", riskLevel: "low" },
  ],
};
// max(480, 400, 400, 400) = 480
```

#### When

```typescript
render(<PermissionSummaryBanner skill={skill} />);
```

#### Then

```typescript
// high が1件含まれるため max=480 >= 480 で表示
expect(screen.getByTestId("permission-summary-banner")).toBeInTheDocument();
// low のみでは発火しないことを含意する（low × 4 では非表示となる対比）
```

---

## TC-F-008: INS-02 発火条件の境界テスト（実行中の権限確認インジケーター）

### 発火条件詳細

エージェント実行中に権限確認待ちのリクエスト数（`pendingCount`）が `0` より大きいとき、
`PermissionPendingIndicator` を表示する。

境界値: **0**（`> 0` で表示、`= 0` で非表示）

### テストケース一覧

| テストID  | `pendingCount` 値 | 期待表示                           | 境界判定                |
| --------- | ----------------- | ---------------------------------- | ----------------------- |
| TC-F-008a | `0`               | インジケーター非表示               | 0 = 0（非表示）         |
| TC-F-008b | `1`               | インジケーター表示                 | 1 > 0（0から1への境界） |
| TC-F-008c | `0` に戻った      | インジケーターが非表示に切り替わる | 動的な 1→0 遷移         |

---

### TC-F-008a: pendingCount = 0 → インジケーター非表示

#### Given

権限確認待ちリクエストが存在しない初期状態:

```typescript
const pendingCount = 0;
```

#### When

```typescript
render(<PermissionPendingIndicator pendingCount={pendingCount} />);
```

#### Then

```typescript
// pendingCount = 0 のためインジケーターは非表示
expect(
  screen.queryByTestId("permission-pending-indicator"),
).not.toBeInTheDocument();
```

---

### TC-F-008b: pendingCount = 1 → インジケーター表示（0から1への境界）

#### Given

権限確認待ちリクエストが1件発生:

```typescript
const pendingCount = 1;
```

#### When

```typescript
render(<PermissionPendingIndicator pendingCount={pendingCount} />);
```

#### Then

```typescript
// pendingCount = 1 > 0 のためインジケーター表示
expect(screen.getByTestId("permission-pending-indicator")).toBeInTheDocument();
// 件数が表示されている
expect(screen.getByTestId("permission-pending-indicator")).toHaveTextContent(
  "1",
);
```

---

### TC-F-008c: pendingCount が 0 に戻った → インジケーター非表示に切り替わる

#### Given

権限確認が完了し pendingCount が 1 から 0 に変化:

```typescript
// 初期状態: pendingCount = 1（表示中）
const { rerender } = render(
  <PermissionPendingIndicator pendingCount={1} />
);
// 表示されていることを確認
expect(
  screen.getByTestId("permission-pending-indicator")
).toBeInTheDocument();
```

#### When

```typescript
// pendingCount が 0 に戻る（権限確認完了）
rerender(<PermissionPendingIndicator pendingCount={0} />);
```

#### Then

```typescript
// 0 に戻ったためインジケーターが非表示に切り替わる
expect(
  screen.queryByTestId("permission-pending-indicator"),
).not.toBeInTheDocument();
```

---

## TC-F-009: INS-03 発火条件の境界テスト（実行結果の権限サマリー）

### 発火条件詳細

実行完了後に `sessionPermissionHistory.length > 0` かつ
履歴に `action !== "denied"` のエントリが存在するとき、
`PermissionResultSummary` を表示する。

設計確認事項: `denied` アクションは `sessionPermissionHistory` に含めない設計
（denied は別の `deniedHistory` に記録する）

境界値:

1. `sessionPermissionHistory.length = 0` → 非表示
2. `sessionPermissionHistory.length = 1` → 表示（0から1への境界）
3. `denied` のみ → 非表示（denied は sessionPermissionHistory に含まれない）

### テストケース一覧

| テストID  | セッション中の権限承認件数 | 期待表示       | 境界判定                                                |
| --------- | -------------------------- | -------------- | ------------------------------------------------------- |
| TC-F-009a | `0` 件                     | サマリー非表示 | length = 0（非表示）                                    |
| TC-F-009b | `1` 件                     | サマリー表示   | length = 1 > 0（0から1への境界）                        |
| TC-F-009c | `denied` のみ（承認なし）  | サマリー非表示 | denied は sessionPermissionHistory に含まれない設計確認 |

---

### TC-F-009a: sessionPermissionHistory.length = 0 → サマリー非表示

#### Given

実行セッション中に権限承認が一度も発生しなかった:

```typescript
const sessionPermissionHistory: PermissionHistoryEntry[] = [];
```

#### When

```typescript
render(
  <PermissionResultSummary
    sessionPermissionHistory={sessionPermissionHistory}
  />
);
```

#### Then

```typescript
// history が空のためサマリーは非表示
expect(
  screen.queryByTestId("permission-result-summary"),
).not.toBeInTheDocument();
```

---

### TC-F-009b: sessionPermissionHistory.length = 1 → サマリー表示（0から1への境界）

#### Given

実行セッション中に権限承認が1件発生:

```typescript
const sessionPermissionHistory: PermissionHistoryEntry[] = [
  {
    id: "entry-001",
    toolName: "write_file",
    riskLevel: "high",
    action: "approved_once",
    approvedAt: new Date("2026-03-16T07:17:31Z"),
    sessionId: "session-001",
  },
];
```

#### When

```typescript
render(
  <PermissionResultSummary
    sessionPermissionHistory={sessionPermissionHistory}
  />
);
```

#### Then

```typescript
// length = 1 > 0 のためサマリー表示
expect(screen.getByTestId("permission-result-summary")).toBeInTheDocument();
// 承認件数が表示されている
expect(screen.getByTestId("permission-result-summary")).toHaveTextContent("1");
// 承認されたツール名が表示されている
expect(screen.getByTestId("permission-result-summary")).toHaveTextContent(
  "write_file",
);
```

---

### TC-F-009c: denied のみ（承認なし）→ サマリー非表示

#### Given

実行セッション中に権限確認がすべて denied で終了した。
設計上、`denied` アクションは `sessionPermissionHistory` に追加しない。

```typescript
// denied は sessionPermissionHistory に含まれない設計を確認
const sessionPermissionHistory: PermissionHistoryEntry[] = [];
// denied 専用の記録は別フィールドで管理（設計確認）
const deniedHistory: DeniedPermissionEntry[] = [
  {
    toolName: "bash",
    riskLevel: "critical",
    action: "denied",
    deniedAt: new Date("2026-03-16T07:17:31Z"),
  },
];
```

#### When

```typescript
render(
  <PermissionResultSummary
    sessionPermissionHistory={sessionPermissionHistory}
    deniedHistory={deniedHistory}
  />
);
```

#### Then

```typescript
// sessionPermissionHistory が空（denied は含まれない設計）のためサマリー非表示
expect(
  screen.queryByTestId("permission-result-summary"),
).not.toBeInTheDocument();
// denied のみの実行でサマリーが出ないことを確認
// （これにより denied が誤って sessionPermissionHistory に混入していないことも間接検証）
```

**設計検証ポイント**:

- `PermissionHistoryEntry` の `action` フィールドが `"approved_once" | "approved_permanent" | "skipped"` のみ受け付ける（`"denied"` は型として除外）ことを型テスト（TC-T-006）と合わせて確認する。
