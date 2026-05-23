import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, FontSizes, PersonalityColors, PersonalityLabels } from '@/constants/theme';
import { Compass, Brain, Heart, Map, Sparkles, TrendingUp, ChevronRight, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Quote {
  text: string;
  author: string;
}

interface CareerMatch {
  career_id: string;
  match_score: number;
  careers: { id: string; title: string; slug: string; image_url: string; category_id: string };
}

interface SavedCareer {
  career_id: string;
  careers: { id: string; title: string; slug: string; image_url: string };
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [topMatches, setTopMatches] = useState<CareerMatch[]>([]);
  const [savedCareers, setSavedCareers] = useState<SavedCareer[]>([]);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    const [quoteRes, matchRes, savedRes, quizRes] = await Promise.all([
      supabase.from('inspirational_quotes').select('text, author').order('random()').limit(1).maybeSingle(),
      supabase.from('career_match_scores').select('career_id, match_score, careers:careers(id, title, slug, image_url, category_id)').eq('user_id', user.id).order('match_score', { ascending: false }).limit(3),
      supabase.from('saved_careers').select('career_id, careers:careers(id, title, slug, image_url)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('quiz_results').select('quiz_type', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    if (quoteRes.data) setQuote(quoteRes.data);
    if (matchRes.data) setTopMatches(matchRes.data as unknown as CareerMatch[]);
    if (savedRes.data) setSavedCareers(savedRes.data as unknown as SavedCareer[]);
    setQuizzesCompleted(quizRes.count ?? 0);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'there';
  const personalityType = profile?.personality_type;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForNextLevel = level * 200;
  const xpProgress = (xp % 200) / 200;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {firstName}</Text>
          {personalityType && (
            <View style={styles.personalityBadge}>
              <Sparkles size={14} color={PersonalityColors[personalityType] || Colors.primary[500]} />
              <Text style={[styles.personalityText, { color: PersonalityColors[personalityType] || Colors.primary[500] }]}>
                {PersonalityLabels[personalityType] || personalityType}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.xpContainer}>
          <Zap size={16} color={Colors.accent[500]} />
          <Text style={styles.xpText}>Lv {level}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
        </View>
      </View>

      {quote && (
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>
      )}

      {topMatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary[500]} />
            <Text style={styles.sectionTitle}>Top Matches</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {topMatches.map((match) => (
              <TouchableOpacity
                key={match.career_id}
                style={styles.matchCard}
                onPress={() => router.push(`/explore/detail?id=${match.careers.id}`)}
              >
                <View style={styles.matchScoreContainer}>
                  <Text style={styles.matchScore}>{match.match_score}%</Text>
                </View>
                <Text style={styles.matchTitle} numberOfLines={2}>{match.careers.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {savedCareers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={Colors.error[500]} />
            <Text style={styles.sectionTitle}>Saved Careers</Text>
          </View>
          {savedCareers.map((saved) => (
            <TouchableOpacity
              key={saved.career_id}
              style={styles.savedItem}
              onPress={() => router.push(`/explore/detail?id=${saved.careers.id}`)}
            >
              <View style={styles.savedIcon}>
                <Heart size={16} color={Colors.error[500]} fill={Colors.error[500]} />
              </View>
              <Text style={styles.savedTitle}>{saved.careers.title}</Text>
              <ChevronRight size={18} color={Colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {quizzesCompleted < 4 && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primary[50] }]}
              onPress={() => router.push('/quiz')}
            >
              <Brain size={28} color={Colors.primary[500]} />
              <Text style={[styles.actionTitle, { color: Colors.primary[700] }]}>Take a Quiz</Text>
              <Text style={[styles.actionSub, { color: Colors.primary[400] }]}>{4 - quizzesCompleted} remaining</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.secondary[50] }]}
            onPress={() => router.push('/explore')}
          >
            <Compass size={28} color={Colors.secondary[500]} />
            <Text style={[styles.actionTitle, { color: Colors.secondary[700] }]}>Explore Careers</Text>
            <Text style={[styles.actionSub, { color: Colors.secondary[400] }]}>Browse all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.accent[50] }]}
            onPress={() => router.push('/plan')}
          >
            <Map size={28} color={Colors.accent[500]} />
            <Text style={[styles.actionTitle, { color: Colors.accent[700] }]}>Future Plan</Text>
            <Text style={[styles.actionSub, { color: Colors.accent[400] }]}>Build roadmap</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text },
  personalityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  personalityText: { fontSize: FontSizes.sm, fontWeight: '600' },
  xpContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent[50], paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full },
  xpText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.accent[700] },
  xpBar: { width: 40, height: 4, backgroundColor: Colors.accent[100], borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.accent[500], borderRadius: 2 },
  quoteCard: { backgroundColor: Colors.primary[50], borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderLeftWidth: 4, borderLeftColor: Colors.primary[400] },
  quoteText: { fontSize: FontSizes.md, color: Colors.text, fontStyle: 'italic', lineHeight: 22 },
  quoteAuthor: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 8, fontWeight: '500' },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  horizontalScroll: { gap: Spacing.md, paddingRight: Spacing.md },
  matchCard: { width: 140, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  matchScoreContainer: { width: 48, height: 48, borderRadius: BorderRadius.full, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  matchScore: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.primary[600] },
  matchTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  savedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, gap: Spacing.sm },
  savedIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: Colors.error[50], alignItems: 'center', justifyContent: 'center' },
  savedTitle: { flex: 1, fontSize: FontSizes.md, fontWeight: '500', color: Colors.text },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  actionCard: { flex: 1, minWidth: '45%', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', gap: 8 },
  actionTitle: { fontSize: FontSizes.md, fontWeight: '700', textAlign: 'center' },
  actionSub: { fontSize: FontSizes.xs, fontWeight: '500' },
});
