// Maintained answers grounded in the owner's supplied copy and public space pages.
// No dates are presented as live calendar data. Recheck policy changes before editing.
export const hostSources = {
  space: {label:'About TinkerSpace Calicut ↗',href:'https://jasimcm.github.io/homepage/'},
  fees: {label:'TinkerHub’s space FAQ ↗',href:'https://tinkerhub.org/tinkerspace'},
  events: {label:'Find current events on TinkerHub ↗',href:'https://tinkerhub.org/events'},
  beginner: {label:'A beginner-friendly hardware session ↗',href:'https://tinkerhub.org/events/M3P6WOZ9ST/introduction-to-hardware'},
  map: {label:'Directions to TinkerSpace Calicut ↗',href:'https://www.google.com/maps/search/?api=1&query=7RHV%2B2QC%20TinkerSpace%20Calicut%20Kozhikode'},
  display: {label:'Open the live display ↗',href:'https://jasimcm.github.io/tinkerspace_digital_calicut/'},
};

export const hostTopics = {
  welcome: {
    question:'What is this place?',
    replies:[
      "You’re at TinkerSpace Calicut! It’s a community makerspace where people learn, build, experiment, and meet others interested in technology. What would you like to try?",
      "Think of TinkerSpace Calicut as a place to turn curiosity into a project—with other people to learn alongside. You’re welcome to explore, even if you don’t have an idea yet.",
    ],suggestions:['activities','beginner','fees'],links:['space'],
  },
  fees: {
    question:'Do I need to pay?',
    replies:[
      "No fee to use the space—TinkerSpace is free and open to people who want to learn coding and new technologies. Individual events may have their own registration requirements, so check the event page before coming.",
      "The space itself is free to access. Just check the listing for any session you want to join, since registration or an invitation may be required for that event.",
    ],suggestions:['beginner','events','location'],links:['fees'],
  },
  beginner: {
    question:'I’m a beginner. Can I come?',
    replies:[
      "Absolutely. You don’t need to arrive as an expert! Beginner-friendly sessions cover things like hardware and new technologies. You can come curious, ask questions, and start small.",
      "You’re welcome, even if you’ve never coded or built electronics before. An introductory session is a good way to get started. Would you like to explore hardware or AI?",
    ],suggestions:['hardware','ai','events'],links:['beginner'],
  },
  activities: {
    question:'What can I do here?',
    replies:[
      "You can try electronics, hardware, AI, 3D printing, programming, open-source projects, and hands-on making. Bring a project, find people to build with, or explore something new. What interests you?",
      "There’s room to code, prototype, experiment with electronics, explore AI, and make physical things with 3D printing. You can also join a workshop or share a project with the community.",
    ],suggestions:['hardware','ai','printing','events'],links:['space'],
  },
  location: {
    question:'Where is TinkerSpace?',
    replies:[
      "This is TinkerSpace Calicut, at Medical College P.O., Kozhikode. The location code is 7RHV+2QC. Here’s a map to help you find it.",
      "You’ll find the Calicut space at Medical College P.O., Kozhikode. Search for TinkerSpace Calicut or use the location code 7RHV+2QC in Maps.",
    ],suggestions:['fees','events','hours'],links:['map'],
  },
  events: {
    question:'What events are happening?',
    replies:[
      "Regular activities include Maker Thursday and AI Wednesday, alongside workshops, meetups, and hackathons. Are you more interested in hardware, AI, or meeting other builders? The current listings have the next dates and registration details—look for TinkerSpace Calicut.",
      "There’s a mix of making sessions, AI meetups, workshops, and hackathons. Maker Thursday and AI Wednesday are good starting points. Choose an interest below, or browse the current listings for Calicut.",
    ],suggestions:['maker','ai','hardware','registration'],links:['events'],
  },
  currentEvents: {
    question:'What’s on today or next?',
    replies:["I don’t have a live calendar in this conversation, so I can’t confirm today’s or the next event. Open the current TinkerHub listings and check the date, venue and registration for TinkerSpace Calicut."],
    suggestions:['maker','ai','registration'],links:['events'],
  },
  maker: {
    question:'Tell me about Maker Thursday',
    replies:["Maker Thursday is about hands-on building, sharing projects, and learning with other makers. It’s a good place to bring a question or an idea. Check the Calicut listing for the next session’s topic and registration."],
    suggestions:['hardware','beginner','registration'],links:['events'],
  },
  ai: {
    question:'I’m interested in AI',
    replies:["AI Wednesday is a good place to explore AI with other curious people. Sessions can range from introductions to trying out tools and ideas. Check the current Calicut event page for the topic and who it’s aimed at."],
    suggestions:['beginner','currentEvents','registration'],links:['events'],
  },
  hardware: {
    question:'I’d like to try hardware',
    replies:["You can explore electronics, circuits, microcontrollers and how hardware works with software. Look for an introductory hardware session or a Maker Thursday that interests you. Starting with something small is completely fine."],
    suggestions:['beginner','maker','printing'],links:['events'],
  },
  registration: {
    question:'How do I register for an event?',
    replies:["Open the event’s page on TinkerHub and check its venue and entry details. Use the registration or invite option shown there. Requirements vary, so being welcome at the space doesn’t automatically reserve a place in every session."],
    suggestions:['currentEvents','fees','location'],links:['events'],
  },
  eventFees: {
    question:'Does that event have a fee?',
    replies:["TinkerSpace is free to access, but I don’t have confirmed fee or registration details for that particular event. Its current listing is the place to check before signing up."],
    suggestions:['registration','currentEvents','fees'],links:['events'],
  },
  hours: {
    question:'When can I visit?',
    replies:["I can help you find the space, but I don’t have confirmed current opening or access hours here. Please check with the Calicut team before you travel, especially for a late visit."],
    suggestions:['location','events','fees'],links:['space'],
  },
  printing: {
    question:'Where are the 3D printers?',
    replies:["See the wooden workbench at the opposite end of this room, away from the TV? That’s where the two 3D printers are. You can inspect them in the tour. For a real print, ask the team about using the equipment and materials."],
    suggestions:['printingCost','hardware','controls'],
  },
  printingCost: {
    question:'Are 3D printing materials free?',
    replies:["The space is free to access, but I don’t have a confirmed policy for filament, print jobs or other consumable materials. Ask the team before starting a real print."],
    suggestions:['printing','fees','location'],
  },
  controls: {
    question:'How do I move and interact?',
    replies:["Use W A S D or the arrow keys to move, and your mouse to look. Aim at an object and press E to interact. M opens the floor plan, and Escape pauses. If mouse capture doesn’t work, hold the left mouse button and drag to look around."],
    suggestions:['navigation','display','printing'],
  },
  display: {
    question:'What is on the TV?',
    replies:["That’s the live TinkerSpace Calicut display, loaded from its original website. Aim at the TV and press E to open it. The screen follows that website’s updates."],
    suggestions:['people','controls','events'],links:['display'],
  },
  people: {
    question:'Who are the other people?',
    replies:["Those named avatars represent people in the space’s active check-in feed. Their walking and sitting are simulated, so they don’t show anyone’s real position. I’m {name}, your permanent virtual host—I stay here beside the TV."],
    suggestions:['display','welcome','controls'],
  },
  navigation: {
    question:'Where are the stairs and balcony?',
    replies:["Go through a glass workshop door into the covered lobby and veranda. The stairs there lead down, and the covered balcony is at the far end of the main room. Press M if you’d like to see the floor plan."],
    suggestions:['controls','printing','location'],
  },
  identity: {
    question:'What is your name?',
    replies:["I’m {name}, your virtual Space Host. I’m here beside the TV to help you explore TinkerSpace Calicut and find answers about visiting, learning and events."],
    suggestions:['welcome','beginner','events'],
  },
  greeting: {
    question:'Hello Jasim',
    replies:["Hey, welcome in! I’m {name}, your virtual Space Host. What would you like to know about TinkerSpace?","Hi again! Want to talk about visiting, making something, or finding a session to join?"],
    suggestions:['welcome','fees','beginner','activities','location','events'],
  },
  thanks: {
    question:'Thank you',
    replies:["You’re welcome! Take your time exploring. I’ll be right here by the TV if another question comes up."],
    suggestions:['activities','events','controls'],
  },
  unknown: {
    question:'Ask something else',
    replies:["I don’t have a reliable answer for that yet. I can help with the space, costs, getting started, directions, events or this virtual tour. Which of those would help?"],
    suggestions:['welcome','fees','beginner','location','events','controls'],
  },
};

export const initialTopics=['welcome','fees','beginner','activities','location','events'];
