---
layout: post
title: What Would It Mean If You Could Cheat?
date: 2026-02-24
description: On computation, quantum mechanics, the structure of difficulty, and what a universe that allowed shortcuts would have to look like
tag: other
math: true
references:
  - title: "On Computable Numbers, with an Application to the Entscheidungsproblem"
    authors: "Alan Turing"
    url: "https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf"
    venue: "Proceedings of the London Mathematical Society"
    year: 1936
  - title: "The Complexity of Theorem-Proving Procedures"
    authors: "Stephen Cook"
    url: "https://dl.acm.org/doi/10.1145/800157.805047"
    venue: "STOC"
    year: 1971
  - title: "Quantum Computing since Democritus"
    authors: "Scott Aaronson"
    url: "https://www.cambridge.org/core/books/quantum-computing-since-democritus/197A4CD77E1B61E8B0E585EA7E4BF723"
    venue: "Cambridge University Press"
    year: 2013
  - title: "Quantum Computing and Hidden Variables"
    authors: "Scott Aaronson"
    url: "https://arxiv.org/abs/quant-ph/0408035"
    venue: "Physical Review A"
    year: 2005
  - title: "'Relative State' Formulation of Quantum Mechanics"
    authors: "Hugh Everett III"
    url: "https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.29.454"
    venue: "Reviews of Modern Physics"
    year: 1957
  - title: "PP is closed under intersection"
    authors: "Beigel, Reingold, Spielman"
    url: "https://www.sciencedirect.com/science/article/pii/S0022000005800248"
    venue: "Journal of Computer and System Sciences"
    year: 1995
---

# What It Means to Compute

## Machines that follow rules

A computer is a machine that follows instructions. You give it a sequence of steps ("add these two numbers," "if the result is negative, go to step 7," "otherwise, write down a 1 and continue"), and it executes them one after another until it reaches a stopping point or runs forever.

In 1936, Alan Turing described an imaginary device, now called a Turing machine, that captures everything we mean by "mechanical computation."<a href="#ref-1" class="cite">[1]</a> It has a tape (infinite memory), a head that reads and writes symbols, and a finite table of rules telling it what to do next. Every algorithm ever written, every program running on every server and phone and satellite, is equivalent to some Turing machine. The physical details (silicon transistors, vacuum tubes, pen and paper) change the *speed*, but not what is *computable*.

This is the Church–Turing thesis: anything that can be computed by any reasonable physical process can be computed by a Turing machine. It has never been proven; it functions more as a law of nature that has never been violated. Every proposed model of computation (lambda calculus, register machines, cellular automata, DNA computing) turns out to compute exactly the same class of functions.

## Problems and their sizes

When we talk about a "problem" in computer science, we don't mean a single question ("is 91 prime?") but an infinite family of questions parameterised by size:

- "Given a number with *n* digits, is it prime?"
- "Given a graph with *n* nodes, does it contain a triangle?"
- "Given a logical formula with *n* variables, is there an assignment of true/false that makes it true?"

The size parameter *n* determines everything about tractability. An algorithm that works for 10 variables might take longer than the age of the universe for 300 variables, depending on how its running time grows with *n*.

## Polynomial vs. exponential: the only distinction that matters

There are many possible growth rates, but for the deepest questions in computer science, only one distinction matters:

**Polynomial growth** means the running time is bounded by some fixed power of *n*: maybe $n^2$ steps, or $n^3$, or $n^{17}$. These are "fast" algorithms. Doubling the input size might multiply the time by 4 (if quadratic) or 8 (if cubic).

**Exponential growth** means the running time is something like $2^n$. Now doubling the input size *squares* the running time. An algorithm that takes one second for $n = 50$ would take roughly 34 million years for $n = 100$. No amount of engineering helps. Faster hardware and better compilers don't matter against an exponential.

This is a statement about scaling laws, not current technology. Polynomial-time algorithms are *feasible*; exponential-time algorithms are *not*, for any input of practical size.

# The Landscape of Difficulty

## P: problems we can solve quickly

**P** is the class of problems that some algorithm can solve in polynomial time. Sorting a list, multiplying matrices, finding shortest paths in networks, determining if a number is prime. All in P.

If a problem is in P, we consider it "tractable." There exists a procedure that will always give you the correct answer, and whose running time is bounded by a polynomial function of the input size.

## NP: problems whose solutions we can check quickly

Now consider a different kind of question. Suppose someone hands you a massive logical formula, thousands of variables, millions of clauses, and asks: "Is there *some* assignment of true and false to these variables that makes this formula true?"

You might have no idea how to *find* such an assignment efficiently. But if someone handed you a candidate assignment, you could *check* it almost instantly: just plug in the values and see if the formula evaluates to true.

This is the class **NP**: problems where a correct solution, if one exists, can be *verified* in polynomial time, even if *finding* one might be hard.

Every problem in P is automatically in NP (if you can solve it quickly, you can certainly check a solution quickly). Whether the reverse holds is the most important open question in computer science, and arguably in all of mathematics:

**Does P = NP?**

Can every problem whose solutions are easy to *check* also be solved *quickly*?

Almost no one believes so, but no one has proven otherwise.

## NP-completeness: the hardest problems in NP

In 1971, Stephen Cook showed that some problems in NP are, in a precise sense, *as hard as anything in NP*.<a href="#ref-2" class="cite">[2]</a> If you could solve any one of these problems in polynomial time, you could solve *all* of NP in polynomial time.

These are called **NP-complete** problems. The canonical example is **3SAT**:

> Given a Boolean formula in a specific form — a conjunction (AND) of clauses, where each clause is a disjunction (OR) of exactly three variables or their negations — does there exist an assignment of true/false values that satisfies every clause?

For example: $(x_1 \lor \lnot x_2 \lor x_3) \land (\lnot x_1 \lor x_2 \lor x_4) \land \ldots$

With 3 variables, you can check all $2^3 = 8$ possibilities. With 300 variables, there are $2^{300}$, more than the number of atoms in the observable universe. The best known algorithms are sophisticated forms of brute-force search.

3SAT is NP-complete: if you could solve it in polynomial time, every problem in NP would fall. Scheduling, protein folding, circuit design, logistics. Thousands of practical problems are NP-complete or NP-hard. A fast algorithm for any one of them would be a fast algorithm for all of them.

## Beyond NP: the class PP

NP asks: "Does a satisfying assignment *exist*?" Now consider a harder question:

> "Do *more than half* of all possible assignments satisfy the formula?"

This is a counting question rather than a search question. Finding one solution or verifying one isn't enough; you need to know something about the *proportion* of solutions.

The class **PP** (Probabilistic Polynomial time) captures this. Formally, a problem is in PP if there exists a randomised polynomial-time algorithm that gives the right answer with probability strictly greater than 1/2, but perhaps only barely greater. Maybe it's right with probability $\frac{1}{2} + \frac{1}{2^n}$. That razor-thin margin is what gives PP its power.

PP is believed to be vastly more powerful than NP. It contains the entire **polynomial hierarchy**, an infinite tower of complexity classes built by stacking NP-like quantifiers ("there exists... for all... there exists..."). PP lets you not just find needles in haystacks but compare the *sizes* of haystacks.

## Why this hierarchy matters

The classes, ordered by believed difficulty:

$$P \subseteq NP \subseteq PH \subseteq PP$$

Each inclusion is believed to be strict: each class is thought to contain problems harder than the one before. But none of these separations have been proven. Proving that any two are different remains open.

# Quantum Mechanics in Five Steps

## Step 1: States are vectors

In classical physics, a coin is either heads or tails. A bit is either 0 or 1. The state of the system is a definite configuration.

In quantum mechanics, the state of a system is a **vector** in an abstract mathematical space (a Hilbert space). For a **qubit** (the quantum analog of a classical bit), the state is:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

where $\alpha$ and $\beta$ are complex numbers satisfying $\|\alpha\|^2 + \|\beta\|^2 = 1$.

This is not a statement about ignorance. The system is not "really" in state $\|0\rangle$ or $\|1\rangle$ with the answer hidden from us. The superposition is the physical state. The system has no definite value until something forces one.

## Step 2: Evolution is linear and unitary

Between measurements, quantum systems evolve according to **unitary** transformations, linear operations that preserve the total "length" of the state vector.

Linearity means: if you apply an operation $U$ to a superposition $\alpha\|0\rangle + \beta\|1\rangle$, the result is $\alpha \cdot U\|0\rangle + \beta \cdot U\|1\rangle$. The operation acts on each component independently, and the coefficients pass through untouched. Linearity is a law of physics, not a design choice. All known physical interactions are described by linear, unitary quantum mechanics.

Linearity matters because **you cannot selectively amplify one branch of a superposition without affecting others.** If a state has a tiny component (say $\alpha = 10^{-100}$), no physically allowed operation can magnify that component while suppressing the rest, without the operation being exponentially costly or violating unitarity.

## Step 3: Measurement and the Born rule

When you measure a qubit in state $\alpha\|0\rangle + \beta\|1\rangle$, you get:

- outcome $0$ with probability $\|\alpha\|^2$
- outcome $1$ with probability $\|\beta\|^2$

This is the **Born rule**. It connects the mathematical formalism (complex amplitudes) to observable frequencies. After measurement, the system "collapses" into whichever state was observed.

The probabilities are determined by the *squared magnitudes* of the amplitudes. An amplitude of $10^{-100}$ gives a probability of $10^{-200}$. Such outcomes never happen.

## Step 4: Entanglement and decoherence

When two quantum systems interact, they can become **entangled**: their joint state cannot be described by specifying each system's state independently. Measuring one system instantaneously determines facts about the other, regardless of distance.

In practice, quantum systems constantly interact with their environments: air molecules, photons, thermal fluctuations. This process, called **decoherence**, entangles the system with the environment so thoroughly that quantum interference effects are destroyed. The system behaves classically.

Decoherence is why you don't see cats in superpositions. Quantum mechanics doesn't stop applying at large scales; the quantum coherence required for quantum effects is destroyed almost instantaneously by environmental interactions.

## Step 5: Quantum computing — what it actually buys you

A quantum computer maintains a register of $n$ qubits. The state of this register is a vector in a $2^n$-dimensional space:

$$|\psi\rangle = \sum_{x \in \{0,1\}^n} \alpha_x |x\rangle$$

There are $2^n$ amplitudes, one for each possible $n$-bit string. A quantum computation applies a sequence of unitary operations (quantum gates) to this state, then measures.

This looks like massive parallelism: $2^n$ components being processed simultaneously. But the bottleneck is *extraction*. When you measure, you get a single outcome $x$ with probability $\|\alpha_x\|^2$. All the other information is lost. You can't "read off" the results of $2^n$ parallel computations.

Quantum algorithms work by carefully engineering interference — arranging the amplitudes so that wrong answers cancel out and right answers reinforce, funnelling probability toward the correct output. This is difficult, and only works for problems with specific mathematical structure.

The class of problems solvable by polynomial-time quantum algorithms is called **BQP** (Bounded-error Quantum Polynomial time). BQP is believed to be larger than P (Shor's algorithm for factoring is the star example), but it is believed to *not* contain all of NP.

Quantum mechanics gives you some speedup over classical computation, but not an unlimited one. It does not, as far as anyone can tell, let you solve NP-complete problems efficiently.

# The Many-Worlds Interpretation

## What it says

The **many-worlds interpretation** of quantum mechanics, proposed by Hugh Everett III in 1957, takes the mathematical formalism at face value and refuses to add anything to it.<a href="#ref-5" class="cite">[5]</a>

In the standard ("Copenhagen") interpretation, measurement causes a real, physical collapse: the state $\alpha\|0\rangle + \beta\|1\rangle$ becomes *either* $\|0\rangle$ *or* $\|1\rangle$, with Born-rule probabilities. Collapse is sudden, irreversible, and not described by the Schrödinger equation. It is a second law of nature grafted onto the first.

Everett asked: what if there is no collapse? What if the Schrödinger equation (linear, unitary evolution) is the *only* law, applying always and everywhere, including during measurement?

The consequence: when a measurement occurs, the universe doesn't collapse into one outcome. *All* outcomes occur. The measuring device, the observer, the entire environment become entangled with the quantum system, and the universal wavefunction branches:

$$|\text{observer sees 0}\rangle \otimes |0\rangle + |\text{observer sees 1}\rangle \otimes |1\rangle$$

Each branch is equally real. In one branch, you see 0. In another, you see 1. Neither branch has access to the other; decoherence ensures they evolve independently from that point on. You experience one branch because *you* are in one branch. The "you" in the other branch is having the complementary experience.

## What it does not say

Many-worlds says all branches exist. It does **not** say:

1. You can choose which branch you end up in.
2. You can communicate between branches.
3. You can influence the Born-rule probabilities governing which branch "you" experience.
4. The existence of all branches gives you computational power beyond BQP.

Point 4 is the important one. Yes, in some branch, a quantum computer "computes" every possible answer. But this is true of an ordinary coin flip in many-worlds too. In some branch, the coin lands heads. That doesn't help you *use* the heads-branch result if you're in the tails-branch. The branches are causally disconnected after decoherence.

Many-worlds provides no computational upgrade. It is an interpretive framework.

# The Anthropic Computing Idea

## The provocation

The idea, phrased as a thought experiment:

Suppose you want to solve 3SAT. You have a formula $\varphi$ with $n$ variables. You proceed as follows:

1. Generate a uniformly random assignment $x \in \{0,1\}^n$.
2. Check whether $x$ satisfies $\varphi$.
3. If it does not — eliminate the current branch.

If you take "eliminate the branch" literally in a many-worlds context, then: across all $2^n$ branches of the random assignment, only the branches where $x$ satisfies $\varphi$ survive (contain observers). If you are observing anything at all, you must be in a branch where $x$ satisfies $\varphi$. You've solved 3SAT, and all you did was guess randomly and apply a filter.

There's a subtlety for unsatisfiable formulas (what if no assignment works, and you've eliminated yourself in every branch?). This is handled by adding a small escape clause: with some tiny probability, say $2^{-2n}$, you skip the whole procedure and do nothing. If the formula is satisfiable, you'll almost certainly end up in a branch that found a satisfying assignment. If you find yourself in the "did nothing" branch, you can conclude with overwhelming probability that the formula was unsatisfiable.

The term for this is **anthropic computing**: computation in which the probability of the observer's own existence depends on the computational output.

## Why it seems to work

The logic runs:

1. In many-worlds, all random outcomes occur in some branch.
2. If you arrange for your existence to be contingent on a correct answer, then conditional on existing, you have the correct answer.
3. The conditioning is free — you don't need to search; you just need to *be*.

This appears to give polynomial-time solutions to NP-complete problems (just guess and check — the checking is polynomial, and the "search" is handled by the branching).

## Why it doesn't work (in known physics)

The problem is the conditioning step. In standard quantum mechanics, you cannot "condition on existing" in the way the argument requires.

The Born rule assigns probabilities to measurement outcomes based on squared amplitudes. If $\varphi$ has exactly $k$ satisfying assignments out of $2^n$ total, the probability of landing in a satisfying branch (by random guessing) is $k / 2^n$. For a hard instance, $k$ might be 1, making the probability $2^{-n}$, exponentially small.

You can't make this probability larger without doing exponential work, because **the laws of physics are linear**. No unitary operation can take an exponentially small amplitude and boost it to a constant without either:

- applying exponentially many operations, or
- violating linearity/unitarity (i.e., breaking quantum mechanics).

"Condition on surviving" is doing, by fiat, exactly what the laws of physics prohibit: selecting the exponentially unlikely outcome as your experience, at zero cost. In the language of quantum information, this is **postselection**, which is not a physically available operation.

# Postselection — What It Is and What It Costs

## Definition

**Postselection** means: perform a computation that produces some output with probability $p > 0$, then act *as if* that output is guaranteed.

Concretely: run a quantum (or classical) computation, measure a qubit (or bit), and condition on the outcome being 1, ignoring all runs where it was 0, no matter how many there are. If the probability of seeing 1 is $2^{-n}$, you'd need to repeat the experiment roughly $2^n$ times before you'd actually see it. But postselection says: pretend you saw it on the first try.

In a many-worlds framing, postselection is: "only count the branches where the desired outcome occurred." It is anthropic selection: the observer exists only in favourable branches.

## As a mathematical tool, it's well-defined

There's nothing wrong with postselection as a theoretical device. You can define complexity classes based on it and prove rigorous theorems. The question is whether it corresponds to a physically realisable operation.

## Aaronson's theorem: PostBQP = PP

In 2005, Scott Aaronson defined **PostBQP**: the class of problems solvable by a quantum polynomial-time computer augmented with the ability to postselect on measurement outcomes (provided those outcomes have nonzero probability).<a href="#ref-4" class="cite">[4]</a>

He proved:

$$\text{PostBQP} = \text{PP}$$

Recall that PP is the class of problems decidable by a randomised algorithm that's correct with probability just barely above 1/2. It contains the entire polynomial hierarchy. It is believed to be far more powerful than NP.

Postselection doesn't just give you NP. It gives you PP, the ability to count solutions, compare exponentially large sets, and resolve questions well beyond NP-type search.

There is also a classical version. Classical anthropic computing (random guessing plus postselection, without quantum mechanics) gives power equivalent to a class called **BPP$_{\text{path}}$**, which sits between MA (a randomised version of NP) and BPP$^{\text{NP}}$. Weaker than PP, but well beyond polynomial time.

## What this means

If "anthropic computing" were physically realisable, if you could condition your experienced reality on computational outputs at polynomial cost, you would have:

- The ability to solve 3SAT efficiently.
- The ability to break all public-key cryptography.
- The ability to solve every problem in PP in polynomial time, a class that contains the entire polynomial hierarchy.

# What Would Have to Be True About the Universe

## The question, restated

Many-worlds alone doesn't give you postselection. Quantum mechanics, as we understand it, doesn't give you postselection. So if anthropic computing *were* possible, if you could reliably end up in the branch where the computation succeeded, what would that tell us about the laws of physics?

The algorithm doesn't work in known physics. The interesting question is what the universe would have to look like for it to work.

## Something would have to give

For postselection to be physically available, at least one of the following must be false:

**Linearity of quantum mechanics.** If the evolution of quantum states is not linear, if nonlinear modifications of the Schrödinger equation describe real processes, then it becomes possible to amplify exponentially small amplitudes without exponential cost. The tiny branch where you guessed the right answer could be "boosted" to macroscopic probability.

As a hypothesis this is not exotic, but the consequences are severe. In the early 1990s, Nicolas Gisin and Joseph Polchinski independently showed that *any* nonlinear modification of quantum mechanics, however small, enables **faster-than-light signaling**. The nonlinearity allows you to distinguish non-orthogonal quantum states with certainty, which can be leveraged through entanglement to transmit information superluminally. This destroys relativistic causal structure.

**The Born rule as the correct measure over outcomes.** The Born rule says you experience outcome $x$ with probability $\|\alpha_x\|^2$. If the actual rule were different, if there were a physical law saying "observers preferentially find themselves in branches with certain computational properties," then you could, in principle, experience the satisfying branch disproportionately often.

This is a strange kind of modification. It would mean the probability measure over observer-experiences is not determined by the dynamics (unitary evolution + Born rule) but by something else, something that depends on *what the computation computes*. Physics would have to "know" about the semantic content of computations, not just their physical implementation.

**No-signaling / relativistic causal structure.** Postselection is closely related to the ability to signal faster than light. If you can condition your experienced reality on events in your future light cone (as anthropic computing requires (you "survive" based on a future computation's outcome)), you are introducing a form of retrocausality or nonlocal influence that sits uneasily with relativity.

**Thermodynamic constraints.** Postselection is, in a sense, a Maxwell's demon operating on branches of the wavefunction. It extracts useful information (the satisfying assignment) from a uniform mixture (random guessing) without paying the entropic cost. This violates the spirit, if not the letter, of the second law of thermodynamics.

## The measure problem: where cosmology meets computation

In modern cosmology, particularly in models involving **eternal inflation**, there is an unsolved problem called the **measure problem**. In an eternally inflating universe, every possible configuration of matter occurs infinitely many times in infinitely many regions. To make *any* prediction, you need a way to assign relative probabilities to different observations. You need a **measure**: a rule for weighting different observer-moments.

Different choices of measure lead to different empirical predictions. Some measures predict we should observe a very young universe (the "Boltzmann brain" problem). Others predict different values of cosmological constants. The "right" measure is not determined by the equations of general relativity or quantum field theory alone. It is an additional input.

Anthropic computing is a proposal for a very specific kind of measure: one that weights observer-moments by *computational outcomes*. You find yourself disproportionately in branches where the computation succeeded, not because of any dynamical mechanism, but because the measure over histories is rigged in your favour.

The cosmological measure problem, weaponised as a computational resource. And the fact that cosmologists cannot currently solve the measure problem, cannot determine from first principles which measure is correct, means that dismissing anthropic computing is harder than it might seem. You can't say "obviously the Born rule is the right measure" because, in the context of eternal inflation and many-worlds, what constitutes "the right measure" is precisely what's in dispute.

There is a strong pragmatic argument against computation-dependent measures: they would imply a universe so different from the one we observe that the resulting predictions would likely be falsified immediately. If our measure over experiences were biased by computational outcomes, we would expect to see all sorts of statistically anomalous patterns in our observations, and we don't.

# The Halting Problem Boundary

## What even postselection cannot do

Suppose we grant postselection. Suppose the universe really does allow you to condition on computational outcomes at polynomial cost. Does this give you unlimited computational power?

There is a hard boundary.

The **halting problem** asks: given an arbitrary program $M$ and input $x$, does $M$ eventually halt (stop running), or does it run forever?

Alan Turing proved in 1936 that no algorithm can decide this for all programs. It is **undecidable**, not merely hard (like NP-complete problems), but provably impossible for any Turing machine, regardless of time or resources.

This is a different kind of impossibility than NP-completeness. NP-complete problems are (probably) hard because the best algorithms take exponential time, but they are decidable; given enough time, you can always determine the answer by exhaustive search. The halting problem cannot be decided by *any* algorithm in *any* amount of time.

## Why postselection doesn't cross this boundary

3SAT is decidable. For a formula with $n$ variables, you can check all $2^n$ assignments; the answer is always determined in finite (though possibly exponential) time. Postselection speeds this up; it collapses the exponential search into a polynomial-time conditioning trick, but the underlying problem was always solvable in finite time.

The halting problem is different. A program might run for a googol steps and then halt, or it might run forever. To decide halting, you would need to resolve an *infinite-time* property of a computation. Postselection operates on finite computations with definite outcomes; it conditions on a specific measurement result. It doesn't help you with questions whose answers require observing a computation for an *unbounded* amount of time.

Could you try an anthropic approach? Run the program and stipulate: "I only exist in branches where I eventually observe the program halting." If the program halts, you observe it halting, fine. But if it doesn't halt, what do you experience? You'd need to experience "not halting" as a definite outcome in finite time. But "this program hasn't halted yet" is not evidence that it *won't* halt; it might halt in the next step, or in $10^{10^{10}}$ steps.

To convert "I haven't observed halting" into a reliable certificate that the program *never* halts, you would need an additional mechanism: something like a cosmic time limit, or a rule that says "if it hasn't halted by time $T$, conclude it won't." But choosing the right $T$ is itself an undecidable problem (it depends on the busy beaver function, which grows faster than any computable function). Any such rule is effectively smuggling in an **oracle** (a source of uncomputable information), which goes beyond mere postselection.

Postselection expands the class of tractable problems from P to PP but does not cross the boundary between computable and uncomputable.

# The Principle

## What kind of law would forbid anthropic computing?

We've mapped out the consequences: if anthropic computing worked, you'd get PP in polynomial time, you'd likely break no-signaling, and you'd need a non-Born measure over observer-moments that depends on computational outcomes. Our universe appears to forbid all of this.

What *kind* of law is doing the forbidding?

Consider an analogy. Before Einstein, the speed of light was a measured quantity, something that happened to be about $3 \times 10^8$ metres per second. Einstein's move was to promote this empirical fact to a **structural principle**: the speed of light is not just fast; it is a *speed limit*, a constraint that shapes the geometry of spacetime and dictates the form of every physical law.

This was not a discovery of a new fact. It was a change in the *status* of a known fact. The numerical value didn't change; its role in the architecture of physics did. The speed of light went from being a property of electromagnetism to being a property of *spacetime itself*.

## The computational speed limit

There may be an analogous principle at work in the relationship between physics and computation:

> **No physical process can convert exponentially small measure into guaranteed experienced outcomes at polynomial cost.**

This is a statement about what the laws of physics permit, not about any particular algorithm or physical system. It says that the structure of physical law, whatever its specific form, respects a constraint on the relationship between computational difficulty and physical feasibility.

In our universe, this constraint appears to be enforced by several interlocking mechanisms:

- **Linearity and unitarity** prevent the selective amplification of exponentially small amplitudes.
- **The Born rule** ties experienced probabilities to squared amplitudes, ensuring that low-amplitude branches are experienced with correspondingly low probability.
- **Decoherence** destroys the coherence needed to access other branches, making inter-branch interference (and thus inter-branch information transfer) impossible at macroscopic scales.
- **Thermodynamic irreversibility** imposes entropic costs on information extraction that mirror the computational costs of search.
- **No-signaling constraints** (enforced by relativistic causal structure) prevent the statistical steering tricks that postselection would enable.

No single one of these mechanisms, taken alone, is obviously sufficient to enforce the prohibition. But together they make anthropic computing physically impossible in our universe. Whether this web is a coincidence of our particular physical laws or reflects something deeper is still open.

## Is the prohibition independent or derived?

**Option A: Derived.** The inability to postselect is a *consequence* of linearity, the Born rule, and relativistic causality. No new principle is needed; the existing laws are sufficient. The "computational speed limit" is a theorem, not an axiom. This is plausible: linearity alone arguably rules out the relevant kinds of amplitude amplification, and the Born rule fixes the measure over outcomes.

**Option B: Independent.** The computational constraint is a new principle that is *not* derivable from the existing laws in their standard formulation. It would need to be added as an additional axiom, a "computational postulate" alongside the dynamical postulates of quantum mechanics. This would be more surprising, but also more informative: it would suggest that computation plays a foundational role in physics, not just a descriptive one.

We don't know which is correct. We don't even have a sharp enough formulation of the principle to state the question precisely. But treating computational constraints as potential physical laws is an active direction at the boundary of physics and computer science.

## Postselection as a fictional-but-useful primitive

Even if postselection is physically impossible, even if anthropic computing is definitively ruled out, the *mathematical framework* of postselection has proven useful.

Aaronson's proof that PostBQP = PP provides a clean, conceptually transparent route to structural results about complexity classes. The original proof that PP is closed under intersection (due to Beigel, Reingold, and Spielman in 1995) used hard classical combinatorics.<a href="#ref-6" class="cite">[6]</a> The PostBQP = PP proof gives you the same result through a quantum argument that feels almost obvious in comparison.

This pattern recurs in theoretical physics and mathematics: imaginary capabilities, taken seriously as formal devices, yield real insight. Feynman's path integrals sum over physically impossible trajectories. Boltzmann's statistical mechanics imagines ensembles of systems that don't exist. The "many worlds" of the many-worlds interpretation may or may not be real, but the mathematics works either way.

Postselection is another such device. It doesn't need to be physical to be useful; the mathematical relationships it reveals are properties of computation and physics, independent of whether any universe actually allows it.

# Conclusion

The "anthropic computing" thought experiment starts as a trick (guess and die, survive only if you guessed right) and opens into a probe of the relationship between physics and computation.

What it reveals:

1. **Many-worlds alone doesn't help.** The existence of all branches does not let you select among them. Branching gives you BQP, not NP or PP.

2. **The real primitive is postselection**, the ability to condition experienced reality on computational outcomes at polynomial cost. Quantum mechanics as we understand it does not provide this.

3. **If postselection were physical, you wouldn't just get NP. You'd get PP**, a class that dwarfs NP and contains the entire polynomial hierarchy.

4. **Even postselection has limits.** It doesn't cross the Turing barrier. Undecidable problems remain undecidable.

5. **The universe appears to enforce a computational speed limit**: you cannot convert exponentially small measure into guaranteed experience without exponential cost. This prohibition is maintained by linearity, the Born rule, thermodynamics, and no-signaling constraints working together.

6. **Whether this speed limit is a derived theorem or an independent principle remains open.** If it's independent, computation is not just something we do within the universe; it is something the universe itself is constrained by.
