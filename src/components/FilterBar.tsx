import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  title?: string;
}

export function FilterBar({ options, selectedValue, onSelect, title }: FilterBarProps) {
  return (
    <View className="mb-4">
      {title && <Text className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest px-1">{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(isSelected ? null : opt.value)}
              className={`px-4 py-2 rounded-full border mr-2 shadow-sm ${
                isSelected 
                  ? 'bg-primary border-primary' 
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Text 
                className={isSelected ? 'text-white font-bold' : 'text-slate-600 dark:text-slate-300'}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
