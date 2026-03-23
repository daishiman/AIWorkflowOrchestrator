# DIP 準拠関数シグネチャ設計

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 2 - 設計

## 設計原則

- DIP（依存性逆転原則）に基づき、ハンドラ登録関数はインターフェース（Port）に依存する
- P61 教訓: 具象クラスではなくインターフェースを引数型とする

## 関数シグネチャ

### registerSkillCreatorHandlers

```typescript
export function registerSkillCreatorHandlers(
  skillCreatorService: SkillCreatorServicePort,
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorPort,
): void;
```

### registerCreatorHandlers

```typescript
export function registerCreatorHandlers(
  runtimeSkillCreatorService: RuntimeSkillCreatorPort,
  mainWindow: BrowserWindow,
): void;
```

## DIP 部分違反（MINOR-2）

現状の実装では `registerCreatorHandlers` が `RuntimeSkillCreatorFacade`（具象クラス）を直接受け取っている。`RuntimeSkillCreatorPort` インターフェースの抽出は UT-SC-01-DIP-INTERFACE として未タスク化。

### 現状（部分違反）

```typescript
export function registerCreatorHandlers(
  runtimeService: RuntimeSkillCreatorFacade, // 具象クラス
  mainWindow: BrowserWindow,
): void;
```

### 理想（DIP 完全準拠）

```typescript
export function registerCreatorHandlers(
  runtimeService: RuntimeSkillCreatorPort, // インターフェース
  mainWindow: BrowserWindow,
): void;
```

## バリデーション方針

- 全ハンドラで P42 準拠の3段バリデーション（型チェック / 空文字列 / トリム空文字列）を適用
- エラーレスポンスは `{ success: false, error: { code, message } }` 形式（P60準拠）
