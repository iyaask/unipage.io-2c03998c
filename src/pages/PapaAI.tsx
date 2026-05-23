import PapaAIChat from "@/components/chat/PapaAIChat";
const PapaAI = () => {
  return <div className="container mx-auto py-2 md:py-6 px-2 md:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Papa AI</h1>
          <p className="text-gray-600 text-sm md:text-base px-4">Your AI assistant here to help you with all your needs</p>
        </div>
        <PapaAIChat />
      </div>
    </div>;
};
export default PapaAI;