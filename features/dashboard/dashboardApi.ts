import { api } from '../../services/api';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalBatches: number;
  attendanceRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface FinancialDataPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface AttendanceDataPoint {
  day: string;
  rate: number;
}

export interface BatchDistributionPoint {
  batchName: string;
  students: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
  charts: {
    financial: FinancialDataPoint[];
    attendance: AttendanceDataPoint[];
    batchDistribution: BatchDistributionPoint[];
  };
  recentNotices: any[];
  recentHomework: any[];
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => 'api/dashboard/stats',
      providesTags: ['Student', 'Teacher', 'Batch', 'Attendance', 'Fee', 'Notice', 'Homework'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
