---
title: "From WhatsApp Lists to Agentic Workflows: A Pickleball Side Project"
date: 2026-10-21
categories: tech
tags: AI React TypeScript Vite 'GitHub Pages' WhatsApp
published: true
comments: true
---

Recently, I built a small web app for our pickleball signups. We used to coordinate through WhatsApp: an organiser posts the game details, people add their names to a list, and the waitlist moves up when someone drops out. It worked, but it was also a reminder that a spreadsheet-like process is not always easy to run in chat.

I kept WhatsApp for the conversation and moved the signup list into a simple app. Share a game link in the group, open the page, and join. If the game is full, the next player goes on the waitlist; when a slot opens, the first waitlisted person moves in automatically. A few edge cases mattered: duplicate joins, last-slot races, withdrawals followed by rejoining, and organiser removals. I used a lightweight spec-first workflow to define the rules before coding, which made the implementation easier to test and easier to reason about with AI agents.

I used AI agents throughout the build, testing, and deployment flow. The frontend is a static React + TypeScript + Vite app on GitHub Pages. Supabase handles authentication, PostgreSQL data, and live updates; Resend sends emails. There is no separate app server for the core signup workflow. The bigger point was not just producing code. It was making the work travel cleanly between environments. GitHub hosts the code and database migrations, while GitHub Actions builds and publishes the frontend. An agent can work in one environment, hand off its results, and the next environment can continue without needing my laptop in the middle.

The app keeps the queue fair in the database. Each registration gets a queue number, and only the first N players count as active. When someone withdraws, they are removed from the queue and the next waitlisted player is promoted automatically. All signup-changing operations lock the relevant game record so competing requests cannot both claim the same last available slot. Players sign in with an email magic link and choose a display name. Game access is controlled by invite links, and the final destination is preserved across browsers so the redirect still lands in the correct game. The app also includes a confirmation step for sign-in links to avoid automated scanners consuming the one-time link.

Permissions are enforced at the data layer, not just the UI. Supabase Row Level Security restricts writes, and database functions validate the user, membership, and permissions before performing an action. That prevents a player from deleting someone else’s registration by sending the wrong request. When a player is promoted from the waitlist, the database records an email in an outbox and a background function sends it through Resend. It checks that the player is still eligible before sending, retries failed deliveries, and uses an idempotency key to avoid duplicate messages.

I am now letting my pickleball kakis at work try it out. I want to see whether the status is clear, whether the actions are easy to find, and whether anything needs more explanation. The real test is not whether the app works in theory, but whether people can use it without thinking too much about it. If it helps them spend more time on the game and less time managing the list, then it has done its job.
