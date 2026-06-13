import { getDashboardStats, getTodaySchedule, getUpcomingAlerts } from "@/actions/dashboard";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { UpcomingAlerts } from "@/components/dashboard/upcoming-alerts";

export default async function DashboardPage() {
  const [stats, todaySchedule, upcoming] = await Promise.all([
    getDashboardStats(),
    getTodaySchedule(),
    getUpcomingAlerts(),
  ]);

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TodaySchedule bookings={todaySchedule} />
        <UpcomingAlerts bookings={upcoming} />
      </div>
    </div>
  );
}
