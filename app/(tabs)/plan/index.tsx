import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Modal, FlatList, Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { Map, Plus, Trash2, ChevronRight, Target, GraduationCap, Wrench, Briefcase, CircleCheck as CheckCircle2, Circle, CreditCard as Edit3, X } from 'lucide-react-native';

interface Plan {
  id: string;
  name: string;
  career_id: string;
  is_active: boolean;
  steps: PlanStep[];
  careers?: { id: string; title: string };
}

interface PlanStep {
  id: string;
  title: string;
  description: string;
  type: 'goal' | 'school' | 'skill' | 'internship' | 'job';
  completed: boolean;
}

interface Career {
  id: string;
  title: string;
}

const STEP_TYPES = [
  { key: 'goal', label: 'Goal', icon: Target, color: Colors.primary[500] },
  { key: 'school', label: 'School', icon: GraduationCap, color: Colors.secondary[500] },
  { key: 'skill', label: 'Skill', icon: Wrench, color: Colors.accent[500] },
  { key: 'internship', label: 'Internship', icon: Briefcase, color: Colors.warning[500] },
  { key: 'job', label: 'Job', icon: CheckCircle2, color: Colors.success[500] },
] as const;

export default function PlanScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepType, setNewStepType] = useState<string>('goal');

  const loadData = useCallback(async () => {
    if (!user) return;
    const [planRes, careerRes] = await Promise.all([
      supabase.from('future_plans').select('*, careers:careers(id, title)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('careers').select('id, title').order('title'),
    ]);
    if (planRes.data) setPlans(planRes.data as unknown as Plan[]);
    if (careerRes.data) setCareers(careerRes.data as Career[]);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const createPlan = async () => {
    if (!user || !newPlanName.trim()) return;
    await supabase.from('future_plans').insert({
      user_id: user.id,
      name: newPlanName.trim(),
      career_id: selectedCareerId,
      steps: [],
      is_active: true,
    });
    setShowCreateModal(false);
    setNewPlanName('');
    setSelectedCareerId(null);
    loadData();
  };

  const deletePlan = async (planId: string) => {
    if (!user) return;
    await supabase.from('future_plans').delete().eq('id', planId);
    if (activePlanId === planId) setActivePlanId(null);
    loadData();
  };

  const addStep = async () => {
    if (!user || !activePlanId || !newStepTitle.trim()) return;
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    const newStep: PlanStep = {
      id: Date.now().toString(),
      title: newStepTitle.trim(),
      description: newStepDesc.trim(),
      type: newStepType as PlanStep['type'],
      completed: false,
    };

    const updatedSteps = [...(plan.steps || []), newStep];
    await supabase.from('future_plans').update({ steps: updatedSteps, updated_at: new Date().toISOString() }).eq('id', activePlanId);
    setShowAddStepModal(false);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepType('goal');
    loadData();
  };

  const toggleStep = async (planId: string, stepIndex: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const updatedSteps = [...plan.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], completed: !updatedSteps[stepIndex].completed };
    await supabase.from('future_plans').update({ steps: updatedSteps, updated_at: new Date().toISOString() }).eq('id', planId);
    loadData();
  };

  const deleteStep = async (planId: string, stepIndex: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const updatedSteps = plan.steps.filter((_, i) => i !== stepIndex);
    await supabase.from('future_plans').update({ steps: updatedSteps, updated_at: new Date().toISOString() }).eq('id', planId);
    loadData();
  };

  const getStepIcon = (type: string) => {
    const found = STEP_TYPES.find(t => t.key === type);
    return found || STEP_TYPES[0];
  };

  const activePlan = plans.find(p => p.id === activePlanId);
  const completedSteps = activePlan?.steps?.filter(s => s.completed).length || 0;
  const totalSteps = activePlan?.steps?.length || 0;
  const progressPct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Map size={28} color={Colors.primary[500]} />
        <Text style={styles.headerTitle}>Future Plans</Text>
      </View>

      {plans.length === 0 ? (
        <View style={styles.emptyState}>
          <Map size={48} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptySubtitle}>Create a roadmap to your dream career</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Create Your First Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.plansList}>
            {plans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, activePlanId === plan.id && styles.planCardActive]}
                onPress={() => setActivePlanId(activePlanId === plan.id ? null : plan.id)}
              >
                <View style={styles.planCardHeader}>
                  <View style={styles.planCardInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.careers && <Text style={styles.planCareer}>{plan.careers.title}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => deletePlan(plan.id)} style={styles.deleteButton}>
                    <Trash2 size={16} color={Colors.error[500]} />
                  </TouchableOpacity>
                </View>
                {plan.steps && plan.steps.length > 0 && (
                  <View style={styles.planProgress}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${(plan.steps.filter(s => s.completed).length / plan.steps.length) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{plan.steps.filter(s => s.completed).length}/{plan.steps.length} steps</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addPlanButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={20} color={Colors.primary[500]} />
            <Text style={styles.addPlanText}>Add New Plan</Text>
          </TouchableOpacity>

          {activePlan && (
            <View style={styles.roadmapSection}>
              <View style={styles.roadmapHeader}>
                <Text style={styles.roadmapTitle}>{activePlan.name}</Text>
                {totalSteps > 0 && (
                  <Text style={styles.roadmapProgress}>{Math.round(progressPct)}% complete</Text>
                )}
              </View>

              {totalSteps > 0 && (
                <View style={styles.roadmapProgressBar}>
                  <View style={[styles.roadmapProgressFill, { width: `${progressPct}%` }]} />
                </View>
              )}

              {activePlan.steps && activePlan.steps.length > 0 ? (
                <View style={styles.stepsList}>
                  {activePlan.steps.map((step, i) => {
                    const stepType = getStepIcon(step.type);
                    return (
                      <View key={step.id} style={styles.stepRow}>
                        <TouchableOpacity onPress={() => toggleStep(activePlan.id, i)} style={styles.stepCheck}>
                          {step.completed ? (
                            <CheckCircle2 size={24} color={Colors.success[500]} />
                          ) : (
                            <Circle size={24} color={Colors.neutral[300]} />
                          )}
                        </TouchableOpacity>
                        <View style={[styles.stepIcon, { backgroundColor: stepType.color + '15' }]}>
                          <stepType.icon size={18} color={stepType.color} />
                        </View>
                        <View style={[styles.stepContent, step.completed && styles.stepContentCompleted]}>
                          <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>{step.title}</Text>
                          {step.description ? <Text style={styles.stepDesc} numberOfLines={1}>{step.description}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => deleteStep(activePlan.id, i)} style={styles.stepDelete}>
                          <X size={16} color={Colors.neutral[300]} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptySteps}>
                  <Text style={styles.emptyStepsText}>No steps yet. Add your first step below.</Text>
                </View>
              )}

              <TouchableOpacity style={styles.addStepButton} onPress={() => setShowAddStepModal(true)}>
                <Plus size={18} color={Colors.primary[500]} />
                <Text style={styles.addStepText}>Add Step</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Plan</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Plan name (e.g., Game Designer Path)"
              placeholderTextColor={Colors.neutral[400]}
              value={newPlanName}
              onChangeText={setNewPlanName}
            />
            <Text style={styles.modalLabel}>Dream Career (optional)</Text>
            <ScrollView style={styles.careerPicker} showsVerticalScrollIndicator={false}>
              {careers.map(career => (
                <TouchableOpacity
                  key={career.id}
                  style={[styles.careerOption, selectedCareerId === career.id && styles.careerOptionSelected]}
                  onPress={() => setSelectedCareerId(selectedCareerId === career.id ? null : career.id)}
                >
                  <Text style={[styles.careerOptionText, selectedCareerId === career.id && styles.careerOptionTextSelected]}>
                    {career.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={createPlan}>
              <Text style={styles.modalButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddStepModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Step</Text>
              <TouchableOpacity onPress={() => setShowAddStepModal(false)}>
                <X size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Step Type</Text>
            <View style={styles.stepTypeRow}>
              {STEP_TYPES.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.stepTypeChip, newStepType === type.key && { backgroundColor: type.color + '15', borderColor: type.color }]}
                  onPress={() => setNewStepType(type.key)}
                >
                  <type.icon size={16} color={newStepType === type.key ? type.color : Colors.neutral[400]} />
                  <Text style={[styles.stepTypeText, newStepType === type.key && { color: type.color }]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Step title"
              placeholderTextColor={Colors.neutral[400]}
              value={newStepTitle}
              onChangeText={setNewStepTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.neutral[400]}
              value={newStepDesc}
              onChangeText={setNewStepDesc}
              multiline
            />
            <TouchableOpacity style={styles.modalButton} onPress={addStep}>
              <Text style={styles.modalButtonText}>Add Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.neutral[500] },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.neutral[400], textAlign: 'center' },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary[500], borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginTop: Spacing.md },
  createButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  scrollContent: { paddingHorizontal: Spacing.md },
  plansList: { gap: Spacing.md, marginBottom: Spacing.md },
  planCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  planCardActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planCardInfo: { flex: 1 },
  planName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  planCareer: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  deleteButton: { width: 32, height: 32, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  planProgress: { marginTop: Spacing.sm },
  progressBar: { height: 4, backgroundColor: Colors.neutral[100], borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary[500], borderRadius: 2 },
  progressText: { fontSize: FontSizes.xs, color: Colors.neutral[500], marginTop: 4 },
  addPlanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, borderStyle: 'dashed' },
  addPlanText: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.primary[500] },
  roadmapSection: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md },
  roadmapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  roadmapTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  roadmapProgress: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary[500] },
  roadmapProgressBar: { height: 6, backgroundColor: Colors.neutral[100], borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.lg },
  roadmapProgressFill: { height: '100%', backgroundColor: Colors.primary[500], borderRadius: 3 },
  stepsList: { gap: Spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepCheck: { padding: 2 },
  stepIcon: { width: 32, height: 32, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepContentCompleted: { opacity: 0.5 },
  stepTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  stepTitleCompleted: { textDecorationLine: 'line-through', color: Colors.neutral[400] },
  stepDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  stepDelete: { width: 28, height: 28, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  emptySteps: { paddingVertical: Spacing.lg, alignItems: 'center' },
  emptyStepsText: { fontSize: FontSizes.sm, color: Colors.neutral[400] },
  addStepButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, borderStyle: 'dashed' },
  addStepText: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.primary[500] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  modalLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  modalInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  careerPicker: { maxHeight: 200, marginBottom: Spacing.md },
  careerOption: { paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: 4 },
  careerOptionSelected: { backgroundColor: Colors.primary[50] },
  careerOptionText: { fontSize: FontSizes.md, color: Colors.text },
  careerOptionTextSelected: { color: Colors.primary[600], fontWeight: '600' },
  modalButton: { backgroundColor: Colors.primary[500], borderRadius: BorderRadius.md, paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.sm },
  modalButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.white },
  stepTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  stepTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  stepTypeText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.neutral[500] },
});
