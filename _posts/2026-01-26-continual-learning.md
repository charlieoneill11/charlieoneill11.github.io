---
layout: post
title: Continual learning and the post-monolith AI era
date: 2026-01-26
description: The cost of continual learning scales with generality
tag: ai
---

# Introduction

Modern LLMs are amnesiacs. Once their context window fills, they start over with nothing but a summary to guide them. This isn't a bug we can engineer away, but rather a consequence of how memory works in transformers. As context grows, the KV cache grows linearly which leads it to rapidly consume more memory than all of the model’s weights. And in order to build systems that learn continuously, we need to move information from the token level into the weight level: from explicit storage into superposition.

This leads us to a conclusion that shapes the rest of this piece: **continual learning is inseparable from specialization.** The cost of remembering scales with the scope of what you're trying to remember. Narrow the scope, and the problem becomes tractable. Keep it general, and the model is now fighting thermodynamics.

# Two types of Specialization

Specialization takes two forms: task specialization and domain specialization. Most enterprise AI use cases today focus on the former — document summarization, data extraction, classification. Any task with a fixed prompt template and a well-defined output space.

We think continual learning for task specialization is essentially solved.

Companies already collect data continuously. Modern fine-tuning stacks make it trivial to set up a continuous fine-tuning pipeline, whether you're doing RL or SFT. Furthermore, there's little practical difference between ten fine-tunes of 100,000 examples each or one fine-tune of a million examples. If you have enough data, a single training run at the start often suffices. If the distribution shifts, you retrain. This is engineering, not research.

The interesting question is: what does continual learning unlock beyond incremental improvement on tasks models can already do? What new use cases become possible?

Consider the difference between a model that summarizes documents and a model that acts as an employee. Why can't we just collect conversation traces between employee and manager and train on them?

Two factors make the employee problem fundamentally harder:

1. **Coverage.** For document summarization, you can define a priori a set of evals that cover the task. The output space is bounded. An employee might be expected to do a much wider range of tasks — tasks you can't enumerate in advance.

2. **Sample efficiency.** A summarization model sees thousands of documents. It has abundant opportunity to learn from feedback. An employee might receive an instruction once and be expected to follow it forever. There's no second chance to learn from a repeated example.

It's this second class of problems — broad scope, sparse feedback, one-shot retention — that continual learning needs to solve. This is what we're focused on in this piece.

# The Fundamental Tension

The best framing of continual learning's core difficulty comes from [Beren](https://www.beren.io/2025-10-11-Continual-Learning-Explains-Interesting-Phenomena-Human-Memory/) Millidge.

Beren says that continual learning is fundamentally in tension with long-term memory. Memories don't store information directly but rather store pointers to distributed neural representations. When you recall something, you're reactivating a pattern across many neurons. But continual learning keeps updating those very representations. The paths your memories point to drift out of sync with where they're supposed to lead.

This generalizes to any modular system. If two subsystems communicate via representations that both evolve independently, their shared language eventually breaks down. Module A learns to send signal X for "danger." Module B learns that X means "danger." Then A updates, and now it sends Y. But B is still listening for X, and the interface is corrupted.

The brain's solution is to [freeze the interface](https://www.beren.io/2025-10-11-Continual-Learning-Explains-Interesting-Phenomena-Human-Memory/). After some critical period (the highly neuroplastic period of childhood), the communication channel between systems becomes fixed. Each subsystem can still learn internally — it builds encoders and decoders that map between its evolving representations and the frozen channel. This is why critical periods exist, because they establish stable interfaces so the rest of the pipeline doesn't catastrophically break every time you learn something new.

But notice what this implies. If the interface is frozen, all subsequent learning happens _relative to that frozen base_. The base constrains what you can learn and how efficiently you can learn it. The more you've already committed to the base, the harder it becomes to add more. This is why adults struggle with languages that children acquire effortlessly, i.e. the phonological interface froze decades ago.

You might object: adults still learn for decades, as we remain generally intelligent and continual learning isn't catastrophic for us.

But humans are far more specialized than LLMs. Our knowledge is patchy, spiky. We pick one narrow sub-area and learn it deeply. A surgeon doesn't also know tax law and fluid dynamics and Mandarin. The brain solves continual learning by not attempting generality in the first place.

The Big Labs face a harder problem: take a model that already knows everything, then force it to learn more, without forgetting what it knew.

**The cost of continual learning scales with generality.**

A model that knows everything must maintain consistency across all its representations whenever it learns anything new. Every update risks breaking something unrelated. You could design a synchronization system that keeps stored knowledge aligned with drifting representations, but this eliminates the computational advantage of long-term memory, which is that you can largely leave it alone unless needed. The maintenance burden grows with what you're storing.

A model that only knows insurance claims has no such problem, as it can update freely and there's little else to interfere with, little else to keep synchronized. Once you establish your base representations, all new learning happens relative to them. The more you've crammed in, the harder it is to add more without interference, and the more expensive it becomes to maintain what you have.

This is Adam Smith’s specialization of labor applied to neural networks. Generality has overhead, and that overhead grows faster than linearly with scope. Specialization sidesteps the problem entirely. A medical coding model establishes interfaces optimized for medical concepts and improves within that bounded space, where catastrophic forgetting becomes a local problem rather than a global one, and synchronization costs stay manageable.

The intractability of continual learning in generalist models is the invisible hand pushing deployment toward narrow experts.

# Some of the obvious and less obvious ideas in the literature

The continual learning literature is large and growing. Most of it is trying to escape the tension we just described—finding some trick that lets you update representations without corrupting the interface. Some approaches are clever. Some might even work for narrow cases. But we think none of them escape the fundamental tradeoff.

Here's a tour of the ideas we find most interesting, and why we're still skeptical.

At the moment, the state-of-the-art technique for dealing with finite context windows is to prompt a model with ‘summarize this conversation’. Everyone knows that this is suboptimal, but coming up with a better solution is surprisingly difficult. However, one interesting observation from recent years is that many post-training innovations have originated with a capability that was initially elicited through prompting. The best example of this is reasoning models; before we had o1, we had ‘Think step by step’.

What then is the equivalent generalization of ‘summarize this conversation’? One approach from last year is the idea of constructing ‘[Cartridges](https://arxiv.org/pdf/2506.06266)’. The idea here is to construct a KV cache that efficiently compresses prior knowledge into a dense learned representation. This is done by prompting the model to ‘self-study’ the prior knowledge, and using back propagation to update the KV cache instead of the model weights.

In fact, this idea is quite old. In 2019, FAIR published [Augmenting Self-attention with Persistent Memory](https://arxiv.org/pdf/1907.01470). This paper highlights the following point: a trained KV cache is actually very mathematically similar to a multi-layer perceptron (MLP) layer. Indeed, taking a dot product with a set of keys is equivalent to multiplying with an up-projection matrix. The softmax is then a suitable activation function, and a linear combination of value vectors is mathematically equivalent to multiplying with a down projection matrix. For this reason, the authors of this paper propose doing away with the MLP entirely: we simply make use of two types of KV vectors – static and dynamic. This makes the problem of continual learning even more tantalizing: it makes you wonder how we might move dynamic KV vectors into the static KV cache.

Of course, it would be remiss of us not to mention state space models in this context. In 2025, models like Qwen-3-Next, Kimi-Linear, Minimax-M1 and Nemotron 3 Nano demonstrated that hybridizing state-space models with interleaved full attention layers could lead to competitive long context performance. However, these full attention layers are still critical, so the context window is still growing indefinitely.

Without a non-linearity between the keys and the values, we are skeptical that pure state space models like delta-net and mamba-2 will have the expressivity needed to compete with full attention. In a KV cache, the exponential decay of softmax allows you to distinguish between adjacent keys with high fidelity; without it, interference is inevitable. Indeed, the 128 by 128 state matrices which dominate the state-space status quo can only accommodate 128 rank 1 updates before perfect recall becomes impossible. As such, we see such state space models as essentially a smoothed version of sliding window attention. Certainly, this is an interesting innovation, but not a silver bullet for infinite context.

Another idea is from a relatively old [paper](https://arxiv.org/abs/2407.04153), Mixture of a Million Experts, which pushes MoE to its logical extreme: a million experts, each a single neuron.[^1] When we read this paper, our first thought was “what if you had a mixture of a _trillion_ experts, and continual learning was just updating the router for new tasks?” This is because, with a trillion experts, you basically have the primitives for all function composition, and your router can just expressively map to these. But this also felt a bit overkill and moving away from the representation-based world of Beren. It felt like we should still be routing to and updating meaningful latents, in some form, rather than very atomic functional primitives.

[Sparse memory fine tuning](https://arxiv.org/pdf/2510.15103) makes this idea more explicit in an update rule. Given a memory layer (architecturally similar to mixture of a million experts), they ask: which slots should you actually update when learning something new? Their answer is TF-IDF scoring _(a simple term-importance heuristic)_: rank memory indices by how specific they are to the new input versus a background corpus. This identifies indices that are activated by _this_ knowledge but not by everything else, avoiding the general-purpose slots that would cause interference. This is Beren's framework quite explicitly: a frozen addressing mechanism plus a simple heuristic (update what's specific, leave what's general) that sidesteps the need to learn how to learn.

There was a lot of hype around the (very lengthy) paper from [DeepMind on nested learning](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning/), which starts with the observation that architecture and optimization aren’t separate things. Rather, they’re the same concept operating at different timescales. A transformer’s attention mechanism is associative memory updating every forward pass. The feedforward layers are associative memory updating at training time. Backprop itself is associative memory, mapping inputs to their prediction errors. Once you see this, the whole model becomes a hierarchy of nested optimization problems, each with its own update frequency. This leads naturally to what they call “continuum memory systems”: instead of a binary split between short-term (attention) and long-term (weights), you get a spectrum of memory modules updating at different rates. Their proof of concept architecture, Hope, implements this as a self-modifying recurrent network that can optimize its own memory through self-reference. From the Beren framing, this is another way of establishing stable interfaces: if different components update at different frequencies, the slow-updating ones become the frozen channel through which the fast-updating ones communicate. You get modularity through temporal separation of learning rates. (This builds on Titans; see below.)

We don’t know enough about this to make an informed comment, but it feels a bit flawed. We think that it introduces way too many manual and qualitative design choices that are difficult to justify exactly why you chose them (number of time scales, what the frequency of those time scales should be, etc.). To us, it seems much cleaner to have the minimal set of discrete components of the system to emulate our meta-learning algorithm (a long-term memory like parameter weights, a short-term memory like the KV cache, and a way to inject the relevant bits of short-term memory into long-term memory when we need to). But we could be wrong. Maybe this is a solution.

Speaking of “when we need to”, a lot of people think surprise-based learning is the way to go.[^2] One recent [paper](https://www.arxiv.org/abs/2601.02151) we read on this was entropy-adaptive fine-tuning (EAFT). EAFT identifies confident conflicts, which are tokens where the model has low entropy (strong prior) but low probability (the training label contradicts that prior). These generate massive gradients that overwrite existing representations, causing forgetting. Their fix is to weight the loss by normalised entropy, suppressing gradients when the model is confident. This dramatically reduces catastrophic forgetting.

But I’m skeptical. The whole point of learning is sometimes you _need_ to override a confident prior. The president of the United States changed from Obama to Trump. A fact you were confident about turned out to be wrong. EAFT treats all confident conflicts as damage to be avoided, but some of them are exactly the updates you want. The real problem is that standard architectures don’t have a clean separation between “what I know” and “how I reason”, so updating one fact corrupts everything else. Suppressing those updates just means you never learn the new facts.

And then there’s test-time training. One interesting paper we saw on this was [Titans](https://arxiv.org/pdf/2501.00663). This takes a memory-centric view of sequence modeling. They say attention (due to its limited context but accurate dependency modeling) acts as short-term memory, while a neural network that learns to compress information into its weights can act as long-term memory. Their neural memory module is essentially a meta-model that learns how to memorize at test time, using gradient descent on an associative memory loss. The clever bit is their surprise metric: an event that violates expectations (high gradient) is more memorable, but they decompose this into past surprise (momentum) and momentary surprise (current gradient), which prevents the model from missing important information after a big surprising moment. They also add a forgetting mechanism via weight decay, which they show is actually a generalisation of the gating in Mamba and friends. This feels like (1) a more principled surprise-based approach than EAFT, but simultaneously (2) re-deriving RNNs/LSTMs and the like, so we're not sure how we feel about it.

A related and recent [paper](https://arxiv.org/pdf/2512.23675) takes a simpler approach: just keep training a standard transformer with sliding-window attention at test-time via next-token prediction on the context it’s reading. The model compresses context into its weights rather than storing every key-value pair explicitly. To make this work well, they use meta-learning at training time to prepare the model’s initialization for test-time training, so the outer loop optimizes for “how good will this model be after it’s been updated on the test context”. The tradeoff is worse needle in a haystack retrieval, which makes sense, as the whole point is lossy compression, not lossless recall. I actually don’t mind this, as it feels a lot closer to what humans are doing. At the same time, I think we still need a lossless form of short-term memory that we can more efficiently swap to, without defaulting to test-time training.

There’s also a bunch of other interesting related papers, whether it’s about extending the effective context window (e.g. lightning attention or landmark tokens)[^3], or other architecture changes like Memformer, which are worth reading.

The final one goes back to CARTRIDGES, which feels very spiritually close to sparse memory fine tuning. Again, if you treat your bank of CARTRIDGES as an associative memory, and the pre-trained transformer backbone establishes the interface, and you figure out how to retrieve and update relevant CARTRIDGES continuously, then you’ve got Beren’s system. But maybe you want to be able to slowly add CARTRIDGES back into the weights, which is a whole other question entirely.

# The common thread

Every approach here is trying to answer the same question: how do you update a neural network without breaking what it already knows?

The answers cluster into two families. Either you sparsify the update (million experts, TF-IDF routing, low-rank adapters), or you separate timescales (nested learning, test-time training, CARTRIDGES as a separate memory system). Both are ways of limiting interference. Neither escapes the fundamental tension.

Sparsification works when knowledge is separable. But the whole power of distributed representations is that they're _not_ separable: features are reused across contexts, and that reuse is what gives you generalization. The more you sparsify, the more you're fighting the architecture.

Temporal separation works when you can afford to freeze something. But what you freeze becomes load-bearing. If you freeze too early, you're stuck with bad representations. If you freeze too late, you've already caused interference. And the thing you froze can never improve.

None of this means these techniques are useless. For narrow domains with clean separation, sparse updates might be enough. For applications where you can tolerate lossy compression, test-time training might work. But for the Big Lab dream, a general model that learns everything, forever, without forgetting anything, we don't see an escape hatch here.

# Why this is probably the wrong framing

Most of the ideas in the previous section share an assumption: that the right way to solve continual learning is to learn how to learn. To us, it is fairly clear that humans don’t _learn_ their meta-learning algorithm. Instead, nature endows us with a relatively fixed, heuristic-based strategy for absorbing information: we learn our encoding during childhood, then use that mostly-frozen encoding to update our associative memory for the rest of our lives. If we also had to learn _how_ to learn, we’d be dead long before we learned anything useful. (There’s also evidence for this in animals. Zebras walk within minutes of birth. They’re not figuring out locomotion from first principles.)

As Rich Sutton points out, evolution solved the meta-learning problem over tens of thousands of years. The important takeaway is that we don’t have to. If we know what the meta-learning strategy is supposed to do, we don’t need gradients on gradients. We don’t have to bitter-lesson our way to the right algorithm. If we can design a system that (1) establishes an interface of representations plus encoders and decoders that read from and write to memory, and (2) slowly adds to that memory without disrupting the frozen interface, then we can just throw backprop at the subproblems. Learning representations and learning encoders/decoders are things we already know how to do. Retrieval might be as simple as vector search. Updates might be as simple as TF-IDFing which slots to touch, just like sparse memory finetuning.

And whilst we don’t know enough about the human brain to be able to emulate _exactly_ what this meta-learning strategy might be, I imagine it could be akin to the airplane emulating the flight of birds. We know what we need to do and what the end goal is (keeping a body in the air for an extended period of time), so we’ll probably end up just figuring out what the end mechanism we need for this system, and writing some code/designing an architecture+algorithm to do it.

# The Cambrian Zoo

So what does the future actually look like?

We think you'll see a proliferation of specialized models (thousands, eventually millions) each optimised for a narrow domain and continuously improving within it. Medical models that know medicine. Legal models that know law. Models fine-tuned on individual users' preferences, updating constantly.

These models won't share weights. They'll share APIs. The "general intelligence" emerges from composition rather than from cramming everything into one network. A routing layer (itself probably a model) will decide which specialist to invoke. The specialists can be updated, swapped out, improved independently. No global synchronization is required.

This is the Cambrian explosion that followed the Ediacaran period, a riot of specialized forms filling every niche. The foundation model era was Ediacara: a few general-purpose architectures dominating because nothing else had evolved yet. What comes next is adaptive radiation.

We don't think the Big Labs will stop trying to build god-models. There's too much momentum, too much narrative investment in AGI as a single artifact. But we think the actual deployed systems that matter, i.e. the ones doing useful work, making money, and improving over time, will be specialists. The monoliths will be impressive demos. The zoo will be the product.

The infrastructure for a world of specialized models looks different from the infrastructure for a world of monoliths. You need to serve thousands of models efficiently, not one model at massive scale. You need to route between them intelligently. You need to update them continuously without downtime. You need to version them, A/B test them, roll them back when something breaks.

This is what we’re building toward at Baseten.

# Appendix: RL vs SFT

No continual learning discussion would be complete without a discussion of RL vs SFT. The catastrophic forgetting literature has long treated forgetting as an architectural problem i.e. something to be solved with replay buffers, elastic weight consolidation, or careful regularisation. But recent work suggests the training objective itself might be the culprit. Specifically: SFT and RL have fundamentally different relationships to the model’s existing knowledge, and this difference is best understood through the lens of KL divergence.

SFT minimizes negative log-likelihood over a dataset, which is equivalent (up to a constant) to minimizing the forward KL divergence between the data distribution and the model. This is a mode-covering objective. The model is heavily penalized for assigning low probability to any completion found in the training data; the loss increases exponentially as probability approaches zero. To avoid this penalty, the model must spread its probability mass across all modes in the dataset. The practical consequence is that when you fine-tune on new data, the model aggressively shifts probability toward that data, often at the expense of previously learned modes that aren't represented in the current batch.

RL, by contrast, maximizes rewards on completions sampled from the model's own policy (with KL regularization to the reference model). This is equivalent to minimizing the reverse KL divergence (a mode-seeking objective). The model emphasizes high-reward outputs even at the cost of ignoring some output modes entirely. Importantly, assigning near-zero probability to some completion simply prevents it from being sampled; there's no exponential penalty forcing the model to cover that mode. The model can sharpen around what works without being dragged toward what the data says it should be doing.

This distinction turns out to be predictive of forgetting behavior. A recent group studying multimodal continual post-training, found that sequential SFT on seven tasks produced significant forgetting while reinforcement fine-tuning on the same sequence preserved prior-task performance almost entirely, approaching the upper bound of multi-task training without replay. Other papers report that RL achieves comparable target-task gains with substantially less degradation on non-target tasks. Another paper proposes what they call "RL's Razor": among all parameter configurations that solve a new task, online RL tends to converge to the one closest (in KL) to the original model. SFT, by contrast, can converge to solutions arbitrarily far from the base model depending on the training labels.

The common thread is on-policy learning. Because RL samples from the model's current policy, it trains on completions the model already assigns reasonable probability to. This implicitly preserves prior modes as you're reinforcing behaviors the model can already produce, not overwriting them with behaviors from an external distribution. The mode-seeking property of reverse KL means the model doesn't need to spread probability mass to match some target distribution; it can simply sharpen around what's working while leaving the rest of its knowledge largely untouched.

This suggests an important reframe: the problem with SFT isn't just that it's off-policy in the RL sense, but that it's mode-covering in a way that actively redistributes probability mass away from prior knowledge. Every batch of new data pulls the model toward full coverage of that batch's modes, creating interference with everything else. There’s also some stuff which shows low-rank updates are important for less forgetting, with everything from LoRAs to RL.

The on-policy distillation work from Thinking Machines makes this concrete. They show that even training on a model's own samples via SFT degrades performance. Any finite batch exhibits distributional drift from the true policy, and the mode-covering objective amplifies this into progressive forgetting. On-policy distillation sidesteps this because the objective (reverse KL to a fixed teacher) is mode-seeking: the student converges on the teacher's behavior without the self-reinforcing drift of off-policy training. This is why they can recover instruction-following capability after mid-training on domain data, and why distillation is emerging as a tool for continual learning more broadly.

[^1]: Product key retrieval makes routing tractable; decomposing keys into a Cartesian product reduces complexity from O(N) to O(sqrt(N)).

[^2]: See everything from Fristonâs free energy principle/predictive coding to Bayesian surprise to prioritised experience replay to Titans.

[^3]: What if we could have some RL to earmark or tag bits we want to remember and replay, and incorporate into our long-term knowledge?
