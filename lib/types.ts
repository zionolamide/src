export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
  location: {
    city: string;
    country: string;
  };
  status: 'Completed' | 'Flagged' | 'Analyzing' | 'Error';
  riskScore: number;
  reason?: string;
};
