import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  RefreshControl, FlatList, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { Search, SlidersHorizontal, Heart, ChevronRight, X } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

interface Career {
  id: string;
  title: string;
  slug: string;
  description: string;
  salary_min: number;
  salary_max: number;
  growth_outlook: string;
  education_needed: string;
  remote_friendly: boolean;
  image_url: string;
  category_id: string;
  personality_tags: string[];
  creativity_level: number;
  analytical_level: number;
  social_level: number;
  independence_level: number;
}

const FILTER_OPTIONS = {
  growth: ['all', 'growing', 'stable', 'declining'],
  remote: ['all', 'yes', 'no'],
  creativity: ['all', '1', '2', '3', '4', '5'],
};

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [growthFilter, setGrowthFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');

  const loadData = useCallback(async () => {
    const [catRes, careerRes, savedRes] = await Promise.all([
      supabase.from('career_categories').select('*').order('sort_order'),
      supabase.from('careers').select('*').order('title'),
      user ? supabase.from('saved_careers').select('career_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
    ]);

    if (catRes.data) setCategories(catRes.data as Category[]);
    if (careerRes.data) {
      setCareers(careerRes.data as Career[]);
      setFilteredCareers(careerRes.data as Career[]);
    }
    if (savedRes.data) {
      setSavedIds(new Set((savedRes.data as any[]).map((s: any) => s.career_id)));
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = [...careers];
    if (selectedCategory) result = result.filter(c => c.category_id === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (growthFilter !== 'all') result = result.filter(c => c.growth_outlook === growthFilter);
    if (remoteFilter === 'yes') result = result.filter(c => c.remote_friendly);
    if (remoteFilter === 'no') result = result.filter(c => !c.remote_friendly);
    setFilteredCareers(result);
  }, [careers, selectedCategory, searchQuery, growthFilter, remoteFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleSave = async (careerId: string) => {
    if (!user) return;
    if (savedIds.has(careerId)) {
      await supabase.from('saved_careers').delete().eq('user_id', user.id).eq('career_id', careerId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(careerId); return n; });
    } else {
      await supabase.from('saved_careers').insert({ user_id: user.id, career_id: careerId });
      setSavedIds(prev => new Set(prev).add(careerId));
    }
  };

  const formatSalary = (min: number, max: number) => `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;

  const getGrowthColor = (outlook: string) => {
    if (outlook === 'growing') return Colors.success[500];
    if (outlook === 'stable') return Colors.warning[500];
    return Colors.error[500];
  };

  const renderCareer = ({ item }: { item: Career }) => (
    <TouchableOpacity style={styles.careerCard} onPress={() => router.push(`/explore/detail?id=${item.id}`)}>
      <View style={styles.careerHeader}>
        <View style={styles.careerInfo}>
          <Text style={styles.careerTitle}>{item.title}</Text>
          <Text style={styles.careerDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={() => toggleSave(item.id)}>
          <Heart
            size={20}
            color={savedIds.has(item.id) ? Colors.error[500] : Colors.neutral[300]}
            fill={savedIds.has(item.id) ? Colors.error[500] : 'none'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.careerMeta}>
        <View style={styles.metaTag}>
          <Text style={styles.metaTagText}>{formatSalary(item.salary_min, item.salary_max)}</Text>
        </View>
        <View style={[styles.metaTag, { backgroundColor: getGrowthColor(item.growth_outlook) + '15' }]}>
          <Text style={[styles.metaTagText, { color: getGrowthColor(item.growth_outlook) }]}>
            {item.growth_outlook.charAt(0).toUpperCase() + item.growth_outlook.slice(1)}
          </Text>
        </View>
        {item.remote_friendly && (
          <View style={[styles.metaTag, { backgroundColor: Colors.primary[50] }]}>
            <Text style={[styles.metaTagText, { color: Colors.primary[600] }]}>Remote</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search careers..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.neutral[400]} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={showFilters ? Colors.primary[500] : Colors.neutral[500]} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Growth</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {FILTER_OPTIONS.growth.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.filterChip, growthFilter === g && styles.filterChipActive]}
                  onPress={() => setGrowthFilter(g)}
                >
                  <Text style={[styles.filterChipText, growthFilter === g && styles.filterChipTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Remote</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {FILTER_OPTIONS.remote.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.filterChip, remoteFilter === r && styles.filterChipActive]}
                  onPress={() => setRemoteFilter(r)}
                >
                  <Text style={[styles.filterChipText, remoteFilter === r && styles.filterChipTextActive]}>
                    {r === 'all' ? 'All' : r === 'yes' ? 'Remote' : 'In-Person'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && { backgroundColor: cat.color + '15', borderColor: cat.color }]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && { color: cat.color, fontWeight: '600' }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredCareers}
        renderItem={renderCareer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.careersList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No careers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, gap: Spacing.sm },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSizes.md, color: Colors.text, padding: 0 },
  filterButton: { width: 46, height: 46, borderRadius: BorderRadius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  filtersPanel: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  filterLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, width: 60 },
  filterOptions: { flex: 1 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.neutral[100], marginRight: 8 },
  filterChipActive: { backgroundColor: Colors.primary[500] },
  filterChipText: { fontSize: FontSizes.xs, color: Colors.neutral[600], fontWeight: '500' },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },
  categoriesScroll: { maxHeight: 44, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  categoriesContent: { gap: 8, paddingVertical: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] },
  categoryChipText: { fontSize: FontSizes.sm, color: Colors.neutral[600], fontWeight: '500' },
  categoryChipTextActive: { color: Colors.white, fontWeight: '600' },
  careersList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  careerCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  careerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  careerInfo: { flex: 1, marginRight: Spacing.sm },
  careerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  careerDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  saveButton: { width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: Colors.neutral[50], alignItems: 'center', justifyContent: 'center' },
  careerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.neutral[100] },
  metaTagText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.neutral[600] },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.neutral[500], marginBottom: 4 },
  emptySubtext: { fontSize: FontSizes.sm, color: Colors.neutral[400] },
});
