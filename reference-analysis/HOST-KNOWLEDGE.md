# Jasim's conversation content

Reviewed 20 September 2026. The user named the host Jasim and supplied the six core question/answer examples and the Calicut address: Medical College P.O., Kozhikode; plus code 7RHV+2QC. Personal identity is shown only in runtime UI, never baked into the GLB.

The conversation engine matches questions to curated topics; it does not call an LLM or fetch an event calendar. Source links open the original pages. No fixed event dates or clock times are embedded as current recommendations. Website revisions do not automatically rewrite these answers.

Public cross-checks:

- [TinkerHub's TinkerSpace page](https://tinkerhub.org/tinkerspace): the general FAQ describes free access for learning technology. The page includes several Kochi-specific sections, so facility capacities and timetable hours from it were not transferred to Calicut.
- [Calicut community page](https://jasimcm.github.io/homepage/): community making/learning, free access, broad interests, Maker Thursday and AI Wednesday. Its opening-status copy is internally dated, so it is not used to claim current hours or that the space is still under construction.
- [Calicut Introduction to Hardware listing](https://tinkerhub.org/events/M3P6WOZ9ST/introduction-to-hardware): supports beginner-friendly hardware learning and the Calicut plus code.
- [TinkerHub event listings](https://tinkerhub.org/events): current-event discovery destination. Users are asked to check the venue for TinkerSpace Calicut, along with the date and registration requirements.
- [Calicut GitHub Dev Days listing](https://tinkerhub.foundation/events/V2790ETSNK/Github%20Dev%20Days%20Kozhikode): corroborates the plus code. No completed-event date is presented as an upcoming recommendation.

The free-access answer must not be extended to individual event fees, filament or other consumables. Dedicated follow-up topics state that those details must be checked. Current opening hours, private Wi-Fi credentials and unsupported questions receive a bounded fallback.

Edit `src/host/host-knowledge.js` when policy/content changes, and add recognized phrasings and regression examples in `HostConversation.js` and `tests/host-conversation.test.js`. The browser check covers safe text rendering, keyboard input and responsive chat layout.
