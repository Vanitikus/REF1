export function StatsBar() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard value="1,247" label="Obiecte recuperate" color="emerald" />
      <StatCard value="3,891" label="Posturi active" color="blue" />
      <StatCard value="89%" label="Rata de succes" color="amber" />
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-xl p-3 text-center ${colorMap[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] opacity-80">{label}</div>
    </div>
  );
}
