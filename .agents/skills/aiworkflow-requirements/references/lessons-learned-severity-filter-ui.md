# 教訓: Severity フィルタ UI 実装（UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001）

## タスク情報
- タスクID: UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001
- 実装日: 2026-04-03
- 影響コンポーネント: SkillLifecyclePanel.tsx

## 技術的教訓

### 1. derived state パターンの有効性
checksByLayer → filteredChecksByLayer という派生 state を useMemo で構築することで、
フィルタ条件が増えても既存の checksByLayer ロジックを変更せずに済む。
純粋関数 shouldShowCheck() を useMemo の中で使うことでテスタビリティが高い。

### 2. aria-pressed によるセグメントコントロール
toggle button group に role="group" + aria-label + 各ボタンの aria-pressed を組み合わせることで、
専用コンポーネントを追加せずにアクセシブルなセグメントコントロールを実現できる。

### 3. テスト環境の flaky test について
Vitest でテストを全件一括実行すると、テスト間の state リーク により一部テストが失敗することがある。
個別実行では PASS する場合は flaky test と判断し、afterEach で screen をクリーンアップしているか確認する。

### 4. activeWorkflowId 変更時のリセット
reverify 後に severityFilter をリセットしないことで「ユーザーが選んだフィルタを維持する」という要件を満たせる。
activeWorkflowId（ワークフロー切替）の場合のみリセットする（別スキル・別実行への切替）。

## 苦戦箇所

### Formatter によるコード変更
Edit tool でコードを変更すると PostToolUse hook が Prettier を実行してフォーマットを変更する。
次の Edit の old_string が formatter の出力と異なるとミスマッチが起きるため、
Edit 後は Read で再確認してから次の Edit を実行する必要がある。

### テスト全件実行 vs 個別実行の挙動差異
全件実行で失敗、個別実行で成功するケースがあった（TC-13）。
原因: 前のテストが setTimeout や未完了の Promise を残す可能性。
対策: 各テストの afterEach で act() のドレインを確認する。

## コードパターン

### shouldShowCheck 純粋関数
```typescript
function shouldShowCheck(
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  filter: SeverityFilterValue,
): boolean {
  if (filter === "all") return true;
  if (filter === "warning+") return severity === "warning" || severity === "error";
  return severity === "error";
}
```

### filteredChecksByLayer useMemo
```typescript
const filteredChecksByLayer = useMemo(() => {
  const result = createVerifyChecksByLayer();
  for (const layer of VERIFY_LAYER_ORDER) {
    result[layer] = (checksByLayer[layer] ?? []).filter((check) =>
      shouldShowCheck(check.severity, severityFilter),
    );
  }
  return result;
}, [checksByLayer, severityFilter]);
```
