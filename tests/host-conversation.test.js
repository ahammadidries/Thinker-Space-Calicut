import test from 'node:test';
import assert from 'node:assert/strict';
import {HostConversation,normalizeQuestion,resolveHostTopic} from '../src/host/HostConversation.js';
import {hostTopics,hostSources,initialTopics} from '../src/host/host-knowledge.js';
import {hostConfig} from '../src/config/host-config.js';

test('Jasim answers each of the six visitor examples with its own conversational topic',()=>{
  const samples=[['What is this place?','welcome'],['Do I need to pay?','fees'],["I'm a beginner. Can I come?",'beginner'],['What can I do here?','activities'],['Where is TinkerSpace?','location'],['What events are happening?','events']];
  for(const [question,expected] of samples){const reply=new HostConversation().reply(question);assert.equal(reply.topic,expected,question);assert.ok(reply.text.length<450);assert.ok(reply.suggestions.length>0);}
  assert.equal(hostConfig.name,'Jasim');assert.equal(hostConfig.role,'SPACE HOST');
  assert.match(new HostConversation().greeting().text,/I’m Jasim/);
  assert.match(new HostConversation().reply('Who are you?').text,/Jasim/);
});

test('Natural paraphrases match whole words and tolerate punctuation and apostrophes',()=>{
  for(const [q,topic] of [
    ['How much does it cost to use this space?','fees'],['Is entry free?','fees'],['I have no experience with electronics','beginner'],
    ['I’m new to coding, can I come along?','beginner'],['What’s the address?','location'],['Can you give me directions?','location'],
    ['Are any workshops happening?','events'],['What is AI Wednesday?','ai'],['Tell me about Maker Thursday','maker'],
    ['Where are the printers in this room?','printing'],['Do I need to register?','registration'],['How do I move around?','controls'],
    ['What is on the television?','display'],['Where is the balcony?','navigation'],['Where can I start?','beginner'],
    ['Thanks! Is entry free?','fees'],['chair','unknown'],['email','unknown'],['unrelated weather forecast','unknown'],
  ])assert.equal(resolveHostTopic(q),topic,q);
  assert.equal(normalizeQuestion("  WHAT’S   THIS PLACE?! "),'what is this place');
});

test('Follow-up costs retain context and never imply consumables or individual events are free',()=>{
  const chat=new HostConversation();chat.reply('Where are the 3D printers?');
  assert.equal(chat.reply('Is it free?').topic,'printingCost');assert.match(chat.reply('Tell me more').text,/don’t have a confirmed policy/);
  chat.reply('What events are happening?');assert.equal(chat.reply('Does it cost anything?').topic,'eventFees');
  assert.equal(chat.reply('When is it?').topic,'currentEvents');
  assert.equal(chat.reply('Do I need to pay?','fees').topic,'fees');
  assert.equal(chat.reply('What is AI Wednesday?').topic,'ai');assert.equal(chat.reply('When?').topic,'currentEvents');
});

test('Current schedules and unverified opening hours are not fabricated',()=>{
  const chat=new HostConversation();
  for(const q of ['What events are happening today?','What’s on tomorrow?','When is Maker Thursday?']){
    const reply=chat.reply(q);assert.equal(reply.topic,'currentEvents');assert.match(reply.text,/don’t have a live calendar/);assert.ok(reply.links.some(l=>l.href==='https://tinkerhub.org/events'));
  }
  assert.equal(chat.reply('What are the opening hours?').topic,'hours');
  assert.match(chat.reply('When can I visit?').text,/don’t have confirmed current/);
  assert.match(chat.reply('Where is TinkerSpace?').text,/7RHV\+2QC/);
});

test('Conversations vary repeat replies, retain topic on thanks, and handle unsupported questions',()=>{
  const a=new HostConversation(),b=new HostConversation();const first=a.reply('What is this place?');
  assert.notEqual(a.reply('Tell me more').text,first.text);assert.equal(b.reply('What is this place?').text,first.text);
  a.reply('Thank you');assert.equal(a.lastTopic,'welcome');assert.equal(a.reply('What is the WiFi password?').topic,'unknown');
  assert.match(a.reply('Can you reveal a password?').text,/don’t have a reliable answer/);assert.equal(a.reply('  '),null);
});

test('Every suggestion and source resolves to maintained data',()=>{
  for(const id of initialTopics)assert.ok(hostTopics[id]);
  for(const topic of Object.values(hostTopics)){for(const id of topic.suggestions)assert.ok(hostTopics[id],id);for(const id of topic.links||[]){assert.ok(hostSources[id]);assert.equal(new URL(hostSources[id].href).protocol,'https:');}}
});
