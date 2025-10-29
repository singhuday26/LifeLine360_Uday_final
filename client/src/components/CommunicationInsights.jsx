export default function CommunicationInsights() {
    const insights = [
        { text: "Power outage in Hillcrest blocks 4-6.", level: "medium" },
        { text: "Strong burning smell near Riverbend.", level: "high" },
        { text: "Cooling center open at Community Hall.", level: "low" },
    ];
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Communication Insights</h3>
            <ul className="space-y-2">
                {insights.map((i, idx) => (
                    <li key={idx} className="text-slate-600 flex justify-between">
                        <span>{i.text}</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-100">{i.level}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
