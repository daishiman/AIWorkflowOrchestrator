/**
 * @file useWizardStep.test.ts
 * @description useWizardStep カスタムフック ユニットテスト
 * @phase Phase 8: リファクタリング
 * @task TASK-10A-C
 *
 * P9準拠: beforeEachで状態リセット（renderHook毎に新規インスタンス）
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWizardStep } from "../hooks/useWizardStep";

describe("useWizardStep", () => {
  it("初期状態で currentStep=0", () => {
    const { result } = renderHook(() => useWizardStep(4));
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("goNext でステップが進む", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(false);
  });

  it("goBack でステップが戻る", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it("goBack で0未満にならない", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentStep).toBe(0);
  });

  it("goNext で最大ステップを超えない", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    }); // 4th call should not exceed
    expect(result.current.currentStep).toBe(3);
    expect(result.current.isLastStep).toBe(true);
  });

  it("goToStep で直接ステップに移動できる", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStep).toBe(2);
  });

  it("goToStep で範囲外のステップは無視される", () => {
    const { result } = renderHook(() => useWizardStep(4));
    act(() => {
      result.current.goToStep(10);
    });
    expect(result.current.currentStep).toBe(0);
    act(() => {
      result.current.goToStep(-1);
    });
    expect(result.current.currentStep).toBe(0);
  });
});
