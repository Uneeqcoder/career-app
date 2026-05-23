import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, TextInput as RNTextInput,
} from 'react-native';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { User, Mail, Lock, ArrowRight, GraduationCap, Calendar } from 'lucide-react-native';

const GRADE_OPTIONS = ['8th or below', '9th', '10th', '11th', '12th', 'College'];
const AGE_OPTIONS = ['12-14', '15-17', '18-20', '21+'];

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign-up only fields
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [ageRange, setAgeRange] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);

  const validate = () => {
    if (!email.trim()) { setError('Please enter your email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address'); return false; }
    if (!password) { setError('Please enter your password'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (isSignUp) {
      if (!fullName.trim()) { setError('Please enter your full name'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const { error: err } = await signUp(email.trim().toLowerCase(), password, {
        full_name: fullName.trim(),
        username: fullName.trim().toLowerCase().replace(/\s+/g, '_'),
        grade_level: gradeLevel,
        age_range: ageRange,
      });
      if (err) {
        if (err.includes('already registered') || err.includes('already been registered')) {
          setError('An account with this email already exists. Try signing in.');
        } else {
          setError(err);
        }
      }
    } else {
      const { error: err } = await signIn(email.trim().toLowerCase(), password);
      if (err) {
        setError('Incorrect email or password. Please try again.');
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setGradeLevel('');
    setAgeRange('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>CP</Text>
          </View>
          <Text style={styles.title}>CareerPath</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.neutral[400]}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>
          )}

          <View>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.neutral[400]} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.neutral[400]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral[400]} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                placeholderTextColor={Colors.neutral[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={isSignUp ? undefined : handleSubmit}
              />
            </View>
          </View>

          {isSignUp && (
            <>
              <View>
                <Text style={styles.fieldLabel}>Grade Level (optional)</Text>
                <View style={styles.chipRow}>
                  {GRADE_OPTIONS.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, gradeLevel === g && styles.chipSelected]}
                      onPress={() => setGradeLevel(gradeLevel === g ? '' : g)}
                    >
                      <Text style={[styles.chipText, gradeLevel === g && styles.chipTextSelected]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>Age Range (optional)</Text>
                <View style={styles.chipRow}>
                  {AGE_OPTIONS.map(a => (
                    <TouchableOpacity
                      key={a}
                      style={[styles.chip, ageRange === a && styles.chipSelected]}
                      onPress={() => setAgeRange(ageRange === a ? '' : a)}
                    >
                      <Text style={[styles.chipText, ageRange === a && styles.chipTextSelected]}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
            {!loading && <ArrowRight size={20} color={Colors.white} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={switchMode}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchTextBold}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  form: {
    gap: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error[100],
  },
  errorText: {
    color: Colors.error[600],
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  switchText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  switchTextBold: {
    fontWeight: '600',
    color: Colors.primary[500],
  },
});
