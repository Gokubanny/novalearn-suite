import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  basic: {
    maxStudents: 500,
    maxLecturers: 10,
    storageGB: 5,
    features: [],
    label: 'Basic',
  },
  pro: {
    maxStudents: 2000,
    maxLecturers: 50,
    storageGB: 50,
    features: ['ai_assistant', 'advanced_analytics', 'full_notifications', 'priority_support'],
    label: 'Pro',
  },
  enterprise: {
    maxStudents: Infinity,
    maxLecturers: Infinity,
    storageGB: Infinity,
    features: [
      'ai_assistant',
      'advanced_analytics',
      'facial_recognition',
      'full_notifications',
      'custom_integrations',
      'priority_support',
    ],
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
    if (!user?.institutionId) {
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from('institutions')
        .select('subscription_plan')
        .eq('id', user.institutionId!)
        .single();

      if (data?.subscription_plan) {
        setPlan(data.subscription_plan as SubscriptionPlan);
      }
      setIsLoading(false);
    };

    fetch();
  }, [user?.institutionId]);

  const canAccess = useCallback(
    (feature: GatedFeature) => PLAN_CONFIGS[plan].features.includes(feature),
    [plan],
  );

  const limits = PLAN_CONFIGS[plan];

  return { plan, isLoading, canAccess, limits };
}
