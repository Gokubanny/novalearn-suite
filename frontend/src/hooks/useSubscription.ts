import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { schoolService } from '@/services/school.service';

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export type GatedFeature =
  | 'ai_assistant'
  | 'advanced_analytics'
  | 'facial_recognition'
  | 'full_notifications'
  | 'custom_integrations'
  | 'priority_support';

interface PlanConfig {
  maxStudents: number;
  maxLecturers: number;
  storageGB: number;
  features: GatedFeature[];
  label: string;
}

const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  basic: { maxStudents: 500, maxLecturers: 10, storageGB: 5, features: [], label: 'Basic' },
  pro: {
    maxStudents: 2000, maxLecturers: 50, storageGB: 50,
    features: ['ai_assistant', 'advanced_analytics', 'full_notifications', 'priority_support'],
    label: 'Pro',
  },
  enterprise: {
    maxStudents: Infinity, maxLecturers: Infinity, storageGB: Infinity,
    features: ['ai_assistant','advanced_analytics','facial_recognition','full_notifications','custom_integrations','priority_support'],
    label: 'Enterprise',
  },
};

export function getRequiredPlan(feature: GatedFeature): SubscriptionPlan {
  if (PLAN_CONFIGS.pro.features.includes(feature)) return 'pro';
  return 'enterprise';
}

export function getPlanLabel(plan: SubscriptionPlan): string {
  return PLAN_CONFIGS[plan]?.label ?? 'Basic';
}

export function useSubscription() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>('basic');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      setIsLoading(false);
      return;
    }
    let active = true;
    schoolService.getProfile()
      .then((res) => {
        const p = res.data?.data?.subscription?.plan ?? res.data?.data?.subscriptionPlan;
        if (active && p && PLAN_CONFIGS[p as SubscriptionPlan]) setPlan(p as SubscriptionPlan);
      })
      .catch(() => {})
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [user]);

  const config = PLAN_CONFIGS[plan] ?? PLAN_CONFIGS.basic;
  const canAccess = useCallback(
    (feature: GatedFeature) => config.features.includes(feature),
    [config],
  );
  return { plan, isLoading, canAccess, limits: config };
}
