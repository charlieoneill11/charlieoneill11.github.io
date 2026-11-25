---
layout: post
title: A weekend of machine mathematics
date: 2026-11-25
description: Six results, some miscalibration, and a rush I'd only felt at the pokies
math: true
tag: ai
---

> *There is a flash out of the corner of one’s eye, out of the corner of one’s room, where the clouds outside are pink and orange behind the bridge, and then you look up and there is nothing but grey grey grey.*

(I wrote that while working on this late on a rainy SF afternoon. I'm not sure what it has to do with the following, but it felt appropriate.)

The world is now somewhat inundated with people releasing significant maths results, without explanation, on the internet. I'm doing the same, but I'd like to offer a little transparency into what this took and what the process looked like. I confined my work to essentially a weekend, I have no background beyond the mathematics you would encounter in undergrad, and I certainly don't fully understand the results I'm releasing. However, I now appreciate to some extent what it's like to slip into AI psychosis, the lethargic adrenaline rush you get as you see the spinning wheel in Codex. The need to stay up because you think that one more nudge, one potentially interesting observation from you in another session, might just tip everything over the edge into a completed proof.

In a sense, it's much like gambling. I haven't felt this specific type of rush outside the casino or the pokie machines (Australian term for slot machines). I understand how a mathematician can be furious. How dare this insolent, aggressively hubristic AI researcher spend a few thousand dollars in API credits, with almost no intellectual input, to achieve something that once took us many years, maybe even decades? (I'm not saying my results are that important, I'm just saying that's a reasonable estimate of how long they might have taken a reasonably strong mathematician without LLMs.) And I understand them, but I am greedy, and perhaps more defensibly a pragmatist, and I believe that if a scientific result has been discovered it should be made available, regardless of how it was achieved, or who achieved it.

## How I began

Last week Levente Alpöge posted a proof of the Riemann Hypothesis and the Generalised Riemann Hypothesis for Dirichlet $$L$$-functions, with a [Lean formalisation](#TODO-LINK). Apart from being excited (and patting oneself on the back, once again, for believing the scaling laws), my other reaction was selfish. A huge amount of number theory has likely been written in the conditional mood for a century. Surely some of that ground was open in a way it wasn't a week ago. It felt a bit like having some alpha in a Polymarket strategy; if you moved fast enough, you could probably capitalise on it, but the next model or other mathematicians trying the same thing would quickly eat that alpha up.

I began by talking to Astra and trying to get a lay of the land by understanding which results were stated assuming RH, which had finished arguments, which were partial, and so on. I thought there must be places where people had stopped working because RH seemed like the real obstacle. This seemed like a promising category to me. A lot of conditional results became unconditional the moment we had Riemann, e.g. Cramér's bound on prime gaps, the deterministic Miller primality test, and plenty of others. That's all well and good, but there's nothing for anyone to do there. What I wanted were problems where the conditional literature was thin, because why would you push hard on a conditional bound, and where a few more ideas might buy a lot of progress.

I came up with three: the sixth moment of zeta, nonvanishing of quadratic $$L$$-functions at the central point, and primes between consecutive powers. I then tried to basically crapshoot for three more that might in some weird way benefit from Riemann, but these didn't end up needing it.

## The six results

I will try to state these results as simply as I understand them. Each has its own page with the PDF and the code ([link](#TODO-LINK)).

- **The sixth moment of zeta.** If you average $$\lvert\zeta(\tfrac12 + it)\rvert^6$$ up to height $$T$$, it grows like a constant times $$T(\log T)^9$$. Random matrix theory predicts the constant (normalised) should be 42. The best lower bound was 41.008. We get 41.6406. This is a big improvement in the gap (and improves significantly on what [OpenAI released recently](#TODO-LINK)).
- **Quadratic $$L$$-functions at $$\tfrac12$$.** Chowla conjectured that $$L(\tfrac12, \chi_d)$$ is never zero. We show it's nonzero for more than 94.53% of fundamental discriminants, up from 94.27%. It was a very small improvement but actually quite hard to get.
- **Primes between powers.** Legendre's conjecture says there's always a prime between $$n^2$$ and $$(n+1)^2$$. Nobody can prove it, even with RH. We prove there's a prime between $$n^{11/5}$$ and $$(n+1)^{11/5}$$ for every $$n$$. The analytic argument handles everything above 35 trillion, and a computation handles everything below. While we were at it, we checked Legendre's conjecture itself up to $$10^{14}$$, past the previous record of $$7.05 \times 10^{13}$$. That sweep was about 59 trillion interval checks run on Blaxel sandboxes on Baseten, and it produced 51.69 TB of certificates.
- **Least prime in an arithmetic progression.** For more than 58.7% of moduli $$n$$, every reduced residue class mod $$n$$ contains a prime below $$Cn^{2-\delta}$$. This one is a short note, but it's a clean explicit proportion.
- **Hadwiger–Nelson.** How many colours do you need so that no two points in the plane at distance exactly 1 share a colour? Since the recent proof that five colours aren't enough, the answer is 6 or 7. So if 7 is the truth, there's some finite unit-distance graph that can't be 6-coloured, and the question is how big it has to be. We show every unit-distance graph with at most 10,689 vertices is 6-colourable (previously 6,992), and the same for every graph with at most 245,510 edges, however many vertices it has (previously 232,645).
- **Seven-cycle.** A question from information theory about how many "confusable" words you can avoid when sending signals over a noisy channel shaped like a 7-cycle. We show $$\alpha(C_7^{\boxtimes 4}) \le 112$$ and $$\alpha(C_7^{\boxtimes 5}) \le 392$$, down from 115 and 401. Both bounds are proved in Lean.

## I was quite miscalibrated

To contextualise my maths background, I did maths in undergrad, and that's about it. I'm strong at ML-related maths but haven't touched anything like this stuff in several years. I could understand the landscape Astra laid out at a high level. The picture was basically "RH is the big wall, wall has come down, now sprint". Perhaps with RH in hand we could get the sixth moment to 42 or even prove Legendre outright.

That was wrong but rather instructive. RH removes one obstacle, but most of these problems have several obstacles and the others are just as hard. (This, if anything, was a chance to learn some interesting maths.) For example, Legendre's conjecture doesn't follow from RH at all. Even assuming RH, the classical argument gives primes in intervals of length about $$\sqrt{x} \log x$$, and squares need intervals of length about $$2\sqrt{x}$$.

So in hindsight I picked problems that were suboptimal for the size of jump I imagined. The results are real improvements, some quite large, and even show why certain strategies will or won't work, but they're increments on hard problems, not resolutions. I don't think that's a bad outcome. But part of the lesson is that understanding why a problem is hard is its own skill, and I didn't have it.

The clearest example is from the first night on zeta. About an hour in, I told Astra we could assume RH and GRH and to "push push push" and "bring it home", by which I meant prove 42. It came back with "the coefficient 42 remains open, including under RH and GRH". And it not only failed but also showed that our approach could only ever get to 41.998 instead of 42. Hence no amount of optimising those inputs could ever get there. When I asked for the path forward, it went further and said that even the most optimistic version of the route we were on would top out around 41.707.

Models seemed to be very good at squeezing a framework, e.g. finding the next term to bound more carefully or spotting two cases that could be merged, and were much worse at saying when a whole approach capped out and realising we needed a new idea. When they did produce something that felt new, it usually came from combining known tools in an unusual order, not from inventing a tool. I'm not sure whether that's a deep limitation or just where we are this month.

My interactions with these models eventually tipped into something like mania. You know you should stop. You know the marginal hour of your attention is worth less than the hour of sleep. But the loop is so tight, and the reward so frequent, that you're basically addicted. I've had a milder version of this with training runs, and this was much stronger.

I don't have a neat conclusion about this. Partly I think it's a genuinely new experience that more people are going to have. Partly it's probably a warning to myself.

## I wasn't bitter-lesson pilled enough

The biggest mistake I probably made was intervening too much. I kept stopping the models to either understand what they were doing (which felt responsible) or sometimes to steer them towards an idea I liked or saw in another session. And often to pass along results from other threads working on other problems, when I thought there might be a connection. That cross-pollination was nothing more sophisticated than fuzzy string matching on my end, to be clear.

It worked a couple of times. But looking back, most of the progress came when I left a thread alone for hours. I probably should have put them in a goal loop with a clear objective and a checker and let them cook.

The one place I do think a human hand helped was in switching modes. I found I had to alternate the models between two kinds of work: brute-forcing the current approach (optimise this parameter, extend this table, certify this inequality), and stepping back to think about the broader picture (what is this approach actually capable of, what would a different subfield do here). Left alone, they'd tend to stay in whichever mode they were in.

## Open-weight models did it too

I also wondered how much of this maths gave way due to the specific capabilities of the frontier models I used, or whether it was more about where models in general are now.

So we went back and rederived the main results using open-weight models, DeepSeek and Kimi. They got there on all of the major results, some of them with hints. We will share more of a writeup on this shortly.

As far as I can tell, this is among the first times open-weight models have produced progress of this size on well-known open problems. Earlier open-model results were mostly small numerical improvements to bounds, things like the fourth or fifth decimal place of an autocorrelation constant.

## QED

We lament our value only when it passes; it is only natural to do so. There are few who have been able to do the things we are now seeing machines do. I have nothing but the utmost respect for those who did it properly and well, on the stanchions of their own intelligence, thoughts earned honestly. There is little I can say about the tidal wave of artificial minds ossifying that ability into the stones of history books that hasn't already been said. But perhaps I can still say this: your thoughts etched the grooves in the silicon we now use to replace you, and there are some who appreciate that. Not appreciate that you are getting replaced; appreciate what it took to do so.
