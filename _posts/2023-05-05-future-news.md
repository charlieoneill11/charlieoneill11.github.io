---
layout: post
title: How I'd build the future of news
date: 2025-01-15
description: Notes from Rake
tag: ai
---

I think, somewhere between the toy app we have now and [_What is the future of Rake_]({% post_url 2023-03-03-future-rake %}), we will see a rapid shift in the evolution of news that hopefully Rake will be a part of. This has happened in many industries; AirBnB for accomodation, Uber for transportation, Spotify for music, and so on. I don't really know what the word for it is apart from turning a discrete industry more continuous. 

So what I'm picturing is a platform where "artists" (aka journalists) upload "songs" (aka chunks of information pertaining to specific news stories) for "listeners" (readers) to read the synthesised news stories. 

So how do we get people/journalists to start uploading chunks? How do we monetise this and value contributions from people? I think it starts by allowing people to connect their Twitter accounts to the Rake news platform. This would allow us to incorporate Tweets and little *tidbits* of information into the news articles. Whilst [[Elon Musk]] has made it hard to scrape X, I think we can either (1) get away with small amounts using a basic access Developer API account, or (2) just figure out how to do it subtly since we don't need masses of data and can make very specific searches.

We would then move to people actually almost "tweeting" on our app itself. These tweets would be listed in some sort of feed, like Twitter, but the key bit would be how we take all this information and synthesise it into the articles. (A few tangential questions here: do we even need a feed, or can we keep it hidden? How do we stop ourselves from becoming a Twitter summariser?) We could have formatted (e.g. highly refined journalistic pieces) and unformatted contributions (e.g. your grandmother heard from someone that Mossad actually knew about the Hamas attacks on October 7th). The more reliable a contribution is, the more likely it is to be included in articles and thus the more the artist/journalist gets paid. **This allows us to democratise journalism.** 

A cool part of this is the localisation of information. For instance, by your friends contributing stuff, Rake can show you ultra-personalised content, with not just local news but news within your friendship circles. This would be great for distant family members getting news about weddings, or even spreading achievements in communities ("Did you hear so-and-so won that PhD scholarship??")

Of course, this necessitates a whole host of (likely transformer-based) algorithms to determine the factuality and usefulness of contributions, but I think this would actually be a tractable problem when you consider the mass of information (i.e. actual articles plus contributions plus general social media scraping); it would be easy enough to figure out the factual "core" of a story that is undisputed and then the fluffy bits around the edges. In addition to this, we can get users themselves to upvote/downvote contributions, with features like Community Notes in X to monitor the value of contributions.

The personalisation of the content of specific articles is a different story. This is still a problem we need to solve, but it will involve everything from altering how the article is synthesised/written (e.g. style, length based on education level and age) to our plug-ins (e.g. the plug-in that inserts information about stock performance relevant to the article and the reader's portfolio) to location-specific personalisation and much more. (And again, personalisation of what articles to show in the first place is a whole different can of worms, based on our RecSys). 