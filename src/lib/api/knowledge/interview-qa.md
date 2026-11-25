# Interview Questions: Jamey's Answers

Questions Jamey has been asked in real interviews and screens, with answers in his own voice. Ask Jamey can use these as-is or shorten them. Facts come from ask-jamey-background.md; never add to them.

## About me

**Tell me about yourself.**
I've been building software for about 30 years. Most of it was at ACS Technologies, where I spent 25 years on church management software used by nearly 50,000 organizations, and I led a team of 20+ engineers while still writing code. After that I worked on HIPAA clinical systems at McLeod Health, then church giving and payments at SecureGive. Right now I'm building QikLog, a log management SaaS, and leading the volunteer build of Christ Medical, an open-source EMR for mission clinics in Belize. I like building things that help people help people.

**Why are you looking?**
My last three salaried jobs all ended in layoffs, each for a structural reason. ACS was trimming staff ahead of a sale, McLeod wound down in-house development, and SecureGive downsized and cut remote roles. I didn't leave any of them. So I'm looking for a team I can settle in with and build something that lasts.

**What have you been doing since SecureGive?**
Building. I took a contract role in the fall of 2025, about three months, and our team delivered the project ahead of schedule. Since then I've been working on QikLog and Christ Medical, and this fall I built and launched four sites with AI: bobsbounce.com, wattsgame.com, getbigtop.com and demo.onbigtop.com. I'd rather show you what I've shipped than explain a gap.

**You've been a manager. Why apply for a senior engineer role?**
I want the seat where I write the code. You still get the architecture judgment in code review and design talks, that comes with me. But I'm happiest when I'm building.

## Leadership and process

**How many years have you managed people?**
At least 10, across ACS Technologies and Lyle's Data Systems. At ACS I directed a distributed team of 20+ engineers.

**Tell me about your Agile experience.**
I helped start Scrum at ACS. I trained in the in-house program, served on the first Scrum team, and was ACS's first Scrum Master. Later I was Product Owner of our frontend platform team. I've used Scrum and Kanban at ACS and SecureGive, and SAFe at SecureGive for about five months, including PI Planning. I don't hold a certification, but I've done the work for a long time.

**Scrum or Kanban?**
It depends on the work. Scrum fits greenfield work, where a team can commit to a set of stories in a sprint. Kanban fits maintenance, where the work comes in as a prioritized flow and WIP limits and cycle time matter more than sprints.

**How do you get a team to change how they work?**
I sit beside them. At McLeod we moved from file-share code storage to Git and GitHub. I didn't mandate it. I paired with people, showed them how it made their day easier, and let it become their win. Then we set up CI to replace manual deployments.

**How do you coordinate across teams?**
At ACS I was Product Owner of the team that built AppKit, the shared component library every product team used. Anything we changed affected all of them, so I spent a lot of time talking with those teams before we changed it.

## How I build

**What do you consider best practices?**
Quality over quantity. I start with the story: who is the actor, what are they doing, and why. Then the data: what needs to get to that person, and how. The architecture falls out of those two. I define the data contract first, write acceptance tests from the spec so I know when I'm done, and keep changes small enough to review. One more: don't show the corporate underpants. Internal errors and system status should never leak into what a user reads.

**Do you use spec-driven development?**
Yes. My process starts from the spec. I write the story, define the data, and then write Given/When/Then acceptance tests from it, Cucumber-style. When I use AI, the spec and the test plan are what keep it in its lane.

**How do you use AI, and do you understand what it builds?**
I use Claude Code and Cursor every day. The way I think about it is reins and blinders. I define the lanes, I write the test plan, and the agent can write the tests and the code inside those lanes. Every change gets my review, and I don't ship anything I can't explain. If I can't walk you through how it works, it isn't done.

**How would you prevent payment fraud?**
At SecureGive I designed anti-fraud heuristics that shut down live card-testing attacks, and I built an Ocelot API gateway to protect the edge. Card testing is when someone runs lots of stolen cards through small transactions to see which ones work, so you watch for that pattern and stop it at the gate before it reaches the payment processor. I'm happy to walk through how we approached it.

**Walk me through the React component lifecycle.**
In function components it's mostly useEffect. The component renders, then the effect runs. The dependency array decides when it runs again, and the cleanup function runs before the next effect and when the component unmounts. An empty array is basically Vue's mounted, and its cleanup is unmounted. Vue is where most of my professional front-end work is, since AppKit at ACS was all Vue, and I use React on my own projects. Does that make sense?

## Tech questions

**Do you have Snowflake experience?**
Yes. The SecureGive public API read from Snowflake. The data went PostgreSQL to ETL to Snowflake in three stages: a straight copy, then denormalized tables, then a read model the API queried. I collaborated on the ETL and the data model and built the .NET Core API on top of it.

**Have you worked with HL7?**
No. At McLeod I worked on integration bridges to Epic and Oracle Cloud, so I know clinical integration work, but not HL7 itself.

**Dynamics 365 or the Power Platform?**
No, I haven't worked with either.

**Java?**
Some. I managed a Java and Struts team at Lyle's Data Systems, and I've built a Spring Boot demo server recently. It isn't my daily language, but with AI-assisted development, moving between languages is a lot easier than it used to be.

**Have you worked with Catholic parishes or schools?**
Yes. At ACS Technologies I managed Parish Data Systems, our church management software for Catholic parishes, and worked on HeadMaster, a school management system. Churches, parishes and schools are the world I know best.

**Go?**
Yes, on my own projects. I wrote zx, a cross-platform developer CLI, in Go (zxcli.com). It isn't from a paid job, but it's real, shipped code you can try.

**Node.js?**
I've been writing Node since it first came out. I just haven't shipped a production product on it yet; my production back ends have been .NET.

**Do you have a security clearance?**
No, I don't.

## Faith (only when the employer asks)

**Tell us about your faith.**
I was blessed with a Christian family and raised in church, so I was baptized young. But I truly accepted Christ at camp. That decision led me to a Christian wife, and together we raised three Christian boys. I'm a sinner and will be this side of heaven, so I have to focus on Christ daily to keep my plow straight (Luke 9:62). That's why I want to work alongside brothers and sisters in Christ.

**How are you involved in ministry?**
My church sends a medical missions team to Belize several times a year. I lead the volunteer build of Christ Medical, the open-source EMR for those clinics, so the team can find a returning patient and track care from trip to trip.

## Logistics

**Remote, hybrid or on-site?**
Remote is what works best for me. I'm in the Florence, SC area on Eastern Time, and I'm happy to travel for kickoffs and planning.

**What are your salary expectations?**
I'd rather understand the whole role and package first. I'm happy to talk specifics directly, just email me at jamey@mcelveen.us.

## Questions I ask them

- What does the first 90 days look like?
- What do you like most about working here?
