import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Animated,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes, PersonalityColors, PersonalityLabels, PersonalityDescriptions } from '@/constants/theme';
import { Brain, CircleCheck as CheckCircle2, ChevronRight, Sparkles, ArrowRight, RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuizQuestion {
  id: string;
  quiz_type: string;
  question_text: string;
  options: { text: string; personality_tag: string; weight: number }[];
  sort_order: number;
}

interface QuizType {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const QUIZ_TYPES: QuizType[] = [
  { key: 'personality', title: 'Personality', description: 'Discover your career personality type', icon: 'user', color: Colors.primary[500] },
  { key: 'interest', title: 'Interests', description: 'What subjects and activities excite you', icon: 'heart', color: Colors.error[500] },
  { key: 'skills', title: 'Skills', description: 'What are you naturally good at', icon: 'zap', color: Colors.accent[500] },
  { key: 'work_style', title: 'Work Style', description: 'How you prefer to work and collaborate', icon: 'briefcase', color: Colors.secondary[500] },
];

export default function QuizScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: string; option_index: number; personality_tag: string; weight: number }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resultScores, setResultScores] = useState<Record<string, number>>({});
  const [topPersonality, setTopPersonality] = useState<string>('');

  const loadCompletedQuizzes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('quiz_results').select('quiz_type').eq('user_id', user.id);
    if (data) setCompletedQuizzes(data.map(d => (d as any).quiz_type));
  }, [user]);

  useEffect(() => { loadCompletedQuizzes(); }, [loadCompletedQuizzes]);

  const startQuiz = async (quizType: string) => {
    const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_type', quizType).order('sort_order');
    if (data && data.length > 0) {
      setQuestions(data as QuizQuestion[]);
      setActiveQuiz(quizType);
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResults(false);
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const option = question.options[optionIndex];
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      question_id: question.id,
      option_index: optionIndex,
      personality_tag: option.personality_tag,
      weight: option.weight,
    };
    setAnswers(newAnswers);

    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(questionIndex + 1), 300);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = async (finalAnswers: typeof answers) => {
    const scores: Record<string, number> = {};
    finalAnswers.forEach(a => {
      if (a) {
        scores[a.personality_tag] = (scores[a.personality_tag] || 0) + a.weight;
      }
    });

    const maxScore = Math.max(...Object.values(scores));
    const top = Object.entries(scores).find(([_, v]) => v === maxScore)?.[0] || 'THINKER';

    setResultScores(scores);
    setTopPersonality(top);
    setShowResults(true);

    if (user && activeQuiz) {
      await supabase.from('quiz_results').upsert({
        user_id: user.id,
        quiz_type: activeQuiz,
        personality_type: top,
        scores,
        answers: finalAnswers,
      }, { onConflict: 'user_id,quiz_type' });

      if (activeQuiz === 'personality') {
        await supabase.from('profiles').update({ personality_type: top }).eq('id', user.id);
        refreshProfile();
      }

      await calculateCareerMatches(top, scores);
      loadCompletedQuizzes();
    }
  };

  const calculateCareerMatches = async (personality: string, scores: Record<string, number>) => {
    if (!user) return;
    const { data: careers } = await supabase.from('careers').select('id, personality_tags, creativity_level, analytical_level, social_level, independence_level');
    if (!careers) return;

    const maxQuizScore = Math.max(...Object.values(scores), 1);
    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([k, v]) => { normalizedScores[k] = v / maxQuizScore; });

    const matches = careers.map(career => {
      let matchScore = 0;
      const tags = (career as any).personality_tags || [];
      tags.forEach((tag: string) => {
        if (normalizedScores[tag]) matchScore += normalizedScores[tag] * 40;
      });
      matchScore = Math.min(99, Math.round(matchScore));
      return { career_id: (career as any).id, match_score: matchScore };
    }).filter(m => m.match_score > 30).sort((a, b) => b.match_score - a.match_score).slice(0, 20);

    for (const match of matches) {
      await supabase.from('career_match_scores').upsert({
        user_id: user.id,
        career_id: match.career_id,
        match_score: match.match_score,
      }, { onConflict: 'user_id,career_id' });
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setResultScores({});
    setTopPersonality('');
  };

  const retakeQuiz = (quizType: string) => {
    resetQuiz();
    startQuiz(quizType);
  };

  if (showResults) {
    const sortedScores = Object.entries(resultScores).sort((a, b) => b[1] - a[1]);
    const maxVal = sortedScores[0]?.[1] || 1;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultHeader}>
          <Sparkles size={32} color={PersonalityColors[topPersonality] || Colors.primary[500]} />
          <Text style={styles.resultTitle}>You are a</Text>
          <Text style={[styles.resultPersonality, { color: PersonalityColors[topPersonality] || Colors.primary[500] }]}>
            {PersonalityLabels[topPersonality] || topPersonality}
          </Text>
          <Text style={styles.resultDescription}>
            {PersonalityDescriptions[topPersonality] || 'You have a unique personality that fits many careers!'}
          </Text>
        </View>

        <View style={styles.scoresSection}>
          <Text style={styles.scoresTitle}>Your Personality Breakdown</Text>
          {sortedScores.map(([tag, score]) => (
            <View key={tag} style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: PersonalityColors[tag] || Colors.neutral[600] }]}>
                {PersonalityLabels[tag] || tag}
              </Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${(score / maxVal) * 100}%`, backgroundColor: PersonalityColors[tag] || Colors.primary[500] }]} />
              </View>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          ))}
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.resultButton} onPress={resetQuiz}>
            <RotateCcw size={20} color={Colors.primary[500]} />
            <Text style={styles.resultButtonText}>Back to Quizzes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.resultButton, { backgroundColor: Colors.primary[500] }]} onPress={() => retakeQuiz(activeQuiz!)}>
            <Text style={[styles.resultButtonText, { color: Colors.white }]}>Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (activeQuiz && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={resetQuiz}>
            <Text style={styles.quitText}>Quit</Text>
          </TouchableOpacity>
          <Text style={styles.quizProgress}>{currentQuestion + 1} of {questions.length}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question_text}</Text>
        </View>

        <ScrollView style={styles.optionsContainer} contentContainerStyle={styles.optionsContent} showsVerticalScrollIndicator={false}>
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion]?.option_index === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => selectAnswer(currentQuestion, index)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]}>
                  {isSelected && <CheckCircle2 size={20} color={Colors.white} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Brain size={28} color={Colors.primary[500]} />
        <Text style={styles.pageTitle}>Matchmaker Quizzes</Text>
        <Text style={styles.pageSubtitle}>Discover careers that match who you are</Text>
      </View>

      <View style={styles.quizGrid}>
        {QUIZ_TYPES.map(quiz => {
          const isCompleted = completedQuizzes.includes(quiz.key);
          return (
            <TouchableOpacity
              key={quiz.key}
              style={[styles.quizCard, isCompleted && styles.quizCardCompleted]}
              onPress={() => startQuiz(quiz.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.quizIcon, { backgroundColor: quiz.color + '15' }]}>
                {isCompleted ? (
                  <CheckCircle2 size={28} color={Colors.success[500]} />
                ) : (
                  <Brain size={28} color={quiz.color} />
                )}
              </View>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              <Text style={styles.quizDescription}>{quiz.description}</Text>
              <View style={[styles.quizAction, { borderColor: quiz.color }]}>
                <Text style={[styles.quizActionText, { color: quiz.color }]}>
                  {isCompleted ? 'Retake' : 'Start'}
                </Text>
                <ArrowRight size={16} color={quiz.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {completedQuizzes.length === 4 && (
        <View style={styles.allCompleteCard}>
          <Sparkles size={24} color={Colors.accent[500]} />
          <Text style={styles.allCompleteText}>All quizzes complete! Check your profile for your full personality breakdown.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  pageHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text, marginTop: Spacing.sm },
  pageSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 4 },
  quizGrid: { gap: Spacing.md },
  quizCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  quizCardCompleted: { borderColor: Colors.success[100], backgroundColor: Colors.success[50] },
  quizIcon: { width: 56, height: 56, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  quizTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  quizDescription: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  quizAction: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 6 },
  quizActionText: { fontSize: FontSizes.sm, fontWeight: '600' },
  allCompleteCard: { backgroundColor: Colors.accent[50], borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md },
  allCompleteText: { flex: 1, fontSize: FontSizes.sm, color: Colors.accent[700], fontWeight: '500', lineHeight: 20 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  quitText: { fontSize: FontSizes.md, color: Colors.error[500], fontWeight: '600' },
  quizProgress: { fontSize: FontSizes.sm, color: Colors.neutral[500], fontWeight: '500' },
  progressBar: { height: 4, backgroundColor: Colors.neutral[200], marginHorizontal: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary[500], borderRadius: 2 },
  questionContainer: { padding: Spacing.lg },
  questionText: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text, lineHeight: 30 },
  optionsContainer: { flex: 1 },
  optionsContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  optionCardSelected: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  optionIndicator: { width: 24, height: 24, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.neutral[300] },
  optionIndicatorSelected: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, fontSize: FontSizes.md, color: Colors.text, fontWeight: '500' },
  optionTextSelected: { color: Colors.primary[700], fontWeight: '600' },
  resultHeader: { alignItems: 'center', paddingVertical: Spacing.xl },
  resultTitle: { fontSize: FontSizes.lg, color: Colors.textSecondary, marginTop: Spacing.md },
  resultPersonality: { fontSize: FontSizes.xxxl, fontWeight: '800', marginTop: 4 },
  resultDescription: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
  scoresSection: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  scoresTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  scoreLabel: { width: 80, fontSize: FontSizes.sm, fontWeight: '600' },
  scoreBar: { flex: 1, height: 8, backgroundColor: Colors.neutral[100], borderRadius: 4, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 4 },
  scoreValue: { width: 30, fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  resultActions: { flexDirection: 'row', gap: Spacing.md },
  resultButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.primary[500] },
  resultButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.primary[500] },
});
