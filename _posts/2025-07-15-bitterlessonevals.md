---
layout: post
title: The bitter lesson of LLM evals
date: 2025-07-15
description: Scaling care beats scaling compute
math: true
---

In the history of artificial intelligence, there is a famous principle known as the Bitter Lesson. Coined by Rich Sutton, it observes that the biggest gains in performance have consistently come not from elaborate, human-designed knowledge, but from general methods that leverage massive increases in computation. The lesson is simple and humbling: in the long run, brute-force compute is what wins.

When it comes to evaluating the complex AI systems we build today, the seductive path is to apply the same lesson. It’s tempting to believe we can automate our way to understanding by throwing more compute at the problem: that a bigger model like GPT-4, with a clever prompt, can serve as an objective, scalable judge.

This is a dangerous illusion.

For LLM evaluation, a new and inverted bitter lesson is emerging: the most effective path to a reliable signal comes not from scaling compute, but from scaling *care*. Progress is unlocked by meticulous, structured, and profoundly human effort in defining what, precisely, we are trying to measure. Success in applied AI hinges on how fast you can iterate, and the speed of iteration is governed by a single, unforgiving bottleneck: your ability to tell if a change made things better or worse. Chasing a computational shortcut without this foundation is a recipe for wasted engineering cycles, chasing phantom improvements based on a noisy, wobbling ruler.

Evaluation is the single most important activity in AI development. And its bitter lesson is that you cannot automate your way out of thinking clearly.

# The Mirage of the LLM Judge

The seeming solution for scaling evaluation is the "LLM-as-a-judge." The idea is seductive: ask a powerful model like GPT-4 if your system's output is good. It feels objective and infinitely scalable. The reality is that this approach is built on shaky ground. An off-the-shelf LLM judge is an unstable foundation for development, plagued by inconsistencies that stem from the fundamental nature of how these models work.

## The Unstable Nature of Autoregressive Generation

LLMs generate text one token at a time, with each new token conditioned on the ones before it. This autoregressive process is inherently stochastic. Many believe setting `temperature=0` solves this, forcing the model to always pick the most probable next token. This promises deterministic, repeatable outputs.

But it’s a fallacy. Most models do not generate optimally at `temperature=0`, and subtle factors in the deep learning stack (as we’ve recently seen with the vLLM vs HuggingFace [debacle](https://x.com/finbarrtimbers/status/1941184677047566548)) can alter the floating-point arithmetic just enough to tip the scales from one token to another. A single different token early on can cascade, leading to a completely different output.

More importantly, determinism doesn't solve the core issue: extreme sensitivity. An LLM judge's final verdict can be swayed by laughably small, semantically irrelevant changes to the evaluation prompt (see [here](https://aclanthology.org/2024.findings-emnlp.108/), [here](https://arxiv.org/pdf/2502.06065) and [here](https://arxiv.org/pdf/2504.12408)).

- **Ordering Bias:** Simply reordering the criteria in your rubric can change the outcome. An LLM might weigh the first criterion it reads more heavily, meaning an evaluation asking for "conciseness, then accuracy" could produce a different score than one asking for "accuracy, then conciseness."
- **Sensitivity to Phrasing:** Consider these two instructions: "The response must be faithful to the source text" vs. "The response must not contain any information that isn't in the source text." To a human, they are nearly identical. To an LLM, they are different token sequences that can trigger entirely different reasoning paths and, therefore, different judgments.

This constant "prompt fiddling" to find a stable configuration is a tax on development. You end up basically just searching for a measurement tool that doesn't wobble when you hold it.

## Faithfulness vs. Helpfulness

Beyond instability, LLM judges often fail to grasp the nuanced, orthogonal dimensions of what makes a response good. The two most important are [faithfulness and helpfulness](https://arxiv.org/abs/2410.02970).

- **Faithfulness** measures whether an answer relies *only* on the provided source documents. It must not invent facts (hallucinations) or add external information.
- **Helpfulness** measures whether the answer is relevant, comprehensive, and useful to the user.

A response can be perfectly faithful yet utterly useless. Ask a system, "What are the penalties for a missed payment according to this lease agreement?" and it might respond, "Clause 4.2 of the lease agreement addresses missed payments." This is 100% faithful to the text but provides zero help. A generic LLM judge, tasked with checking for factual accuracy, might score this a perfect 10/10.

This leads to failure modes that simple evaluations miss:

- **False Negatives:** The system incorrectly states that the source document doesn't contain the answer. This is often caused by poor retrieval or the model's limited attention over large contexts, or the "lost in the middle" problem where information in the middle of a long document is [ignored](https://arxiv.org/abs/2407.03651).
- **False Positives:** The system hallucinates an answer that sounds plausible but doesn't exist in the source document.

A good evaluation system must be able to distinguish between these failure modes across thousands of examples, calibrated to your specific task. A generic LLM judge simply cannot.

## The hardest thing to admit: you can’t use generic evals

I think the majority of companies we’ve spoken to and worked with have assumed that at least part of their eval stack can reuse generic or at least non-customised eval prompts when testing for things like hallucinations and completeness in their model outputs. Unfortunately, the bitter lesson of evals is that this just doesn’t work. For a lot of the reasons above, at some point you just have to bite the bullet and LOOK AT YOUR DATA (as [Hamel Husain would say](https://hamel.dev/blog/posts/evals/)) and determine what you actually want to evaluate. Only then can you actually start sculpting the contours of the evaluation which reflects what a domain expert in your company would consider to be the ground-truth. 

# The Parsed Flywheel: Forging a Compounding Moat

To escape this cycle, you need to treat evaluation as the core product. You need to build a system (we call it a harness) that is more than just a metric. It must become the ground truth that your entire development process orbits around. This is what we build at Parsed.

## Ground truth doesn’t exist in a dataset

A universal evaluation metric doesn't exist. Ground truth is unique to your task, your domain, and your users. That's why we begin with a forward-deployed model. Our top engineers embed directly with your team for 1-4 weeks. They don't just ask for a dataset; they sit side-by-side with your domain experts to understand their workflow, their heuristics, and their definition of "quality."

We use a process of critique shadowing. Your principal domain expert makes simple, binary Pass/Fail decisions on representative traces, but provides detailed critiques explaining their reasoning. This forces clear thinking, is immediately actionable, and is far faster than debating arbitrary 1-5 scales. This expert judgment becomes the seed of your evaluation harness, along with any user feedback you’ve collected.

## Stop with your monolithic eval prompts

A single evaluation question like "Is this summary good?" is impossible to answer consistently. To solve the sensitivity and random neglect problems, we break the task down. Instead of one large, complex prompt sent to a single powerful model, we build a **rubric fan-out** (credit to Haize Labs for [coining this term](https://www.haizelabs.com/technology/verdict-vogent)).

Imagine evaluating a RAG system's answer. We deconstruct the task into a series of metrics you want to monitor, and then each of those metrics into a set of independent checks:

- **Individual Checks:** A small, fast, possibly fine-tuned model does *only one thing*. One model checks if claim #1 is supported by the context. Another checks if claim #2 is. A third checks for a polite tone. A fourth checks for conciseness. Each model has a narrow, unambiguous task, making it robust to prompt variations.
- **Metrics:** The binary outputs of these checks are then aggregated into the higher-level metrics they were derived from.
- **The Harness Score:** Finally, these metrics are weighted and combined into a single, observable score that gives you an immediate, top-level signal of system health.

This granular structure allows us to have absolute certainty that every single criterion in your rubric is evaluated, every single time. It transforms an unreliable process into a deterministic, mechanistic one.

## Tame the variance

To solve the inherent stochasticity of LLMs, we treat evaluation as a statistical process. We deploy **ensembles of judges** for each granular check, using techniques like mean-pooling or self-consistency where multiple attempts are made and the most common outcome is chosen as the final verdict. As a wide body of [research](https://arxiv.org/pdf/2412.00543) has shown, this approach drastically smooths out variance.

It also allows us to use an ensemble of weaker, faster, and cheaper models to achieve results that are more stable and aligned with human judgment than a single, expensive call to a frontier model. The result is an evaluation harness that is not only more reliable, but also orders of magnitude more efficient to run at scale. 

## The compounding loop

This is the bitter lesson of LLM evals in practice. The compounding moat of quality isn't dug with more compute, but with more rigour. It’s built by embracing the hard work of thinking from first principles about what "good" actually means for your specific task, and then mechanising that deep understanding into a system you can trust. (We even use this evaluation harness to drive continuous improvement of a custom model for your task, but that’s a story for another day.)

This flywheel is the direct embodiment of this lesson. It is a system for scaling *care*, for turning meticulous human judgment into a reliable, high-velocity engine for improvement. It builds a defensible moat of quality and performance that you can use to improve the models doing your task and compounds over time, making it nearly impossible for competitors to catch up.

The next generation of breakout AI companies won't be won by those who are quickest to adopt the latest model. It will be won by those who build the most superior engine for improvement.

It’s a harder path, but it's the only one that leads to a durable advantage. We built Parsed to walk it with you.