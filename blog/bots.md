---
title: Bots System on this Website
description: Why are there "ips banned" on the left side bar? What does it mean?
date: 11.07.2026
time: 19:00
---

In the big (insert year here), AI bots have became more and more popular scraping website data.  
Their only flaw... most of them don't have JavaScript enabled.  

## How does it ban?
At the top of every page on [this website](https://smilt.dev), there is a redirect to a page hidden in the HTML.  
You, cannot see it as you are looking at it with the colors and design that I've made.  

But a bot doesn't see all of that, all it sees: *"Oh! There's a link, gotta go scrape it!"*.  
When it does, the bot gets banned, only leaving a message which lets them contact me, which, I don't think has the ability to do that.

## Why can't I see the link in Inspect Element?
When you load the page, you load up a JS script, which removes the element and the script itself, so you don't even see it!  
I've added that as a security measure, so there are less false positives.
If you do want to see it, you can go to the Page Sources instead.

## Why not use X to prevent bots?
Well, unsure what **X** means, but I do use other sorts of preventing bots and crawlers.  

The domain and website itself is proxied through Cloudflare, where I have [Block AI crawlers & bots](https://www.cloudflare.com/the-net/building-cyber-resilience/regain-control-ai-crawlers/) enabled.  
Server-side, I have [CrowdSec](https://www.crowdsec.net/), which is a way of offering crowdsourced server detection and protection against malicious IPs.  

The bot system on this website is just an extra way to protect myself. Some other good recommendations for blocking IPs and scrapers are [Fail2Ban](https://github.com/fail2ban/fail2ban) and [anubis](https://github.com/TecharoHQ/anubis)!