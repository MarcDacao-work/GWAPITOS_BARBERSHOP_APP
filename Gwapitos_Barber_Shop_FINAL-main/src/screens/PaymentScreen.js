import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Switch,
  Image
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockAppointments } from '../utils/mockData';

const PaymentScreen = ({ navigation, route }) => {
  const appointment = route.params?.appointment || mockAppointments[0];
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPaid, setIsPaid] = useState(appointment.status === 'completed');
  const [tipAmount, setTipAmount] = useState(5);
  const [saveCard, setSaveCard] = useState(true);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', color: '#2196F3' },
    { id: 'cash', name: 'Cash', icon: 'cash-outline', color: '#4CAF50' },
    { id: 'digital', name: 'Digital Wallet', icon: 'phone-portrait-outline', color: '#FF9800' },
    { id: 'bank', name: 'Bank Transfer', icon: 'business-outline', color: '#9C27B0' },
  ];
  const tipOptions = [0, 5, 10, 15, 20];

  const handlePayment = () => {
    if (isPaid) {
      Alert.alert('Already Paid', 'This appointment has already been marked as paid.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to process payment of ${appointment.price} via ${paymentMethod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Payment',
          onPress: () => {
            setIsPaid(true);
            Alert.alert(
              'Payment Successful!',
              `Payment of ${appointment.price} has been processed successfully. Thank you!`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleReceipt = () => {
    Alert.alert(
      'Receipt',
      `GWAPITOS BARBER SHOP\n\n` +
      `Receipt #: ${Math.floor(Math.random() * 1000000)}\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Time: ${new Date().toLocaleTimeString()}\n\n` +
      `Customer: John Smith\n` +
      `Barber: ${appointment.barberName}\n` +
      `Service: ${appointment.service}\n` +
      `Duration: ${appointment.duration}\n\n` +
      `Subtotal: ${appointment.price}\n` +
      `Tip: $${tipAmount}\n` +
      `Total: $${parseInt(appointment.price.replace('$', '')) + tipAmount}\n\n` +
      `Payment Method: ${paymentMethod.toUpperCase()}\n` +
      `Status: ${isPaid ? 'PAID' : 'PENDING'}\n\n` +
      `Thank you for your business!`,
      [{ text: 'OK' }]
    );
  };

  const handleRefund = () => {
    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Refund',
          onPress: () => {
            Alert.alert(
              'Refund Requested',
              'Your refund request has been submitted. You will be contacted within 3-5 business days.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <TouchableOpacity style={styles.receiptButton} onPress={handleReceipt}>
          <Icon name="receipt-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Payment Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isPaid ? '#4CAF50' : '#FF9800' }
            ]}>
              <Icon 
                name={isPaid ? "checkmark-circle" : "time-outline"} 
                size={20} 
                color="#fff" 
              />
            </View>
            <Text style={styles.statusTitle}>
              {isPaid ? 'Payment Complete' : 'Payment Pending'}
            </Text>
          </View>
          
          <View style={styles.paymentToggle}>
            <Text style={styles.toggleLabel}>Mark as Paid</Text>
            <Switch
              value={isPaid}
              onValueChange={(value) => {
                if (value) {
                  Alert.alert(
                    'Mark as Paid',
                    'Are you sure you want to mark this appointment as paid?',
                    [
                      { text: 'Cancel', onPress: () => setIsPaid(false) },
                      { text: 'Confirm', onPress: () => setIsPaid(true) }
                    ]
                  );
                } else {
                  setIsPaid(false);
                }
              }}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={isPaid ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Appointment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Appointment Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Icon name="person-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Barber</Text>
              <Text style={styles.summaryValue}>{appointment.barberName}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Icon name="cut-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{appointment.service}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Icon name="calendar-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
              <Text style={styles.summaryValue}>
                {appointment.date}, {appointment.time}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.priceValue}>{appointment.price}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>$2.50</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>
                ${parseInt(appointment.price.replace('$', '')) + 2.50}
              </Text>
            </View>
          </View>
        </View>

        {/* Tip Selection */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Add a Tip</Text>
          <Text style={styles.tipSubtitle}>Select tip percentage</Text>
          
          <View style={styles.tipOptions}>
            {tipOptions.map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipOption,
                  tipAmount === tip && styles.selectedTipOption
                ]}
                onPress={() => setTipAmount(tip)}
              >
                <Text style={[
                  styles.tipOptionText,
                  tipAmount === tip && styles.selectedTipOptionText
                ]}>
                  {tip}%
                </Text>
                {tipAmount === tip && (
                  <Icon name="checkmark" size={16} color="#4CAF50" style={styles.tipCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customTip}>
            <Text style={styles.customTipLabel}>Custom Amount: </Text>
            <Text style={styles.customTipValue}>${tipAmount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsCard}>
          <Text style={styles.methodsTitle}>Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodOption,
                paymentMethod === method.id && styles.selectedMethod
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                <Icon name={method.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.methodName}>{method.name}</Text>
              {paymentMethod === method.id && (
                <Icon name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}

          {/* Save Card Option */}
          {paymentMethod === 'card' && (
            <View style={styles.saveCardOption}>
              <Text style={styles.saveCardLabel}>Save card for future payments</Text>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                trackColor={{ false: '#767577', true: '#2196F3' }}
                thumbColor={saveCard ? '#fff' : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        {/* Payment Details - Mock Card */}
        {paymentMethod === 'card' && (
          <View style={styles.cardDetails}>
            <View style={styles.cardPreview}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardBank}>GOLD BANK</Text>
                <Icon name="wifi-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.cardNumber}>••••  ••••  ••••  1234</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardValue}>JOHN SMITH</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>12/25</Text>
                </View>
                <View style={styles.cardChip}>
                  <Icon name="card-outline" size={30} color="#FFD700" />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Cash Payment Instructions */}
        {paymentMethod === 'cash' && (
          <View style={styles.cashInstructions}>
            <Icon name="information-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.cashText}>
              Please pay with cash to your barber. Exact change is appreciated.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isPaid && (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Icon name="lock-closed-outline" size={22} color="#fff" />
              <Text style={styles.payButtonText}>
                PAY ${parseInt(appointment.price.replace('$', '')) + 2.50 + tipAmount}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.secondaryButton, isPaid && styles.refundButton]}
            onPress={isPaid ? handleRefund : handleReceipt}
          >
            <Icon 
              name={isPaid ? "arrow-undo-outline" : "receipt-outline"} 
              size={22} 
              color={isPaid ? "#F44336" : "#2196F3"} 
            />
            <Text style={[
              styles.secondaryButtonText,
              isPaid && styles.refundButtonText
            ]}>
              {isPaid ? 'Request Refund' : 'View Receipt'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <Icon name="shield-checkmark-outline" size={24} color="#4CAF50" />
          <Text style={styles.securityTitle}>Secure Payment</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We do not store your full card details.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  receiptButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  priceSection: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#888',
  },
  priceValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tipCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tipSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipOption: {
    width: '18%',
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  selectedTipOption: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  tipOptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  selectedTipOptionText: {
    color: '#fff',
  },
  tipCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  customTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  customTipLabel: {
    fontSize: 16,
    color: '#888',
  },
  customTipValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  methodsCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedMethod: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  saveCardOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  saveCardLabel: {
    fontSize: 14,
    color: '#888',
  },
  cardDetails: {
    marginBottom: 20,
  },
  cardPreview: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardBank: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 30,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  cardChip: {
    backgroundColor: '#444',
    width: 50,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  cashText: {
    flex: 1,
    color: '#FF9800',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 15,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  refundButton: {
    borderColor: '#F44336',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refundButtonText: {
    color: '#F44336',
  },
  securityCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
    marginBottom: 10,
  },
  securityText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});

export default PaymentScreen;