import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  FlatList, Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes, PersonalityColors, PersonalityLabels } from '@/constants/theme';
import { User, Heart, Trophy, LogOut, CreditCard as Edit3, ChevronRight, X, Save, Sparkles, Zap, BookOpen, Target, Compass, Brain, Map, Award, Route, Flame } from 'lucide-react-native';

interface SavedCareerItem {
  id: string;
  career_id: string;
  careers: { id: string; title: string; slug: string; salary_min: number; salary_max: number; growth_outlook: string };
}

interface AchievementItem {
  id: string;
  earned_at: string;
  achievements: { id: string; name: string; slug: string; description: string; icon: string; xp_reward: number };
}

interface QuizResult {
  id: string;
  quiz_type: string;
  personality_type: string;
  completed_at: string;
}

type TabKey = 'profile' | 'saved' | 'achievements';

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [savedCareers, setSavedCareers] = useState<SavedCareerItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editAge, setEditAge] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    const [savedRes, achieveRes, quizRes] = await Promise.all([
      supabase.from('saved_careers').select('id, career_id, careers:careers(id, title, slug, salary_min, salary_max, growth_outlook)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('user_achievements').select('id, earned_at, achievements:achievements(id, name, slug, description, icon, xp_reward)').eq('user_id', user.id).order('earned_at', { ascending: false }),
      supabase.from('quiz_results').select('id, quiz_type, personality_type, completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }),
    ]);
    if (savedRes.data) setSavedCareers(savedRes.data as unknown as SavedCareerItem[]);
    if (achieveRes.data) setAchievements(achieveRes.data as unknown as AchievementItem[]);
    if (quizRes.data) setQuizResults(quizRes.data as QuizResult[]);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const startEditing = () => {
    setEditName(profile?.full_name || '');
    setEditUsername(profile?.username || '');
    setEditGrade(profile?.grade_level || '');
    setEditAge(profile?.age_range || '');
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from('profiles').update({
      full_name: editName,
      username: editUsername,
      grade_level: editGrade,
      age_range: editAge,
    }).eq('id', user.id);
    setEditing(false);
    refreshProfile();
  };

  const removeSavedCareer = async (id: string) => {
    await supabase.from('saved_careers').delete().eq('id', id);
    loadData();
  };

  const resetQuizData = async () => {
    if (!user) return;
    await supabase.from('quiz_results').delete().eq('user_id', user.id);
    await supabase.from('career_match_scores').delete().eq('user_id', user.id);
    await supabase.from('profiles').update({ personality_type: '' }).eq('id', user.id);
    refreshProfile();
    loadData();
  };

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForLevel = level * 200;
  const xpProgress = (xp % 200) / 200;

  const getAchievementIcon = (iconName: string) => {
    const map: Record<string, any> = { Compass, Brain, Trophy, Map, Heart, User, Route, Flame, Award };
    return map[iconName] || Award;
  };

  const renderProfile = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.full_name?.[0] || profile?.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.full_name || 'Set your name'}</Text>
          {profile?.username && <Text style={styles.profileUsername}>@{profile.username}</Text>}
          {profile?.personality_type && (
            <View style={styles.personalityBadge}>
              <Sparkles size={14} color={PersonalityColors[profile.personality_type] || Colors.primary[500]} />
              <Text style={[styles.personalityText, { color: PersonalityColors[profile.personality_type] || Colors.primary[500] }]}>
                {PersonalityLabels[profile.personality_type]}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={editing ? saveProfile : startEditing}>
          {editing ? <Save size={18} color={Colors.success[500]} /> : <Edit3 size={18} color={Colors.neutral[500]} />}
        </TouchableOpacity>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpRow}>
          <Zap size={20} color={Colors.accent[500]} />
          <Text style={styles.xpLevel}>Level {level}</Text>
          <Text style={styles.xpDetail}>{xp} / {xpForLevel} XP</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpProgress * 100}%` as any }]} />
        </View>
      </View>

      {editing ? (
        <View style={styles.editForm}>
          <TextInput style={styles.editInput} placeholder="Full Name" placeholderTextColor={Colors.neutral[400]} value={editName} onChangeText={setEditName} />
          <TextInput style={styles.editInput} placeholder="Username" placeholderTextColor={Colors.neutral[400]} value={editUsername} onChangeText={setEditUsername} autoCapitalize="none" />
          <TextInput style={styles.editInput} placeholder="Grade Level (e.g., 10th)" placeholderTextColor={Colors.neutral[400]} value={editGrade} onChangeText={setEditGrade} />
          <TextInput style={styles.editInput} placeholder="Age Range (e.g., 15-17)" placeholderTextColor={Colors.neutral[400]} value={editAge} onChangeText={setEditAge} />
        </View>
      ) : (
        <View style={styles.profileDetails}>
          {profile?.grade_level ? (
            <View style={styles.detailRow}>
              <BookOpen size={18} color={Colors.neutral[500]} />
              <Text style={styles.detailLabel}>Grade</Text>
              <Text style={styles.detailValue}>{profile.grade_level}</Text>
            </View>
          ) : null}
          {profile?.age_range ? (
            <View style={styles.detailRow}>
              <User size={18} color={Colors.neutral[500]} />
              <Text style={styles.detailLabel}>Age Range</Text>
              <Text style={styles.detailValue}>{profile.age_range}</Text>
            </View>
          ) : null}
        </View>
      )}

      {quizResults.length > 0 && (
        <View style={styles.quizHistory}>
          <Text style={styles.subTitle}>Quiz History</Text>
          {quizResults.map(qr => (
            <View key={qr.id} style={styles.quizHistoryItem}>
              <Brain size={16} color={PersonalityColors[qr.personality_type] || Colors.primary[500]} />
              <Text style={styles.quizHistoryType}>{qr.quiz_type.charAt(0).toUpperCase() + qr.quiz_type.slice(1)}</Text>
              <Text style={[styles.quizHistoryResult, { color: PersonalityColors[qr.personality_type] || Colors.primary[500] }]}>
                {PersonalityLabels[qr.personality_type] || qr.personality_type}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.dangerZone}>
        <TouchableOpacity style={styles.dangerButton} onPress={resetQuizData}>
          <Text style={styles.dangerText}>Reset Quiz Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dangerButton, { borderColor: Colors.error[500] }]} onPress={signOut}>
          <LogOut size={18} color={Colors.error[500]} />
          <Text style={[styles.dangerText, { color: Colors.error[500] }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSaved = () => (
    <View style={styles.savedSection}>
      {savedCareers.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={40} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No saved careers</Text>
          <Text style={styles.emptySub}>Explore careers and save the ones you like</Text>
        </View>
      ) : (
        <FlatList
          data={savedCareers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.savedCareerCard}>
              <View style={styles.savedCareerInfo}>
                <Text style={styles.savedCareerTitle}>{item.careers.title}</Text>
                <Text style={styles.savedCareerSalary}>
                  ${(item.careers.salary_min / 1000).toFixed(0)}k - ${(item.careers.salary_max / 1000).toFixed(0)}k
                </Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeSavedCareer(item.id)}>
                <X size={18} color={Colors.error[500]} />
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsSection}>
      {achievements.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy size={40} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No achievements yet</Text>
          <Text style={styles.emptySub}>Complete quizzes and explore careers to earn badges</Text>
        </View>
      ) : (
        <View style={styles.achievementGrid}>
          {achievements.map(item => {
            const IconComp = getAchievementIcon(item.achievements.icon);
            return (
              <View key={item.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <IconComp size={28} color={Colors.accent[500]} />
                </View>
                <Text style={styles.achievementName}>{item.achievements.name}</Text>
                <Text style={styles.achievementDesc}>{item.achievements.description}</Text>
                <Text style={styles.achievementXp}>+{item.achievements.xp_reward} XP</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {([
          { key: 'profile' as TabKey, label: 'Profile', icon: User },
          { key: 'saved' as TabKey, label: 'Saved', icon: Heart },
          { key: 'achievements' as TabKey, label: 'Awards', icon: Trophy },
        ]).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <tab.icon size={18} color={activeTab === tab.key ? Colors.primary[500] : Colors.neutral[400]} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'saved' && renderSaved()}
        {activeTab === 'achievements' && renderAchievements()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.sm, gap: Spacing.sm },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  tabActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  tabLabel: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.neutral[500] },
  tabLabelActive: { color: Colors.primary[500], fontWeight: '600' },
  scrollContent: { flex: 1 },
  scrollContentInner: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  profileSection: { gap: Spacing.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 64, height: 64, borderRadius: BorderRadius.full, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  profileUsername: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  personalityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  personalityText: { fontSize: FontSizes.sm, fontWeight: '600' },
  editButton: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.neutral[50], alignItems: 'center', justifyContent: 'center' },
  xpSection: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  xpLevel: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  xpDetail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: 'auto' },
  xpBar: { height: 8, backgroundColor: Colors.neutral[100], borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.accent[500], borderRadius: 4 },
  editForm: { gap: Spacing.sm },
  editInput: { backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  profileDetails: { gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  detailLabel: { fontSize: FontSizes.sm, color: Colors.neutral[500], flex: 1 },
  detailValue: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.text },
  subTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  quizHistory: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  quizHistoryItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  quizHistoryType: { fontSize: FontSizes.md, color: Colors.text, flex: 1 },
  quizHistoryResult: { fontSize: FontSizes.md, fontWeight: '600' },
  dangerZone: { gap: Spacing.sm, marginTop: Spacing.md },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.neutral[300] },
  dangerText: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.neutral[500] },
  savedSection: { gap: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.neutral[500] },
  emptySub: { fontSize: FontSizes.sm, color: Colors.neutral[400], textAlign: 'center' },
  savedCareerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  savedCareerInfo: { flex: 1 },
  savedCareerTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  savedCareerSalary: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  removeButton: { width: 32, height: 32, borderRadius: BorderRadius.md, backgroundColor: Colors.error[50], alignItems: 'center', justifyContent: 'center' },
  achievementsSection: { gap: Spacing.md },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  achievementCard: { width: '47%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 6 },
  achievementIcon: { width: 56, height: 56, borderRadius: BorderRadius.full, backgroundColor: Colors.accent[50], alignItems: 'center', justifyContent: 'center' },
  achievementName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  achievementDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  achievementXp: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.accent[500] },
});
