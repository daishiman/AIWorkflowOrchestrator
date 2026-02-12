/**
 * @file SkillSelector Component
 * @description スキル選択ドロップダウン
 * @feature skill-import-agent-system
 * @see specification.md 4.2 SkillSelector詳細
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  useAvailableSkillsMetadata,
  useImportedSkills,
  useSelectedSkillName,
  useIsScanningSkills,
  useSelectSkillByName,
  useRescanSkills,
} from "../../store";

// ============================================
// Types
// ============================================

export interface SkillSelectorProps {
  className?: string;
}

interface SkillOptionProps {
  name: string | null;
  label?: string;
  description?: string;
  agentCount?: number;
  referenceCount?: number;
  isSelected: boolean;
  isFocused: boolean;
  index: number;
  onSelect: () => void;
}

interface SkillOptionUnimportedProps {
  name: string;
  description?: string;
  isSelected: boolean;
  isFocused: boolean;
  index: number;
  onSelect: () => void;
}

// ============================================
// Helpers
// ============================================

/** Safe array length accessor for optional array-like properties */
function getArrayLength<T extends object>(
  obj: T,
  key: keyof T,
): number | undefined {
  const val = obj[key];
  return Array.isArray(val) ? val.length : undefined;
}

// ============================================
// Sub-components
// ============================================

/**
 * SkillOption - インポート済みスキル用のオプション表示
 */
const SkillOption: React.FC<SkillOptionProps> = ({
  name,
  label,
  description,
  agentCount,
  referenceCount,
  isSelected,
  isFocused,
  index,
  onSelect,
}) => {
  const displayName = label ?? name ?? "なし";

  return (
    <div
      id={`skill-option-${index}`}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`
        px-3 py-2 cursor-pointer text-sm
        hover:bg-gray-50 dark:hover:bg-gray-700
        ${isSelected ? "bg-blue-50 dark:bg-blue-900" : ""}
        ${isFocused && !isSelected ? "bg-gray-100 dark:bg-gray-700" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400 w-4 text-center">
          {isSelected ? "✓" : "○"}
        </span>
        <span className="text-gray-900 dark:text-gray-100">{displayName}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-6 truncate">
          {description}
        </p>
      )}
      {(agentCount !== undefined || referenceCount !== undefined) && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-6">
          {agentCount !== undefined && `サブエージェント: ${agentCount}個`}
          {agentCount !== undefined && referenceCount !== undefined && " | "}
          {referenceCount !== undefined && `参照資料: ${referenceCount}個`}
        </p>
      )}
    </div>
  );
};

/**
 * SkillOptionUnimported - 未インポートスキル用のオプション表示
 */
const SkillOptionUnimported: React.FC<SkillOptionUnimportedProps> = ({
  name,
  description,
  isSelected,
  isFocused,
  index,
  onSelect,
}) => {
  return (
    <div
      id={`skill-option-${index}`}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`
        px-3 py-2 cursor-pointer text-sm
        hover:bg-gray-50 dark:hover:bg-gray-700
        ${isFocused ? "bg-gray-100 dark:bg-gray-700" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400 w-4 text-center">○</span>
        <span className="text-gray-500 dark:text-gray-400">{name}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-6 truncate">
          {description}
        </p>
      )}
    </div>
  );
};

// ============================================
// Main Component
// ============================================

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  className = "",
}) => {
  const availableSkillsMetadata = useAvailableSkillsMetadata();
  const importedSkills = useImportedSkills();
  const selectedSkillName = useSelectedSkillName();
  const isScanning = useIsScanningSkills();
  const selectSkillByName = useSelectSkillByName();
  const rescanSkills = useRescanSkills();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute unimported skills (available but not imported)
  const importedNames = useMemo(
    () => new Set(importedSkills.map((s) => s.name)),
    [importedSkills],
  );

  const unimportedSkills = useMemo(
    () =>
      availableSkillsMetadata.filter(
        (s: { name: string }) => !importedNames.has(s.name),
      ),
    [availableSkillsMetadata, importedNames],
  );

  // Build selectable options list for keyboard navigation
  const allOptions = useMemo(
    () => [
      { type: "none" as const, name: null as string | null },
      ...importedSkills.map((s) => ({
        type: "imported" as const,
        name: s.name as string | null,
      })),
      ...unimportedSkills.map((s) => ({
        type: "available" as const,
        name: s.name as string | null,
      })),
    ],
    [importedSkills, unimportedSkills],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        // Opening: set focus to selected item or first
        const selectedIdx = allOptions.findIndex(
          (o) => o.name === selectedSkillName,
        );
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      }
      return !prev;
    });
  }, [allOptions, selectedSkillName]);

  const handleSelect = useCallback(
    (name: string | null) => {
      selectSkillByName(name);
      setIsOpen(false);
    },
    [selectSkillByName],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (isOpen && focusedIndex >= 0 && allOptions[focusedIndex]) {
            handleSelect(allOptions[focusedIndex].name);
          } else if (!isOpen) {
            handleToggle();
          }
          break;
        case "Escape":
          if (isOpen) {
            setIsOpen(false);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) =>
              prev < allOptions.length - 1 ? prev + 1 : prev,
            );
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case "Home":
          if (isOpen) {
            event.preventDefault();
            setFocusedIndex(0);
          }
          break;
        case "End":
          if (isOpen) {
            event.preventDefault();
            setFocusedIndex(allOptions.length - 1);
          }
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, focusedIndex, allOptions, handleSelect, handleToggle],
  );

  const handleRescan = useCallback(() => {
    rescanSkills();
  }, [rescanSkills]);

  // Compute base indices for each section (avoids mutable counter in render)
  const noneOptionIndex = 0;
  const importedBaseIndex = 1;
  const unimportedBaseIndex = 1 + importedSkills.length;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Screen reader label */}
      <label id="skill-selector-label" className="sr-only">
        スキルを選択
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-labelledby="skill-selector-label"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="skill-listbox"
        aria-activedescendant={
          isOpen && focusedIndex >= 0
            ? `skill-option-${focusedIndex}`
            : undefined
        }
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between px-3 py-2
          rounded-md border border-gray-300 bg-white
          text-left text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
        `}
      >
        <span className="flex items-center gap-2">
          <span>📦</span>
          <span>{selectedSkillName ?? "なし"}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="skill-listbox"
          role="listbox"
          aria-labelledby="skill-selector-label"
          className={`
            absolute z-50 mt-1 w-full
            bg-white border border-gray-200 rounded-md shadow-lg
            max-h-60 overflow-auto
            dark:bg-gray-800 dark:border-gray-600
          `}
        >
          {/* "None" option */}
          <SkillOption
            name={null}
            label="なし（スキルを使用しない）"
            isSelected={selectedSkillName === null}
            isFocused={focusedIndex === noneOptionIndex}
            index={noneOptionIndex}
            onSelect={() => handleSelect(null)}
          />

          {/* Imported Skills Section */}
          {importedSkills.length > 0 && (
            <>
              <div
                role="presentation"
                aria-hidden="true"
                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700"
              >
                インポート済み ({importedSkills.length})
              </div>
              {importedSkills.map((skill, i) => {
                const idx = importedBaseIndex + i;
                return (
                  <SkillOption
                    key={skill.name}
                    name={skill.name}
                    description={skill.description}
                    agentCount={getArrayLength(skill, "agents")}
                    referenceCount={getArrayLength(skill, "references")}
                    isSelected={selectedSkillName === skill.name}
                    isFocused={focusedIndex === idx}
                    index={idx}
                    onSelect={() => handleSelect(skill.name)}
                  />
                );
              })}
            </>
          )}

          {/* Available (Unimported) Skills Section */}
          {unimportedSkills.length > 0 && (
            <>
              <div
                role="presentation"
                aria-hidden="true"
                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700"
              >
                利用可能なスキル ({unimportedSkills.length})
              </div>
              {unimportedSkills.map(
                (skill: { name: string; description?: string }, i: number) => {
                  const idx = unimportedBaseIndex + i;
                  return (
                    <SkillOptionUnimported
                      key={skill.name}
                      name={skill.name}
                      description={skill.description}
                      isSelected={false}
                      isFocused={focusedIndex === idx}
                      index={idx}
                      onSelect={() => handleSelect(skill.name)}
                    />
                  );
                },
              )}
            </>
          )}

          {/* Footer: Rescan button */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleRescan}
              disabled={isScanning}
              aria-label="再スキャン"
              className={`
                text-sm w-full text-center
                ${isScanning ? "text-gray-400 cursor-not-allowed" : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"}
              `}
            >
              {isScanning ? "スキャン中..." : "再スキャン"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

SkillSelector.displayName = "SkillSelector";
