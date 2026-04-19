# 受け入れ基準

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 受け入れ基準一覧

### AC-1: update モード phase のマッピング

**条件**: `mapPhaseToStage("loading-skill")` を呼び出す  
**期待結果**: `"planning"` が返る  
**検証方法**: 単体テスト TC-01, TC-02

```typescript
expect(mapPhaseToStage("loading-skill")).toBe("planning");
expect(mapPhaseToStage("analyzing")).toBe("planning");
```

### AC-2: orchestrate モード phase のマッピング

**条件**: `mapPhaseToStage("engine-selection")` を呼び出す  
**期待結果**: `"planning"` が返る  
**検証方法**: 単体テスト TC-03

```typescript
expect(mapPhaseToStage("engine-selection")).toBe("planning");
```

### AC-3: improve-prompt モード phase のマッピング

**条件**: `mapPhaseToStage("improving")` を呼び出す  
**期待結果**: `"generating-skill"` が返る  
**検証方法**: 単体テスト TC-04

```typescript
expect(mapPhaseToStage("improving")).toBe("generating-skill");
```

### AC-4: create モード既存 phase のリグレッションなし

**条件**: `mapPhaseToStage` に create モードの既存 phase 名を渡す  
**期待結果**: 既存マッピング結果が変わらない  
**検証方法**: 単体テスト TC-05, TC-06

```typescript
expect(mapPhaseToStage("planning")).toBe("planning");
expect(mapPhaseToStage("generating-skill")).toBe("generating-skill");
expect(mapPhaseToStage("generating-agents")).toBe("generating-agents");
expect(mapPhaseToStage("validating")).toBe("validating");
expect(mapPhaseToStage("done")).toBe("done");
```

### AC-5: 未知 phase のフォールバック動作

**条件**: `mapPhaseToStage` に未登録の phase 名を渡す  
**期待結果**: `"planning"` が返る  
**検証方法**: 単体テスト TC-07

```typescript
expect(mapPhaseToStage("unknown-phase")).toBe("planning");
expect(mapPhaseToStage("")).toBe("planning");
```

### AC-6: TypeScript 型チェック PASS

**条件**: `pnpm --filter @repo/desktop typecheck` を実行する  
**期待結果**: エラーなしで完了する  
**検証方法**: CI / ローカル typecheck 実行

---

## 補足: AC と実装範囲の対応

| AC   | 対象実装ファイル                                          | 変更内容                          |
| ---- | --------------------------------------------------------- | --------------------------------- |
| AC-1 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | `loading-skill`, `analyzing` 追加 |
| AC-2 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | `engine-selection` 追加           |
| AC-3 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | `improving` 追加                  |
| AC-4 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | 既存エントリ変更なし              |
| AC-5 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | フォールバック維持                |
| AC-6 | プロジェクト全体                                          | 型エラーなし                      |

---

## 判定基準

- AC-1 〜 AC-6 が全て PASS した場合: **受け入れ完了**
- 1つでも FAIL した場合: 実装修正後に再検証

## 合否

| 基準 | 判定 | 備考                               |
| ---- | ---- | ---------------------------------- |
| AC-1 | PASS | PHASE_TO_STAGEに4エントリ追加済み  |
| AC-2 | PASS | PHASE_TO_STAGEに4エントリ追加済み  |
| AC-3 | PASS | PHASE_TO_STAGEに4エントリ追加済み  |
| AC-4 | PASS | 既存エントリ変更なし               |
| AC-5 | PASS | `?? "planning"` フォールバック維持 |
| AC-6 | PASS | 型変更なし・型安全                 |
