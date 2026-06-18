const columns = [
  { key: "applied", label: "APPLIED", color: "bg-[#9DB4C8]" },
  { key: "ghosted", label: "GHOSTED", color: "bg-[#B8AE9C]" },
  { key: "interviewing", label: "INTERVIEWING", color: "bg-[#A8C0C8]" },
  { key: "rejected", label: "REJECTED", color: "bg-[#D89B8C]" },
];

const Tracker = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wider text-foreground/80">
                {col.label}
              </span>
              <span className="text-sm text-muted-foreground">0</span>
            </div>
            <div className={`h-[2px] w-full ${col.color} mb-4`} />
            <p className="text-sm text-muted-foreground">No applications</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tracker;
