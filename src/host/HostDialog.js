import {hostConfig} from '../config/host-config.js';
import {HostConversation} from './HostConversation.js';
import {hostTopics} from './host-knowledge.js';

export class HostDialog {
  constructor({onOpen,onClose,onAnswer},config=hostConfig) {
    this.config=config;this.callbacks={onOpen,onClose,onAnswer};
    this.element=document.createElement('section');this.element.id='host-dialog';this.element.className='modal-shell';this.element.hidden=true;
    this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.setAttribute('aria-labelledby','host-title');this.element.setAttribute('aria-describedby','host-description');
    this.element.innerHTML=`<div class="host-card">
      <div class="host-dialog-heading"><div><span class="eyebrow">SPACE HOST · TINKERSPACE CALICUT</span><h2 id="host-title"></h2><p id="host-description"><i aria-hidden="true"></i>Your virtual guide. Ask me about the space.</p></div><button class="host-close" type="button" aria-label="Close conversation">×</button></div>
      <div class="host-messages" role="log" aria-label="Conversation with the Space Host" aria-live="polite" aria-relevant="additions text" tabindex="0"></div>
      <div class="host-suggestions"><p>You could ask</p><div class="host-questions" aria-label="Suggested questions"></div></div>
      <form class="host-composer"><label for="host-question">Ask a question</label><div><input id="host-question" type="text" maxlength="280" autocomplete="off" placeholder="Ask Jasim something…"><button type="submit" class="host-send" disabled>Send <span aria-hidden="true">↑</span></button></div></form>
      <div class="host-dialog-footer"><button type="button" class="host-reset">Start over</button><button type="button" class="host-back">Back to the room <span aria-hidden="true">↗</span></button></div>
    </div>`;
    document.body.append(this.element);
    this.element.querySelector('#host-title').textContent=config.name;
    this.input=this.element.querySelector('input');this.input.placeholder=`Ask ${config.name} something…`;
    this.log=this.element.querySelector('.host-messages');this.log.setAttribute('aria-label',`Conversation with ${config.name}`);
    this.list=this.element.querySelector('.host-questions');this.sendButton=this.element.querySelector('.host-send');
    this.element.querySelector('form').onsubmit=e=>{e.preventDefault();this.submit(this.input.value);};
    this.input.oninput=()=>{this.sendButton.disabled=!this.input.value.trim();};
    this.element.querySelector('.host-close').onclick=()=>this.close();this.element.querySelector('.host-back').onclick=()=>this.close();
    this.element.querySelector('.host-reset').onclick=()=>{this.reset();this.input.focus();};
    this.onKey=e=>{if(this.element.hidden)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close();}};
    document.addEventListener('keydown',this.onKey,true);
    this.onResize=()=>{if(this.isOpen)this.log.scrollTop=this.log.scrollHeight;};window.addEventListener('resize',this.onResize);
    this.reset();
  }
  get isOpen(){return !this.element.hidden;}
  open(){if(this.isOpen)return;this.previousFocus=document.activeElement;this.element.hidden=false;this.callbacks.onOpen?.();this.element.querySelector('.host-close').focus();this.log.scrollTop=this.log.scrollHeight;}
  close(){if(!this.isOpen)return;this.element.hidden=true;this.previousFocus?.focus();this.callbacks.onClose?.();}
  reset(){this.conversation=new HostConversation(this.config.name);this.log.replaceChildren();this.input.value='';this.sendButton.disabled=true;const greeting=this.conversation.greeting();this.append('host',greeting.text);this.suggest(greeting.suggestions);}
  submit(question,topic=null){
    const text=String(question).trim().slice(0,280);if(!text)return;
    const reply=this.conversation.reply(text,topic);if(!reply)return;
    this.append('visitor',text);this.append('host',reply.text,reply.links);this.suggest(reply.suggestions);
    this.input.value='';this.sendButton.disabled=true;this.input.focus();this.callbacks.onAnswer?.();
  }
  append(role,text,links=[]){
    const message=document.createElement('article');message.className=`host-message host-message-${role}`;
    const speaker=document.createElement('span');speaker.className='host-speaker';speaker.textContent=role==='host'?this.config.name:'You';
    const content=document.createElement('p');content.textContent=text;message.append(speaker,content);
    if(links.length){const refs=document.createElement('div');refs.className='host-message-links';for(const {label,href} of links){const link=document.createElement('a');link.textContent=label;link.href=href;link.target='_blank';link.rel='noopener noreferrer';refs.append(link);}message.append(refs);}
    this.log.append(message);
    // Local to this visit; never sent to a server or saved in browser storage.
    while(this.log.children.length>41)this.log.firstElementChild.remove();
    this.log.scrollTop=this.log.scrollHeight;
  }
  suggest(ids){
    this.list.replaceChildren();
    for(const id of ids){const topic=hostTopics[id];if(!topic)continue;const button=document.createElement('button');button.type='button';button.textContent=topic.question;button.dataset.topic=id;button.onclick=()=>this.submit(topic.question,id);this.list.append(button);}
    this.log.scrollTop=this.log.scrollHeight;
  }
  dispose(){document.removeEventListener('keydown',this.onKey,true);window.removeEventListener('resize',this.onResize);this.element.remove();}
}
