---
title: "From WhatsApp Lists to Agentic Workflows: A Pickleball Side Project"
date: 2026-10-21
category: tech
tags: AI React TypeScript Vite 'GitHub Pages' WhatsApp
published: true
---

Recently, I started working on a small webapp for our pickleball signups. Nothing too grand! Just something to help with a routine that our group has been doing through WhatsApp.

The organiser posts the game details, followed by a numbered list of 16 players and a waitlist. Those who want to join copy the message, add their names, and post it back. When someone pulls out, the list gets updated again, with the first person on the waitlist moving into the playing list.

It serves its purpose. But it also seemed like a good opportunity to build something useful, starting with a problem that was already quite clear.

So, my pickleball signup webapp came about.

## Keeping things familiar

I did not want to replace WhatsApp. That is still where we chat and make arrangements.

The idea was simply to move the signup list somewhere it could be maintained without everyone having to copy and paste it. Share a game link in the group, open the page, and join. If the game is full, the next player goes on the waitlist. When a place opens up, the first waitlisted player moves in automatically.

The conversation stays where it is. The bookkeeping moves to the app.

It sounds straightforward when written that way!

## A few buttons, quite a few decisions

Once the requirements were being worked through, the small details started becoming important.

What happens when two people try to get the last available place? What if someone taps Join twice? If a player withdraws and then decides to join again, should that person get the old position back?

These are situations that are easy enough to discuss in a group chat. An app, however, needs a consistent answer.

For this project, a player can have only one active registration per game. Withdrawing and rejoining means going to the back of the queue. Closing registration stops new joins, but still allows players to withdraw.

This is where spec-driven development became useful. Not the production of a lengthy document, but the process of making expectations clear before treating an implementation as complete.

"Build a signup page" is a starting point. Describing what should happen when two people compete for the last spot gives us something more useful to build and test.

Those requirements also became important in how I worked with the AI agents.

## Beyond something that looks finished

I used AI agents to help build, test, and deploy the application. That was an important part of this project, not just getting assistance with writing the code, but working through how the output could move from one environment to another.

I chose **GitHub Pages** because I was already using it for my blog's static content and a few side projects. It was familiar ground, so it made sense to use it for this one too.

The fully automated workflow was a bonus! It brought out something that I find particularly interesting about working with agentic platforms: the **handoff**.

The work does not have to begin and end in the same platform. An agent can produce changes in one environment, and those changes can become the input to the next stage of building, testing, or deployment. GitHub provides a shared place for the code and versioned database migrations, while the **GitHub Actions** workflow builds and publishes the frontend to GitHub Pages.

This means I do not have to bring everything onto my laptop, build it there, test it there, and deploy it from there before the work can move forward.

For those less familiar with sandbox environments, I think of them here as separate working spaces where an agent can carry out a task. The important question is not whether all the work happened in one space, but whether the next environment has what it needs to continue.

That puts more emphasis on clear requirements, tracked changes, repeatable steps, and results that can be checked. An agent saying that something is done is one thing. Being able to pass its output along and verify that it works is another.

For this project, the checks included database acceptance tests, browser testing at mobile and desktop sizes, and simultaneous attempts to take the last available place. The browser tests used temporary accounts against the live database, with the test data removed afterwards.

So, this was not only an exercise in getting agents to produce an application. It was also an exercise in letting the work travel between platforms without making my laptop the required stop in the middle.

That was how the work moved towards deployment. Behind the deployed application, there was another set of responsibilities to put in the right places.

## A small frontend, with the rules behind it

The frontend uses `React`, `TypeScript`, and `Vite`, and is published as a static site on GitHub Pages. `Supabase` provides authentication, a `PostgreSQL` database, and live updates. Resend handles email delivery. There is no separate, always-running application server for me to maintain for the core signup workflow.

"Static" describes how the frontend is hosted, not what players can do with it. The browser loads the application from GitHub Pages, then communicates with Supabase to sign players in, retrieve games, and carry out signup actions.

### Signing in and getting back to the game

Players sign in using an email magic link rather than a password. After signing in for the first time, they choose a display name. Access to the group is controlled through invite links.

There is a small but important detail here. Someone might open a game link inside WhatsApp, then open the sign-in email in a different browser. The implementation carries the intended game or invite destination in the return URL, so the journey does not depend only on information stored in the original browser. Those destinations are also validated rather than accepting arbitrary redirects.

The implementation also includes an optional confirmation step for sign-in links, intended to prevent automated email-link scanners from consuming the one-time link before the player gets to it.

Quite a few considerations behind what should feel like a simple "email me a sign-in link" button!

### Keeping the queue fair

The database maintains an ordered queue of active registrations for each game. Every registration receives a database-assigned queue number. The first players up to the game's capacity form the playing list, and the remaining players form the waitlist.

When someone withdraws, their registration is excluded from the active queue. If they were in the playing list, the first waitlisted player then falls within the playing capacity, without an organiser having to move the name manually.

All signup-changing operations lock the relevant game record while making their changes. This includes joining, withdrawing, organiser removals, and capacity changes. It prevents competing requests from independently claiming the same last available place. Fairness is therefore based on the order in which valid join operations are processed by the database, not the moment someone believes they tapped the button.

The screens receive live updates through Supabase Realtime. They also refresh when a browser tab regains focus, after a connection is restored, and after an action. The database remains the source of truth, rather than each browser trying to predict the final list.

In less technical terms, several people may have the page open, but there should still be only one answer to the question, "Am I playing?"

### Putting permissions behind the screen

The app has player, organiser, and administrator roles, but the protection is not limited to showing or hiding buttons.

Supabase Row Level Security controls access to the data. Client applications cannot write directly to the tables. Instead, changes go through database functions that check the user's identity, membership, and permissions before performing an action.

A player should not be able to remove another player simply by finding the right request to send. The database needs to reject that operation too. Player email addresses are also kept out of roster responses.

### Following through on a promotion

Moving a player off the waitlist records a notification in an outbox table as part of the database operation. A Supabase Edge Function processes those notifications and sends the emails through Resend.

Before sending, it checks that the player is still playing and that the game has not been cancelled or finished. Failed deliveries are retried with increasing delays, and each promotion has an idempotency key, a unique identifier used to prevent retries from creating duplicate emails.

This separates two responsibilities: securing the player's place and telling the player about it. A temporary email problem should not undo a valid promotion.

There is more happening behind the page than the player needs to see. Hopefully, what they experience is much simpler: sign in, join the game, and know where they stand.

Whether it actually feels that straightforward is something I need to learn from the people using it, not just from the implementation and its tests.

## Letting my kakis have a go

I am now letting my pickleball kakis at work test the webapp, and I am gathering their feedback and suggestions.

I want to see whether the status is clear, whether the actions are easy to find, and whether anything needs more explanation. They will bring their own expectations of how signing up for a game should work. Something that seems clear to me may still need explaining to someone else.

That is what I am hoping to learn during this testing period. Not just whether they can join a game, but whether they can do so without having to think too much about the app. The aim, after all, is to get their names on the list and let them get on with their day.

## A small project to keep learning

There is something quite encouraging about working on a problem close to home. The scope is small enough to describe, the people who will try it are people I know, and the outcome is something we can use together.

It also gives me a practical way to think about specifications, agents, and testing. These can become rather big topics when discussed on their own. With this project, there is a simple question to come back to: will this help our group manage signups more easily?

For me, that is the learning opportunity. Take a familiar process, work through the decisions behind it, and put the result in front of people who can tell me what I have missed.

I am looking forward to hearing what my kakis think. Hopefully, the webapp will eventually become something they hardly need to think about at all. More time looking forward to the game, and less time looking for the latest list. :D
