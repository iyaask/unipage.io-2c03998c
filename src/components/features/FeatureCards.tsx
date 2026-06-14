import { Sparkles, GraduationCap, Trophy, ArrowRight } from "lucide-react";

const FeatureCards = () => {
  const features = [
    {
      id: 1,
      number: "500+",
      title: "Bursary Opportunities",
      description: "Advanced AI algorithm to access thousands of funding opportunities matched to your profile",
      icon: Sparkles,
      bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
      cardColor: "bg-white/90 backdrop-blur-sm",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      arrowBg: "bg-green-500"
    },
    {
      id: 2,
      number: "AI-Powered",
      title: "Course Matching",
      description: "Smart algorithms analyze your grades to find courses you qualify for",
      icon: GraduationCap,
      bgColor: "bg-gradient-to-br from-slate-500 to-slate-600",
      cardColor: "bg-white/95 backdrop-blur-sm",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      arrowBg: "bg-white/20"
    },
    {
      id: 3,
      number: "90%",
      title: "Success Rate",
      description: "Students find their ideal course and funding within minutes with PapaAI",
      icon: Trophy,
      bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
      cardColor: "bg-white/90 backdrop-blur-sm",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      arrowBg: "bg-blue-500"
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {features.map((feature, index) => (
        <div
          key={feature.id}
          className={`${feature.bgColor} p-1 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className={`${feature.cardColor} p-6 rounded-3xl relative overflow-hidden group`}>
            {/* Arrow button */}
            <div className={`absolute top-4 right-4 w-10 h-10 ${feature.arrowBg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            
            {/* Icon */}
            <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mb-4`}>
              <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-800">{feature.number}</div>
              <div className="text-lg font-semibold text-gray-700">{feature.title}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;