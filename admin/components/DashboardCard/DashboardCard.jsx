import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACCENTS = {
  blue: { border: 'border-l-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  green: { border: 'border-l-green-500', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  amber: { border: 'border-l-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  red: { border: 'border-l-red-500', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  purple: { border: 'border-l-purple-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  indigo: { border: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  orange: { border: 'border-l-orange-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  teal: { border: 'border-l-teal-500', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
};

export default function DashboardCard({ title, value, icon: Icon, description, accent = 'blue', loading = false }) {
  const colors = ACCENTS[accent] || ACCENTS.blue;

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 border-l-4 ${colors.border}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {Icon && (
          <span className={`flex items-center justify-center h-8 w-8 rounded-lg ${colors.iconBg}`}>
            <Icon className={`h-4 w-4 ${colors.iconColor}`} />
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <div className="h-7 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-100 animate-pulse mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
