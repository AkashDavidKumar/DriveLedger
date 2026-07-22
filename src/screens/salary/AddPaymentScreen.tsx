import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SalaryPaymentService } from '../../services/SalaryPaymentService';
import dayjs from 'dayjs';

export function AddPaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { workEntryId } = route.params;

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }
    
    try {
      await SalaryPaymentService.addPayment(workEntryId, numericAmount, paymentDate, notes);
      Alert.alert('Success', 'Payment recorded successfully!');
      navigation.goBack();
    } catch(e: any) {
      // Overpayment validation error handled here
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-slate-900 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-2xl font-bold text-black dark:text-white mb-6">Add Payment</Text>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Amount (₹)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4 text-xl font-bold"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        placeholderTextColor="gray"
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Payment Date (YYYY-MM-DD)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={paymentDate}
        onChangeText={setPaymentDate}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Notes</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-6"
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
        placeholder="Payment notes..."
        placeholderTextColor="gray"
      />

      <TouchableOpacity
        className="bg-emerald-600 rounded-xl p-4 items-center shadow-lg"
        onPress={handleSave}
      >
        <Text className="text-white font-bold text-lg">Save Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
