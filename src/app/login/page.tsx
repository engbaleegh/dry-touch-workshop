import { ShieldCheck, Calendar, BarChart3 } from "lucide-react";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { LoginForm } from "@/components/auth/login-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/brand/logo";

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const isDev = process.env.NODE_ENV === "development";

  const features = [
    {
      icon: Calendar,
      title: locale === "ar" ? "إدارة الحجوزات" : "Booking Management",
      desc:
        locale === "ar"
          ? "جدولة وتتبع مواعيد العملاء"
          : "Schedule and track customer appointments",
    },
    {
      icon: BarChart3,
      title: locale === "ar" ? "تقارير ذكية" : "Smart Reports",
      desc:
        locale === "ar"
          ? "إحصائيات وتحليلات فورية"
          : "Real-time stats and analytics",
    },
    {
      icon: ShieldCheck,
      title: locale === "ar" ? "آمن وموثوق" : "Secure & Reliable",
      desc:
        locale === "ar"
          ? "حماية بيانات ورشتك"
          : "Protect your workshop data",
    },
  ];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      <div className="gradient-brand hidden flex-1 flex-col justify-between p-8 lg:flex lg:p-12">
        <Logo variant="light" showTagline tagline={dict.app.tagline} size="lg" />

        <div className="space-y-8">
          <div>
            <p className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              {locale === "ar"
                ? "إدارة حجوزات ورشتك بكفاءة"
                : "Manage your workshop bookings efficiently"}
            </p>
            <p className="mt-3 max-w-md text-lg text-slate-400">
              {locale === "ar"
                ? "نظام متكامل للحجوزات والتقويم والتقارير"
                : "Complete system for bookings, calendar, and reports"}
            </p>
          </div>

          <div className="grid gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="rounded-lg bg-amber-500/20 p-2">
                  <f.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm tracking-wider text-slate-500">© 2026 DRY TOUCH</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Logo showTagline tagline={dict.app.tagline} size="sm" />
            <LanguageSwitcher />
          </div>

          <div className="surface-card p-6 sm:p-8">
            <div className="mb-6 hidden items-start justify-between gap-4 lg:flex">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {dict.auth.login}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{dict.auth.loginSubtitle}</p>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="mb-6 lg:hidden">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {dict.auth.login}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{dict.auth.loginSubtitle}</p>
            </div>

            <LoginForm dict={dict} />

            {isDev && (
              <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
                Dev: admin / admin123
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
