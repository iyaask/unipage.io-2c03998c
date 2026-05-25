export interface BursaryQuestion {
  id: string;
  agentMessage: string;
  type: "single" | "text" | "textarea";
  options?: string[];
  placeholder?: string;
  skippable?: boolean;
}

export const BURSARY_QUESTIONS: BursaryQuestion[] = [
  {
    id: "nationality",
    agentMessage: "Hey there! 👋 I'm your Bursary Agent. Let's find you some funding! First up — are you a South African citizen?",
    type: "single",
    options: ["SA Citizen", "Permanent Resident", "International Student"],
  },
  {
    id: "studentStatus",
    agentMessage: "Cool! And what's your current student status? 🎓",
    type: "single",
    options: ["Currently in Grade 12", "Enrolled in tertiary", "Applying for 2025", "Taking a gap year"],
  },
  {
    id: "institutionType",
    agentMessage: "Where are you headed next? What type of institution? 🏫",
    type: "single",
    options: ["University", "TVET College", "Private Institution", "Not sure yet"],
  },
  {
    id: "fieldOfStudy",
    agentMessage: "What do you want to study? This is key for matching you with the right bursaries! 📚",
    type: "text",
    placeholder: "e.g., Engineering, Medicine, Business, IT",
  },
  {
    id: "academicPerformance",
    agentMessage: "How are your grades looking? Don't worry, there are bursaries for all levels! 📊",
    type: "text",
    placeholder: "e.g., APS: 35 or Average: 75%",
    skippable: true,
  },
  {
    id: "studyYear",
    agentMessage: "What year of study will you be in 2025? 📅",
    type: "single",
    options: ["First year", "Second year", "Third year", "Fourth year", "Postgraduate", "Honours", "Masters", "PhD"],
  },
  {
    id: "otherFunding",
    agentMessage: "Do you currently have any funding or bursaries? 💰",
    type: "single",
    options: ["No current funding", "NSFAS - Full", "NSFAS - Partial", "Other bursary - Full", "Other bursary - Partial"],
  },
  {
    id: "race",
    agentMessage: "This one's optional — some bursaries target specific demographics. How do you identify? 🌍",
    type: "single",
    options: ["African", "Coloured", "Indian", "White", "Prefer not to say"],
    skippable: true,
  },
  {
    id: "gender",
    agentMessage: "And your gender identity? 🙋",
    type: "single",
    options: ["Female", "Male", "Non-binary", "Prefer not to say"],
    skippable: true,
  },
  {
    id: "disabilityStatus",
    agentMessage: "Do you have a disability? Some bursaries specifically support students with disabilities 💪",
    type: "single",
    options: ["Yes", "No", "Prefer not to say"],
    skippable: true,
  },
  {
    id: "homeProvince",
    agentMessage: "What province are you from? 📍",
    type: "single",
    options: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"],
  },
  {
    id: "ruralUrban",
    agentMessage: "What type of area do you live in? 🏡",
    type: "single",
    options: ["Rural", "Urban", "Semi-urban"],
    skippable: true,
  },
  {
    id: "workCommitment",
    agentMessage: "Some bursaries require you to work for the sponsor after graduating. Are you open to that? 🤝",
    type: "single",
    options: ["Yes", "No", "Maybe"],
  },
  {
    id: "extracurriculars",
    agentMessage: "Last one! Any leadership roles, volunteering, or awards? This helps with merit-based matches ⭐",
    type: "textarea",
    placeholder: "Describe your leadership roles, volunteer work, achievements...",
    skippable: true,
  },
  {
    id: "deliveryMethod",
    agentMessage: "Amazing! We're almost done 🎉 How would you like to receive your bursary matches?",
    type: "single",
    options: ["View here in the app", "Send to my WhatsApp"],
  },
];
