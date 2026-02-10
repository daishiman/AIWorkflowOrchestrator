# Phase 2: 設計サマリー

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| 前提     | Phase 1（要件定義）                  |
| 作成日   | 2026-02-10                           |

---

## 修正ファイル一覧

| ファイル                                                        | 変更種別 |
| --------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 修正     |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 修正     |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 修正     |

---

## 設計パターン

### 1. useRefによる初期化保護パターン

```typescript
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    // 初期化処理
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**適用先**: SettingsView (initializeAuthMode), LLMSelectorPanel (fetchProviders)

### 2. 前回値比較パターン

```typescript
const prevValueRef = useRef<T | null>(null);

useEffect(() => {
  if (value && value !== prevValueRef.current) {
    prevValueRef.current = value;
    // 値が変わった時の処理
  }
}, [value]);
```

**適用先**: LLMSelectorPanel (checkHealth)

### 3. 空依存配列パターン

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**適用先**: SkillSelector (handleRescan)

---

## 実装順序

1. SettingsView/index.tsx の修正
2. LLMSelectorPanel.tsx の修正
3. SkillSelector.tsx の修正
4. 型チェック・Lint実行
5. テスト実行
6. 手動テスト

---

## テスト影響

既存テストへの影響なし。新規テストケースの追加は不要。

---

## 成果物

- 設計書: `docs/30-workflows/auth-mode-store-fix/phase-2-design.md`
