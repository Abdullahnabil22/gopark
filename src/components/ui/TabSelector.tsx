type TabSelectorProps<T extends string> = {
  Tabs: T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
};

export default function TabSelector<T extends string>({
  Tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps<T>) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {Tabs.map((tab) => (
        <button
          key={tab}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
