# Phase 6 成果物: 拡張テストケース

## 実行日時: 2026-04-07

---

## 追加テストケース

### TC-04: 重複登録注入ネガティブテスト

**内容**: 同一チャネルを `ipcMain.handle()` で 2 回呼び出した場合に重複が検出されることを確認する

**実装方法**:

```typescript
mockIpcMainHandle("skill-creator:plan", vi.fn());
mockIpcMainHandle("skill-creator:plan", vi.fn()); // 重複
mockIpcMainHandle("skill-creator:execute-plan", vi.fn());

const channels = getRegisteredChannels();
const unique = new Set(channels);
expect(unique.size).toBeLessThan(channels.length);
```

**期待動作**: `unique.size < channels.length` → 重複が Set の排除で検出される

---

### TC-05: 想定外チャネル追加ネガティブテスト

**内容**: `registerRuntimeSkillCreatorHandlers` 実行後に想定外のチャネルが追加された場合に件数差分で検出できることを確認する

**実装方法**:

```typescript
registerRuntimeSkillCreatorHandlers(mockMainWindow);
mockIpcMainHandle("skill-creator:unexpected-channel", vi.fn());

const channels = getRegisteredChannels();
expect(channels.length).toBeGreaterThan(18);
```

**期待動作**: `channels.length > 18` → 件数チェックで検出できる

---

## テスト実行結果（全 5 TC PASS）

```
✓ TC-01: 登録チャネル名がスナップショットと一致する
✓ TC-02: 重複チャネルが存在しない
✓ TC-03: 登録チャネル総数が 18
✓ TC-04: 重複登録が注入された場合に重複チャネルが検出される
✓ TC-05: 想定外チャネルが追加された場合にスナップショット差分が検出できる
```

---

## 完了判定

- [x] TC-04 が実装され PASS している
- [x] TC-05 が実装され PASS している
- [x] 全テスト（TC-01〜TC-05）合計 5 件が記録されている
- [x] `outputs/phase-6/` 配下に成果物が配置されている
