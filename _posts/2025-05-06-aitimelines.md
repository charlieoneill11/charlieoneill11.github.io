---
layout: post
title: Five Hinge‑Questions That Decide Whether AGI Is Five Years Away or Twenty
date: 2025-05-06
description: For people who care about falsifiable stakes rather than vibes
math: true
---

# TL;DR

All timeline arguments ultimately turn on five quantitative pivots. Pick optimistic answers to three of them and your median forecast collapses into the 2026–2029 range; pick pessimistic answers to any two and you drift past 2040. The pivots (I think) are:

Which empirical curve matters (hardware spend, algorithmic efficiency, or revenue)

Whether software‑only recursive self‑improvement (RSI) can accelerate capabilities faster than hardware can be installed.

How sharply compute translates into economic value once broad “agentic” reliability is reached.

Whether automating half of essential tasks ignites runaway growth or whether Baumol’s law keeps aggregate productivity anchored until all bottlenecks fall

How much alignment fear, regulation, and supply‑chain friction slow scale‑up

The rest of this post traces how the canonical short‑timeline narrative [AI 2027](https://ai-2027.com/) and the long‑timeline essays by [Ege Erdil](https://epoch.ai/gradient-updates/the-case-for-multi-decade-ai-timelines) and [Zhendong Zheng + Arjun Ramani](https://zhengdongwang.com/2023/06/27/why-transformative-ai-is-really-really-hard-to-achieve.html) diverge on each hinge, and proposes concrete bets that will force regular public updates.

# Shared premises

* Six doublings in frontier training compute between GPT‑2 (2019) and GPT‑4 (2023)
* GPT‑4‑level systems demonstrably replace some cognitive tasks
* Alignment is non‑trivial; nobody claims a free deployment lunch

Agreement in the forecasting/timelines community ends at the tempo question.


# Hinge #1: Which curve do we extrapolate?

The first divide concerns what exactly we should project into the future. Short‑timeline advocates emphasise frontier‑training compute and algorithmic efficiency, or even just the general amalgamation of all benchmarks as "intelligence extrapolation". They point to six straight doublings in effective training FLOP between GPT‑2 and GPT‑4, and they cite scaling‑law papers showing a 1.6x yearly reduction in compute required to reach any fixed loss. This is the engine behind the claim in AI 2027, that “CapEx grows one hundred‑fold in four years.” Long‑timeline authors reply that the best public proxy for capital actually deployed (NVIDIA datacentre revenue, which [I think is a flawed metric for other reasons](https://x.com/charles0neill/status/1919552149392130325)) stopped growing exponentially after the ChatGPT launch. Either you extrapolate benchmark/efficiency performance and hope that eventually gets you to automation, or you only believe if the work itself is actually automated, which is what Erdil is trying to proxy with NVIDIA's revenue.

Overall, I think it's a good argument for the long-timelines side that we've still automated less than probably 0.5% of US GDP with AI. Reasoning models outperform most human mathematicians on FrontierMath, yet we have not seen a single peer‑reviewed theorem produced end‑to‑end by an LLM.[^1] If benchmarks elsewhere are saturating, then there's likely a large disconnect between how economically useful an AI is and progress on evaluation suites + benchmarks (also there's probably unintentional cheating plus overfitting on hillclimbed metrics; for more see [here](https://www.lesswrong.com/posts/4mvphwx5pdsZLMmpY/recent-ai-model-progress-feels-mostly-like-bullshit)).

A bet follows naturally. If by the fourth quarter of 2026 NVIDIA’s datacentre revenue and the combined AI capital expenditures of Google, Meta, OpenAI, etc have doubled year‑over‑year, the hardware curve is still exponential and the short camp scores a point. If they have not, the long camp’s “curve‑bend” story gains credibility.


# Hinge #2: Can software‑only recursive self‑improvement outrun atoms?

The second hinge asks whether capability can compound inside existing datacentres faster than the physical economy can supply new wafers, power, and cooling. Short‑timeline writers emphasise the rise of agentic research assistants. They note that Devin, Claude Code, etc can complete medium‑sized GitHub projects, etc etc. Once a model designs better chips, compilers, or curricula, capability doublings might come from pure code for a year or two - the classic “foom” or “phase transition.”

Erdil’s rejoinder is empirical. Every major algorithmic breakthrough so far (attention, RLHF, mixture routing) consumed between a thousand and a hundred‑thousand GPU‑days of brute‑force experimentation. Experimentation, in turn, is limited by hardware delivery times and energy budgets. Data, too, is finite: the [Villalobos et al.](https://arxiv.org/abs/2211.04325) paper suggests we exhaust high‑quality language data this decade.

I'm more sympathetic to long timelines once again. Operator, Devin, and Anthropic’s workstation agent still regularly fail a task as mundane as booking a round‑trip flight with seat selection. Devin has all these [stories](https://www.answer.ai/posts/2025-01-08-devin.html) of it being successful about 5-20% of the time in the real-world. If we cannot yet automate a travel clerk, claims about near‑total remote‑work automation feel premature. There's also a strong bottleneck argument around compute and real-world data which people have made countless times, and I'm not sure where I stand on.

A testable prediction is to watch wall‑clock time for frontier training runs. If the fastest models trained in mid‑2027 require one‑quarter the elapsed time of equally large runs eighteen months earlier without a node shrink below four nanometres, that will be strong evidence that software‑only acceleration is real, and is not highly bottlenecked by compute or real-world experiments slowing the AI researchers down. 


# Hinge #3: How efficient (and how sudden) is the leap from compute to economic value?

Current AI, even after ChatGPT, earns roughly ten‑thousand dollars per H100‑GPU‑year. This is a figure Erdil emphasises precisely because it equals world GDP per capita. Short‑timeline thinkers retort that this measure hides a looming discontinuity. Once reliability crosses the human median, the "train once, deploy many" property kicks in: the marginal cost of the N‑th copy collapses to server depreciation and a few cents of electricity. They also foresee specialised inference hardware such as NVIDIA’s Blackwell or Groq or whatever, plus sparsity and mixture routing, pushing cost per useful token down by two orders of magnitude. Moreover, value is highly uneven: AlphaFold’s acceleration of drug discovery might be worth many millions of average coders.

Long‑timeline writers respond that newer, more agentic models already need one to three orders of magnitude more reasoning tokens per answer, so the inference cost trend is rising, not falling.

A bet here is to revisit revenue per deployed H100 by the end of 2027.  If the number exceeds one‑hundred‑thousand dollars, the efficiency threshold the short camp predicts has arrived. If it remains close to today’s ten‑thousand, the sceptics will have been vindicated.


# Hinge #4: Must we automate everything, or is half enough?

Here the argument turns to macroeconomic theory. Short‑timeline narratives imagine a reaction wheel: once half of remote cognitive labour is cheap, wages plummet, capital reallocates, and the remaining physical bottlenecks fall rapidly because swarms of AI engineers will design better robots, batteries, and even fusion plants. They also note that GDP composition can migrate; maybe more and more value lives in purely digital goods, so traditional [Baumol constraints](https://en.wikipedia.org/wiki/Baumol_effect) vanish.

Zheng and Ramani retort that William Baumol’s law is brutal. Aggregate productivity is throttled by the slowest essential sector, whether that's housing, logistics, healthcare, and energy. For intance, electricity and the internet each boosted sectoral productivity by a factor of a thousand but raised frontier GDP per capita growth by less than one percentage point. Unless AI swiftly unlocks safe autonomous robotics, cheap power, and fast construction, growth will be stuck.

A decisive empirical milestone is whether any G7 country manages three straight years of six‑percent real GDP‑per‑capita growth before general‑purpose manipulation robots are common. If that occurs, the reaction‑wheel model wins.


# Hinge #5: Alignment‑driven and institutional drag

Finally, even if capability and economics line up, society might want us to slow down anyway. Regulation is already thickening. Physical bottlenecks appear in grid interconnect queues, water‑cooling permits, and limited HBM memory supply. Alignment worries form a special drag: Anthropic’s [Responsible Scaling Policy](https://www.anthropic.com/news/anthropics-responsible-scaling-policy) and OpenAI’s [Preparedness Framework](https://openai.com/index/updating-our-preparedness-framework/) both envision voluntary pauses.

Short‑timeline optimists counter with the Manhattan‑mode story: once states perceive an existential threat or an opportunity for decisive advantage, they bulldoze barriers. The AI 2027 scenario predicts permissive special‑economic zones where training can continue at maximum speed, while regulators lag behind.

We can measure drag directly. One bet is that, by January 2028, at least one top‑three lab publicly delays a frontier model six or more months for safety reasons. Another is that U.S. datacentre megawatt backlogs fall below six months by 2027 and export‑control stringency remains at 2024 levels.



# Dependency Structure

These hinges are not independent.  If the hardware and algorithmic curves keep doubling, software‑only RSI is more plausible. If RSI works, agent efficiency is likelier to jump and GDP could surge even before robots. On the other hand, strong alignment or regulatory brakes can nullify the whole chain. In practice, pessimistic answers to any two hinges probably push full‑replacement timelines into the 2040 s; optimistic answers to at least three make the late‑2020 s credible.

<div style="margin: 4em 0;"></div>

Timeline debates are tractable because they hinge on the above five measurable questions, at least to me. We do not need oracular insight, only discipline: decide which side of each hinge you occupy, publish your odds, and update when the world issues new datapoints. The difference between an AGI in 2027 and one in 2047 may feel philosophical, but it will ultimately be written in SEC filings, power‑grid spreadsheets, and lab press releases. Let us read those, not the vibes.



[^1]: Reasoning models are better than basically all human mathematicians, but still haven't produced one novel mathematical result, suggesting a disconnect between benchmarks and actual real-world use. For instance, if a human gets 25% on FrontierMath (ie Terence Tao), we assume they'll produce great maths research because we know those things to be very correlated. However, the correlation doesn't necessarily hold for LLMs: we could have just hillclimbed on the FrontierMath benchmark and overfitted to that.