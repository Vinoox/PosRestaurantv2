export const ORDER_STATUS = {
    Open: 0,
    InPreparation: 1,
    Completed: 2,
    Canceled: 3
} as const;

export const FULFILLMENT_LABELS: Record<string, string> = {
    'Unassigned': 'nieprzypisane',
    'DineIn': 'na miejscu',
    'Takeaway': 'odbiór',
    'Delivery': 'dostawa własna',
    'Services': 'usługi'
};