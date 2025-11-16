import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button'; // CHANGED: from '../' to '../../'
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';

// ... rest of the code remains the same

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.content}>
        {/* Logo/Icon Placeholder */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>✂️</Text>
          <Text style={styles.appName}>GWAPITOS</Text>
        </View>

        <Text style={styles.title}>Welcome to GWAPITOS</Text>
        <Text style={styles.subtitle}>
          Book your perfect haircut with ease. Skip the wait, get the style you deserve.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('RoleSelection')}
          variant="primary"
          style={styles.primaryButton}
        />
        <Button
          title="I have an account"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: spacing.xxl,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginBottom: spacing.sm,
  },
});

export default WelcomeScreen;