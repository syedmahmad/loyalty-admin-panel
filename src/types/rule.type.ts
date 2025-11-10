type Condition = {
  condition_type: string;
  condition_operator: string;
  condition_value: string;
};

export type FormType = {
  ruleBasicInfo: {
    locales: Record<
      string,
      {
        name: string;
        description: string;
      }
    >;
  };
  rule_type: string; // e.g. "event based earn"
  reward_condition: string; // e.g. "minimum"
  min_amount_spent: string;
  reward_points: string;
  event_triggerer: string;
  max_redeemption_points_limit: string;
  points_conversion_factor: string;
  max_burn_percent_on_invoice: string;
  condition_type: string;
  condition_operator: string;
  condition_value: string;
  validity_after_assignment: number;
  frequency: string; // e.g. "once"
  conditions: Condition[];
  is_priority: number;
  business_unit_id: string;
};
