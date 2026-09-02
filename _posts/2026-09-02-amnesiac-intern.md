---
layout: post
title: The amnesiac intern
date: 2026-09-02
description: Continual learning is not one problem
tag: ai
---

![](/images/continual_learning.jpeg)

Every AI agent today is an amnesiac intern. You can teach it an astonishing amount inside one context window. Then the context window ends, a new intern arrives, and all it has are the notes the previous one left behind. The notes can get better but the intern does not.

This is why continual learning feels like the holy grail of AI research. We have a recipe for creating intelligent machines. What we do not really have is a way for one of those machines to keep learning from experience over long time horizons.

To be clear, I mean a narrower problem than the one the big labs usually care about. They want to take a very general model and update it with the last six months of internet data without breaking too many things. In some manner of speaking, that problem is intractable by definition: you are trying to continuously update an enormous and poorly specified distribution whilst preserving everything useful about the old one.

I care more about the LLM intern ie a model doing one specific job for one company, team or user, even if that job is very agentic. How do we make that model continually learn everything it needs to know to get better at its job?

Humans are at least a proof of existence for this version of the problem.

# The missing layer of memory

Language models are incredibly sample efficient at learning things when the information is inside the context window (arguably more sample efficient than humans). But once you exceed the context window, typically somewhere between hundreds of thousands and around a million tokens, you have to do a bunch of hacky stuff to keep taking advantage of this in-context learning mechanism.

LLMs currently have two native forms of memory. The first is perfectly lossless but very expensive: the context and its KV cache. The model can attend directly to everything that happened, but the cache gets very large very quickly. Full attention over longer sequences is expensive during prefill, KV cache memory grows linearly with sequence length, and it is hard to scale this indefinitely.

The second is incredibly compressed and stable: the weights themselves. An enormous amount of information and capability is packed into them, and retrieving that information at inference time is extremely cheap. But updating the weights without breaking the model is very hard. There is almost nothing in between.

We as a field have therefore pushed on a few different directions.

The first is extending the context window. People have tried linear attention and its variants, where we maintain some fixed-size hidden state that information can be written into, alongside many other tricks for making attention and KV caches cheaper. But we have not really managed to go orders of magnitude beyond current context lengths (around a million tokens) without giving something up. This feels very hard to scale.

The second is building harnesses with stateful memory: memory Markdown files, skill files, natural-language compaction, vector search over old conversations and increasingly elaborate rules for deciding what to load into context. This is hacky, but it is also what has worked best so far.

The third is compressing the context window itself into some learned latent representation.

The third is the direction I am most excited about. Humans do not have a perfectly lossless working memory containing a transcript of everything that has happened to us. Our working memory is tiny and lossy, but we seem able to continuously compress experience into several layers of longer-term memory.

This is what our work on [Still](https://arxiv.org/abs/2606.07878) has been about. It was inspired by work on Cartridges and more analytical compaction methods such as fast KV cache compaction. I think there is now enough evidence to say that this works in some form. We will eventually have granular control over compaction in neural/latent space, rather than being limited to compaction in token space through natural-language summarisation.

Suppose, for now, that we can take a very long context and compress it into a much smaller latent cache without losing much important information. The question then becomes:

> Should we use the information in those caches to update the weights, or should we focus on loading the right cache at inference time?

# Should knowledge be retrieved or baked in?

My initial intuition is that it seems stupid to continually look something up if there is a way to bake it into your brain.

[@justinskycak](https://x.com/justinskycak) (the Math Academy guy, who writes a lot of good stuff on the science of learning) discusses this in terms of automaticity. Through repeated, deliberate practice, especially retrieval practice, foundational knowledge and low-level procedures become deeply embedded in long-term memory. They become instantly and effortlessly available. You no longer have to consciously derive them, reconstruct them or use up scarce working-memory slots every time.

For example, a basketball player does not have to think through how to dribble whilst running a play. The dribbling is automatic, freeing cognitive resources for higher-level decisions. Without automaticity on the basics, everything feels effortful and fragmented.

You can see the same problem with language models. Frontier agents often feel like they spend 95% of their time searching for information, reconstructing what happened previously and rederiving procedures they have already performed many times. If we are going down the route of specialising models for particular jobs anyway, it feels natural that repeatedly useful knowledge and skills should eventually be baked into the weights.

But maybe they don't need to be. Some people argue that if a system (a model plus a harness, memory files, skill files and tools, where everything except the model evolves) functions equivalently to a continual learner, then we do not need to bother with gradient updates. We can trust in-context learning to use whatever is placed in the context window. Our only job is to figure out what to store and what to load.

I think this is probably suboptimal for three reasons.

The first is the boring one: cost. If there is eventually a way to do the same task with 95% fewer tokens (and I do think frontier models spend 95% of their tokens just searching), margin pressure will make the incentives to use it too hard to ignore. If continual learning into weights for specialised models is possible, people will be highly incentivised to pursue it until it works.

The second is skill acquisition. External memory works best when the thing being remembered can be cleanly written down, such as a fact or the location of a database. But many behaviours are difficult to specify explicitly. You do not learn excellent tool use, software engineering or negotiation merely by loading a longer instruction file. There is a reason RL has become so popular for instilling skills after pretraining and for post-training specialisation.

The third, and I think most important, is that hand-engineering a harness does not feel very bitter-lesson-pilled. Maybe it still counts as the Bitter Lesson if the model continuously rewrites its own harness, memory system and retrieval policy. I would be more willing to accept that. But even then, it has to spend a huge number of tokens figuring out how to reduce the number of tokens it spends searching. It never gets around the fact that the underlying model is still an amnesiac intern.

Dwarkesh has a good analogy here. Imagine you are trying to teach someone the trumpet. Every 15 minutes, the student disappears and a new student arrives. The new student has never touched a trumpet. All they have are the notes left by the previous student.

You can make the notes extraordinarily good. But at some point, you probably want the student to actually learn how to play the trumpet.

# The problem is that writing to weights cooks the model

Unfortunately, our work has increasingly pushed me towards an uncomfortable conclusion: the obvious alternative (continually updating the weights) does not work very well either.

There is an important distinction here between knowledge acquisition and skill acquisition. At first glance, knowledge acquisition seems easier. Surely teaching a model that a customer renewed their contract should be easier than teaching it a complex new behaviour. In a one-off setting, it probably is. But in the iterative regime, which is the regime that actually matters for continual learning, I increasingly think knowledge acquisition may be harder than skill acquisition.

Skill acquisition more or less works if you have a sufficiently good environment and a proper RL reward. Defining the environment and reward is hard, but at least we have a recipe. The model takes actions, receives feedback and gradually becomes better at the behaviour. As LLMs get better, autoevals will be constructed from traces of models running in production on the fly.

Knowledge is stranger. We do not have a reliable way to repeatedly write new facts into a model's weights without eventually overwriting old facts, degrading its capabilities or reducing its ability to learn subsequent information.

A system that successfully acquires knowledge over time needs to pass three tests:

1. It does not overwrite useful information from the base model.
2. It does not forget information added during previous updates.
3. It does not degrade the model's general capabilities, such as instruction following, reasoning or its ability to learn new things.

When you look across the spectrum of ways we might write to the weights from SFT, to offline distillation, to on-policy distillation, to RL, I do not think any of the vanilla methods passes all three tests.

SFT is probably the clearest example. In an iterative setting, it can catastrophically forget information from the base model, overwrite information introduced during previous updates and degrade the model's general capabilities. It fails on all three fronts.

Offline and on-policy distillation seem somewhat better, as does RL. But none appears robust in the repeated-update regime. And repeated updates are the whole point. We are discussing continual learning, not one-off fine-tuning.

RL also does not necessarily acquire explicit knowledge very well. A model can learn a policy that succeeds in an environment without cleanly internalising the underlying facts. So it might fail at knowledge acquisition for a more basic reason. We have some research coming out shortly that substantiates a lot of these claims.

There are, of course, variants that show promise.

ECHO may allow RL to acquire explicit facts whilst continuing to learn capabilities. Pedagogical RL, along with variants of on-policy self-distillation, may mitigate some of the degradation, although these methods have not yet been made stable in the continual regime.

And to be honest maybe the objective is simply misspecified. [@b_geist](https://x.com/b_geist) made a good point to me: if you reward both correctness and efficiency, perhaps a model will eventually learn to memorise recurring facts about its environment because repeatedly searching for them costs tokens. It could discover automaticity through optimisation.

But there is currently nothing that works out of the box for taking a model trained for a particular task and then allowing it to continually acquire knowledge over thousands of updates without breaking something important.

# Maybe in-context learning is not a workaround

My current working thesis is that pretraining and RL spend enormous amounts of compute optimising the model's in-context learning mechanism, and that subsequent weight modification destructively interferes with it.

The model learns how to rapidly adapt to information in context. We then attempt to make that adaptation permanent by changing the substrate that implements the adaptation mechanism itself. Plasticity research points in the same direction. Recent work shows that as a model is repeatedly fine-tuned on new tasks, it can lose plasticity and become progressively worse at learning subsequent tasks.

A possible conclusion is that we should lean into ICL fully rather than fighting it. What does this look like? Attention-only transformers + a large MLP database loaded dynamically? A database of compressed KV caches that we load in with vector search/HNSW? Regardless, these might both work better than pure harnesses and memory markdown files because search over latent space is more principled than search over token space.

You can imagine something like:

* A lossless context containing what is immediately relevant.
* A compressed latent episodic memory containing recent experience.
* The weights containing highly consolidated knowledge and capabilities.

The real problem may be learning what information belongs at each level, when it should move between levels and how much compression it can tolerate. Humans do not appear to store every memory in the same format eg some things remain episodic and some skills become automatic. So a continual learner may need the same kind of hierarchy!

# Continual learning is not one problem

I guess my point here is that in order to tackle continual learning, you have to be able to specify the problem in the first place. Continual learning isn't one big amorphous problem; rather it varies tremendously depending on how you define it (eg knowledge vs skill acquisition, narrow vs general), and only in really thinking about the characteristics of what you need it to do do you get some traction on figuring out what your approach should even be. It feels very much like blind men groping at different parts of an elephant at the moment (one working on catastrophic forgetting, one working on memory hierarchies, etc). We probably just need to get enough surface area on what we're actually trying to do with a continual learning system before we can agree on the best way to build it.
