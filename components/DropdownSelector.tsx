import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

export interface DropdownOption<T> {
  id: string;
  value: T;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownSelectorProps<T> {
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options: DropdownOption<T>[];
  selectedId: string | null;
  onSelect: (option: DropdownOption<T> | null) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  allowNone?: boolean;
  noneLabel?: string;
  renderSelectedValue?: (option: DropdownOption<T>) => ReactNode;
  renderOption?: (option: DropdownOption<T>, isSelected: boolean) => ReactNode;
  maxListHeight?: number;
}

export function DropdownSelector<T>({
  label,
  required = false,
  hint,
  placeholder = 'Select an option',
  options,
  selectedId,
  onSelect,
  isExpanded,
  onToggle,
  isLoading = false,
  loadingText = 'Loading...',
  emptyText = 'No options available',
  allowNone = false,
  noneLabel = 'None',
  renderSelectedValue,
  renderOption,
  maxListHeight = 180,
}: DropdownSelectorProps<T>) {
  const selectedOption = options.find(opt => opt.id === selectedId) ?? null;

  const handleSelectNone = () => {
    onSelect(null);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}

      {isLoading ? (
        <View style={styles.loadingField}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.selector}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <View style={styles.selectorContent}>
              {selectedOption ? (
                renderSelectedValue ? (
                  renderSelectedValue(selectedOption)
                ) : (
                  <>
                    {selectedOption.icon}
                    <Text style={styles.selectorText}>{selectedOption.label}</Text>
                  </>
                )
              ) : (
                <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
                  {placeholder}
                </Text>
              )}
            </View>
            <ChevronDown
              size={18}
              color={colors.textSecondary}
              style={isExpanded ? styles.chevronUp : undefined}
            />
          </TouchableOpacity>

          {isExpanded && (
            <ScrollView
              style={[styles.optionsList, { maxHeight: maxListHeight }]}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {/* None option if allowed */}
              {allowNone && (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    !selectedId && styles.optionRowSelected,
                  ]}
                  onPress={handleSelectNone}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !selectedId && styles.optionTextSelected,
                    ]}
                  >
                    {noneLabel}
                  </Text>
                  {!selectedId && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}

              {/* Options */}
              {options.map((option) => {
                const isSelected = selectedId === option.id;

                if (renderOption) {
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                        option.disabled && styles.optionRowDisabled,
                      ]}
                      onPress={() => !option.disabled && onSelect(option)}
                      activeOpacity={option.disabled ? 1 : 0.7}
                    >
                      <View style={styles.optionContent}>
                        {renderOption(option, isSelected)}
                      </View>
                      {isSelected && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                      option.disabled && styles.optionRowDisabled,
                    ]}
                    onPress={() => !option.disabled && onSelect(option)}
                    activeOpacity={option.disabled ? 1 : 0.7}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLabelRow}>
                        {option.icon}
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            option.disabled && styles.optionTextDisabled,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {option.sublabel && (
                        <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                      )}
                    </View>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}

              {/* Empty state */}
              {options.length === 0 && !allowNone && (
                <Text style={styles.emptyText}>{emptyText}</Text>
              )}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  required: {
    color: colors.error,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  selectorPlaceholder: {
    color: colors.textSecondary,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  optionsList: {
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionRowDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
  optionTextDisabled: {
    color: colors.textTertiary,
  },
  optionSublabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 22, // Align with text after icon
  },
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
