import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes, PersonalityColors, PersonalityLabels } from '@/constants/theme';
import { ArrowLeft, Heart, DollarSign, TrendingUp, GraduationCap, Building2, Globe, Wrench, CircleCheck as CheckCircle2, ChevronRight, MapPin } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Career {
  id: string;
  title: string;
  description: string;
  what_they_do: string;
  salary_min: number;
  salary_max: number;
  growth_outlook: string;
  education_needed: string;
  work_environment: string;
  remote_friendly: boolean;
  skills_needed: string[];
  tools_used: string[];
  day_in_the_life: string;
  steps_to_get_there: { title: string; description: string }[];
  personality_tags: string[];
  image_url: string;
  category_id: string;
}

export default function CareerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [career, setCareer] = useState<Career | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    const [careerRes, savedRes, matchRes] = await Promise.all([
      supabase.from('careers').select('*').eq('id', id).maybeSingle(),
      user ? supabase.from('saved_careers').select('id').eq('user_id', user.id).eq('career_id', id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from('career_match_scores').select('match_score').eq('user_id', user.id).eq('career_id', id).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    if (careerRes.data) setCareer(careerRes.data as Career);
    setIsSaved(!!savedRes.data);
    if (matchRes.data) setMatchScore((matchRes.data as any).match_score);
  }, [id, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleSave = async () => {
    if (!user || !career) return;
    if (isSaved) {
      await supabase.from('saved_careers').delete().eq('user_id', user.id).eq('career_id', career.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_careers').insert({ user_id: user.id, career_id: career.id });
      setIsSaved(true);
    }
  };

  if (!career) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const formatSalary = (min: number, max: number) => `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;

  const getGrowthColor = (outlook: string) => {
    if (outlook === 'growing') return Colors.success[500];
    if (outlook === 'stable') return Colors.warning[500];
    return Colors.error[500];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.hero}>
        {career.image_url ? (
          <Image source={{ uri: career.image_url }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]} />
        )}
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={toggleSave}>
            <Heart size={24} color={isSaved ? Colors.error[500] : Colors.white} fill={isSaved ? Colors.error[500] : 'none'} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.careerTitle}>{career.title}</Text>
          {matchScore !== null && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{matchScore}% match</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <DollarSign size={18} color={Colors.success[500]} />
            <Text style={styles.statValue}>{formatSalary(career.salary_min, career.salary_max)}</Text>
            <Text style={styles.statLabel}>Salary</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={18} color={getGrowthColor(career.growth_outlook)} />
            <Text style={[styles.statValue, { color: getGrowthColor(career.growth_outlook) }]}>
              {career.growth_outlook.charAt(0).toUpperCase() + career.growth_outlook.slice(1)}
            </Text>
            <Text style={styles.statLabel}>Outlook</Text>
          </View>
          <View style={styles.statCard}>
            <GraduationCap size={18} color={Colors.primary[500]} />
            <Text style={styles.statValue} numberOfLines={1}>{career.education_needed.split(' ').slice(0, 2).join(' ')}</Text>
            <Text style={styles.statLabel}>Education</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What They Do</Text>
          <Text style={styles.bodyText}>{career.what_they_do || career.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Building2 size={18} color={Colors.neutral[500]} />
            <View style={styles.sectionRowContent}>
              <Text style={styles.sectionRowLabel}>Work Environment</Text>
              <Text style={styles.sectionRowValue}>{career.work_environment}</Text>
            </View>
          </View>
          <View style={styles.sectionRow}>
            <Globe size={18} color={Colors.neutral[500]} />
            <View style={styles.sectionRowContent}>
              <Text style={styles.sectionRowLabel}>Remote Friendly</Text>
              <Text style={styles.sectionRowValue}>{career.remote_friendly ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        {career.personality_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best For</Text>
            <View style={styles.tagsRow}>
              {career.personality_tags.map(tag => (
                <View key={tag} style={[styles.personalityTag, { backgroundColor: (PersonalityColors[tag] || Colors.primary[500]) + '15' }]}>
                  <Text style={[styles.personalityTagText, { color: PersonalityColors[tag] || Colors.primary[500] }]}>
                    {PersonalityLabels[tag] || tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {career.skills_needed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills Needed</Text>
            <View style={styles.tagsRow}>
              {career.skills_needed.map((skill, i) => (
                <View key={i} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {career.tools_used.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Wrench size={18} color={Colors.neutral[500]} />
              <Text style={styles.sectionTitle}>Tools & Software</Text>
            </View>
            <View style={styles.tagsRow}>
              {career.tools_used.map((tool, i) => (
                <View key={i} style={styles.toolTag}>
                  <Text style={styles.toolTagText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {career.day_in_the_life ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Day in the Life</Text>
            <Text style={styles.bodyText}>{career.day_in_the_life}</Text>
          </View>
        ) : null}

        {career.steps_to_get_there && career.steps_to_get_there.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps to Get There</Text>
            <View style={styles.stepsContainer}>
              {career.steps_to_get_there.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                  {i < career.steps_to_get_there.length - 1 && <View style={styles.stepLine} />}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: FontSizes.md, color: Colors.neutral[500] },
  hero: { position: 'relative', height: 240 },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: Colors.primary[500] },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroContent: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, paddingTop: Spacing.xl },
  backButton: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  saveButton: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md },
  careerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  matchBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary[500], paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full, marginTop: 6 },
  matchText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.white },
  content: { padding: Spacing.md, marginTop: -16, backgroundColor: Colors.background, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 4 },
  statValue: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.neutral[500] },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionRowContent: { flex: 1 },
  sectionRowLabel: { fontSize: FontSizes.sm, color: Colors.neutral[500] },
  sectionRowValue: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.text },
  bodyText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personalityTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  personalityTagText: { fontSize: FontSizes.sm, fontWeight: '600' },
  skillTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.secondary[50] },
  skillTagText: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.secondary[700] },
  toolTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.neutral[100] },
  toolTagText: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.neutral[600] },
  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  stepNumber: { width: 28, height: 28, borderRadius: BorderRadius.full, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.white },
  stepContent: { flex: 1, paddingBottom: Spacing.lg },
  stepTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  stepDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  stepLine: { position: 'absolute', left: 13, top: 28, width: 2, height: '100%', backgroundColor: Colors.primary[100] },
});
