import {hostTopics,hostSources,initialTopics} from './host-knowledge.js';

export function normalizeQuestion(value) {
  return String(value??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'")
    .replace(/what's/g,'what is').replace(/where's/g,'where is').replace(/i'm/g,'i am')
    .replace(/can't/g,'cannot').replace(/don't/g,'do not').replace(/isn't/g,'is not')
    .replace(/[^\p{L}\p{N}+]+/gu,' ').trim().replace(/\s+/g,' ');
}

const eventTopics=new Set(['events','currentEvents','maker','ai','hardware','registration','eventFees']);
const cost=/\b(pay|payment|fees?|price|pricing|cost|free|charge[sd]?|expensive|money|subscription|membership)\b/;
const printing=/\b(3d|printers?|printing|filament|print jobs?|consumables?)\b/;
const event=/\b(events?|workshops?|meetups?|hackathons?|sessions?|maker thursdays?|ai wednesdays?)\b/;

export function resolveHostTopic(question,lastTopic=null) {
  const q=normalizeQuestion(question);
  if(!q)return null;
  // Exact suggestion text always selects that topic, including the six supplied examples.
  const exact=Object.entries(hostTopics).find(([,topic])=>normalizeQuestion(topic.question)===q);
  if(exact)return exact[0];
  if(/^(hi|hey|hello|hello there|good morning|good evening)( jasim)?$/.test(q))return 'greeting';
  if(/^(thanks|thank you|thank you jasim|thanks jasim|ok thanks|great thanks|bye|goodbye)$/.test(q))return 'thanks';
  if(/\b(your name|who are you|who is jasim|are you jasim|introduce yourself)\b/.test(q))return 'identity';
  if(cost.test(q)) {
    if(printing.test(q)||(['printing','printingCost'].includes(lastTopic)&&/\b(it|that|this|they|those)\b/.test(q)))return 'printingCost';
    if(event.test(q)||(eventTopics.has(lastTopic)&&/\b(it|that|this|they|those)\b/.test(q)))return 'eventFees';
    return 'fees';
  }
  if(/\b(today|tomorrow|tonight|next|upcoming|this week|this month|schedule|calendar|when|time)\b/.test(q)&&
     (event.test(q)||eventTopics.has(lastTopic)||/\b(what is on|what s on|what is happening)\b/.test(q)))return 'currentEvents';
  if(/\b(register|registration|rsvp|invitation|invite|sign up|how (do|can) i join|book(ing)? (an? )?(event|session|workshop))\b/.test(q))return 'registration';
  if(/\b(opening|hours|open now|open today|24 ?7|anytime|late|midnight|when can i (come|visit)|what time|can i (come|visit) (today|tomorrow|now))\b/.test(q))return 'hours';
  if(/\b(beginner|beginners|newbie|new to|first time|never (coded|built)|no experience|no prior|do not know|cannot code|not an? (engineer|student)|need to be (an? )?(student|engineer)|can i (come|visit)|where (do|can) i start)\b/.test(q))return 'beginner';
  if(/\b(stairs?|staircase|balcony|veranda|lobby|floor plan|exit)\b/.test(q))return 'navigation';
  if(printing.test(q))return 'printing';
  if(/\b(where (is|are) (it|they|that))\b/.test(q)&&['printing','printingCost'].includes(lastTopic))return 'printing';
  if(/\b(where (is|are)|where can i find|where do i go|directions?|address|location|medical college|kozhikode|7rhv|reach (the )?(space|tinkerspace))\b/.test(q))return 'location';
  if(/\b(wasd|keyboard|mouse|controls?|move|moving|walk|interact|jump|sprint|arrow keys)\b/.test(q))return 'controls';
  if(/\b(tv|television|screen|display|dashboard)\b/.test(q))return 'display';
  if(/\b(avatars?|check in|checkin|other people|other users|who (are|is) (here|there|in|the other)|people (here|in))\b/.test(q))return 'people';
  if(/\b(maker thursdays?)\b/.test(q))return 'maker';
  if(/\b(ai|artificial intelligence|machine learning|ai wednesdays?)\b/.test(q))return 'ai';
  if(/\b(hardware|electronics?|circuits?|microcontrollers?|arduino|soldering)\b/.test(q))return 'hardware';
  if(event.test(q)||/\b(what is happening|what s happening|what is on|what s on)\b/.test(q))return 'events';
  if(/\b(what can (i|we) (do|learn|build|make)|activities|facilities|programming|coding|open source|projects?|things to do)\b/.test(q))return 'activities';
  if(/\b(what (is|s) (this|the) (place|space)|what (is|s) tinkerspace|tell me about (this|the|tinker)|makerspace|coworking|co working)\b/.test(q))return 'welcome';
  if(/^(tell me more|more|more please|what about that|and that|can you explain|explain more)$/.test(q)&&lastTopic&&hostTopics[lastTopic])return lastTopic;
  if(/^(when|when is it|what time|what about timings)$/.test(q))return eventTopics.has(lastTopic)?'currentEvents':'hours';
  return 'unknown';
}

export class HostConversation {
  constructor(name='Jasim'){this.name=name;this.lastTopic=null;this.counts=new Map();}
  greeting(){return {topic:'greeting',text:`Hey, welcome in! I’m ${this.name}, your virtual Space Host. What would you like to know about TinkerSpace?`,suggestions:initialTopics,links:[]};}
  reply(question,selectedTopic=null) {
    const topic=selectedTopic&&Object.hasOwn(hostTopics,selectedTopic)?selectedTopic:resolveHostTopic(question,this.lastTopic);
    if(!topic)return null;
    const knowledge=hostTopics[topic],count=this.counts.get(topic)||0;
    this.counts.set(topic,count+1);
    if(!['unknown','greeting','thanks'].includes(topic))this.lastTopic=topic;
    return {topic,text:knowledge.replies[count%knowledge.replies.length].replaceAll('{name}',this.name),suggestions:knowledge.suggestions,links:(knowledge.links||[]).map(id=>hostSources[id])};
  }
}
